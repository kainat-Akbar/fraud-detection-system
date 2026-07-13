import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/services/ml/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<'user' | 'manager'>('user');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(email, password);
            await login(data.token, data.username, data.role);
            router.replace('/(tabs)');
        } catch (error: any) {
            const msg = error.message || "Invalid credentials";
            if (msg.toLowerCase().includes('pending')) {
                Alert.alert("Pending Approval", "Your account is awaiting manager approval.");
            } else {
                Alert.alert("Login Failed", msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: BrandColors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: BrandColors.lightBlue }]}>
                        <IconSymbol name="lock.shield.fill" size={60} color={BrandColors.primary} />
                    </View>
                    <Text style={[styles.title, { color: BrandColors.textMain }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: BrandColors.textSub }]}>Secure authentication to access the intelligence hub.</Text>
                </View>

                <View style={styles.roleToggle}>
                    <TouchableOpacity
                        style={[styles.roleBtn, selectedRole === 'user' && styles.activeRoleBtn]}
                        onPress={() => setSelectedRole('user')}
                    >
                        <IconSymbol name="person.fill" size={18} color={selectedRole === 'user' ? '#FFF' : BrandColors.textSub} />
                        <Text style={[styles.roleText, selectedRole === 'user' && styles.activeRoleText]}>User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, selectedRole === 'manager' && styles.activeRoleBtnManager]}
                        onPress={() => setSelectedRole('manager')}
                    >
                        <IconSymbol name="shield.fill" size={18} color={selectedRole === 'manager' ? '#FFF' : BrandColors.textSub} />
                        <Text style={[styles.roleText, selectedRole === 'manager' && styles.activeRoleText]}>Manager</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: BrandColors.textSub }]}>Email Address</Text>
                    <TextInput
                        style={[styles.input, { borderColor: BrandColors.border, color: BrandColors.textMain }]}
                        placeholder="analyst@secure.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="#A5ADBA"
                    />

                    <Text style={[styles.label, { color: BrandColors.textSub }]}>Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                          style={[styles.passwordInput, { borderColor: BrandColors.border, color: BrandColors.textMain }]}
                          placeholder="••••••••"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                          placeholderTextColor="#A5ADBA"
                      />
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                        <IconSymbol name={showPassword ? "eye.fill" : "eye.slash.fill"} size={20} color={BrandColors.textSub} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: BrandColors.primary }]} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Authenticate Session</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: BrandColors.textSub }]}>New to the system? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <Text style={[styles.linkText, { color: BrandColors.primary }]}>Register Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 32, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 24 },
    roleToggle: {
        flexDirection: 'row',
        backgroundColor: '#F4F5F7',
        borderRadius: 16,
        padding: 6,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    roleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    activeRoleBtn: {
        backgroundColor: BrandColors.primary,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    activeRoleBtnManager: {
        backgroundColor: BrandColors.danger,
        shadowColor: BrandColors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    roleText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#64748B',
    },
    activeRoleText: {
        color: '#FFFFFF',
    },
    iconContainer: {
        width: 104,
        height: 104,
        borderRadius: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 10,
    },
    title: { fontSize: 34, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    form: { width: '100%' },
    label: { fontSize: 13, fontWeight: '800', marginBottom: 10, marginTop: 18, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        fontWeight: '600',
    },
    passwordContainer: { position: 'relative' },
    passwordInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 18,
        paddingRight: 52,
        fontSize: 16,
        fontWeight: '600',
    },
    eyeBtn: {
        position: 'absolute', right: 16, top: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
    },
    button: {
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 36,
        shadowColor: BrandColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.25 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: 14, fontWeight: '500' },
    linkText: { fontSize: 14, fontWeight: '800' },
});
