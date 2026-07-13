import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, ViewStyle, TextStyle } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { getAdminStats, AdminStats } from '@/services/ml/api';
import { BrandColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { logout, username, token, role } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    if (role !== 'manager') {
      router.replace('/(tabs)' as any);
    }
  }, [role]);

  const fetchStats = async () => {
    try {
      if (!token) return;
      const data = await getAdminStats(token);
      setStats(data);
    } catch (err) {
      console.error("Error fetching admin stats", err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [token])
  );

  return (
    <View style={viewStyles.container}>
      <View style={viewStyles.topCurvedBackground} />
      <ScrollView
        contentContainerStyle={viewStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.primary} />}
      >
        <View style={viewStyles.header}>
          <View style={viewStyles.headerTop}>
            <View>
              <Text style={[textStyles.greeting, { color: BrandColors.textSub }]}>Admin Panel</Text>
              <Text style={[textStyles.username, { color: BrandColors.textMain }]}>{username || 'Manager'}</Text>
            </View>
            <View style={viewStyles.headerRight}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/admin-account' as any)} style={viewStyles.iconBtn} activeOpacity={0.7}>
                <IconSymbol name="gearshape.fill" size={22} color={BrandColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={viewStyles.iconBtn} activeOpacity={0.7}>
                <IconSymbol name="paperplane.fill" size={18} color={BrandColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[textStyles.sectionTitle, { color: BrandColors.textMain }]}>Overview</Text>

        {stats ? (
          <View style={viewStyles.grid}>
            <View style={[viewStyles.statCard, { backgroundColor: BrandColors.white, borderColor: BrandColors.border }]}>
              <View style={[viewStyles.cardIconBox, { backgroundColor: BrandColors.lightBlue }]}>
                <IconSymbol name="person.2.fill" size={24} color={BrandColors.primary} />
              </View>
              <Text style={[textStyles.statValue, { color: BrandColors.textMain }]}>{stats.total_users}</Text>
              <Text style={[textStyles.statLabel, { color: BrandColors.textSub }]}>Total Users</Text>
            </View>
            <View style={[viewStyles.statCard, { backgroundColor: BrandColors.white, borderColor: BrandColors.border }]}>
              <View style={[viewStyles.cardIconBox, { backgroundColor: '#FFF3E0' }]}>
                <IconSymbol name="clock.fill" size={24} color="#FF8C00" />
              </View>
              <Text style={[textStyles.statValue, { color: BrandColors.textMain }]}>{stats.pending_approvals}</Text>
              <Text style={[textStyles.statLabel, { color: BrandColors.textSub }]}>Pending</Text>
            </View>
            <View style={[viewStyles.statCard, { backgroundColor: BrandColors.white, borderColor: BrandColors.border }]}>
              <View style={[viewStyles.cardIconBox, { backgroundColor: BrandColors.lightGreen }]}>
                <IconSymbol name="chart.bar.fill" size={24} color={BrandColors.success} />
              </View>
              <Text style={[textStyles.statValue, { color: BrandColors.textMain }]}>{stats.total_transactions.toLocaleString()}</Text>
              <Text style={[textStyles.statLabel, { color: BrandColors.textSub }]}>Transactions</Text>
            </View>
            <View style={[viewStyles.statCard, { backgroundColor: BrandColors.white, borderColor: BrandColors.border }]}>
              <View style={[viewStyles.cardIconBox, { backgroundColor: BrandColors.lightRed }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={BrandColors.danger} />
              </View>
              <Text style={[textStyles.statValue, { color: BrandColors.danger }]}>{stats.fraud_detected.toLocaleString()}</Text>
              <Text style={[textStyles.statLabel, { color: BrandColors.textSub }]}>Threats</Text>
            </View>
          </View>
        ) : (
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
          </View>
        )}

        <View style={viewStyles.quickActions}>
          <Text style={[textStyles.sectionTitle, { color: BrandColors.textMain }]}>Quick Actions</Text>
          <TouchableOpacity style={[viewStyles.actionCard, { backgroundColor: BrandColors.white, borderColor: BrandColors.border }]} onPress={() => router.push('/(tabs)/admin-users' as any)}>
            <View style={[viewStyles.actionIcon, { backgroundColor: BrandColors.lightBlue }]}>
              <IconSymbol name="person.badge.plus.fill" size={22} color={BrandColors.primary} />
            </View>
            <View style={viewStyles.actionContent}>
              <Text style={[textStyles.actionTitle, { color: BrandColors.textMain }]}>Manage Users</Text>
              <Text style={[textStyles.actionDesc, { color: BrandColors.textSub }]}>Approve, edit, or remove accounts</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={BrandColors.textSub} />
          </TouchableOpacity>
          <TouchableOpacity style={[viewStyles.actionCard, { backgroundColor: BrandColors.white, borderColor: BrandColors.border }]} onPress={() => router.push('/(tabs)/admin-tracking' as any)}>
            <View style={[viewStyles.actionIcon, { backgroundColor: BrandColors.lightGreen }]}>
              <IconSymbol name="doc.text.magnifyingglass" size={22} color={BrandColors.success} />
            </View>
            <View style={viewStyles.actionContent}>
              <Text style={[textStyles.actionTitle, { color: BrandColors.textMain }]}>Tracking</Text>
              <Text style={[textStyles.actionDesc, { color: BrandColors.textSub }]}>View all user transaction histories</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={BrandColors.textSub} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background } as ViewStyle,
  topCurvedBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 340,
    backgroundColor: '#EBF4FF', borderBottomRightRadius: 80, opacity: 0.7,
  } as ViewStyle,
  scrollContent: { padding: 24, paddingTop: 64 } as ViewStyle,
  header: { marginBottom: 32 } as ViewStyle,
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  headerRight: { flexDirection: 'row', gap: 12 } as ViewStyle,
  iconBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  } as ViewStyle,
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 40,
  } as ViewStyle,
  statCard: {
    width: (width - 64) / 2, padding: 20, borderRadius: 28, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4,
  } as ViewStyle,
  cardIconBox: {
    width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  } as ViewStyle,
  quickActions: { marginBottom: 24 } as ViewStyle,
  actionCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24,
    borderWidth: 1.5, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3,
  } as ViewStyle,
  actionIcon: {
    width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  } as ViewStyle,
  actionContent: { flex: 1, marginLeft: 16 } as ViewStyle,
});

const textStyles = StyleSheet.create({
  greeting: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 } as TextStyle,
  username: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 } as TextStyle,
  sectionTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 } as TextStyle,
  statValue: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 } as TextStyle,
  statLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginTop: 8, letterSpacing: 0.5 } as TextStyle,
  actionTitle: { fontSize: 17, fontWeight: '900' } as TextStyle,
  actionDesc: { fontSize: 13, fontWeight: '600', marginTop: 4 } as TextStyle,
});
