import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import authService from '../../services/auth';
import comunidadesService from '../../services/comunidades';

/**
 * DashboardScreen - Tela Inicial reformulada conforme referência do Figma.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [user, comunidades] = await Promise.all([
          authService.getCurrentUser(),
          comunidadesService.listarTodas()
        ]);
        setUserName(user.nome);
        console.log('COMUNIDADES CARREGADAS COM SUCESSO:', comunidades.length);
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

  const menuItems = [
    { label: 'POSTAGEM', route: '/telas/postagens', badge: null },
    { label: 'RESERVAS', route: '/telas/reservas', badge: 2 },
    { label: 'PRODUTOS', route: '/telas/produtos', badge: null },
    { label: 'PAGAMENTOS', route: '/telas/pagamentos', badge: 1 },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Cabeçalho com Perfil */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarCircle} />
            <Text style={styles.userName}>Olá, {userName || 'Vendedor'}</Text>
          </View>
        </View>

        {/* Logo Centralizada conforme referência */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/Group 2.svg')}
            style={{ width: 60, height: 60 }}
            contentFit="contain"
          />
          <Text style={styles.logoText}>uitanda.com</Text>
        </View>

        {/* Botões do Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuButton}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.menuButtonText}>{item.label}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Botão Sair */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Sair',
              'Deseja realmente sair da sua conta?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: handleLogout }
              ]
            );
          }}
        >
          <Text style={styles.logoutButtonText}>SAIR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  content: { 
    flex: 1, 
    padding: 25,
    justifyContent: 'space-between'
  },
  header: {
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD',
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginVertical: 40,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#2E7D32',
    marginLeft: -5,
  },
  menuContainer: {
    backgroundColor: 'transparent',
    gap: 15,
  },
  menuButton: {
    backgroundColor: '#40C993',
    height: 60,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  badge: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A4D2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#E53935',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
  },
});
