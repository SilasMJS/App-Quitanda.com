import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '../../components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import reservasService, { Pedido } from '../../services/reservas';

export default function ReservasScreen() {
  const router = useRouter();
  const [reservas, setReservas] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  
  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);
  const [modalRecusarVisible, setModalRecusarVisible] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<Pedido | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('Item esgotado');

  useEffect(() => {
    carregarReservas();
  }, []);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const dados = await reservasService.listarRecebidos();
      setReservas(dados);
    } catch (error) {
      // Silencia erros de carregamento inicial
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarAcao = async () => {
    if (!reservaSelecionada) return;
    
    setProcessando(true);
    try {
      await reservasService.aprovar(reservaSelecionada.id);
      Alert.alert('Sucesso', 'Reserva confirmada com sucesso!');
      setModalConfirmarVisible(false);
      carregarReservas();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível confirmar a reserva.');
    } finally {
      setProcessando(false);
    }
  };

  const handleRecusarAcao = async () => {
    if (!reservaSelecionada) return;

    setProcessando(true);
    try {
      await reservasService.recusar(reservaSelecionada.id, motivoRecusa);
      Alert.alert('Sucesso', 'Reserva recusada.');
      setModalRecusarVisible(false);
      carregarReservas();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível recusar a reserva.');
    } finally {
      setProcessando(false);
    }
  };

  const renderReserva = ({ item }: { item: Pedido }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reservaNumero}>ID: #{item.id.substring(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'PENDENTE' ? '#FFB300' : '#40C993' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.clienteNome}>{item.cliente_nome || 'Cliente da Quitanda'}</Text>
        {item.itens.map((i, index) => (
          <Text key={index} style={styles.itensList}>
            {i.quantidade}x {i.produto_nome || 'Produto'}
          </Text>
        ))}
        <Text style={styles.totalText}>
          R$ {(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {item.status === 'PENDENTE' && (
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
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        <Text style={styles.title}>Minhas Reservas</Text>

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
                <Text style={{ color: '#999', fontSize: 18, fontWeight: 'bold', marginTop: 15 }}>Nenhuma reserva pendente</Text>
                <Text style={{ color: '#CCC', fontSize: 14, textAlign: 'center', marginTop: 5, paddingHorizontal: 40 }}>
                  Quando os clientes fizerem reservas na sua quitanda, elas aparecerão aqui.
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
              <Text style={styles.modalSubtitle}>Deseja confirmar este pedido?</Text>
              
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>MOTIVO DE RECUSA</Text>
              <Text style={styles.modalSubtitle}>Selecione o motivo do cancelamento</Text>
              
              <TouchableOpacity style={styles.dropdown} onPress={() => Alert.alert('Motivos', 'Item esgotado\nEndereço fora da área\nOutros')}>
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

              <TouchableOpacity style={styles.btnModalVoltar} onPress={() => setModalRecusarVisible(false)}>
                <Text style={styles.btnModalVoltarText}>VOLTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  cardBody: { backgroundColor: 'transparent', marginBottom: 15 },
  clienteNome: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  itensList: { color: '#FFF', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  totalText: { color: '#FFF', fontSize: 16, fontWeight: '900', marginTop: 10, textAlign: 'right' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
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
