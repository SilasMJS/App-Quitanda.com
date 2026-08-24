import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import suporteService, { TicketSuporte } from '../../../services/suporte';
import { useToast } from '../../../components/ToastContext';

export default function AdminSuporteScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<TicketSuporte[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [ticketSelecionado, setTicketSelecionado] = useState<TicketSuporte | null>(null);
  const [resposta, setResposta] = useState('');
  const [status, setStatus] = useState('respondido');
  const [enviando, setEnviando] = useState(false);

  const carregarTickets = async () => {
    try {
      setLoading(true);
      const data = await suporteService.listarTodosTickets(); // traz todos por padrao
      setTickets(data);
    } catch (error) {
      console.error('Erro ao carregar tickets do admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarTickets();
    }, [])
  );

  const responderTicket = async () => {
    if (!ticketSelecionado) return;
    
    if (!resposta.trim()) {
      showToast('Digite uma resposta', 'info');
      return;
    }

    try {
      setEnviando(true);
      await suporteService.responderTicket(ticketSelecionado.id, { resposta_admin: resposta, status });
      setTicketSelecionado(null);
      setResposta('');
      showToast('Ticket respondido!', 'success');
      carregarTickets();
    } catch (error) {
      console.error('Erro ao responder ticket:', error);
      showToast('Erro ao enviar resposta', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return '#D32F2F'; // Vermelho para chamar atençao do admin
      case 'respondido': return '#2196F3';
      case 'resolvido': return '#4CAF50';
      default: return '#999';
    }
  };

  const renderTicket = ({ item }: { item: TicketSuporte }) => (
    <TouchableOpacity 
      style={[styles.ticketCard, item.status === 'aberto' && styles.ticketCardAberto]}
      onPress={() => {
        setTicketSelecionado(item);
        setResposta(item.resposta_admin || '');
        setStatus(item.status === 'aberto' ? 'respondido' : item.status);
      }}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTipo}>{item.tipo.toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.ticketRemetente}>{item.usuario_nome} ({item.usuario_email})</Text>
      <Text style={styles.ticketData}>{new Date(item.criado_em).toLocaleString('pt-BR')}</Text>
      <Text style={styles.ticketMensagem} numberOfLines={3}>{item.mensagem}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Suporte</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item.id}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum ticket encontrado.</Text>
          }
        />
      )}

      {/* Modal de Resposta */}
      <Modal visible={!!ticketSelecionado} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Responder Ticket</Text>
            
            {ticketSelecionado && (
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketInfoLabel}>Mensagem Original ({ticketSelecionado.usuario_nome}):</Text>
                <Text style={styles.ticketInfoText}>{ticketSelecionado.mensagem}</Text>
              </View>
            )}

            <Text style={styles.label}>Novo Status:</Text>
            <View style={styles.radioGroup}>
              {['respondido', 'resolvido'].map(op => (
                <TouchableOpacity 
                  key={op} 
                  style={[styles.radioBtn, status === op && styles.radioBtnActive]}
                  onPress={() => setStatus(op)}
                >
                  <Text style={[styles.radioText, status === op && styles.radioTextActive]}>
                    {op.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Sua Resposta:</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Digite o feedback..."
              value={resposta}
              onChangeText={setResposta}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setTicketSelecionado(null)} disabled={enviando}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, enviando && { opacity: 0.7 }]} onPress={responderTicket} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Atualizar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  
  ticketCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#CCC',
  },
  ticketCardAberto: { borderLeftColor: '#D32F2F', backgroundColor: '#FFF5F5' },
  
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketTipo: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  ticketRemetente: { fontSize: 13, color: '#1976D2', marginTop: 5, fontWeight: 'bold' },
  ticketData: { fontSize: 11, color: '#888', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  ticketMensagem: { fontSize: 14, color: '#555' },

  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  
  ticketInfo: { backgroundColor: '#F0F0F0', padding: 10, borderRadius: 8, marginBottom: 15 },
  ticketInfoLabel: { fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 5 },
  ticketInfoText: { fontSize: 14, color: '#333' },

  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  radioGroup: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  radioBtn: { borderWidth: 1, borderColor: '#CCC', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  radioBtnActive: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  radioText: { color: '#555', fontSize: 12 },
  radioTextActive: { color: '#FFF', fontWeight: 'bold' },
  
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 15, fontSize: 16, height: 100, textAlignVertical: 'top' },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  cancelBtn: { padding: 12, borderRadius: 8 },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#1976D2', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' },
});
