import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import suporteService, { TicketSuporte } from '../../services/suporte';

export default function SuporteScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketSuporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('duvida');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const carregarTickets = async () => {
    try {
      setLoading(true);
      const data = await suporteService.listarMeusTickets();
      setTickets(data);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarTickets();
    }, [])
  );

  const enviarTicket = async () => {
    if (!mensagem.trim()) {
      if (Platform.OS === 'web') window.alert('Digite sua mensagem');
      else Alert.alert('Aviso', 'Digite sua mensagem');
      return;
    }
    
    try {
      setEnviando(true);
      await suporteService.criarTicket({ tipo: tipoSelecionado, mensagem });
      setModalVisible(false);
      setMensagem('');
      if (Platform.OS === 'web') window.alert('Mensagem enviada!');
      else Alert.alert('Sucesso', 'Mensagem enviada ao suporte!');
      carregarTickets();
    } catch (error) {
      console.error('Erro ao enviar ticket:', error);
      if (Platform.OS === 'web') window.alert('Não foi possível enviar a mensagem');
      else Alert.alert('Erro', 'Não foi possível enviar a mensagem');
    } finally {
      setEnviando(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return '#FFA000';
      case 'respondido': return '#2196F3';
      case 'resolvido': return '#4CAF50';
      default: return '#999';
    }
  };

  const renderTicket = ({ item }: { item: TicketSuporte }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTipo}>{item.tipo.toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.ticketData}>{new Date(item.criado_em).toLocaleDateString('pt-BR')}</Text>
      <Text style={styles.ticketMensagem}>{item.mensagem}</Text>
      
      {item.resposta_admin && (
        <View style={styles.respostaContainer}>
          <Text style={styles.respostaLabel}>Resposta do Suporte:</Text>
          <Text style={styles.respostaAdmin}>{item.resposta_admin}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Ajuda</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={item => item.id}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma solicitação aberta. Como podemos ajudar hoje?</Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Solicitação</Text>
            
            <Text style={styles.label}>Sobre o que deseja falar?</Text>
            <View style={styles.radioGroup}>
              {['duvida', 'sugestao_produto', 'bug'].map(tipo => (
                <TouchableOpacity 
                  key={tipo} 
                  style={[styles.radioBtn, tipoSelecionado === tipo && styles.radioBtnActive]}
                  onPress={() => setTipoSelecionado(tipo)}
                >
                  <Text style={[styles.radioText, tipoSelecionado === tipo && styles.radioTextActive]}>
                    {tipo.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Mensagem</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Descreva aqui com detalhes..."
              value={mensagem}
              onChangeText={setMensagem}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={enviando}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, enviando && { opacity: 0.7 }]} onPress={enviarTicket} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Enviar</Text>}
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
    backgroundColor: '#2E7D32',
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketTipo: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  ticketData: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  ticketMensagem: { fontSize: 15, color: '#555' },
  
  respostaContainer: {
    marginTop: 15,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  respostaLabel: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5 },
  respostaAdmin: { fontSize: 14, color: '#333' },

  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2E7D32',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  radioBtn: { borderWidth: 1, borderColor: '#CCC', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginBottom: 10 },
  radioBtnActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  radioText: { color: '#555', fontSize: 12 },
  radioTextActive: { color: '#FFF', fontWeight: 'bold' },
  
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 15, fontSize: 16, height: 100, textAlignVertical: 'top' },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 10 },
  cancelBtn: { padding: 12, borderRadius: 8 },
  cancelBtnText: { color: '#666', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#2E7D32', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  submitBtnText: { color: '#FFF', fontWeight: 'bold' },
});
