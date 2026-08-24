import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, View as RNView, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import Constants from 'expo-constants';
import { useToast } from '../../../components/ToastContext';

export default function AdminUsuariosScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [mudandoTipo, setMudandoTipo] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUsuarios();
    }, [])
  );

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/usuarios/');
      setUsuarios(response.data);
    } catch (error) {
      showToast('Não foi possível carregar os usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMudarTipo = async (novoTipo: string) => {
    if (!usuarioSelecionado) return;
    setMudandoTipo(true);
    try {
      await api.put(`/usuarios/${usuarioSelecionado.id}/tipo`, { tipo: novoTipo });
      setUsuarioSelecionado(null);
      loadUsuarios();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Erro ao mudar perfil.';
      showToast(msg, 'error');
    } finally {
      setMudandoTipo(false);
    }
  };

  const getRoleColor = (tipo: string) => {
    if (tipo?.toUpperCase() === 'ADMIN') return '#FBC02D';
    if (tipo?.toUpperCase() === 'VENDEDOR') return '#2E7D32';
    return '#1976D2'; // CLIENTE
  };

  const renderUsuario = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => setUsuarioSelecionado(item)}
    >
      <RNView style={[styles.colorBar, { backgroundColor: getRoleColor(item.tipo) }]} />
      <RNView style={styles.cardContent}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.telefone}>{item.telefone}</Text>
        <RNView style={styles.statusRow}>
          <RNView style={[styles.statusDot, { backgroundColor: item.ativo ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>{item.tipo?.toUpperCase() === 'CLIENTE' ? 'USUÁRIO' : item.tipo?.toUpperCase()} - {item.ativo ? 'Ativo' : 'Inativo'}</Text>
        </RNView>
      </RNView>
      <RNView style={styles.editIconContainer}>
        <Ionicons name="settings-outline" size={24} color="#666" />
      </RNView>
    </TouchableOpacity>
  );

  return (
    <RNView style={styles.container}>
      <StatusBar style="dark" />
      
      <RNView style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/dashboard')}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoRow} onPress={() => router.replace('/telas/dashboard')}>
          <Image source={require('../../../assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>
        
        <RNView style={{ width: 40 }} />
      </RNView>

      <RNView style={styles.content}>
        <RNView style={styles.header}>
          <Text style={styles.title}>Usuários</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/telas/admin/novo-usuario' as any)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>NOVO</Text>
          </TouchableOpacity>
        </RNView>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={usuarios}
            keyExtractor={(item) => item.id}
            renderItem={renderUsuario}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
            }
            onRefresh={loadUsuarios}
            refreshing={loading}
          />
        )}
      </RNView>
      
      {/* Modal de Gestão do Perfil */}
      <Modal visible={!!usuarioSelecionado} transparent={true} animationType="slide">
        <RNView style={styles.modalOverlay}>
          <RNView style={styles.modalContent}>
            {usuarioSelecionado && (
              <>
                <Text style={styles.modalTitle}>Gerenciar Usuário</Text>
                <Text style={styles.modalSubtitle}>{usuarioSelecionado.nome}</Text>
                
                <Text style={styles.modalSectionTitle}>Mudar Perfil Para:</Text>
                
                  {usuarioSelecionado.tipo !== 'cliente' && (
                  <TouchableOpacity 
                    style={[styles.roleBtn, { borderColor: '#1976D2' }]} 
                    onPress={() => handleMudarTipo('cliente')}
                    disabled={mudandoTipo}
                  >
                    <Ionicons name="person-outline" size={20} color="#1976D2" />
                    <Text style={[styles.roleBtnText, { color: '#1976D2' }]}>Tornar USUÁRIO</Text>
                  </TouchableOpacity>
                )}
                
                {usuarioSelecionado.tipo !== 'vendedor' && (
                  <TouchableOpacity 
                    style={[styles.roleBtn, { borderColor: '#2E7D32' }]} 
                    onPress={() => {
                      setUsuarioSelecionado(null);
                      router.push({
                        pathname: '/telas/admin/novo-vendedor',
                        params: { usuario_id: usuarioSelecionado.id, usuario_nome: usuarioSelecionado.nome }
                      } as any);
                    }}
                    disabled={mudandoTipo}
                  >
                    <Ionicons name="storefront-outline" size={20} color="#2E7D32" />
                    <Text style={[styles.roleBtnText, { color: '#2E7D32' }]}>Tornar VENDEDOR</Text>
                  </TouchableOpacity>
                )}
                
                {usuarioSelecionado.tipo !== 'admin' && (
                  <TouchableOpacity 
                    style={[styles.roleBtn, { borderColor: '#FBC02D' }]} 
                    onPress={() => handleMudarTipo('admin')}
                    disabled={mudandoTipo}
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color="#FBC02D" />
                    <Text style={[styles.roleBtnText, { color: '#FBC02D' }]}>Tornar ADMIN</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setUsuarioSelecionado(null)}>
                  <Text style={styles.cancelBtnText}>FECHAR</Text>
                </TouchableOpacity>
              </>
            )}
          </RNView>
        </RNView>
      </Modal>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
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
  backButton: { padding: 5 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  content: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2E7D32', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
  list: { paddingBottom: 20 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    marginBottom: 15, 
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colorBar: { width: 6 },
  cardContent: { flex: 1, padding: 15 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  telefone: { fontSize: 14, color: '#666', marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  editIconContainer: { justifyContent: 'center', padding: 15 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', padding: 25, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  modalSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  roleBtnText: { fontWeight: 'bold', fontSize: 16 },
  
  cancelBtn: { marginTop: 15, padding: 15, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontWeight: 'bold', fontSize: 16 }
});
