import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated, Platform, Dimensions, Modal, ViewStyle, TextStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { predictOnline, predictBulk, BulkPredictionResponse } from '@/services/ml/api';
import { useAuth } from '@/context/AuthContext';
import { BrandColors } from '@/constants/theme';
import { RiskMeter } from '@/components/RiskMeter';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

export default function PredictScreen() {
    const { token } = useAuth();
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [formData, setFormData] = useState({
        type: 'TRANSFER',
        amount: '',
        oldbalanceOrg: '',
        newbalanceOrig: '',
        oldbalanceDest: '',
        newbalanceDest: '',
        nameDest: ''
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ prediction: number, probability: number } | null>(null);
    const [bulkResult, setBulkResult] = useState<BulkPredictionResponse | null>(null);
    const [fadeAnim] = useState(new Animated.Value(0));

    const transactionTypes = ['TRANSFER', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'CASH_IN'];

    const resetResults = () => {
        setResult(null);
        setBulkResult(null);
        fadeAnim.setValue(0);
    };

    const submitPrediction = async () => {
        if (!token) {
            Alert.alert("Auth Error", "You must be logged in to perform analysis.");
            return;
        }

        const isMissingValues = Object.entries(formData).some(([key, value]) => value === '');
        if (isMissingValues) {
            Alert.alert("Missing Details", "Please provide all transaction details to run the scanner.");
            return;
        }

        setLoading(true);
        resetResults();

        try {
            const txData = {
                type: formData.type,
                amount: parseFloat(formData.amount),
                oldbalanceOrg: parseFloat(formData.oldbalanceOrg),
                newbalanceOrig: parseFloat(formData.newbalanceOrig),
                oldbalanceDest: parseFloat(formData.oldbalanceDest),
                newbalanceDest: parseFloat(formData.newbalanceDest),
                nameDest: formData.nameDest
            };

            const predictionResult = await predictOnline(txData, token);
            setResult(predictionResult);
            
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } catch (error: any) {
            Alert.alert("Analysis Error", error.message || "Failed to reach detection engine.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async () => {
        if (!token) {
            Alert.alert("Auth Error", "Please login to Batch Process.");
            return;
        }

        try {
            const pickerResult = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (pickerResult.canceled) return;
            const file = pickerResult.assets[0];
            
            if (!file.name.toLowerCase().endsWith('.csv')) {
                Alert.alert("Unsupported Format", "Please provide a .csv transaction log.");
                return;
            }
            
            setLoading(true);
            resetResults();

            const response = await predictBulk(file.uri, file.name, token);
            setBulkResult(response);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

        } catch (error: any) {
            Alert.alert("Batch Operation Error", error.message || "Failed to process bulk scan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={viewStyles.container}>
            <View style={viewStyles.topCurvedBackground} />
            
            <ScrollView 
                contentContainerStyle={viewStyles.content} 
                showsVerticalScrollIndicator={false}
            >
                <View style={viewStyles.header}>
                    <Text style={textStyles.title}>Scanner Engine</Text>
                    <Text style={textStyles.subtitle}>High-precision financial threat detection.</Text>
                </View>

                {/* Mode Switcher */}
                <View style={viewStyles.modeContainer}>
                    <TouchableOpacity 
                        style={[viewStyles.modeBtn, mode === 'single' && viewStyles.activeModeBtn]} 
                        onPress={() => { setMode('single'); resetResults(); }}
                    >
                        <Text style={[textStyles.modeText, mode === 'single' && textStyles.activeModeText]}>Direct Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[viewStyles.modeBtn, mode === 'bulk' && viewStyles.activeModeBtn]} 
                        onPress={() => { setMode('bulk'); resetResults(); }}
                    >
                        <Text style={[textStyles.modeText, mode === 'bulk' && textStyles.activeModeText]}>Batch Process</Text>
                    </TouchableOpacity>
                </View>

                {mode === 'single' ? (
                    <View style={viewStyles.card}>
                        <Text style={textStyles.label}>Transaction Method</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={viewStyles.typeScroll} contentContainerStyle={viewStyles.typeScrollContent}>
                            {transactionTypes.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        viewStyles.typeButton,
                                        formData.type === t && viewStyles.activeTypeButton
                                    ]}
                                    onPress={() => setFormData({ ...formData, type: t })}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[
                                        textStyles.typeText,
                                        formData.type === t && textStyles.activeTypeText
                                    ]}>
                                        {t.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={textStyles.label}>Analysis Amount</Text>
                        <View style={viewStyles.inputWrapper}>
                            <Text style={textStyles.currencySymbol}>$</Text>
                            <TextInput
                                style={textStyles.input}
                                keyboardType="decimal-pad"
                                value={formData.amount}
                                onChangeText={(val) => setFormData({ ...formData, amount: val })}
                                placeholder="0.00"
                                placeholderTextColor="#A5ADBA"
                            />
                        </View>

                        <View style={viewStyles.divider} />

                        <Text style={textStyles.sectionHeading}>Origin Details</Text>
                        <View style={viewStyles.row}>
                            <View style={viewStyles.inputGroup}>
                                <Text style={textStyles.tinyLabel}>Old Balance</Text>
                                <TextInput
                                    style={textStyles.inputBox}
                                    keyboardType="decimal-pad" 
                                    value={formData.oldbalanceOrg} 
                                    onChangeText={(val) => setFormData({ ...formData, oldbalanceOrg: val })} 
                                    placeholder="0.00" 
                                    placeholderTextColor="#A5ADBA" 
                                />
                            </View>
                            <View style={[viewStyles.inputGroup, { marginLeft: 16 }]}>
                                <Text style={textStyles.tinyLabel}>New Balance</Text>
                                <TextInput 
                                    style={textStyles.inputBox} 
                                    keyboardType="decimal-pad" 
                                    value={formData.newbalanceOrig} 
                                    onChangeText={(val) => setFormData({ ...formData, newbalanceOrig: val })} 
                                    placeholder="0.00" 
                                    placeholderTextColor="#A5ADBA" 
                                />
                            </View>
                        </View>

                        <View style={viewStyles.dividerLight} />

                        <Text style={textStyles.sectionHeading}>Destination Intelligence</Text>
                        <View style={viewStyles.row}>
                            <View style={viewStyles.inputGroup}>
                                <Text style={textStyles.tinyLabel}>Account ID / Signature</Text>
                                <TextInput 
                                    style={textStyles.inputBox} 
                                    value={formData.nameDest} 
                                    onChangeText={(val) => setFormData({ ...formData, nameDest: val })} 
                                    placeholder="M123... or C456..." 
                                    placeholderTextColor="#A5ADBA" 
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>
                        <View style={[viewStyles.row, { marginTop: 16 }]}>
                            <View style={viewStyles.inputGroup}>
                                <Text style={textStyles.tinyLabel}>Prior Balance</Text>
                                <TextInput style={textStyles.inputBox} keyboardType="decimal-pad" value={formData.oldbalanceDest} onChangeText={(val) => setFormData({ ...formData, oldbalanceDest: val })} placeholder="0.00" placeholderTextColor="#A5ADBA" />
                            </View>
                            <View style={[viewStyles.inputGroup, { marginLeft: 16 }]}>
                                <Text style={textStyles.tinyLabel}>Final Balance</Text>
                                <TextInput style={textStyles.inputBox} keyboardType="decimal-pad" value={formData.newbalanceDest} onChangeText={(val) => setFormData({ ...formData, newbalanceDest: val })} placeholder="0.00" placeholderTextColor="#A5ADBA" />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[viewStyles.submitBtn, loading && { opacity: 0.7 }]}
                            onPress={submitPrediction}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={textStyles.submitBtnText}>Initialize Analysis</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={viewStyles.bulkCard}>
                        <View style={viewStyles.bulkIconBox}>
                            <IconSymbol name="network" size={50} color={BrandColors.primary} />
                        </View>
                        <Text style={textStyles.bulkTitle}>Batch Operations</Text>
                        <Text style={textStyles.bulkDesc}>
                            Deploy standard transaction logs in CSV format for recursive fraud detection.
                        </Text>
                        <TouchableOpacity 
                            style={viewStyles.uploadBtn} 
                            onPress={handleBulkUpload}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <IconSymbol name="plus.circle.fill" size={20} color="#FFF" />
                                    <Text style={textStyles.uploadBtnText}>Upload Log File</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Single Result Rendering */}
                {result && (
                    <Animated.View style={[
                        viewStyles.resultCard, 
                        { 
                          opacity: fadeAnim, 
                          borderColor: result.prediction === 1 ? BrandColors.danger : BrandColors.success,
                          backgroundColor: result.prediction === 1 ? '#FFF5F5' : '#F0FFF4'
                        }
                    ]}>
                        <RiskMeter probability={result.probability} />
                        <View style={viewStyles.resultMeta}>
                            <Text style={[textStyles.resultTitle, { color: result.prediction === 1 ? BrandColors.danger : BrandColors.success }]}>
                                {result.prediction === 1 ? 'THREAT IDENTIFIED' : 'SIGNAL SECURE'}
                            </Text>
                            <View style={viewStyles.scoreRow}>
                                <Text style={textStyles.scoreLabel}>Confidence Index:</Text>
                                <Text style={textStyles.scoreValue}>{(result.probability * 100).toFixed(2)}%</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Bulk Result Modal */}
                <Modal visible={!!bulkResult} transparent animationType="fade" onRequestClose={() => setBulkResult(null)}>
                    <View style={viewStyles.modalOverlay}>
                        <Animated.View style={[viewStyles.modalContainer, { opacity: fadeAnim }]}>
                            <View style={[viewStyles.modalHeader, { backgroundColor: BrandColors.primary }]}>
                                <View style={viewStyles.modalIconCircle}>
                                    <IconSymbol name="checkmark.shield.fill" size={36} color={BrandColors.primary} />
                                </View>
                                <Text style={textStyles.modalTitle}>Scan Complete</Text>
                                <Text style={textStyles.modalSubtitle}>Batch analysis finished successfully</Text>
                            </View>

                            {bulkResult && (
                                <>
                                    <View style={viewStyles.modalBody}>
                                        <View style={viewStyles.modalStatsRow}>
                                            <View style={[viewStyles.modalStatCard, { backgroundColor: '#F4F5F7' }]}>
                                                <Text style={textStyles.modalStatValue}>{bulkResult.total}</Text>
                                                <Text style={textStyles.modalStatLabel}>Processed</Text>
                                            </View>
                                            <View style={[viewStyles.modalStatCard, { backgroundColor: BrandColors.lightRed }]}>
                                                <Text style={[textStyles.modalStatValue, { color: BrandColors.danger }]}>{bulkResult.fraud_count}</Text>
                                                <Text style={[textStyles.modalStatLabel, { color: BrandColors.danger }]}>Threats</Text>
                                            </View>
                                            <View style={[viewStyles.modalStatCard, { backgroundColor: BrandColors.lightGreen }]}>
                                                <Text style={[textStyles.modalStatValue, { color: BrandColors.success }]}>{bulkResult.safe_count}</Text>
                                                <Text style={[textStyles.modalStatLabel, { color: BrandColors.success }]}>Secure</Text>
                                            </View>
                                        </View>

                                        <View style={viewStyles.modalBarSection}>
                                            <View style={viewStyles.modalBarHeader}>
                                                <Text style={textStyles.modalBarLabel}>Legitimate</Text>
                                                <Text style={[textStyles.modalBarLabel, { color: BrandColors.danger }]}>Fraudulent</Text>
                                            </View>
                                            <View style={viewStyles.modalBarBg}>
                                                <View style={[viewStyles.modalBarSafe, { flex: bulkResult.safe_count }]} />
                                                <View style={[viewStyles.modalBarFraud, { flex: bulkResult.fraud_count || 0.01 }]} />
                                            </View>
                                            <View style={viewStyles.modalBarPercentages}>
                                                <Text style={[textStyles.modalBarPct, { color: BrandColors.success }]}>
                                                    {((bulkResult.safe_count / bulkResult.total) * 100).toFixed(1)}%
                                                </Text>
                                                <Text style={[textStyles.modalBarPct, { color: BrandColors.danger }]}>
                                                    {((bulkResult.fraud_count / bulkResult.total) * 100).toFixed(1)}%
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={viewStyles.modalResultLine}>
                                            <IconSymbol name={bulkResult.fraud_count > 0 ? "exclamationmark.shield.fill" : "checkmark.shield.fill"} size={18} color={bulkResult.fraud_count > 0 ? BrandColors.danger : BrandColors.success} />
                                            <Text style={[textStyles.modalResultText, { color: bulkResult.fraud_count > 0 ? BrandColors.danger : BrandColors.success }]}>
                                                {bulkResult.fraud_count > 0
                                                    ? `${bulkResult.fraud_count} suspicious transaction${bulkResult.fraud_count > 1 ? 's' : ''} flagged`
                                                    : 'All transactions appear legitimate'}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={viewStyles.modalDoneBtn} onPress={() => setBulkResult(null)} activeOpacity={0.8}>
                                        <Text style={textStyles.modalDoneText}>Done</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Animated.View>
                    </View>
                </Modal>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const viewStyles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: BrandColors.background 
    } as ViewStyle,
    topCurvedBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 340,
        backgroundColor: '#EBF4FF',
        borderBottomLeftRadius: 80,
        opacity: 0.7,
    } as ViewStyle,
    content: { 
        padding: 24, 
        paddingTop: 64 
    } as ViewStyle,
    header: { 
        marginBottom: 32 
    } as ViewStyle,
    modeContainer: { 
        flexDirection: 'row', 
        backgroundColor: '#F4F5F7', 
        borderRadius: 16, 
        padding: 6, 
        marginBottom: 32,
        borderWidth: 1,
        borderColor: BrandColors.border
    } as ViewStyle,
    modeBtn: { 
        flex: 1, 
        paddingVertical: 12, 
        alignItems: 'center', 
        borderRadius: 12 
    } as ViewStyle,
    activeModeBtn: { 
        backgroundColor: BrandColors.primary,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    } as ViewStyle,
    card: { 
        padding: 24, 
        borderRadius: 32, 
        backgroundColor: BrandColors.white,
        borderWidth: 1, 
        borderColor: BrandColors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5
    } as ViewStyle,
    typeScroll: { 
        marginBottom: 24,
        marginTop: 8
    } as ViewStyle,
    typeScrollContent: { 
        paddingRight: 8 
    } as ViewStyle,
    typeButton: { 
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 20, 
        borderWidth: 1.5, 
        borderColor: BrandColors.border, 
        marginRight: 10,
        backgroundColor: '#F8FAFC'
    } as ViewStyle,
    activeTypeButton: { 
        backgroundColor: BrandColors.primary, 
        borderColor: BrandColors.primary 
    } as ViewStyle,
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderRadius: 16, 
        borderWidth: 1.5, 
        borderColor: BrandColors.border,
        height: 60, 
        paddingHorizontal: 20,
        backgroundColor: '#F8FAFC',
        marginTop: 8
    } as ViewStyle,
    divider: { 
        height: 1, 
        backgroundColor: '#EDF2F7', 
        marginVertical: 24 
    } as ViewStyle,
    dividerLight: { 
        height: 1, 
        backgroundColor: '#F8FAFC', 
        marginVertical: 20 
    } as ViewStyle,
    row: { 
        flexDirection: 'row' 
    } as ViewStyle,
    inputGroup: { 
        flex: 1 
    } as ViewStyle,
    submitBtn: { 
        height: 60, 
        borderRadius: 18, 
        backgroundColor: BrandColors.primary,
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 32,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8
    } as ViewStyle,
    bulkCard: { 
        padding: 48, 
        borderRadius: 32, 
        backgroundColor: BrandColors.white,
        borderWidth: 1, 
        borderColor: BrandColors.border,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    } as ViewStyle,
    bulkIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EBF4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    } as ViewStyle,
    uploadBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12, 
        paddingVertical: 18, 
        paddingHorizontal: 36, 
        borderRadius: 20,
        backgroundColor: BrandColors.primary,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6
    } as ViewStyle,
    resultCard: { 
        marginTop: 32, 
        padding: 28, 
        borderRadius: 32, 
        alignItems: 'center', 
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8
    } as ViewStyle,
    resultMeta: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16
    } as ViewStyle,
    scoreRow: { 
        flexDirection: 'row', 
        gap: 8, 
        alignItems: 'center',
        marginTop: 8
    } as ViewStyle,
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(9, 30, 66, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    } as ViewStyle,
    modalContainer: {
        width: '100%',
        backgroundColor: BrandColors.white,
        borderRadius: 40,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
        elevation: 15,
    } as ViewStyle,
    modalHeader: {
        alignItems: 'center',
        paddingVertical: 36,
        paddingHorizontal: 24,
    } as ViewStyle,
    modalIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    } as ViewStyle,
    modalBody: {
        padding: 28,
        paddingBottom: 8,
    } as ViewStyle,
    modalStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    } as ViewStyle,
    modalStatCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
        borderRadius: 20,
    } as ViewStyle,
    modalBarSection: {
        marginBottom: 24,
    } as ViewStyle,
    modalBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    } as ViewStyle,
    modalBarBg: {
        flexDirection: 'row',
        height: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
        overflow: 'hidden',
    } as ViewStyle,
    modalBarSafe: {
        backgroundColor: BrandColors.success,
    } as ViewStyle,
    modalBarFraud: {
        backgroundColor: BrandColors.danger,
    } as ViewStyle,
    modalBarPercentages: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    } as ViewStyle,
    modalResultLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
    } as ViewStyle,
    modalDoneBtn: {
        marginHorizontal: 28,
        marginBottom: 28,
        height: 56,
        borderRadius: 18,
        backgroundColor: BrandColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    } as ViewStyle,
});

const textStyles = StyleSheet.create({
    title: { 
        fontSize: 34, 
        fontWeight: '900', 
        letterSpacing: -1,
        color: BrandColors.textMain
    } as TextStyle,
    subtitle: { 
        fontSize: 16, 
        lineHeight: 24,
        color: BrandColors.textSub,
        marginTop: 4
    } as TextStyle,
    modeText: { 
        fontWeight: '800', 
        fontSize: 15, 
        color: '#64748B' 
    } as TextStyle,
    activeModeText: { 
        color: '#FFFFFF' 
    } as TextStyle,
    label: { 
        fontSize: 12, 
        fontWeight: '800', 
        color: BrandColors.textSub,
        marginBottom: 10, 
        textTransform: 'uppercase',
        letterSpacing: 0.5
    } as TextStyle,
    typeText: { 
        fontSize: 14, 
        fontWeight: '700',
        color: '#64748B' 
    } as TextStyle,
    activeTypeText: { 
        color: '#FFFFFF' 
    } as TextStyle,
    currencySymbol: { 
        fontSize: 22, 
        fontWeight: '900', 
        marginRight: 10,
        color: BrandColors.textMain
    } as TextStyle,
    input: { 
        flex: 1, 
        fontSize: 20, 
        fontWeight: '900',
        color: BrandColors.textMain
    } as TextStyle,
    sectionHeading: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: BrandColors.textMain,
        marginBottom: 16 
    } as TextStyle,
    tinyLabel: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: BrandColors.textSub,
        marginBottom: 8 
    } as TextStyle,
    submitBtnText: { 
        color: '#FFF', 
        fontSize: 18, 
        fontWeight: '900' 
    } as TextStyle,
    bulkTitle: { 
        fontSize: 24, 
        fontWeight: '900', 
        color: BrandColors.textMain,
        marginTop: 8, 
        marginBottom: 12 
    } as TextStyle,
    bulkDesc: { 
        fontSize: 15, 
        textAlign: 'center', 
        lineHeight: 24, 
        color: BrandColors.textSub,
        marginBottom: 36 
    } as TextStyle,
    uploadBtnText: { 
        color: '#FFF', 
        fontSize: 17, 
        fontWeight: '800' 
    } as TextStyle,
    resultTitle: { 
        fontSize: 22, 
        fontWeight: '900', 
        letterSpacing: 0.5 
    } as TextStyle,
    scoreLabel: { 
        fontSize: 15, 
        fontWeight: '700',
        color: BrandColors.textSub 
    } as TextStyle,
    scoreValue: { 
        fontSize: 18, 
        fontWeight: '900',
        color: BrandColors.textMain
    } as TextStyle,
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    } as TextStyle,
    modalSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 6,
    } as TextStyle,
    modalStatValue: {
        fontSize: 28,
        fontWeight: '900',
        color: BrandColors.textMain,
        letterSpacing: -0.5,
    } as TextStyle,
    modalStatLabel: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: BrandColors.textSub,
        marginTop: 6,
    } as TextStyle,
    modalBarLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: BrandColors.success,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    } as TextStyle,
    modalBarPct: {
        fontSize: 14,
        fontWeight: '900',
    } as TextStyle,
    modalResultText: {
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    } as TextStyle,
    modalDoneText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    } as TextStyle,
    inputBox: { 
        height: 52, 
        borderRadius: 14, 
        borderWidth: 1.5, 
        borderColor: BrandColors.border, 
        paddingHorizontal: 16, 
        fontSize: 16, 
        fontWeight: '600',
        backgroundColor: '#F8FAFC'
    } as TextStyle,
});
