import React from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, RefreshControl, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getStats, DashboardStats } from '@/services/ml/api';
import { BrandColors } from '@/constants/theme';
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { logout, username, token, role } = useAuth();
  const router = useRouter();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (role === 'manager') {
      router.replace('/(tabs)/admin-dashboard' as any);
    }
  }, [role]);

  // Brand Consistent Theme
  const textColor = BrandColors.textMain;
  const subTextColor = BrandColors.textSub;
  const accentBlue = BrandColors.primary;
  const successGreen = BrandColors.success;
  const dangerRed = BrandColors.danger;
  const cardBg = BrandColors.white;

  const fetchStats = async () => {
    if (token) {
      try {
        const data = await getStats(token);
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [token]);

  React.useEffect(() => {
    fetchStats();
  }, [token]);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [token])
  );

  return (
    <View style={viewStyles.container}>
      <View style={viewStyles.topCurvedBackground} />

      <ScrollView
        contentContainerStyle={viewStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentBlue} />
        }
      >

        {/* Header Section */}
        <View style={viewStyles.header}>
          <View style={viewStyles.headerTop}>
            <View>
              <Text style={[textStyles.greeting, { color: subTextColor }]}>Security Analyst</Text>
              <Text style={[textStyles.username, { color: textColor }]}>{username || 'Guest'}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={viewStyles.logoutBtn} activeOpacity={0.7}>
              <IconSymbol name="paperplane.fill" size={18} color={accentBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={['#0052CC', '#0747A6', '#00296B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={viewStyles.heroCard}
        >
          <View style={viewStyles.heroContent}>
            <View style={[viewStyles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <IconSymbol name="shield.fill" size={40} color="#FFFFFF" />
            </View>
            <Text style={[textStyles.heroTitle, { color: '#FFFFFF' }]}>Shield Verified</Text>
            <Text style={[textStyles.heroDesc, { color: 'rgba(255,255,255,0.85)' }]}>
              Autonomous fraud scanning is currently active across all integrated channels.
            </Text>
          </View>
          <View style={viewStyles.badgeContainer}>
            <View style={[viewStyles.statusBadge, { backgroundColor: 'rgba(54, 179, 126, 0.2)', borderColor: 'rgba(54, 179, 126, 0.4)' }]}>
              <View style={[viewStyles.statusDot, { backgroundColor: '#36B37E' }]} />
              <Text style={[textStyles.statusText, { color: '#36B37E' }]}>System Optimal</Text>
            </View>
          </View>
          <View style={viewStyles.heroDecorCircle} />
        </LinearGradient>

        {/* Efficiency Overview Header */}
        <Text style={[textStyles.sectionTitle, { color: textColor }]}>Efficiency Overview</Text>

        {/* Summary horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={viewStyles.summaryScroll}
          contentContainerStyle={viewStyles.summaryScrollContent}
        >
          <View style={[viewStyles.summaryCard, { backgroundColor: cardBg, borderColor: BrandColors.border }]}>
            <View style={[viewStyles.cardIconBox, { backgroundColor: BrandColors.lightBlue }]}>
              <IconSymbol name="chart.bar.fill" size={20} color={accentBlue} />
            </View>
            <Text style={[textStyles.summaryLabel, { color: subTextColor }]}>Total Scanned</Text>
            <Text style={[textStyles.summaryValue, { color: textColor }]}>
              {stats ? stats.total_scanned.toLocaleString() : '---'}
            </Text>
          </View>

          <View style={[viewStyles.summaryCard, { backgroundColor: cardBg, borderColor: BrandColors.border }]}>
            <View style={[viewStyles.cardIconBox, { backgroundColor: BrandColors.lightRed }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color={dangerRed} />
            </View>
            <Text style={[textStyles.summaryLabel, { color: subTextColor }]}>Threats Found</Text>
            <Text style={[textStyles.summaryValue, { color: dangerRed }]}>
              {stats ? stats.fraud_detected.toLocaleString() : '---'}
            </Text>
          </View>

          <View style={[viewStyles.summaryCard, { backgroundColor: cardBg, borderColor: BrandColors.border }]}>
            <View style={[viewStyles.cardIconBox, { backgroundColor: BrandColors.lightGreen }]}>
              <IconSymbol name="checkmark.shield.fill" size={20} color={successGreen} />
            </View>
            <Text style={[textStyles.summaryLabel, { color: subTextColor }]}>Accuracy</Text>
            <Text style={[textStyles.summaryValue, { color: successGreen }]}>
              {stats ? `${(stats.accuracy).toFixed(1)}%` : '---'}
            </Text>
          </View>
        </ScrollView>

        {/* Analytics Section */}
        <View style={viewStyles.sectionHeader}>
          <Text style={[textStyles.sectionTitle, { color: textColor }]}>Threat Distribution</Text>
          <IconSymbol name="chevron.right" size={16} color={subTextColor} />
        </View>

        <View style={[viewStyles.chartCard, { backgroundColor: cardBg, borderColor: BrandColors.border }]}>
          <Text style={[textStyles.chartTitle, { color: subTextColor }]}>Activity Breakdown</Text>
          {stats ? (
            <PieChart
              data={[
                {
                  name: "Safe",
                  population: stats.safe_detected,
                  color: BrandColors.success,
                  legendFontColor: BrandColors.textMain,
                  legendFontSize: 12
                },
                {
                  name: "Fraud",
                  population: stats.fraud_detected,
                  color: BrandColors.danger,
                  legendFontColor: BrandColors.textMain,
                  legendFontSize: 12
                }
              ]}
              width={width - 80}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[5, 0]}
              absolute
            />
          ) : (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: subTextColor }}>Computing metrics...</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: BrandColors.background
  } as ViewStyle,
  topCurvedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 340,
    backgroundColor: '#EBF4FF',
    borderBottomRightRadius: 80,
    opacity: 0.7,
  } as ViewStyle,
  scrollContent: {
    padding: 24,
    paddingTop: 64
  } as ViewStyle,
  header: {
    marginBottom: 32
  } as ViewStyle,
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  } as ViewStyle,
  logoutBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  heroCard: {
    borderRadius: 36,
    padding: 28,
    marginBottom: 40,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
    overflow: 'hidden'
  } as ViewStyle,
  heroDecorCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)'
  } as ViewStyle,
  heroContent: {
    alignItems: 'flex-start'
  } as ViewStyle,
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  } as ViewStyle,
  badgeContainer: {
    marginTop: 24
  } as ViewStyle,
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1
  } as ViewStyle,
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10
  } as ViewStyle,
  summaryScroll: {
    marginBottom: 40
  } as ViewStyle,
  summaryScrollContent: {
    paddingRight: 24
  } as ViewStyle,
  summaryCard: {
    width: 170,
    padding: 24,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12
  } as ViewStyle,
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  } as ViewStyle,
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  } as ViewStyle,
  chartCard: {
    padding: 24,
    borderRadius: 36,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    alignItems: 'center'
  } as ViewStyle,
});

const textStyles = StyleSheet.create({
  username: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5
  } as TextStyle,
  greeting: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  } as TextStyle,
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: -0.5
  } as TextStyle,
  heroDesc: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
    width: '90%'
  } as TextStyle,
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  } as TextStyle,
  summaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5
  } as TextStyle,
  summaryValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5
  } as TextStyle,
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: -0.5
  } as TextStyle,
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 24,
    alignSelf: 'flex-start',
    letterSpacing: 0.5
  } as TextStyle,
});
