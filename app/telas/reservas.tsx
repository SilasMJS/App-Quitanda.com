import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Text, View, Linking, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/ToastContext';
import reservasService, { Pedido } from '../../services/reservas';
import vendedoresService from '../../services/vendedores';

export default function ReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Pedido[]>([]);
  const [vendedorNome, setVendedorNome] = useState('Quitanda.com');
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  
  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);
  const [modalRecusarVisible, setModalRecusarVisible] = useState(false);
  const [modalDetalhesVisible, setModalDetalhesVisible] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<any>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('Item esgotado');
  const [showMotivosOptions, setShowMotivosOptions] = useState(false);
  const [modalAvisarVisible, setModalAvisarVisible] = useState(false);
  const [avisarInfo, setAvisarInfo] = useState<{ telefone: string; mensagem: string } | null>(null);
  const { showToast } = useToast();

  const listaMotivos = [
    'Item esgotado no estoque',
    'Quantidade insuficiente solicitada',
    'Fora do horário de funcionamento',
    'Não consigo atender agora',
    'Outros'
  ];

  useEffect(() => {
    carregarReservas();
    vendedoresService.obterMeuPerfil().then(v => {
      if (v && v.nome_fantasia) setVendedorNome(v.nome_fantasia);
    }).catch(() => {});
  }, []);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const dados = await reservasService.listarRecebidos();
      const ativas = dados.filter(r => r.status === 'PENDENTE'); // AGORA SOMENTE PENDENTES AQUI
      setReservas(ativas);
    } catch (error) {
      setReservas([]);
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
      showToast('O cliente não possui um número de telefone válido.', 'error');
      return;
    }
    const numeroFinal = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensagem)}`;
    try {
      // canOpenURL costuma retornar falso no Android 11+ mesmo com o
      // WhatsApp instalado (regra de visibilidade de pacotes) - tenta abrir
      // direto e so avisa erro se realmente falhar.
      await Linking.openURL(url);
    } catch (error) {
      showToast('Não foi possível abrir o WhatsApp. O aplicativo está instalado?', 'error');
    }
  };

  const copiarTelefone = async (telefone: string) => {
    if (!telefone) return;
    await Clipboard.setStringAsync(telefone);
    showToast('Número de telefone copiado com sucesso!', 'success');
  };

  const handleConfirmarAcao = async () => {
    if (!reservaSelecionada) return;
    setProcessando(true);
    try {
      await reservasService.aprovar(reservaSelecionada.id);
      setModalConfirmarVisible(false);
      carregarReservas();
      showToast('Reserva confirmada com sucesso! Ela foi enviada para a aba de Pagamentos.', 'success');
      setAvisarInfo({
        telefone: reservaSelecionada.cliente_telefone,
        mensagem: `Olá, ${reservaSelecionada.cliente_nome || 'cliente'}! Aqui é ${vendedorNome} da Quitanda.com. Sua reserva #${reservaSelecionada.id.substring(0,8).toUpperCase()} foi APROVADA e os produtos já estão sendo separados. Valor total: R$ ${parseFloat(reservaSelecionada.valor_total.toString()).toFixed(2).replace('.', ',')}. Pode vir buscar!`,
      });
      setModalAvisarVisible(true);
    } catch (error) {
      showToast('Não foi possível confirmar a reserva.', 'error');
    } finally {
      setProcessando(false);
    }
  };

  const handleRecusarAcao = async () => {
    if (!reservaSelecionada) return;
    setProcessando(true);
    try {
      await reservasService.recusar(reservaSelecionada.id, motivoRecusa);
      setModalRecusarVisible(false);
      carregarReservas();
      showToast('Reserva recusada.', 'success');
      setAvisarInfo({
        telefone: reservaSelecionada.cliente_telefone,
        mensagem: `Olá, ${reservaSelecionada.cliente_nome || 'cliente'}. Aqui é ${vendedorNome} da Quitanda.com. Infelizmente sua reserva #${reservaSelecionada.id.substring(0,8).toUpperCase()} foi RECUSADA. Motivo: ${motivoRecusa}.`,
      });
      setModalAvisarVisible(true);
    } catch (error) {
      showToast('Não foi possível recusar a reserva.', 'error');
    } finally {
      setProcessando(false);
    }
  };

  const renderReserva = ({ item }: { item: Pedido }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => { setReservaSelecionada(item); setModalDetalhesVisible(true); }}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.reservaNumero}>ID: #{item.id.substring(0, 8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#FFB300' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.clienteNome}>{item.cliente_nome || 'Cliente da Quitanda'}</Text>
        {item.itens?.map((prod: any, idx: number) => (
          <Text key={idx} style={styles.itensList}>{prod.quantidade}x {prod.produto_nome || 'Produto'}</Text>
        ))}
        <Text style={styles.totalText}>R$ {parseFloat(item.valor_total.toString()).toFixed(2).replace('.', ',')}</Text>
      </View>

      <View style={styles.verDetalhesContainer}>
        <Ionicons name="expand" size={14} color="#FFF" />
        <Text style={styles.verDetalhesText}>Toque para ver detalhes</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.btnConfirmar}
          onPress={() => { setReservaSelecionada(item); setModalConfirmarVisible(true); }}
        >
          <Text style={styles.btnText}>CONFIRMAR</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.btnRecusar}
          onPress={() => { setReservaSelecionada(item); setModalRecusarVisible(true); }}
        >
          <Text style={styles.btnText}>RECUSAR</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/telas/dashboard');
          }
        }}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <View style={styles.logoRow}>
          <Image
            source={require('../../assets/images/logo.svg')}
            style={{ width: 35, height: 35 }}
            contentFit="contain"
          />
          <Text style={styles.logoText}>uitanda.com</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Novas Reservas</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={reservas}
            renderItem={renderReserva}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 100, backgroundColor: 'transparent' }}>
                <Ionicons name="cart-outline" size={80} color="#E0E0E0" />
                <Text style={{ color: '#999', fontSize: 18, fontWeight: 'bold', marginTop: 15 }}>Nenhuma nova reserva</Text>
                <Text style={{ color: '#CCC', fontSize: 14, textAlign: 'center', marginTop: 5, paddingHorizontal: 40 }}>
                  Aguardando os clientes fazerem pedidos...
                </Text>
              </View>
            }
            onRefresh={carregarReservas}
            refreshing={loading}
          />
        )}

        {/* Modal CONFIRMAR RESERVA */}
        <Modal animationType="fade" transparent={true} visible={modalConfirmarVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>CONFIRMAR RESERVA</Text>
              <Text style={styles.modalSubtitle}>Deseja confirmar este pedido e preparar os produtos para retirada?</Text>
              
              <TouchableOpacity 
                style={[styles.btnModalAcao, processando && { opacity: 0.7 }]}
                onPress={handleConfirmarAcao}
                disabled={processando}
              >
                {processando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnModalText}>SIM, CONFIRMAR</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnModalVoltar} onPress={() => setModalConfirmarVisible(false)}>
                <Text style={styles.btnModalVoltarText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal MOTIVO DE RECUSA */}
        <Modal animationType="fade" transparent={true} visible={modalRecusarVisible}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingBottom: 10 }]}>
              <Text style={styles.modalTitle}>MOTIVO DA RECUSA</Text>
              
              {!showMotivosOptions ? (
                <>
                  <Text style={styles.modalSubtitle}>Selecione o motivo para informar ao cliente:</Text>
                  <TouchableOpacity style={styles.dropdown} onPress={() => setShowMotivosOptions(true)}>
                    <Text style={styles.dropdownText}>{motivoRecusa}</Text>
                    <Ionicons name="caret-down" size={16} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.btnModalAcao, { backgroundColor: '#C62828' }, processando && { opacity: 0.7 }]}
                    onPress={handleRecusarAcao}
                    disabled={processando}
                  >
                    {processando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnModalText}>CONFIRMAR RECUSA</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={{ width: '100%', maxHeight: 200, marginBottom: 15 }}>
                  <ScrollView showsVerticalScrollIndicator={true}>
                    {listaMotivos.map((motivo, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#0A4D2E' }}
                        onPress={() => { setMotivoRecusa(motivo); setShowMotivosOptions(false); }}
                      >
                        <Text style={{ color: '#FFF', fontSize: 16 }}>{motivo}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity 
                style={styles.btnModalVoltar} 
                onPress={() => { 
                  if (showMotivosOptions) setShowMotivosOptions(false); 
                  else setModalRecusarVisible(false); 
                }}
              >
                <Text style={styles.btnModalVoltarText}>VOLTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal DETALHES */}
        <Modal animationType="slide" transparent={true} visible={modalDetalhesVisible}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#FFF', alignItems: 'stretch' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 15 }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#2C3E50' }}>Detalhes da Reserva</Text>
                <TouchableOpacity onPress={() => setModalDetalhesVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {reservaSelecionada && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' }}>Cliente: {reservaSelecionada.cliente_nome || 'Não informado'}</Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginRight: 10 }}>
                      Telefone: {reservaSelecionada.cliente_telefone || 'Não informado'}
                    </Text>
                    {reservaSelecionada.cliente_telefone && (
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity 
                          style={{ padding: 6, backgroundColor: '#E0F2F1', borderRadius: 6, marginRight: 8 }}
                          onPress={() => copiarTelefone(reservaSelecionada.cliente_telefone)}
                        >
                          <Ionicons name="copy-outline" size={18} color="#008966" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={{ padding: 6, backgroundColor: '#25D366', borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}
                          onPress={() => abrirWhatsApp(reservaSelecionada.cliente_telefone, `Olá, ${reservaSelecionada.cliente_nome || ''}! Aqui é ${vendedorNome} da Quitanda.com. Gostaria de falar sobre sua reserva #${reservaSelecionada.id.substring(0,8).toUpperCase()}.`)}
                        >
                          <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Text style={{ fontSize: 14, marginBottom: 5, color: '#666' }}>Status: {reservaSelecionada.status}</Text>
                  <Text style={{ fontSize: 14, marginBottom: 5, color: '#666' }}>Pagamento: {reservaSelecionada.forma_pagamento || 'Não informado'}</Text>
                  {reservaSelecionada.data_retirada && <Text style={{ fontSize: 14, marginBottom: 5, color: '#666' }}>Retirada: {new Date(reservaSelecionada.data_retirada).toLocaleString('pt-BR')}</Text>}
                  {reservaSelecionada.observacao && <Text style={{ fontSize: 14, marginBottom: 15, color: '#666' }}>Obs: {reservaSelecionada.observacao}</Text>}
                  
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#333' }}>Itens ({reservaSelecionada.itens?.length || 0})</Text>
                  {reservaSelecionada.itens?.map((item: any, idx: number) => (
                    <Text key={idx} style={{ fontSize: 15, marginBottom: 6, color: '#555' }}>- {item.quantidade}x {item.produto_nome}</Text>
                  ))}
                  
                  <Text style={{ fontSize: 20, fontWeight: '900', marginTop: 15, textAlign: 'right', color: '#2E7D32' }}>Total: R$ {parseFloat(reservaSelecionada.valor_total.toString()).toFixed(2).replace('.', ',')}</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        <ConfirmModal
          visible={modalAvisarVisible}
          title="Avisar Cliente"
          message="Deseja avisar o cliente pelo WhatsApp?"
          confirmLabel="Sim, Avisar"
          onCancel={() => setModalAvisarVisible(false)}
          onConfirm={() => {
            setModalAvisarVisible(false);
            if (avisarInfo) abrirWhatsApp(avisarInfo.telefone, avisarInfo.mensagem);
          }}
        />
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
  logoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 20, textAlign: 'center' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#008966', borderRadius: 12, padding: 15, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, backgroundColor: 'transparent' },
  reservaNumero: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardBody: { backgroundColor: 'transparent', marginBottom: 10 },
  clienteNome: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  itensList: { color: '#FFF', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  totalText: { color: '#FFF', fontSize: 16, fontWeight: '900', marginTop: 10, textAlign: 'right' },
  verDetalhesContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  verDetalhesText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 4, opacity: 0.9 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent', marginTop: 5 },
  btnConfirmar: { backgroundColor: '#40C993', width: '48%', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnRecusar: { backgroundColor: '#C62828', width: '48%', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#008966', width: '100%', borderRadius: 15, padding: 25, alignItems: 'center' },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 15 },
  modalSubtitle: { color: '#FFF', fontSize: 14, textAlign: 'center', marginBottom: 30 },
  dropdown: { width: '100%', backgroundColor: '#0A4D2E', height: 50, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 30 },
  dropdownText: { color: '#FFF', fontSize: 16 },
  btnModalAcao: { backgroundColor: '#40C993', width: '100%', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  btnModalText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  btnModalVoltar: { paddingVertical: 8 },
  btnModalVoltarText: { color: '#FFF', fontSize: 14, fontWeight: '700', opacity: 0.8 },
});
