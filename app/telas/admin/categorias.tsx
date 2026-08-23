import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, View as RNView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import Constants from 'expo-constants';

export default function CategoriasAdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'produtos' | 'comunidades'>('produtos');

  const [categorias, setCategorias] = useState<any[]>([]);
  const [tiposComunidade, setTiposComunidade] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formNome, setFormNome] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resCat, resTipos] = await Promise.all([
        api.get('/categorias'),
        api.get('/tipos-comunidade')
      ]);
      setCategorias(resCat.data);
      setTiposComunidade(resTipos.data);
    } catch (error) {
      console.log('Erro ao carregar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!formNome.trim()) {
      const msg = 'Por favor, informe o nome.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Atenção', msg);
      return;
    }

    try {
      const route = activeTab === 'produtos' ? '/categorias' : '/tipos-comunidade';
      const payload = activeTab === 'produtos' 
        ? { nome: formNome, icone: '', ativo: true } 
        : { nome: formNome, ativo: true };

      if (isEditing && editId) {
        await api.put(`${route}/${editId}`, payload);
      } else {
        await api.post(route, payload);
      }
      
      setModalVisible(false);
      setFormNome('');
      carregarDados();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Erro ao salvar item';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erro', msg);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setFormNome('');
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormNome(item.nome);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const route = activeTab === 'produtos' ? '/categorias' : '/tipos-comunidade';
    try {
      await api.delete(`${route}/${id}`);
      carregarDados();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Erro ao excluir item';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Erro', msg);
    }
  };

  const confirmDelete = (id: string, nome: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Deseja realmente excluir "${nome}"?`)) {
        handleDelete(id);
      }
    } else {
      Alert.alert('Excluir', `Deseja realmente excluir "${nome}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDelete(id) }
      ]);
    }
  };

  const listaCompleta = activeTab === 'produtos' ? categorias : tiposComunidade;
  const listaFiltrada = listaCompleta.filter(item => 
    item.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/dashboard')}>
          <Ionicons name="arrow-back" size={26} color="#00796B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar Tipos</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'produtos' && styles.activeTab]}
          onPress={() => setActiveTab('produtos')}
        >
          <Text style={[styles.tabText, activeTab === 'produtos' && styles.activeTabText]}>Produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'comunidades' && styles.activeTab]}
          onPress={() => setActiveTab('comunidades')}
        >
          <Text style={[styles.tabText, activeTab === 'comunidades' && styles.activeTabText]}>Comunidades</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarContainer}>
        <RNView style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder={`Pesquisar ${activeTab === 'produtos' ? 'categorias' : 'tipos de comunidade'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </RNView>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#00796B" style={{marginTop: 50}} />
        ) : listaFiltrada.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? 'Nenhum resultado encontrado.' : 'Nenhum item cadastrado.'}
          </Text>
        ) : (
          listaFiltrada.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <RNView style={styles.actionsRow}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={{marginRight: 15}}>
                  <Ionicons name="pencil-outline" size={22} color="#00796B" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item.id, item.nome)}>
                  <Ionicons name="trash-outline" size={22} color="#D32F2F" />
                </TouchableOpacity>
              </RNView>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Add/Edit */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <RNView style={styles.modalOverlay}>
          <RNView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar' : 'Novo'} {activeTab === 'produtos' ? 'Produto' : 'Comunidade'}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Digite o nome..."
              value={formNome}
              onChangeText={setFormNome}
              autoFocus
            />

            <RNView style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSalvar}>
                <Text style={styles.modalBtnSaveText}>Salvar</Text>
              </TouchableOpacity>
            </RNView>
          </RNView>
        </RNView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  topHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60 + Constants.statusBarHeight,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE',
    paddingTop: Constants.statusBarHeight,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', elevation: 2, zIndex: 10 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#00796B' },
  tabText: { fontSize: 15, fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#00796B' },
  
  searchBarContainer: { 
    flexDirection: 'row', padding: 15, gap: 10, backgroundColor: '#FFF', 
    borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' 
  },
  searchInputWrapper: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 15, height: 45 
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%', outlineStyle: 'none' } as any,
  addButton: { 
    backgroundColor: '#00796B', width: 45, height: 45, 
    borderRadius: 10, justifyContent: 'center', alignItems: 'center' 
  },
  
  scrollContent: { padding: 15 },
  listItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10, 
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  itemNome: { fontSize: 16, fontWeight: '600', color: '#333' },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },

  // Modal Styles
  modalOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', alignItems: 'center', padding: 20 
  },
  modalContent: { 
    backgroundColor: '#FFF', width: '100%', maxWidth: 400, 
    borderRadius: 15, padding: 25, elevation: 5 
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  modalInput: { 
    backgroundColor: '#F5F5F5', borderRadius: 8, padding: 15, 
    fontSize: 16, marginBottom: 25, borderWidth: 1, borderColor: '#E0E0E0' 
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  modalBtnCancelText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
  modalBtnSave: { backgroundColor: '#00796B', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalBtnSaveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
