import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';

// Histórico de vendas para simular o extrato do vendedor
const TRANSACOES = [
  { id: '1', cliente: 'Beatriz Santos', valor: '45.90', data: 'Hoje, 14:20', status: 'Pago', metodo: 'Pix' },
  { id: '2', cliente: 'Carlos Eduardo', valor: '128.00', data: 'Hoje, 11:05', status: 'Pago', metodo: 'Cartão' },
  { id: '3', cliente: 'Dona Neusa', valor: '15.00', data: 'Ontem, 17:45', status: 'Pendente', metodo: 'Dinheiro' },
  { id: '4', cliente: 'Ricardo Alves', valor: '89.50', data: 'Ontem, 09:30', status: 'Pago', metodo: 'Pix' },
  { id: '5', cliente: 'Julia Costa', valor: '32.00', data: '10 Mar, 15:20', status: 'Pago', metodo: 'Cartão' },
];

/**
 * PagamentosScreen - Histórico Financeiro.
 * Mostra o faturamento total e as transações individuais.
 */
export default function PagamentosScreen() {
  return (
    <View style={styles.container}>
      {/* Bloco Superior: Resumo de faturamento com gradiente visual */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Vendido (Mês)</Text>
          <Text style={styles.summaryValue}>R$ 2.450,80</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-up" size={16} color="#4CAF50" />
            <Text style={styles.trendText}>+12% em relação ao mês anterior</Text>
          </View>
        </View>

        {/* Mini cards: Estatísticas de hoje e pendências */}
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>Hoje</Text>
            <Text style={styles.miniStatValue}>R$ 173,90</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatLabel}>A Receber</Text>
            <Text style={[styles.miniStatValue, { color: '#EF6C00' }]}>R$ 15,00</Text>
          </View>
        </View>
      </View>

      {/* Título da Lista e Botão de Filtro */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Histórico de Vendas</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#2E7D32" />
          <Text style={styles.filterText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Transações: Utiliza FlatList para melhor performance com muitos itens */}
      <FlatList
        data={TRANSACOES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            {/* Ícone dinâmico baseado no método de pagamento */}
            <View style={styles.iconBackground}>
              <Ionicons name={item.metodo === 'Pix' ? 'qr-code-outline' : item.metodo === 'Cartão' ? 'card-outline' : 'cash-outline'} size={24} color="#2E7D32" />
            </View>
            
            <View style={styles.transactionInfo}>
              <Text style={styles.clientName}>{item.cliente}</Text>
              <Text style={styles.transactionDate}>{item.data} • {item.metodo}</Text>
            </View>

            <View style={styles.transactionAmountContainer}>
              <Text style={styles.amountText}>R$ {item.valor}</Text>
              {/* Badge de status com cores semânticas (verde para pago, laranja para pendente) */}
              <View style={[
                styles.statusBadge, 
                { backgroundColor: item.status === 'Pago' ? '#E8F5E9' : '#FFF3E0' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.status === 'Pago' ? '#2E7D32' : '#EF6C00' }
                ]}>{item.status}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  summaryContainer: { padding: 20, backgroundColor: '#2E7D32', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  summaryCard: { backgroundColor: 'transparent' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 5 },
  summaryValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'transparent' },
  trendText: { color: '#FFF', fontSize: 12, marginLeft: 5, opacity: 0.9 },
  miniStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, backgroundColor: 'transparent' },
  miniStat: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 15, width: '48%' },
  miniStatLabel: { color: '#FFF', fontSize: 12, opacity: 0.8 },
  miniStatValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 25, marginBottom: 15, backgroundColor: 'transparent' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  filterText: { color: '#2E7D32', fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 12, elevation: 2 },
  iconBackground: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F1F8E9', justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { flex: 1, marginLeft: 15, backgroundColor: 'transparent' },
  clientName: { fontSize: 16, fontWeight: '600', color: '#333' },
  transactionDate: { fontSize: 12, color: '#888', marginTop: 2 },
  transactionAmountContainer: { alignItems: 'flex-end', backgroundColor: 'transparent' },
  amountText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
});
