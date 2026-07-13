from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import jwt
import datetime
import os
from functools import wraps
from sklearn.base import BaseEstimator, ClassifierMixin
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import sys
from sqlalchemy import func, inspect
import logging

# Configure logging to see errors in Railway logs
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fraud-guard')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///users.db').replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Ensure the database directory exists
db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
db_dir = os.path.dirname(db_path)
if db_dir:
    os.makedirs(db_dir, exist_ok=True)

# --- GLOBAL JSON ERROR HANDLER ---
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found', 'path': request.path}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed for this path'}), 405

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Server Error: {str(e)}", exc_info=True)
    if hasattr(e, 'code'):
        return jsonify({'error': str(e)}), e.code
    return jsonify({'error': 'Server Internal Error', 'detail': str(e)}), 500

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    role = db.Column(db.String(20), default='user')
    approved = db.Column(db.Boolean, default=False)

class TransactionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20))
    amount = db.Column(db.Float)
    oldbalanceOrg = db.Column(db.Float)
    newbalanceOrig = db.Column(db.Float)
    oldbalanceDest = db.Column(db.Float)
    newbalanceDest = db.Column(db.Float)
    prediction = db.Column(db.Integer)
    probability = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Initialize DB + seed default admin account
try:
    with app.app_context():
        db.create_all()
        db.session.commit()
except Exception:
    pass  # Tables already exist (created by another worker)

with app.app_context():
    try:
        cols = [c['name'] for c in inspect(db.engine).get_columns('user')]
        if 'role' not in cols:
            db.session.execute(db.text('ALTER TABLE "user" ADD COLUMN role VARCHAR(20) DEFAULT \'user\''))
        if 'approved' not in cols:
            db.session.execute(db.text('ALTER TABLE "user" ADD COLUMN approved BOOLEAN DEFAULT 0'))
        db.session.commit()
    except Exception:
        pass  # Already migrated

    try:
        if not User.query.filter_by(role='manager').first():
            admin = User(
                username='admin',
                email='admin@admin.com',
                password=bcrypt.generate_password_hash('admin').decode('utf-8'),
                role='manager',
                approved=True
            )
            db.session.add(admin)
            db.session.commit()
            logger.info("Default admin created: admin@admin.com / admin")
    except Exception:
        pass  # Another worker already created the admin

# Token Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            # Remove 'Bearer ' if present
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'manager':
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# Custom XGBoost classifier with SMOTE (needed to load the joblib model)
class XGBClassifierWithSMOTE(BaseEstimator, ClassifierMixin):
    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.model = XGBClassifier(**kwargs)
        self.smote = SMOTE(random_state=42, sampling_strategy=0.5)
    
    def fit(self, X, y):
        X_resampled, y_resampled = self.smote.fit_resample(X, y)
        self.model.fit(X_resampled, y_resampled)
        return self
    
    def predict(self, X):
        return self.model.predict(X)
    
    def predict_proba(self, X):
        return self.model.predict_proba(X)
    
    def get_params(self, deep=True):
        return self.kwargs
    
    def set_params(self, **params):
        for key, value in params.items():
            self.kwargs[key] = value
        self.model = XGBClassifier(**self.kwargs)
        return self

model = None
preprocessor = None

# Load the trained models
def load_assets():
    global model, preprocessor
    try:
        model_path = 'xgb_smote_model.joblib'
        prep_path = 'preprocessor.joblib'
        
        # Diagnostic logging
        logger.info(f"Checking for models in: {os.getcwd()}")
        logger.info(f"Files in directory: {os.listdir('.')}")
        
        if os.path.exists(model_path) and os.path.exists(prep_path):
            sys.modules['__main__'].XGBClassifierWithSMOTE = XGBClassifierWithSMOTE
            model = joblib.load(model_path)
            preprocessor = joblib.load(prep_path)
            logger.info("ML Model and Preprocessor loaded successfully")
        else:
            if not os.path.exists(model_path):
                logger.error(f"Missing: {model_path}")
            if not os.path.exists(prep_path):
                logger.error(f"Missing: {prep_path}")
            model = None
            preprocessor = None
    except Exception as e:
        logger.error(f"Critical Error loading models: {e}")
        model = None
        preprocessor = None

# Load ML model on startup
with app.app_context():
    load_assets()

# Helper for feature engineering
def get_user_stats(user_id):
    # SQLite doesn't have a native STDDEV function, so we calculate it safely
    # Get all amounts for this user to calculate std in Python
    amounts = [row[0] for row in db.session.query(TransactionHistory.amount).filter_by(user_id=user_id).all()]
    
    if not amounts:
        return {'count': 0, 'avg': 0.0, 'std': 0.0}
    
    count = len(amounts)
    avg = sum(amounts) / count
    std = np.std(amounts) if count > 1 else 0.0
    
    return {
        'count': count,
        'avg': float(avg),
        'std': float(std)
    }

def engineer_features(data, user_stats, timestamp=None):
    if preprocessor is None:
        raise ValueError("Machine Learning Preprocessor is not loaded. Please ensure preprocessor.joblib exists.")
    
    if timestamp is None:
        timestamp = datetime.datetime.utcnow()
    
    hour = timestamp.hour
    day = timestamp.weekday()
    
    # Basic Feature DataFrame
    df = pd.DataFrame({
        'type': [data['type']],
        'amount': [float(data['amount'])],
        'oldbalanceOrg': [float(data['oldbalanceOrg'])],
        'newbalanceOrig': [float(data['newbalanceOrig'])],
        'oldbalanceDest': [float(data['oldbalanceDest'])],
        'newbalanceDest': [float(data['newbalanceDest'])],
        'balanceDiffOrig': [float(data['oldbalanceOrg']) - float(data['newbalanceOrig'])],
        'balanceDiffDest': [float(data['oldbalanceDest']) - float(data['newbalanceDest'])],
        'amount_log': [np.log1p(float(data['amount']))],
        'amount_to_balance_orig': [float(data['amount']) / (float(data['oldbalanceOrg']) + 1)],
        'amount_to_balance_dest': [float(data['amount']) / (float(data['oldbalanceDest']) + 1)],
        'transaction_count_orig': [user_stats['count'] + 1],
        'transaction_count_dest': [0], # We'd need global DB stats for this, defaulting to 0
        'avg_amount_orig': [user_stats['avg']],
        'std_amount_orig': [user_stats['std']],
        'avg_amount_dest': [0], # Defaulting
        'amount_vs_avg_orig': [float(data['amount']) / (user_stats['avg'] + 1)],
        'amount_vs_avg_dest': [0], # Defaulting
        'hour_of_day': [hour],
        'day_of_week': [day],
        'is_weekend': [1 if day >= 5 else 0],
        'is_night': [1 if hour < 6 or hour > 22 else 0],
        'is_merchant_orig': [0], # Usually C...
        'is_merchant_dest': [1 if data.get('nameDest', '').startswith('M') else 0],
        'balance_to_zero_orig': [1 if float(data['oldbalanceOrg']) > 0 and float(data['newbalanceOrig']) == 0 else 0],
        'balance_to_zero_dest': [0], # Destination doesn't usually go to zero on receive
        'large_transaction_orig': [1 if float(data['amount']) > user_stats['avg'] * 3 else 0],
        'large_transaction_dest': [0],
        'first_transaction_orig': [1 if user_stats['count'] == 0 else 0],
        'is_transfer': [1 if data['type'] == 'TRANSFER' else 0],
        'is_cash_out': [1 if data['type'] == 'CASH_OUT' else 0],
        'is_cash_in': [1 if data['type'] == 'CASH_IN' else 0],
        'is_payment': [1 if data['type'] == 'PAYMENT' else 0],
        'is_debit': [1 if data['type'] == 'DEBIT' else 0],
        'dest_to_orig_balance_ratio': [float(data['oldbalanceDest']) / (float(data['oldbalanceOrg']) + 1)],
        'new_dest_to_orig_ratio': [float(data['newbalanceDest']) / (float(data['newbalanceOrig']) + 1)]
    })
    
    return preprocessor.transform(df)

# --- HEALTH CHECK ---
@app.route('/')
def home():
    return jsonify({
        'status': 'FraudGuard Engine Online',
        'api_version': '2.0',
        'model_loaded': model is not None,
        'preprocessor_loaded': preprocessor is not None,
        'cwd': os.getcwd(),
        'files': os.listdir('.')
    })

# --- AUTH ROUTES ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    role = data.get('role', 'user')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password, role=role)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except:
        return jsonify({'message': 'User already exists'}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'username': user.username,
            'role': user.role or 'user',
            'approved': user.approved if user.approved is not None else False
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

# --- ML ROUTES ---

@app.route('/api/predict', methods=['POST'])
@token_required
def predict(current_user): # current_user is passed by decorator
    try:
        if model is None or preprocessor is None:
            return jsonify({'error': 'AI Model not initialized on server. Check logs.'}), 503
            
        data = request.get_json()
        
        user_stats = get_user_stats(current_user.id)
        processed_data = engineer_features(data, user_stats)
        
        prediction = int(model.predict(processed_data)[0])
        probability = float(model.predict_proba(processed_data)[0][1])

        # Save to database
        tx_history = TransactionHistory(
            user_id=current_user.id,
            type=data['type'],
            amount=float(data['amount']),
            oldbalanceOrg=float(data['oldbalanceOrg']),
            newbalanceOrig=float(data['newbalanceOrig']),
            oldbalanceDest=float(data['oldbalanceDest']),
            newbalanceDest=float(data['newbalanceDest']),
            prediction=prediction,
            probability=probability
        )
        db.session.add(tx_history)
        db.session.commit()
        
        return jsonify({
            'prediction': prediction,
            'probability': probability
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400
@app.route('/api/predict/bulk', methods=['POST'])
@token_required
def predict_bulk(current_user):
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        filename = file.filename.lower()
        if not (filename.endswith('.csv') or filename.endswith('.xls') or filename.endswith('.xlsx')):
            return jsonify({'error': 'File must be a CSV or Excel (.xlsx) file'}), 400

        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)
        except Exception as e:
            return jsonify({'error': f'Failed to parse file: {str(e)}'}), 400
        
        # Verify columns match model requirements
        required_cols = ['type', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
        if not all(col in df.columns for col in required_cols):
            return jsonify({'error': f'File must contain columns: {", ".join(required_cols)}'}), 400
            
        # Run batch prediction
        user_stats = get_user_stats(current_user.id)
        results = []
        fraud_count = 0
        
        for i in range(len(df)):
            row = df.iloc[i]
            # Try to get nameDest if available in CSV, else default
            target_data = {
                'type': row['type'],
                'amount': row['amount'],
                'oldbalanceOrg': row['oldbalanceOrg'],
                'newbalanceOrig': row['newbalanceOrig'],
                'oldbalanceDest': row['oldbalanceDest'],
                'newbalanceDest': row['newbalanceDest'],
                'nameDest': str(row.get('nameDest', ''))
            }
            
            processed_row = engineer_features(target_data, user_stats)
            pred = int(model.predict(processed_row)[0])
            prob = float(model.predict_proba(processed_row)[0][1])
            
            if pred == 1:
                fraud_count += 1
                
            results.append({
                'id': i,
                'prediction': pred,
                'probability': prob
            })

            # Save bulk transactions
            tx_history = TransactionHistory(
                user_id=current_user.id,
                type=target_data['type'],
                amount=float(target_data['amount']),
                oldbalanceOrg=float(target_data['oldbalanceOrg']),
                newbalanceOrig=float(target_data['newbalanceOrig']),
                oldbalanceDest=float(target_data['oldbalanceDest']),
                newbalanceDest=float(target_data['newbalanceDest']),
                prediction=pred,
                probability=prob
            )
            db.session.add(tx_history)
            
        db.session.commit()
            
        return jsonify({
            'total': len(df),
            'fraud_count': fraud_count,
            'safe_count': len(df) - fraud_count,
            'results': results
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/history', methods=['GET'])
@token_required
def get_history(current_user):
    try:
        limit = request.args.get('limit', 20, type=int)
        history = TransactionHistory.query.filter_by(user_id=current_user.id).order_by(TransactionHistory.timestamp.desc()).limit(limit).all()
        
        results = []
        for h in history:
            results.append({
                'id': h.id,
                'type': h.type,
                'amount': h.amount,
                'prediction': h.prediction,
                'probability': h.probability,
                'timestamp': h.timestamp.isoformat() + 'Z'
            })
            
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    try:
        total = TransactionHistory.query.filter_by(user_id=current_user.id).count()
        fraud = TransactionHistory.query.filter_by(user_id=current_user.id, prediction=1).count()
        safe = total - fraud
        
        # Use a hardcoded accuracy for now, but in reality it'd come from model evaluation
        accuracy = 95.2 
        
        return jsonify({
            'total_scanned': total,
            'fraud_detected': fraud,
            'safe_detected': safe,
            'accuracy': accuracy
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# --- ADMIN ROUTES ---

@app.route('/api/admin/stats', methods=['GET'])
@token_required
@admin_required
def admin_stats(current_user):
    try:
        total_users = User.query.count()
        pending_approvals = User.query.filter_by(approved=False).count()
        total_transactions = TransactionHistory.query.count()
        fraud_detected = TransactionHistory.query.filter_by(prediction=1).count()
        safe_detected = TransactionHistory.query.filter_by(prediction=0).count()
        return jsonify({
            'total_users': total_users,
            'pending_approvals': pending_approvals,
            'total_transactions': total_transactions,
            'fraud_detected': fraud_detected,
            'safe_detected': safe_detected
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users', methods=['GET'])
@token_required
@admin_required
def admin_users(current_user):
    try:
        users = User.query.all()
        result = []
        for u in users:
            txn_count = TransactionHistory.query.filter_by(user_id=u.id).count()
            result.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'role': u.role or 'user',
                'approved': u.approved if u.approved is not None else False,
                'transaction_count': txn_count
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users/<int:user_id>/approve', methods=['PUT'])
@token_required
@admin_required
def admin_approve_user(current_user, user_id):
    try:
        user = User.query.get_or_404(user_id)
        user.approved = True
        db.session.commit()
        return jsonify({'message': 'User approved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_user(current_user, user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'password' in data:
            user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        db.session.commit()
        return jsonify({'message': 'User updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_user(current_user, user_id):
    try:
        user = User.query.get_or_404(user_id)
        TransactionHistory.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/users/<int:user_id>/history', methods=['GET'])
@token_required
@admin_required
def admin_user_history(current_user, user_id):
    try:
        limit = request.args.get('limit', 20, type=int)
        txns = TransactionHistory.query.filter_by(user_id=user_id).order_by(TransactionHistory.timestamp.desc()).limit(limit).all()
        return jsonify([{
            'id': t.id,
            'user_id': t.user_id,
            'username': User.query.get(t.user_id).username,
            'type': t.type,
            'amount': t.amount,
            'prediction': t.prediction,
            'probability': t.probability,
            'timestamp': t.timestamp.isoformat() if t.timestamp else None
        } for t in txns])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/history', methods=['GET'])
@token_required
@admin_required
def admin_all_history(current_user):
    try:
        limit = request.args.get('limit', 50, type=int)
        user_id = request.args.get('user_id', type=int)
        query = TransactionHistory.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        txns = query.order_by(TransactionHistory.timestamp.desc()).limit(limit).all()
        return jsonify([{
            'id': t.id,
            'user_id': t.user_id,
            'username': User.query.get(t.user_id).username,
            'type': t.type,
            'amount': t.amount,
            'prediction': t.prediction,
            'probability': t.probability,
            'timestamp': t.timestamp.isoformat() if t.timestamp else None
        } for t in txns])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/admin/account', methods=['PUT'])
@token_required
@admin_required
def admin_update_account(current_user):
    try:
        data = request.get_json()
        if 'username' in data:
            current_user.username = data['username']
        if 'email' in data:
            current_user.email = data['email']
        if 'password' in data:
            current_user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        db.session.commit()
        return jsonify({
            'message': 'Account updated successfully',
            'username': current_user.username,
            'email': current_user.email
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# For local development
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))