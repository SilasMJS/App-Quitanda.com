import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, Text, View, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import pagamentosService from '../../services/pagamentos';
import { Pedido } from '../../services/reservas';
import authService from '../../services/auth';

export default function PagamentosScreen() {
  const router = useRouter();
  const [exibirHistorico, setExibirHistorico] = useState(false);
  const [pagamentos, setPagamentos] = useState<Pedido[]>([]);
  const [historico, setHistorico] = useState<Pedido[]>([]);
  const [vendedorNome, setVendedorNome] = useState('Quitanda.com');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    authService.getCurrentUser().then(u => {
      if (u && u.nome) setVendedorNome(u.nome);
    }).catch(() => {});
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

  const limparTelefone = (telefone: string) => {
    if (!telefone) return '';
    return telefone.replace(/\D/g, '');
  };

  const abrirWhatsApp = async (telefone: string, mensagem: string) => {
    const numeroLimpo = limparTelefone(telefone);
    if (!numeroLimpo) {
      Alert.alert('Aviso', 'O cliente não possui um número de telefone válido.');
      return;
    }
    const numeroFinal = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensagem)}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Aviso', 'Não foi possível abrir o WhatsApp.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o WhatsApp.');
    }
  };

  const copiarTelefone = async (telefone: string) => {
    if (!telefone) return;
    await Clipboard.setStringAsync(telefone);
    Alert.alert('Copiado', 'Número de telefone copiado com sucesso!');
  };

  const confirmarPagamento = async (pedido: Pedido) => {
    try {
      await pagamentosService.confirmarPagamento(pedido.id);
      Alert.alert(
        'Sucesso', 
        'Reserva finalizada (Paga e Entregue)!\n\nDeseja enviar uma mensagem de agradecimento no WhatsApp?',
        [
          { text: 'Não', style: 'cancel', onPress: () => carregarDados() },
          { text: 'Sim, Agradecer', onPress: () => {
              carregarDados();
              abrirWhatsApp(
                pedido.cliente_telefone || '',
                `Olá, ${pedido.cliente_nome || 'cliente'}! Aqui é ${vendedorNome} da Quitanda.com. Muito obrigado por comprar conosco e retirar a sua reserva #${pedido.id.substring(0,8).toUpperCase()}! Esperamos que goste dos nossos produtos. Volte sempre!`
              );
          } }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha ao confirmar.');
    }
  };

  const renderPagamento = ({ item }: { item: Pedido }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reservaNumero}>RESERVA #{item.id.substring(0, 8).toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clienteNome}>{item.cliente_nome || 'Cliente'}</Text>
            {item.cliente_telefone ? (
              <Text style={{ color: '#FFF', fontSize: 13, marginBottom: 10, opacity: 0.9 }}>
                {item.cliente_telefone}
              </Text>
            ) : null}
          </View>

          {item.cliente_telefone && (
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <TouchableOpacity 
                style={{ padding: 8, backgroundColor: '#E0F2F1', borderRadius: 8, marginRight: 8 }}
                onPress={() => copiarTelefone(item.cliente_telefone || '')}
              >
                <Ionicons name="copy-outline" size={18} color="#008966" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ padding: 8, backgroundColor: '#25D366', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}
                onPress={() => abrirWhatsApp(item.cliente_telefone || '', `Olá, ${item.cliente_nome || ''}! Aqui é ${vendedorNome} da Quitanda.com. Sua reserva #${item.id.substring(0,8).toUpperCase()} já está separada e aguardando retirada. Que horas você vem buscar?`)}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.totalText}>R$ {parseFloat(item.valor_total.toString()).toFixed(2).replace('.', ',')}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnPago} onPress={() => confirmarPagamento(item)}>
          <Text style={styles.btnText}>MARCAR COMO PAGO E ENTREGUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/dashboard')}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoRow} onPress={() => router.replace('/telas/dashboard')}>
          <Image source={require('../../assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>
        
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : !exibirHistorico ? (
          <>
            <TouchableOpacity style={styles.btnVerHistorico} onPress={() => setExibirHistorico(true)}>
              <Text style={styles.btnVerHistoricoText}>VER HISTÓRICO</Text>
            </TouchableOpacity>
            <FlatList
              data={pagamentos}
              renderItem={renderPagamento}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Nenhuma encomenda aguardando retirada.</Text>}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>HISTÓRICO</Text>
            <FlatList
              data={historico}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historicoRow}>
                  <Text style={styles.historicoTexto}>#{item.id.substring(0,8).toUpperCase()} - R$ {parseFloat(item.valor_total.toString()).toFixed(2).replace('.', ',')}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF',
  },
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
  content: { flex: 1, padding: 20, paddingTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  backButton: { padding: 5 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: '#333', marginBottom: 20 },
  btnVerHistorico: { backgroundColor: '#0A4D2E', alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, marginBottom: 30 },
  btnVerHistoricoText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#008966', borderRadius: 12, padding: 15, marginBottom: 20 },
  cardHeader: { alignItems: 'flex-end', marginBottom: 10 },
  reservaNumero: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  cardBody: { marginBottom: 15 },
  clienteNome: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 2 },
  totalText: { color: '#FFF', fontSize: 20, fontWeight: '900', textAlign: 'left', marginTop: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'center', marginTop: 5 },
  btnPago: { backgroundColor: '#40C993', width: '100%', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  historicoRow: { backgroundColor: '#008966', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 8, marginBottom: 10 },
  historicoTexto: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  statusBadge: { backgroundColor: '#40C993', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  btnVoltarLista: { backgroundColor: '#0A4D2E', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnVoltarListaText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
