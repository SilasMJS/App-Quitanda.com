import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import authService from '../../services/auth';
import comunidadesService from '../../services/comunidades';
import reservasService from '../../services/reservas';
import suporteService from '../../services/suporte';
import api from '../../services/api';
import notificationService from '../../services/notifications';
import * as Notifications from 'expo-notifications';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countReservas, setCountReservas] = useState(0);
  const [countPagamentos, setCountPagamentos] = useState(0);
  const [countTickets, setCountTickets] = useState(0);
  const [countAdminTickets, setCountAdminTickets] = useState(0);

  const [countUsuarios, setCountUsuarios] = useState(0);
  const [countComunidades, setCountComunidades] = useState(0);
  const [countVendedores, setCountVendedores] = useState(0);

  useEffect(() => {
    // Ao clicar na notificação, leva o usuário para a tela de reservas
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      router.push('/telas/reservas');
    });
    return () => subscription.remove();
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);

          // Tenta registrar o dispositivo para Push Notifications
          notificationService.registerForPushNotificationsAsync().then((token) => {
            if (token) {
              notificationService.salvarTokenNoBackend(token);
            }
          });
          
          try {
            const numTickets = await suporteService.getBadgeCount();
            setCountTickets(numTickets.user_count);
            setCountAdminTickets(numTickets.admin_count);
          } catch (e) {
            console.error("Erro ao carregar tickets", e);
          }

          if (userData?.tipo?.toUpperCase() === 'ADMIN') {
            // Fetch Admin metrics
            const [comunidadesRes, usuariosRes, vendedoresRes] = await Promise.all([
              comunidadesService.listarTodas().catch(() => []),
              api.get('/usuarios/').catch(() => ({ data: [] })),
              api.get('/vendedores/').catch(() => ({ data: [] }))
            ]);
            setCountComunidades(comunidadesRes.length);
            setCountUsuarios(usuariosRes.data.length);
            setCountVendedores(vendedoresRes.data.length);
          }
          
          // Fetch Seller metrics if they have a store (or if they are Admin testing seller view)
          if (userData?.tipo?.toUpperCase() === 'ADMIN' || userData?.tipo?.toUpperCase() === 'VENDEDOR') {
            const reservas = await reservasService.listarRecebidos().catch(() => []);
            const pendentes = reservas.filter((r: any) => r.status === 'PENDENTE').length;
            const aprovados = reservas.filter((r: any) => r.status === 'APROVADO').length;
            setCountReservas(pendentes);
            setCountPagamentos(aprovados);
          }
        } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        await authService.logout();
        router.replace('/');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    }, [])
  );

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/');
  };

  const isAdmin = user?.tipo?.toUpperCase() === 'ADMIN';
  const hasStore = !!user?.vendedor;
  const [isAdminView, setIsAdminView] = useState(isAdmin);

  useEffect(() => {
    setIsAdminView(isAdmin);
  }, [isAdmin]);

  const sellerMenuItems = [
    { label: 'Postagens', route: '/telas/postagens', badge: null, icon: 'megaphone' },
    { label: 'Reservas', route: '/telas/reservas', badge: countReservas > 0 ? countReservas : null, icon: 'calendar' },
    { label: 'Produtos', route: '/telas/produtos', badge: null, icon: 'basket' },
    { label: 'Pagamentos', route: '/telas/pagamentos', badge: countPagamentos > 0 ? countPagamentos : null, icon: 'wallet' },
    { label: 'Suporte', route: '/telas/suporte', badge: countTickets > 0 ? countTickets : null, icon: 'help-circle' },
  ];

  const adminMenuItems = [
    { label: 'COMUNIDADES', route: '/telas/admin/comunidades', icon: 'business', color: '#1976D2' },
    { label: 'CATÁLOGO', route: '/telas/admin/produtos-base', icon: 'basket', color: '#0288D1' },
    { label: 'VENDEDORES', route: '/telas/admin/vendedores', icon: 'people', color: '#01579B' },
    { label: 'USUÁRIOS', route: '/telas/admin/usuarios', icon: 'person', color: '#455A64' },
    { label: 'CATEGORIAS & TIPOS', route: '/telas/admin/categorias', icon: 'list', color: '#00796B' },
    { label: 'SUPORTE', route: '/telas/admin/suporte', icon: 'headset', color: '#D32F2F', badge: countAdminTickets > 0 ? countAdminTickets : null },
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
            {user?.imagem_url ? (
              <Image source={{ uri: user.imagem_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2E7D32' }}>
                {(() => {
                  if (!user?.nome) return 'US';
                  const parts = user.nome.trim().split(/\s+/);
                  return parts.length >= 2 
                    ? (parts[0][0] + parts[1][0]).toUpperCase() 
                    : user.nome.substring(0, 2).toUpperCase();
                })()}
              </Text>
            )}
          </View>
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.userName}>Olá, {user?.nome || 'Usuário'}</Text>
            <Text style={styles.welcomeSubtitle}>{isAdminView ? 'Painel de Gestão Global' : 'Toque para ver seu perfil'}</Text>
          </View>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </TouchableOpacity>

        {isAdmin && hasStore && (
          <TouchableOpacity 
            style={{ backgroundColor: isAdminView ? '#2E7D32' : '#1976D2', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 }}
            onPress={() => setIsAdminView(!isAdminView)}
          >
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
              {isAdminView ? 'ALTERAR PARA MINHA QUITANDA' : 'ALTERAR PARA PAINEL ADMIN'}
            </Text>
          </TouchableOpacity>
        )}

        {isAdminView ? (
          /* --- DASHBOARD ANALÍTICO PARA ADMIN --- */
          <View style={styles.adminContent}>
            
            <Text style={styles.sectionTitle}>VISIBILIDADE E ALCANCE</Text>
            {/* Cards de Métricas focados em alcance social, não financeiro */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{countUsuarios}</Text>
                <Text style={styles.statLabel}>Usuários Ativos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{countComunidades}</Text>
                <Text style={styles.statLabel}>Comunidades</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{countVendedores}</Text>
                <Text style={styles.statLabel}>Vendedores</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/telas/admin/nova-comunidade')}>
                <Ionicons name="add-circle" size={24} color="#2E7D32" />
                <Text style={styles.quickActionText}>Comunidade</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/telas/admin/novo-vendedor' as any)}>
                <Ionicons name="add-circle" size={24} color="#01579B" />
                <Text style={styles.quickActionText}>Vendedor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/telas/admin/novo-usuario' as any)}>
                <Ionicons name="add-circle" size={24} color="#455A64" />
                <Text style={styles.quickActionText}>Usuário</Text>
              </TouchableOpacity>
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
                    <Text style={[styles.adminMenuBtnText, { flex: 1 }]}>{item.label}</Text>
                    {item.badge && (
                      <View style={[styles.badge, { backgroundColor: item.color }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color="#CCC" />
                  </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>ATIVIDADE RECENTE</Text>
            <View style={styles.recentActivityCard}>
              <View style={styles.activityItem}>
                <Ionicons name="people" size={20} color="#4CAF50" />
                <Text style={styles.activityText}>Novo vendedor ingressou na <Text style={{fontWeight:'bold'}}>Feira Centro</Text></Text>
              </View>
              <View style={styles.activityItem}>
                <Ionicons name="basket" size={20} color="#2196F3" />
                <Text style={styles.activityText}>Cliente João fez sua primeira reserva!</Text>
              </View>
            </View>
          </View>
        ) : (
          /* --- DASHBOARD OPERACIONAL PARA VENDEDOR --- */
          <View style={styles.sellerContent}>
            
            {user?.tipo?.toUpperCase() === 'CLIENTE' && (
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

            <View style={[styles.menuContainer, user?.tipo?.toUpperCase() === 'CLIENTE' && { opacity: 0.4 }]}>
              {sellerMenuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.menuButton}
                  onPress={() => {
                    if (user?.tipo?.toUpperCase() === 'CLIENTE') {
                      Alert.alert('Ação Bloqueada', 'Você precisa completar seu cadastro de vendedor antes de acessar esta funcionalidade.');
                      return;
                    }
                    router.push(item.route as any);
                  }}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={24} color="#2E7D32" />
                  </View>
                  <Text style={styles.menuButtonText}>{item.label}</Text>
                  
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={24} color="#FFF" style={{ opacity: 0.7 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Botão Sair */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              const confirm = window.confirm('Deseja realmente sair da sua conta?');
              if (confirm) {
                handleLogout();
              }
            } else {
              Alert.alert('Sair', 'Deseja realmente sair?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: handleLogout }
              ]);
            }
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
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  quickActionBtn: { backgroundColor: '#FFF', width: '31%', paddingVertical: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  quickActionText: { fontSize: 11, fontWeight: 'bold', color: '#444', marginTop: 6 },
  
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
  menuButton: { 
    height: 75, 
    borderRadius: 16, 
    flexDirection: 'row',
    alignItems: 'center', 
    paddingHorizontal: 20,
    backgroundColor: '#40C993', 
    elevation: 4, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuButtonText: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: '800', 
    letterSpacing: 0.5,
    flex: 1
  },
  badge: { 
    backgroundColor: '#FF5252', 
    minWidth: 26, 
    height: 26, 
    borderRadius: 13, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 10
  },
  badgeText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

  logoutButton: { marginTop: 40, padding: 15, alignItems: 'center' },
  logoutButtonText: { color: '#D32F2F', fontWeight: 'bold', letterSpacing: 1 }
});
