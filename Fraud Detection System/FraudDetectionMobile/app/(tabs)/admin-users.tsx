import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { getAdminUsers, approveUser, updateUser, deleteUser, AdminUser } from '@/services/ml/api';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function AdminUsersScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchUsers(); }, [token]));

  const handleApprove = (user: AdminUser) => {
    if (!token) return;
    Alert.alert("Approve User", `Approve ${user.username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve", onPress: async () => {
          try {
            await approveUser(token, user.id);
            fetchUsers();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        }
      }
    ]);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.username);
    setEditEmail(user.email);
    setEditPassword('');
    setEditModal(true);
  };

  const handleEdit = async () => {
    if (!token || !editingUser) return;
    try {
      const payload: any = {};
      if (editName) payload.username = editName;
      if (editEmail) payload.email = editEmail;
      if (editPassword) payload.password = editPassword;
      await updateUser(token, editingUser.id, payload);
      setEditModal(false);
      fetchUsers();
      Alert.alert("Success", "User updated");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (user: AdminUser) => {
    if (!token) return;
    Alert.alert("Delete User", `Permanently delete ${user.username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteUser(token, user.id);
            fetchUsers();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        }
      }
    ]);
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = users.filter(u => !u.approved).length;

  return (
    <View style={viewStyles.container}>
      <View style={viewStyles.topCurvedBackground} />
      <View style={viewStyles.header}>
        <View style={viewStyles.headerTop}>
          <View>
            <Text style={textStyles.title}>User Management</Text>
            <Text style={textStyles.subtitle}>{users.length} total accounts</Text>
          </View>
          {pendingCount > 0 && (
            <View style={viewStyles.pendingBadge}>
              <Text style={textStyles.pendingText}>{pendingCount} pending</Text>
            </View>
          )}
        </View>
        <View style={viewStyles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={18} color={BrandColors.textSub} />
          <TextInput
            style={textStyles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#A5ADBA"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={viewStyles.centerBox}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={viewStyles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isPending = !item.approved;
            return (
              <View style={[viewStyles.userCard, { borderColor: isPending ? '#FFAB00' : BrandColors.border }]}>
                <View style={viewStyles.cardHeader}>
                  <View style={viewStyles.avatar}>
                    <IconSymbol name="person.fill" size={22} color={item.role === 'manager' ? BrandColors.danger : BrandColors.primary} />
                  </View>
                  <View style={viewStyles.userInfo}>
                    <Text style={textStyles.userName}>{item.username}</Text>
                    <Text style={textStyles.userEmail}>{item.email}</Text>
                  </View>
                  <View style={[viewStyles.roleBadge, { backgroundColor: item.role === 'manager' ? BrandColors.lightRed : BrandColors.lightBlue }]}>
                    <Text style={[textStyles.roleText, { color: item.role === 'manager' ? BrandColors.danger : BrandColors.primary }]}>
                      {item.role}
                    </Text>
                  </View>
                </View>
                <View style={viewStyles.cardFooter}>
                  <Text style={textStyles.txCount}>{item.transaction_count} transactions</Text>
                  <View style={viewStyles.actions}>
                    {isPending && (
                      <TouchableOpacity style={viewStyles.approveBtn} onPress={() => handleApprove(item)}>
                        <IconSymbol name="checkmark.circle.fill" size={16} color={BrandColors.success} />
                        <Text style={textStyles.approveText}>Approve</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={viewStyles.editBtn} onPress={() => openEdit(item)}>
                      <IconSymbol name="pencil" size={14} color={BrandColors.textSub} />
                    </TouchableOpacity>
                    <TouchableOpacity style={viewStyles.deleteBtn} onPress={() => handleDelete(item)}>
                      <IconSymbol name="trash.fill" size={14} color={BrandColors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={viewStyles.centerBox}>
              <Text style={textStyles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}

      <Modal visible={editModal} transparent animationType="slide">
        <View style={viewStyles.modalOverlay}>
          <View style={viewStyles.modalContent}>
            <Text style={textStyles.modalTitle}>Edit User</Text>
            <Text style={textStyles.modalLabel}>Username</Text>
            <TextInput style={textStyles.modalInput} value={editName} onChangeText={setEditName} placeholderTextColor="#A5ADBA" />
            <Text style={textStyles.modalLabel}>Email</Text>
            <TextInput style={textStyles.modalInput} value={editEmail} onChangeText={setEditEmail} placeholderTextColor="#A5ADBA" autoCapitalize="none" />
            <Text style={textStyles.modalLabel}>New Password (leave blank to keep)</Text>
            <TextInput style={textStyles.modalInput} value={editPassword} onChangeText={setEditPassword} placeholder="••••••••" placeholderTextColor="#A5ADBA" secureTextEntry />
            <View style={viewStyles.modalActions}>
              <TouchableOpacity style={viewStyles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={textStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={viewStyles.saveBtn} onPress={handleEdit}>
                <Text style={textStyles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const viewStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background } as ViewStyle,
  topCurvedBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 280,
    backgroundColor: '#EBF4FF', borderBottomRightRadius: 80, opacity: 0.7,
  } as ViewStyle,
  header: { padding: 24, paddingTop: 64, paddingBottom: 16 } as ViewStyle,
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } as ViewStyle,
  pendingBadge: {
    backgroundColor: '#FFF3E0', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#FFE0B2',
  } as ViewStyle,
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: BrandColors.white,
    borderRadius: 16, paddingHorizontal: 16, height: 52,
    borderWidth: 1.5, borderColor: BrandColors.border, gap: 10,
  } as ViewStyle,
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  listContent: { padding: 24, paddingTop: 8, paddingBottom: 120 } as ViewStyle,
  userCard: {
    backgroundColor: BrandColors.white, borderRadius: 24, padding: 20, marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3,
  } as ViewStyle,
  cardHeader: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F4F5F7',
    justifyContent: 'center', alignItems: 'center',
  } as ViewStyle,
  userInfo: { flex: 1, marginLeft: 14 } as ViewStyle,
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 } as ViewStyle,
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' } as ViewStyle,
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E3FCEF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
  } as ViewStyle,
  editBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F5F7',
    justifyContent: 'center', alignItems: 'center',
  } as ViewStyle,
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFEBE6',
    justifyContent: 'center', alignItems: 'center',
  } as ViewStyle,
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24,
  } as ViewStyle,
  modalContent: {
    backgroundColor: BrandColors.white, borderRadius: 32, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 10,
  } as ViewStyle,
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 28 } as ViewStyle,
  cancelBtn: {
    flex: 1, height: 52, borderRadius: 16, backgroundColor: '#F4F5F7',
    justifyContent: 'center', alignItems: 'center',
  } as ViewStyle,
  saveBtn: {
    flex: 1, height: 52, borderRadius: 16, backgroundColor: BrandColors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: BrandColors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  } as ViewStyle,
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 } as ViewStyle,
});

const textStyles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -1, color: BrandColors.textMain } as TextStyle,
  subtitle: { fontSize: 14, fontWeight: '600', color: BrandColors.textSub, marginTop: 4 } as TextStyle,
  pendingText: { fontSize: 12, fontWeight: '900', color: '#E65100' } as TextStyle,
  searchInput: { flex: 1, fontSize: 16, fontWeight: '600', color: BrandColors.textMain } as TextStyle,
  userName: { fontSize: 17, fontWeight: '900', color: BrandColors.textMain } as TextStyle,
  userEmail: { fontSize: 13, fontWeight: '600', color: BrandColors.textSub, marginTop: 2 } as TextStyle,
  roleText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 } as TextStyle,
  txCount: { fontSize: 13, fontWeight: '700', color: BrandColors.textSub } as TextStyle,
  approveText: { fontSize: 13, fontWeight: '900', color: BrandColors.success } as TextStyle,
  emptyText: { fontSize: 16, fontWeight: '800', color: BrandColors.textSub } as TextStyle,
  modalTitle: { fontSize: 24, fontWeight: '900', color: BrandColors.textMain, marginBottom: 24 } as TextStyle,
  modalLabel: { fontSize: 12, fontWeight: '800', color: BrandColors.textSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 16 } as TextStyle,
  modalInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: BrandColors.border,
    borderRadius: 14, padding: 16, fontSize: 16, fontWeight: '600', color: BrandColors.textMain,
  } as TextStyle,
  cancelText: { fontSize: 16, fontWeight: '800', color: BrandColors.textSub } as TextStyle,
  saveText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' } as TextStyle,
});
