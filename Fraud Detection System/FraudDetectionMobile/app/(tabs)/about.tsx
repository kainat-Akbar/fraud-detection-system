import React from 'react';
import { StyleSheet, View, Text, ScrollView, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
    // Brand Consistent Theme
    const textColor = BrandColors.textMain;
    const subTextColor = BrandColors.textSub;
    const accentBlue = BrandColors.primary;
    const accentLightBlue = BrandColors.lightBlue;
    const successGreen = BrandColors.success;
    const cardBg = BrandColors.white;
    const borderColor = BrandColors.border;

    return (
        <View style={viewStyles.container}>
            <View style={viewStyles.topCurvedBackground} />
            
            <ScrollView 
                contentContainerStyle={viewStyles.content} 
                showsVerticalScrollIndicator={false}
            >
                <View style={viewStyles.header}>
                    <Text style={textStyles.title}>Intelligence</Text>
                    <Text style={textStyles.subtitle}>Foundational architecture and core metrics.</Text>
                </View>

                <View style={viewStyles.card}>
                    <View style={viewStyles.cardHeader}>
                        <View style={[viewStyles.iconBg, { backgroundColor: accentLightBlue }]}>
                            <IconSymbol name="cube.fill" size={24} color={accentBlue} />
                        </View>
                        <Text style={textStyles.cardTitle}>Training Dataset</Text>
                    </View>
                    <Text style={textStyles.cardBody}>
                        The artificial intelligence model underpinning FraudGuard is trained on a massive foundational dataset containing over 6.3 million real-world financial transactions, capturing complex fraudulent topologies.
                    </Text>
                </View>

                <View style={viewStyles.card}>
                    <View style={viewStyles.cardHeader}>
                        <View style={[viewStyles.iconBg, { backgroundColor: '#E3FCEF' }]}>
                            <IconSymbol name="network" size={24} color={successGreen} />
                        </View>
                        <Text style={textStyles.cardTitle}>Backend Integration</Text>
                    </View>

                    <View style={viewStyles.dataRow}>
                        <Text style={textStyles.dataKey}>Algorithm</Text>
                        <View style={viewStyles.badge}>
                            <Text style={textStyles.badgeText}>XGBoost + SMOTE</Text>
                        </View>
                    </View>
                    <View style={viewStyles.dataRow}>
                        <Text style={textStyles.dataKey}>Feature Set</Text>
                        <Text style={textStyles.dataValue}>35 Advanced Vectors</Text>
                    </View>
                    <View style={[viewStyles.dataRow, { borderBottomWidth: 0 }]}>
                        <Text style={textStyles.dataKey}>Balancing</Text>
                        <Text style={textStyles.dataValue}>Synthetic Oversampling</Text>
                    </View>
                </View>

                <View style={viewStyles.card}>
                    <View style={viewStyles.cardHeader}>
                        <View style={[viewStyles.iconBg, { backgroundColor: accentLightBlue }]}>
                            <IconSymbol name="chart.pie.fill" size={24} color={accentBlue} />
                        </View>
                        <Text style={textStyles.cardTitle}>Performance Matrix</Text>
                    </View>

                    <Text style={[textStyles.cardBody, { marginBottom: 24 }]}>
                        Advanced ensemble learning optimized via SMOTE to maximize recall on minority fraud classes while maintaining high precision.
                    </Text>

                    <View style={viewStyles.progressSection}>
                        <View style={viewStyles.progressHeader}>
                            <Text style={textStyles.progressText}>Detection Recall</Text>
                            <Text style={[textStyles.progressPercent, { color: successGreen }]}>97.9%</Text>
                        </View>
                        <View style={viewStyles.progressBg}>
                            <View style={[viewStyles.progressBar, { width: '97.9%', backgroundColor: successGreen }]} />
                        </View>
                    </View>

                    <View style={viewStyles.progressSection}>
                        <View style={viewStyles.progressHeader}>
                            <Text style={textStyles.progressText}>Model Accuracy</Text>
                            <Text style={[textStyles.progressPercent, { color: accentBlue }]}>99.9%</Text>
                        </View>
                        <View style={viewStyles.progressBg}>
                            <View style={[viewStyles.progressBar, { width: '99.9%', backgroundColor: accentBlue }]} />
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
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
        height: 320,
        backgroundColor: '#EBF4FF',
        borderBottomRightRadius: 80,
        opacity: 0.7,
    } as ViewStyle,
    content: { 
        padding: 24, 
        paddingTop: 64 
    } as ViewStyle,
    header: { 
        marginBottom: 32 
    } as ViewStyle,
    card: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
        backgroundColor: BrandColors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        borderWidth: 1,
        borderColor: BrandColors.border,
    } as ViewStyle,
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20, 
        gap: 16 
    } as ViewStyle,
    iconBg: { 
        width: 52, 
        height: 52, 
        borderRadius: 26, 
        justifyContent: 'center', 
        alignItems: 'center' 
    } as ViewStyle,
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderColor: '#F8FAFC'
    } as ViewStyle,
    badge: {
        backgroundColor: '#EBF4FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    } as ViewStyle,
    progressSection: {
        marginBottom: 24,
    } as ViewStyle,
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    } as ViewStyle,
    progressBg: { 
        height: 12, 
        backgroundColor: '#F4F5F7', 
        borderRadius: 6, 
        overflow: 'hidden' 
    } as ViewStyle,
    progressBar: { 
        height: '100%', 
        borderRadius: 6 
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
        fontSize: 15, 
        fontWeight: '600',
        color: BrandColors.textSub,
        marginTop: 4
    } as TextStyle,
    cardTitle: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: BrandColors.textMain,
        letterSpacing: -0.5 
    } as TextStyle,
    cardBody: { 
        fontSize: 15, 
        lineHeight: 24,
        color: BrandColors.textSub
    } as TextStyle,
    dataKey: { 
        fontSize: 15, 
        fontWeight: '700',
        color: BrandColors.textSub 
    } as TextStyle,
    dataValue: { 
        fontSize: 15, 
        fontWeight: '900',
        color: BrandColors.textMain 
    } as TextStyle,
    badgeText: {
        color: BrandColors.primary,
        fontSize: 13,
        fontWeight: '900',
    } as TextStyle,
    progressText: { 
        fontSize: 15, 
        fontWeight: '800',
        color: BrandColors.textMain
    } as TextStyle,
    progressPercent: { 
        fontSize: 16, 
        fontWeight: '900' 
    } as TextStyle,
});
