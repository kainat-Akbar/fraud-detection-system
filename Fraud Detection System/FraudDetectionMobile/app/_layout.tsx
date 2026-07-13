import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [appReady, setAppReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isSignupPage = segments[1] === 'signup';

    if (!token && !inAuthGroup) {
      // Redirect to login if user is not authenticated and not in auth group
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup && !isSignupPage) {
      // Redirect to home if user is authenticated and trying to access auth group (except signup)
      // This allows users to explicitly visit signup even if logged in, but we handle it there
      router.replace('/(tabs)');
    }
  }, [token, segments, isLoading]);

  useEffect(() => {
    async function prepare() {
      try {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 20,
          useNativeDriver: true,
        }).start();

        // Shortened splash duration for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        SplashScreen.hideAsync();

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setSplashVisible(false));
      }
    }
    prepare();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="dark" />

      {splashVisible && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.splashContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.splashIcon}>🛡️</Text>
          </Animated.View>
          <Text style={styles.splashTitle}>FraudGuard AI</Text>
          <Text style={styles.splashSubtitle}>Intelligent Financial Security</Text>
          <Animated.View style={styles.loaderContainer}>
            <View style={styles.loaderBar} />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <InitialLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  splashIcon: {
    fontSize: 64,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#091E42',
    letterSpacing: -0.75,
    marginBottom: 12,
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#6B778C',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
    width: 200,
    height: 4,
    backgroundColor: '#DFE1E6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderBar: {
    width: '50%',
    height: '100%',
    backgroundColor: '#0052CC',
    borderRadius: 2,
  }
});
