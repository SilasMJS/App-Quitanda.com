import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth';
import Constants from 'expo-constants';

export default function PerfilScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data);
    } catch (error) {
      // Erro silencioso
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
          await authService.logout();
          router.replace('/');
      }}
    ]);
  };

  if (loading) {
    return (
      <RNView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </RNView>
    );
  }

  return (
    <RNView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Cabeçalho Superior Padronizado */}
      <RNView style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <RNView style={styles.logoRow}>
          <Image source={require('../../assets/images/Group 2.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </RNView>
        
        <RNView style={{ width: 40 }} />
      </RNView>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cartão de Identificação */}
        <RNView style={styles.profileCard}>
          <RNView style={styles.avatarCircle}>
            <Ionicons name="person" size={45} color="#2E7D32" />
          </RNView>
          <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
          <RNView style={[
            styles.roleBadge, 
            user?.tipo === 'ADMIN' && { backgroundColor: '#FBC02D' } // Cor dourada para Admin
          ]}>
            <Text style={styles.roleText}>
              {user?.tipo === 'ADMIN' ? 'ADMINISTRADOR' : (user?.tipo === 'VENDEDOR' ? 'VENDEDOR' : 'EM CADASTRO')}
            </Text>
          </RNView>
        </RNView>

        {/* Informações de Contato */}
        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
          <RNView style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>{user?.telefone}</Text>
          </RNView>
          <RNView style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>{user?.email || 'E-mail não cadastrado'}</Text>
          </RNView>
        </RNView>

        {/* Seção Administrativa - Visível apenas para ADMIN */}
        {user?.tipo === 'ADMIN' && (
          <RNView style={styles.section}>
            <Text style={styles.sectionTitle}>PAINEL ADMINISTRATIVO</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#1976D2' }]}
              onPress={() => router.push('/telas/admin/comunidades')}
            >
              <Ionicons name="business" size={22} color="#FFF" />
              <Text style={styles.actionButtonText}>GERENCIAR COMUNIDADES</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#0288D1', marginTop: 12 }]}
              onPress={() => router.push('/telas/admin/vendedores')}
            >
              <Ionicons name="people" size={22} color="#FFF" />
              <Text style={styles.actionButtonText}>APROVAR VENDEDORES</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </RNView>
        )}

        {/* Quitanda e Negócios - Botão Verde Sólido (Não aparece para Admin se quiser simplificar, ou mantém) */}
        {user?.tipo !== 'ADMIN' && (
          <RNView style={styles.section}>
            <Text style={styles.sectionTitle}>QUITANDA E NEGÓCIOS</Text>
            
            {user?.cadastro_completo ? (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/telas/dashboard')}
              >
                <Ionicons name="storefront" size={22} color="#FFF" />
                <Text style={styles.actionButtonText}>PAINEL DO VENDEDOR</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/cadastro-vendedor')}
              >
                <Ionicons name="id-card" size={22} color="#FFF" />
                <Text style={styles.actionButtonText}>COMPLETAR CADASTRO</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </RNView>
        )}

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    paddingTop: Constants.statusBarHeight 
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60 + Constants.statusBarHeight,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingTop: Constants.statusBarHeight,
  },
  backButton: { padding: 5 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  scrollContent: { flex: 1, padding: 25 },
  profileCard: {
    alignItems: 'center',
    marginBottom: 35,
    backgroundColor: '#FFF',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  userName: { fontSize: 24, fontWeight: '900', color: '#333' },
  roleBadge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  section: { marginBottom: 35 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#999', marginBottom: 15, letterSpacing: 1 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 16, color: '#333', marginLeft: 15, fontWeight: '500' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 20,
    borderRadius: 15,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionButtonText: { 
    flex: 1,
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '900', 
    marginLeft: 15,
    letterSpacing: 0.5,
    backgroundColor: 'transparent'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 60,
    marginTop: 10
  },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: '900', marginLeft: 10, letterSpacing: 1 }
});
