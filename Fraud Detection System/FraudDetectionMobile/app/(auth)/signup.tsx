import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { signupUser } from '@/services/ml/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function SignupScreen() {
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'manager'>('user');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { token, username: currentUsername, logout } = useAuth();

    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await signupUser(username, email, password, role);
            Alert.alert("Success", "Account created! Awaiting manager approval.", [
                { text: "OK", onPress: () => router.replace('/(auth)/login') }
            ]);
        } catch (error: any) {
            Alert.alert("Signup Failed", error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchAccount = async () => {
        await logout();
        // Stay on signup page but clear state
        setUserName('');
        setEmail('');
        setPassword('');
    };

    if (token) {
        return (
            <View style={[styles.container, { backgroundColor: BrandColors.background, justifyContent: 'center', padding: 24 }]}>
                <View style={[styles.card, { padding: 32, alignItems: 'center' }]}>
                    <IconSymbol name="person.badge.plus.fill" size={80} color={BrandColors.success} />
                    <Text style={[styles.title, { marginTop: 24, textAlign: 'center' }]}>Create New Account?</Text>
                    <Text style={[styles.alreadyLoggedText, { color: BrandColors.textSub }]}>
                        You are currently logged in as <Text style={{fontWeight: '800', color: BrandColors.textMain}}>{currentUsername}</Text>.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: BrandColors.success, width: '100%' }]} 
                        onPress={handleSwitchAccount}
                    >
                        <Text style={styles.buttonText}>Logout & Join New</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ marginTop: 24 }} 
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={[styles.linkText, { color: BrandColors.textSub }]}>Stay on current account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: BrandColors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: BrandColors.lightGreen }]}>
                        <IconSymbol name="person.badge.plus.fill" size={60} color={BrandColors.success} />
                    </View>
                    <Text style={[styles.title, { color: BrandColors.textMain }]}>Join the Hub</Text>
                    <Text style={[styles.subtitle, { color: BrandColors.textSub }]}>Secure access to transaction intelligence.</Text>
                </View>

                <View style={styles.roleToggle}>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'user' && styles.activeRoleBtn]}
                        onPress={() => setRole('user')}
                    >
                        <IconSymbol name="person.fill" size={18} color={role === 'user' ? '#FFF' : BrandColors.textSub} />
                        <Text style={[styles.roleText, role === 'user' && styles.activeRoleText]}>User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'manager' && styles.activeRoleBtnManager]}
                        onPress={() => setRole('manager')}
                    >
                        <IconSymbol name="shield.fill" size={18} color={role === 'manager' ? '#FFF' : BrandColors.textSub} />
                        <Text style={[styles.roleText, role === 'manager' && styles.activeRoleText]}>Manager</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.pendingNote, { color: BrandColors.textSub }]}>
                    {role === 'manager' ? 'Manager accounts require approval from an existing manager.' : 'Standard user accounts require manager approval.'}
                </Text>

                <View style={styles.form}>
                    <Text style={[styles.label, { color: BrandColors.textSub }]}>Username</Text>
                    <TextInput
                        style={[styles.input, { borderColor: BrandColors.border, color: BrandColors.textMain }]}
                        placeholder="analyst_sigma"
                        value={username}
                        onChangeText={setUserName}
                        autoCapitalize="none"
                        placeholderTextColor="#A5ADBA"
                    />

                    <Text style={[styles.label, { color: BrandColors.textSub }]}>Email Address</Text>
                    <TextInput
                        style={[styles.input, { borderColor: BrandColors.border, color: BrandColors.textMain }]}
                        placeholder="name@company.com"
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
                        style={[styles.button, { backgroundColor: BrandColors.success }]} 
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Join Intelligence System</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: BrandColors.textSub }]}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                            <Text style={[styles.linkText, { color: BrandColors.success }]}>Sign In</Text>
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
    card: { backgroundColor: '#FFF', borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
    header: { alignItems: 'center', marginBottom: 24 },
    roleToggle: {
        flexDirection: 'row',
        backgroundColor: '#F4F5F7',
        borderRadius: 16,
        padding: 6,
        marginBottom: 12,
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
    pendingNote: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: BrandColors.success,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
    alreadyLoggedText: { fontSize: 16, textAlign: 'center', marginVertical: 24, paddingHorizontal: 20 },
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.25 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: 14, fontWeight: '500' },
    linkText: { fontSize: 14, fontWeight: '800' },
});
