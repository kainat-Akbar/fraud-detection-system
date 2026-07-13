import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';

const activeColor = '#0052CC';
const inactiveColor = '#A5ADBA';

function TabIcon({ name, color }: { name: any; color: string }) {
  return (
    <View style={[styles.iconContainer, { backgroundColor: color === activeColor ? '#EBF4FF' : 'transparent' }]}>
      <IconSymbol size={24} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { role, isLoading } = useAuth();
  const isManager = role === 'manager';

  if (isLoading) return null;

  const tabBarStyle = {
    position: 'absolute' as const,
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 72,
    borderTopWidth: 0,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    paddingBottom: 8,
    paddingTop: 8,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle,
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 4 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          href: isManager ? null : undefined,
          tabBarIcon: ({ color }) => <TabIcon name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          title: 'Dashboard',
          href: isManager ? undefined : null,
          tabBarIcon: ({ color }) => <TabIcon name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="predict"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <TabIcon name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          href: isManager ? null : undefined,
          tabBarIcon: ({ color }) => <TabIcon name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Intelligence',
          href: isManager ? null : undefined,
          tabBarIcon: ({ color }) => <TabIcon name="cube.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin-users"
        options={{
          title: 'Users',
          href: isManager ? undefined : null,
          tabBarIcon: ({ color }) => <TabIcon name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin-tracking"
        options={{
          title: 'Tracking',
          href: isManager ? undefined : null,
          tabBarIcon: ({ color }) => <TabIcon name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="admin-account" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  }
});
