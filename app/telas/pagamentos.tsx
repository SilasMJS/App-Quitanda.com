import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PAGAMENTOS_PENDENTES = [
  { 
    id: '1', 
    numero: '#1',
    nome: 'Silas Malaquias', 
    itens: '2x Alface roxo\n1x Cheiro Verde',
    total: 'R$ 6,00 Em dinheiro',
  }
];

const HISTORICO = [
  { id: 'h1', data: '12 de janeiro 2025', itens: [
    { id: '123', nome: 'Silas Malaquias' },
    { id: '124', nome: 'Silas Malaquias' },
  ]},
  { id: 'h2', data: '10 de janeiro 2025', itens: [
    { id: '125', nome: 'Silas Malaquias' },
    { id: '126', nome: 'Silas Malaquias' },
  ]},
];

export default function PagamentosScreen() {
  const router = useRouter();
  const [exibirHistorico, setExibirHistorico] = useState(false);

  const renderPagamento = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reservaNumero}>RESERVA {item.numero}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.clienteNome}>{item.nome}</Text>
        <Text style={styles.itensList}>{item.itens}</Text>
        <Text style={styles.totalText}>{item.total}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnPago}>
          <Text style={styles.btnText}>PAGO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnCancelado}>
          <Text style={styles.btnText}>CANCELADO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistoricoItem = ({ item }: { item: any }) => (
    <View style={styles.historicoSection}>
      <Text style={styles.dataHeader}>{item.data}</Text>
      {item.itens.map((subItem: any) => (
        <View key={subItem.id} style={styles.historicoRow}>
          <Text style={styles.historicoTexto}>#{subItem.id} {subItem.nome}</Text>
          <TouchableOpacity style={styles.btnAbrir}>
            <Text style={styles.btnAbrirText}>ABRIR</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header com Logo e Botão Voltar */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require('@/assets/images/Group 2.svg')}
              style={{ width: 35, height: 35 }}
              contentFit="contain"
            />
            <Text style={styles.logoText}>uitanda.com</Text>
          </View>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={20} color="#FFF" />
            <Text style={styles.btnVoltarText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>

        {!exibirHistorico ? (
          <>
            <TouchableOpacity 
              style={styles.btnVerHistorico}
              onPress={() => setExibirHistorico(true)}
            >
              <Text style={styles.btnVerHistoricoText}>VER HISTORICO</Text>
            </TouchableOpacity>

            <FlatList
              data={PAGAMENTOS_PENDENTES}
              renderItem={renderPagamento}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>HISTORICO</Text>
            <TouchableOpacity 
              style={styles.searchBar}
              activeOpacity={1}
            >
              <Ionicons name="calendar-outline" size={20} color="#333" />
              <Text style={styles.searchText}>Pesquisar data</Text>
            </TouchableOpacity>

            <FlatList
              data={HISTORICO}
              renderItem={renderHistoricoItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity 
              style={styles.btnVoltarLista}
              onPress={() => setExibirHistorico(false)}
            >
              <Text style={styles.btnVoltarListaText}>VOLTAR AOS PENDENTES</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'transparent',
  },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  btnVoltar: {
    backgroundColor: '#0A4D2E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnVoltarText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 5 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  btnVerHistorico: {
    backgroundColor: '#0A4D2E',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 30,
  },
  btnVerHistoricoText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: '#008966',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  cardHeader: { alignItems: 'flex-end', marginBottom: 10, backgroundColor: 'transparent' },
  reservaNumero: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  cardBody: { backgroundColor: 'transparent', marginBottom: 15 },
  clienteNome: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  itensList: { color: '#FFF', fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 15 },
  totalText: { color: '#FFF', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  btnPago: {
    backgroundColor: '#40C993',
    width: '48%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCancelado: {
    backgroundColor: '#C62828',
    width: '48%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  // Histórico Styles
  searchBar: {
    backgroundColor: '#40C993',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  searchText: { color: '#333', marginLeft: 10, fontSize: 16, fontWeight: '500' },
  historicoSection: { backgroundColor: 'transparent', marginBottom: 30 },
  dataHeader: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 15 
  },
  historicoRow: {
    backgroundColor: '#008966',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historicoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnAbrir: {
    backgroundColor: '#40C993',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnAbrirText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  btnVoltarLista: {
    backgroundColor: '#0A4D2E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnVoltarListaText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
