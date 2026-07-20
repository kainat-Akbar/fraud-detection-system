<div align="center">

# 🛡️ AI-Powered Mobile Fraud Detection Application

### React Native (Expo) • Python Flask • XGBoost • REST APIs • JWT • MySQL

A mobile application that uses Machine Learning to identify potentially fraudulent financial transactions in real time.

</div>

---

# 📖 Overview

The **AI-Powered Mobile Fraud Detection Application** is a Final Year Project developed to help identify fraudulent financial transactions using Machine Learning.

The system combines a **React Native (Expo)** mobile application, a **Python Flask** backend, and an **XGBoost** Machine Learning model to provide secure and real-time fraud prediction.

The application supports both **single transaction analysis** and **bulk CSV verification**, allowing users to detect suspicious transactions efficiently. It also includes role-based access control where managers can approve new staff accounts and manage system users.

---

# ✨ Features

### 🤖 AI-Based Fraud Detection

- Detect fraudulent financial transactions using an XGBoost Machine Learning model.
- Predict fraud for individual transactions in real time.
- Analyze multiple transactions through bulk CSV upload.

---

### 👥 Role-Based Access Control

The application provides two user roles with different levels of access.

#### Manager

Managers have full administrative access and can:

- Approve or reject newly registered staff accounts
- Manage staff profiles
- Access the manager dashboard
- Perform single transaction fraud prediction
- Upload CSV files for bulk fraud verification
- View all transaction history across the system
- Monitor which staff members performed fraud analysis
- Review fraud prediction results
- Download fraud analysis reports in PDF format
- View dashboard statistics such as total scans, approvel, total fraud's

#### Staff

Approved staff members can:

- Log in after manager approval
- Access the staff dashboard
- Perform single transaction fraud prediction
- Upload CSV files for bulk verification
- View only their own transaction history
- Download their own fraud analysis reports
- View personal dashboard statistics
- Manage their own profile

### 📊 Fraud Analysis

The application allows users to:

- Analyze a single transaction
- Upload CSV files for batch verification
- View fraud prediction results
- Save prediction history
- Download reports in PDF format

---

# 🛠 Technology Stack

## Mobile Application

- React Native
- Expo

## Backend

- Python
- Flask
- REST APIs
- JWT Authentication

## Machine Learning

- XGBoost
- Scikit-learn
- Pandas
- NumPy
- SMOTE

## Database

- MySQL

## Development Tools

- Git
- GitHub
- Google Colab
- Visual Studio Code
- Docker

---

# 🎯 Project Objectives

The main objective of this project is to develop a secure and intelligent mobile application capable of detecting fraudulent financial transactions using Machine Learning.

The project aims to:

- Improve fraud detection accuracy
- Reduce manual verification effort
- Provide secure authentication
- Support real-time fraud prediction
- Enable bulk transaction verification
- Maintain transaction history
- Generate downloadable PDF reports
- Provide role-based access for managers and staff

---


# 🏗️ System Architecture

The application follows a multi-layer architecture where the mobile application communicates with the Flask backend through secure REST APIs. The backend authenticates users, processes requests, interacts with the Machine Learning model, and returns fraud prediction results to the mobile application.

```text
                    React Native (Expo)
                            │
                     HTTPS REST APIs
                            │
                            ▼
                  Python Flask Backend
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
 JWT Authentication   XGBoost ML Model     MySQL Database
                     Fraud Prediction      User & History Data
                            │
                            ▼
                  Prediction Response
                            │
                            ▼
                  Mobile Application
```

---


# ⚙️ How the System Works

The application processes transactions through the following workflow:

1. The user logs in to the mobile application.
2. Staff accounts require manager approval before they can access the system.
3. After successful authentication, the user can analyze either:
   - a single transaction, or
   - a CSV file containing multiple transactions.
4. The mobile application sends the request to the Flask REST API.
5. The backend validates the request and preprocesses the input data.
6. The trained XGBoost model predicts whether each transaction is fraudulent or legitimate.
7. The prediction results are stored in the MySQL database.
8. The prediction results are returned to the mobile application.
9. Managers can view all transaction history, fraud reports, and dashboard statistics across the system.
10. Staff members can view only their own transaction history, reports, and dashboard statistics.
11. Users can download fraud analysis reports in PDF format.

---

# 🤖 Machine Learning Pipeline

The fraud detection model was developed using a structured Machine Learning workflow.

### Dataset Preparation

The dataset was cleaned and prepared before training.

The preprocessing phase included:

- Removing unnecessary data
- Handling missing values
- Feature engineering
- Data transformation

---

### Handling Class Imbalance

Financial fraud datasets are highly imbalanced.

To improve model performance, **SMOTE (Synthetic Minority Over-sampling Technique)** was applied to balance the training dataset.

---

### Model Training

The Machine Learning model was trained using **XGBoost**, which is well suited for structured tabular data and fraud detection tasks.

---

### Model Evaluation

The model performance was evaluated using:

- Precision
- Recall
- F1-Score

The trained model and preprocessing pipeline were then saved and integrated with the Flask backend for real-time prediction.

---

# 🔐 Authentication & Authorization

The application uses MYSQL together with JWT-based authorization to secure user access.

After successful login, the backend generates a JSON Web Token (JWT) with a validity period of **24 hours**. Users must log in again after the token expires.

The system implements role-based access control.

### Manager Permissions

Managers can:

- Approve new staff accounts
- Manage staff profiles
- Access all system transactions
- Monitor fraud detection activity
- View dashboard analytics
- Download all fraud reports

### Staff Permissions

Staff members can:

- Access the application after manager approval
- Analyze transactions
- Upload CSV files
- View only their own transaction history
- Download their own reports
- Manage their own profile
 ---

# 📱 Mobile Application

The mobile application is developed using React Native (Expo) and provides a clean interface for fraud analysis.

Main modules include:

- Login
- Registration
- Manager Dashboard
- Staff Dashboard
- Fraud Scanner
- Single Transaction Prediction
- Bulk CSV Verification
- Transaction History
- PDF Report Download
- Profile Management

Different dashboards are provided for managers and staff based on their permissions.
# 📊 Dashboard Analytics

The application provides dashboard statistics based on user roles.

### Manager Dashboard

- Total transactions analyzed
- Total fraud cases detected
- Today's fraud analysis summary
- Complete transaction history
- Staff activity monitoring
- Download fraud reports

### Staff Dashboard

- Personal transaction count
- Personal fraud detection count
- Personal transaction history
- Download personal fraud reports

# 🗂️ Project Structure

```text
fraud-detection-system/

└── Fraud Detection System/
    │
    ├── FraudDetectionMobile/
    │      React Native (Expo) Mobile Application
    │
    ├── app.py
    │      Flask Backend
    │
    ├── fraud-detection.ipynb
    │      Machine Learning Training Notebook
    │
    ├── xgb_smote_model.joblib
    │      Trained XGBoost Model
    │
    ├── preprocessor.joblib
    │      Data Preprocessing Pipeline
    │
    ├── requirements.txt
    │      Python Dependencies
    │
    ├── Dockerfile
    │
    ├── .gitignore
    └── .dockerignore

```

---

## 🚀 Backend Responsibilities

The Flask backend is responsible for:

- User authentication
- JWT token validation
- Fraud prediction requests
- Bulk CSV processing
- Communication with the Machine Learning model
- Database operations
- Returning prediction results to the mobile application

---



# 🚀 Getting Started

## Prerequisites

Before running the project, make sure the following software is installed:

- Python 3.x
- Node.js
- Expo CLI
- Git
- MySQL
- Visual Studio Code (Recommended)

---

# 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kainat-Akbar/fraud-detection-system.git
```

---

### 2. Navigate to the Project Directory

```bash
cd fraud-detection-system
```

---

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Start the Flask Backend

```bash
python app.py
```

The backend server will start and expose the REST APIs required by the mobile application.

---

### 5. Run the Mobile Application

Navigate to the mobile application folder.

```bash
cd FraudDetectionMobile
```

Install the required packages.

```bash
npm install
```

Start the Expo development server.

```bash
npx expo start
```

Scan the generated QR code using the **Expo Go** application to run the mobile app.

---

# 🔌 REST API Overview

The Flask backend exposes REST APIs that allow the mobile application to communicate with the Machine Learning model.

Main functionalities include:

- User Registration
- User Login
- JWT Authentication
- Manager Approval
- Single Transaction Prediction
- Bulk CSV Prediction
- Transaction History
- User Profile Management
- PDF Report Generation

---

# 📊 Prediction Workflow

```text
User Login
      │
      ▼
React Native Mobile App
      │
      ▼
Flask REST API
      │
      ▼
Input Validation
      │
      ▼
Data Preprocessing
      │
      ▼
XGBoost Machine Learning Model
      │
      ▼
Fraud Prediction
      │
      ▼
Save History
      │
      ▼
Return Result
      │
      ▼
Display in Mobile App
```

---

# 📸 Application Modules

The application consists of the following modules:

- Login
- Registration
- Manager Dashboard
- Staff Dashboard
- Fraud Scanner
- Single Transaction Prediction
- Bulk CSV Verification
- Transaction History
- User Profile
- PDF Report Download

> Screenshots can be added in the future to provide a visual overview of each module.

---

# 🎯 Learning Outcomes

This project provided practical experience in:

- Machine Learning Model Development
- Data Preprocessing
- Feature Engineering
- Handling Imbalanced Data using SMOTE
- Model Evaluation
- Python Backend Development
- Flask REST API Development
- Authentication & Authorization
- Mobile Application Development using React Native (Expo)
- Database Integration
- Git & GitHub Version Control

---

# 🚀 Future Improvements

Potential future enhancements include:

- Explainable AI (XAI)
- Advanced Fraud Analytics Dashboard
- Cloud Deployment
- Real-time Notifications
- Enhanced Reporting & Visualization
- Performance Optimization
- Multi-language Support

---

# 👩‍💻 Author

## Kainat Akbar

**AI & Python Backend Developer**

Recent BS Information Technology Graduate passionate about Artificial Intelligence, Machine Learning, and Python Backend Development.

Currently seeking internship opportunities in:

- Artificial Intelligence
- Machine Learning
- Python Backend Development

- **GitHub:** https://github.com/kainat-Akbar
- **LinkedIn:** https://www.linkedin.com/in/kainat-akbar-bsit

---

# 📄 License

This project is shared for educational and portfolio purpose

---

<div align="center">

⭐ If you found this project interesting, consider giving it a Star.

Thank you for visiting this repository!

</div>
