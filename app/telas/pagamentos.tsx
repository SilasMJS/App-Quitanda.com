import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '../../components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import pagamentosService from '../../services/pagamentos';
import { Pedido } from '../../services/reservas';

export default function PagamentosScreen() {
  const router = useRouter();
  const [exibirHistorico, setExibirHistorico] = useState(false);
  const [pagamentos, setPagamentos] = useState<Pedido[]>([]);
  const [historico, setHistorico] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [pendentes, passados] = await Promise.all([
        pagamentosService.listarPendentes(),
        pagamentosService.listarHistorico()
      ]);
      setPagamentos(pendentes);
      setHistorico(passados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarPagamento = async (id: string) => {
    try {
      await pagamentosService.confirmarPagamento(id);
      Alert.alert('Sucesso', 'Pagamento confirmado!');
      carregarDados();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao confirmar.');
    }
  };

  const renderPagamento = ({ item }: { item: Pedido }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reservaNumero}>RESERVA #{item.id.substring(0, 6)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.clienteNome}>{item.cliente_nome || 'Cliente'}</Text>
        <Text style={styles.totalText}>R$ {item.valor_total.toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnPago} onPress={() => confirmarPagamento(item.id)}>
          <Text style={styles.btnText}>MARCAR COMO PAGO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/images/Group 2.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
            <Text style={styles.logoText}>uitanda.com</Text>
          </View>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={20} color="#FFF" />
            <Text style={styles.btnVoltarText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : !exibirHistorico ? (
          <>
            <TouchableOpacity style={styles.btnVerHistorico} onPress={() => setExibirHistorico(true)}>
              <Text style={styles.btnVerHistoricoText}>VER HISTORICO</Text>
            </TouchableOpacity>
            <FlatList
              data={pagamentos}
              renderItem={renderPagamento}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999' }}>Nenhum pagamento pendente.</Text>}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>HISTORICO</Text>
            <FlatList
              data={historico}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historicoRow}>
                  <Text style={styles.historicoTexto}>#{item.id.substring(0,6)} - R$ {item.valor_total.toFixed(2)}</Text>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>{item.status}</Text></View>
                </View>
              )}
              contentContainerStyle={styles.list}
            />
            <TouchableOpacity style={styles.btnVoltarLista} onPress={() => setExibirHistorico(false)}>
              <Text style={styles.btnVoltarListaText}>VOLTAR</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  btnVoltar: { backgroundColor: '#0A4D2E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnVoltarText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 5 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: '#333', marginBottom: 20 },
  btnVerHistorico: { backgroundColor: '#0A4D2E', alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginBottom: 30 },
  btnVerHistoricoText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#008966', borderRadius: 12, padding: 15, marginBottom: 20 },
  cardHeader: { alignItems: 'flex-end', marginBottom: 10 },
  reservaNumero: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  cardBody: { marginBottom: 15 },
  clienteNome: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  totalText: { color: '#FFF', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  cardActions: { flexDirection: 'row', justifyContent: 'center' },
  btnPago: { backgroundColor: '#40C993', width: '80%', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  historicoRow: { backgroundColor: '#008966', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 8, marginBottom: 10 },
  historicoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  statusBadge: { backgroundColor: '#40C993', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  btnVoltarLista: { backgroundColor: '#0A4D2E', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnVoltarListaText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
