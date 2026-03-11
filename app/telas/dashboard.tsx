import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Dados mockados: Simulam o que viria de um banco de dados
const RESERVAS_RECENTES = [
  { id: '1', cliente: 'Maria Silva', itens: '3 itens (Tomate, Alface, Ovos)', status: 'Pendente' },
  { id: '2', cliente: 'João Pereira', itens: '1 item (Mel Orgânico)', status: 'Pronto para Retirada' },
];

/**
 * DashboardScreen - Tela principal pós-login.
 */
export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Bloco de Saudação: A logo agora está no cabeçalho fixo no topo */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, Silas!</Text>
        <Text style={styles.date}>Quarta-feira, 11 de Março de 2026</Text>
      </View>

      {/* Cards de Estatísticas */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="cart-outline" size={24} color="#2E7D32" />
          <Text style={styles.statValue}>R$ 450,00</Text>
          <Text style={styles.statLabel}>Vendas Hoje</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="time-outline" size={24} color="#EF6C00" />
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
      </View>

      {/* Ações Rápidas */}
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/telas/postagens')}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera" size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>Postar Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/telas/produtos')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#1976D2' }]}>
            <Ionicons name="list" size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>Ver Estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/telas/pagamentos')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FBC02D' }]}>
            <Ionicons name="cash-outline" size={24} color="#FFF" />
          </View>
          <Text style={styles.actionLabel}>Pagamentos</Text>
        </TouchableOpacity>
      </View>

      {/* Reservas Recentes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Reservas Recentes</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver tudo</Text>
        </TouchableOpacity>
      </View>

      {RESERVAS_RECENTES.map((item) => (
        <View key={item.id} style={styles.reservationCard}>
          <View style={styles.reservationInfo}>
            <Text style={styles.clientName}>{item.cliente}</Text>
            <Text style={styles.itemDescription}>{item.itens}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'Pendente' ? '#FFF9C4' : '#C8E6C9' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'Pendente' ? '#F57F17' : '#2E7D32' }
            ]}>{item.status}</Text>
          </View>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: 20 },
  header: { marginBottom: 24, backgroundColor: 'transparent' },
  greeting: { fontSize: 24, fontWeight: 'bold' },
  date: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, backgroundColor: 'transparent' },
  statCard: { width: '48%', padding: 16, borderRadius: 16, alignItems: 'flex-start' },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8, color: '#333' },
  statLabel: { fontSize: 12, opacity: 0.7, marginTop: 2, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, backgroundColor: 'transparent' },
  actionButton: { alignItems: 'center', width: '30%' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, textAlign: 'center', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, backgroundColor: 'transparent' },
  seeAll: { color: '#2E7D32', fontSize: 14, fontWeight: '600' },
  reservationCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  reservationInfo: { flex: 1, backgroundColor: 'transparent' },
  clientName: { fontSize: 16, fontWeight: '600' },
  itemDescription: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
});
