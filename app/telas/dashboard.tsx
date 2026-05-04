import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import authService from '../../services/auth';
import comunidadesService from '../../services/comunidades';
import reservasService from '../../services/reservas';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countReservas, setCountReservas] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, comunidades, reservas] = await Promise.all([
          authService.getCurrentUser(),
          comunidadesService.listarTodas(),
          reservasService.listarRecebidos().catch(() => [])
        ]);
        setUser(userData);
        
        // Conta apenas as pendentes
        const pendentes = reservas.filter((r: any) => r.status === 'PENDENTE').length;
        setCountReservas(pendentes);
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/');
  };

  const isAdmin = user?.tipo === 'ADMIN';

  const sellerMenuItems = [
    { label: 'POSTAGEM', route: '/telas/postagens', badge: null, color: '#40C993' },
    { label: 'RESERVAS', route: '/telas/reservas', badge: countReservas > 0 ? countReservas : null, color: '#40C993' },
    { label: 'PRODUTOS', route: '/telas/produtos', badge: null, color: '#40C993' },
    { label: 'PAGAMENTOS', route: '/telas/pagamentos', badge: null, color: '#40C993' },
  ];

  const adminMenuItems = [
    { label: 'COMUNIDADES', route: '/telas/admin/comunidades', icon: 'business', color: '#1976D2' },
    { label: 'CATÁLOGO', route: '/telas/admin/produtos-base', icon: 'basket', color: '#0288D1' },
    { label: 'VENDEDORES', route: '/telas/admin/vendedores', icon: 'people', color: '#01579B' },
    { label: 'RELATÓRIOS', route: '/telas/admin/relatorios', icon: 'bar-chart', color: '#455A64' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho de Boas-vindas */}
        <TouchableOpacity 
          style={styles.welcomeSection}
          onPress={() => router.push('/telas/perfil')}
        >
          <View style={styles.avatarCircleSmall}>
            <Ionicons name="person" size={18} color="#2E7D32" />
          </View>
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.userName}>Olá, {user?.nome || 'Usuário'}</Text>
            <Text style={styles.welcomeSubtitle}>{isAdmin ? 'Painel de Gestão Global' : 'Toque para ver seu perfil'}</Text>
          </View>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </TouchableOpacity>

        {isAdmin ? (
          /* --- DASHBOARD ANALÍTICO PARA ADMIN --- */
          <View style={styles.adminContent}>
            <Text style={styles.sectionTitle}>VISÃO GERAL DO SISTEMA</Text>
            
            {/* Cards de Métricas */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>R$ 4.5k</Text>
                <Text style={styles.statLabel}>Vendas (30d)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Comunidades</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>48</Text>
                <Text style={styles.statLabel}>Vendedores</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>GERENCIAMENTO</Text>
            <View style={styles.adminMenuGrid}>
              {adminMenuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.adminMenuBtn, { borderLeftColor: item.color }]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                  <Text style={styles.adminMenuBtnText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#CCC" />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>ATIVIDADE RECENTE</Text>
            <View style={styles.recentActivityCard}>
              <View style={styles.activityItem}>
                <Ionicons name="add-circle" size={20} color="#4CAF50" />
                <Text style={styles.activityText}>Novo vendedor cadastrado na <Text style={{fontWeight:'bold'}}>Feira Centro</Text></Text>
              </View>
              <View style={styles.activityItem}>
                <Ionicons name="cart" size={20} color="#2196F3" />
                <Text style={styles.activityText}>Reserva confirmada: <Text style={{fontWeight:'bold'}}>#A829 - R$ 45,90</Text></Text>
              </View>
            </View>
          </View>
        ) : (
          /* --- DASHBOARD OPERACIONAL PARA VENDEDOR --- */
          <View style={styles.sellerContent}>
            
            {!user?.cadastro_completo && (
              <TouchableOpacity 
                style={styles.incompleteBanner}
                onPress={() => router.push('/cadastro-vendedor')}
              >
                <Ionicons name="alert-circle" size={28} color="#FFF" />
                <View style={{ flex: 1, marginLeft: 12, backgroundColor: 'transparent' }}>
                  <Text style={styles.incompleteTitle}>Cadastro Incompleto</Text>
                  <Text style={styles.incompleteSubtitle}>Complete sua vitrine para começar a vender no app.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            )}

            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.svg')}
                style={{ width: 60, height: 60 }}
                contentFit="contain"
              />
              <Text style={styles.logoText}>uitanda.com</Text>
            </View>

            <View style={[styles.menuContainer, !user?.cadastro_completo && { opacity: 0.4 }]}>
              {sellerMenuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.menuButton, { backgroundColor: item.color }]}
                  onPress={() => {
                    if (!user?.cadastro_completo) {
                      Alert.alert('Ação Bloqueada', 'Você precisa completar seu cadastro de vendedor antes de acessar esta funcionalidade.');
                      return;
                    }
                    router.push(item.route as any);
                  }}
                >
                  <Text style={styles.menuButtonText}>{item.label}</Text>
                  {item.badge && user?.cadastro_completo && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Botão Sair */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert('Sair', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: handleLogout }
            ]);
          }}
        >
          <Text style={styles.logoutButtonText}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingTop: Constants.statusBarHeight,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  welcomeSection: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatarCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#333' },
  welcomeSubtitle: { fontSize: 13, color: '#888' },
  adminBadge: { backgroundColor: '#FBC02D', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginLeft: 'auto' },
  adminBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#000' },

  /* Estilos de Alerta */
  incompleteBanner: {
    backgroundColor: '#E65100',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  incompleteTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  incompleteSubtitle: { color: '#FFF', fontSize: 12, opacity: 0.9, marginTop: 2 },
  
  /* Estilos Admin */
  adminContent: { marginTop: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 15, marginTop: 10 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { backgroundColor: '#FFF', width: '31%', padding: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 10, color: '#666', marginTop: 4, textAlign: 'center' },
  adminMenuGrid: { gap: 12, marginBottom: 25 },
  adminMenuBtn: { 
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 12, 
    borderLeftWidth: 5,
    elevation: 2
  },
  adminMenuBtnText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: 'bold', color: '#444' },
  recentActivityCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  activityText: { marginLeft: 10, fontSize: 13, color: '#555', flex: 1 },

  /* Estilos Seller */
  sellerContent: { alignItems: 'center', marginTop: 30 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 50 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#2E7D32', marginLeft: -5 },
  menuContainer: { width: '100%', gap: 15 },
  menuButton: { height: 65, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3, position: 'relative' },
  menuButtonText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  badge: { position: 'absolute', right: 20, width: 28, height: 28, borderRadius: 14, backgroundColor: '#0A4D2E', justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  logoutButton: { marginTop: 40, padding: 15, alignItems: 'center' },
  logoutButtonText: { color: '#D32F2F', fontWeight: 'bold', letterSpacing: 1 }
});
