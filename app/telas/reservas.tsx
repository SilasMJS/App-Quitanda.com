import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Dados mockados conforme o estilo da imagem
const RESERVAS = [
  { 
    id: '1', 
    numero: '#1',
    nome: 'Silas Malaquias', 
    itens: '2x Alface roxo\n1x Cheiro Verde',
    total: 'R$ 6,00 Em dinheiro',
  },
  { 
    id: '2', 
    numero: '#2',
    nome: 'Maria Julia', 
    itens: '1x Mel Orgânico\n2x Ovos Caipira',
    total: 'R$ 45,00 Em dinheiro',
  },
];

export default function ReservasScreen() {
  const router = useRouter();
  const [modalConfirmarVisible, setModalConfirmarVisible] = useState(false);
  const [modalRecusarVisible, setModalRecusarVisible] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<any>(null);

  const handleConfirmar = (reserva: any) => {
    setReservaSelecionada(reserva);
    setModalConfirmarVisible(true);
  };

  const handleRecusar = (reserva: any) => {
    setReservaSelecionada(reserva);
    setModalRecusarVisible(true);
  };

  const renderReserva = ({ item }: { item: any }) => (
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
        <TouchableOpacity 
          style={styles.btnConfirmar}
          onPress={() => handleConfirmar(item)}
        >
          <Text style={styles.btnText}>CONFIRMAR</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.btnRecusar}
          onPress={() => handleRecusar(item)}
        >
          <Text style={styles.btnText}>RECUSAR</Text>
        </TouchableOpacity>
      </View>
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
          <TouchableOpacity 
            style={styles.btnVoltar}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-circle-outline" size={20} color="#FFF" />
            <Text style={styles.btnVoltarText}>VOLTAR</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={RESERVAS}
          renderItem={renderReserva}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Modal CONFIRMAR RESERVA */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalConfirmarVisible}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>CONFIRMAR RESERVA</Text>
              <Text style={styles.modalSubtitle}>A reserva {reservaSelecionada?.numero} será confirmada</Text>
              
              <TouchableOpacity 
                style={styles.btnModalAcao}
                onPress={() => setModalConfirmarVisible(false)}
              >
                <Text style={styles.btnModalText}>SIM</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnModalVoltar}
                onPress={() => setModalConfirmarVisible(false)}
              >
                <Ionicons name="arrow-back-circle-outline" size={18} color="#FFF" />
                <Text style={styles.btnModalVoltarText}>VOLTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal MOTIVO DE RECUSA */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalRecusarVisible}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>MOTIVO DE RECUSA</Text>
              <Text style={styles.modalSubtitle}>Selecione o motivo do cancelamento do pedido</Text>
              
              <View style={styles.dropdown}>
                <Text style={styles.dropdownText}>Item esgotado</Text>
                <Ionicons name="caret-down" size={16} color="#FFF" />
              </View>

              <TouchableOpacity 
                style={styles.btnModalAcao}
                onPress={() => setModalRecusarVisible(false)}
              >
                <Text style={styles.btnModalText}>CONTINUAR</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnModalVoltar}
                onPress={() => setModalRecusarVisible(false)}
              >
                <Ionicons name="arrow-back-circle-outline" size={18} color="#FFF" />
                <Text style={styles.btnModalVoltarText}>VOLTAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: '#008966',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  cardHeader: {
    alignItems: 'flex-end',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  reservaNumero: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  cardBody: { backgroundColor: 'transparent', marginBottom: 15 },
  clienteNome: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  itensList: { color: '#FFF', fontSize: 14, fontWeight: '500', lineHeight: 20, marginBottom: 15 },
  totalText: { color: '#FFF', fontSize: 16, fontWeight: '900', textAlign: 'center' },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  btnConfirmar: {
    backgroundColor: '#40C993',
    width: '48%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnRecusar: {
    backgroundColor: '#C62828',
    width: '48%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#008966',
    width: '100%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  dropdown: {
    width: '100%',
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  dropdownText: { color: '#FFF', fontSize: 16 },
  btnModalAcao: {
    backgroundColor: '#40C993',
    width: '80%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnModalText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  btnModalVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A4D2E',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnModalVoltarText: { color: '#FFF', fontSize: 14, fontWeight: '700', marginLeft: 5 },
});
