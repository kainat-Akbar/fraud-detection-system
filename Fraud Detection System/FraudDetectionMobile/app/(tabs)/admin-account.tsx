import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Keyboard, Pressable, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { updateAdminAccount } from '@/services/ml/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

export default function AdminAccountScreen() {
  const { token, username, login } = useAuth();
  const router = useRouter();

  const [newUsername, setNewUsername] = useState(username || '');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const payload: any = {};
      if (newUsername) payload.username = newUsername;
      if (newEmail) payload.email = newEmail;
      if (newPassword) payload.password = newPassword;
      const result = await updateAdminAccount(token, payload);
      await login(token, result.username, 'manager');
      Alert.alert("Success", "Account updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable style={viewStyles.container} onPress={Keyboard.dismiss}>
      <View style={viewStyles.topCurvedBackground} />
      <ScrollView contentContainerStyle={viewStyles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={viewStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={viewStyles.backBtn}>
            <IconSymbol name="chevron.left" size={24} color={BrandColors.textMain} />
          </TouchableOpacity>
          <Text style={textStyles.title}>Account Settings</Text>
          <Text style={textStyles.subtitle}>Update your profile credentials</Text>
        </View>

        <View style={viewStyles.card}>
          <View style={viewStyles.avatarSection}>
            <View style={viewStyles.avatar}>
              <IconSymbol name="person.fill" size={40} color={BrandColors.primary} />
            </View>
            <Text style={textStyles.avatarName}>{username}</Text>
            <Text style={textStyles.avatarRole}>Manager</Text>
          </View>

          <Text style={textStyles.label}>Username</Text>
          <TextInput
            style={textStyles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholderTextColor="#A5ADBA"
          />

          <Text style={textStyles.label}>Email</Text>
          <TextInput
            style={textStyles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="admin@fraudguard.com"
            placeholderTextColor="#A5ADBA"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={textStyles.label}>New Password</Text>
          <View style={viewStyles.passwordContainer}>
            <TextInput
              style={textStyles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Leave blank to keep current"
              placeholderTextColor="#A5ADBA"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={viewStyles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <IconSymbol name={showPassword ? "eye.fill" : "eye.slash.fill"} size={20} color={BrandColors.textSub} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[viewStyles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={textStyles.submitText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Pressable>
  );
}

const viewStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background } as ViewStyle,
  topCurvedBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 280,
    backgroundColor: '#EBF4FF', borderBottomRightRadius: 80, opacity: 0.7,
  } as ViewStyle,
  content: { padding: 24, paddingTop: 64 } as ViewStyle,
  header: { marginBottom: 32 } as ViewStyle,
  backBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: BrandColors.white,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  } as ViewStyle,
  card: {
    backgroundColor: BrandColors.white, borderRadius: 32, padding: 28,
    borderWidth: 1, borderColor: BrandColors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
  } as ViewStyle,
  avatarSection: { alignItems: 'center', marginBottom: 32 } as ViewStyle,
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: BrandColors.lightBlue,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: BrandColors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  } as ViewStyle,
  passwordContainer: { position: 'relative' } as ViewStyle,
  eyeBtn: {
    position: 'absolute', right: 16, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  } as ViewStyle,
  submitBtn: {
    height: 56, borderRadius: 18, backgroundColor: BrandColors.primary,
    justifyContent: 'center', alignItems: 'center', marginTop: 32,
    shadowColor: BrandColors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  } as ViewStyle,
});

const textStyles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -1, color: BrandColors.textMain } as TextStyle,
  subtitle: { fontSize: 15, fontWeight: '600', color: BrandColors.textSub, marginTop: 4 } as TextStyle,
  avatarName: { fontSize: 22, fontWeight: '900', color: BrandColors.textMain } as TextStyle,
  avatarRole: {
    fontSize: 12, fontWeight: '800', color: BrandColors.primary, marginTop: 4,
    textTransform: 'uppercase', letterSpacing: 0.5, backgroundColor: BrandColors.lightBlue,
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8, overflow: 'hidden',
  } as TextStyle,
  label: {
    fontSize: 12, fontWeight: '800', color: BrandColors.textSub, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 8, marginTop: 20,
  } as TextStyle,
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: BrandColors.border,
    borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '600', color: BrandColors.textMain,
  } as TextStyle,
  passwordInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: BrandColors.border,
    borderRadius: 16, padding: 16, paddingRight: 52, fontSize: 16, fontWeight: '600', color: BrandColors.textMain,
  } as TextStyle,
  submitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' } as TextStyle,
});
