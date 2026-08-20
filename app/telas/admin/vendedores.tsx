import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import Constants from 'expo-constants';

export default function AdminVendedoresScreen() {
  const router = useRouter();
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendedores/');
      setVendedores(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os vendedores.');
    } finally {
      setLoading(false);
    }
  };

  const renderVendedor = ({ item }: { item: any }) => (
    <RNView style={styles.card}>
      <RNView style={[styles.colorBar, { backgroundColor: '#2E7D32' }]} />
      <RNView style={styles.cardContent}>
        <Text style={styles.nome}>{item.nome_fantasia}</Text>
        <Text style={styles.telefone}>Chave PIX: {item.chave_pix}</Text>
        <RNView style={styles.statusRow}>
          <RNView style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statusText}>VENDEDOR APROVADO</Text>
        </RNView>
      </RNView>
      <TouchableOpacity style={styles.editButton}>
        <Ionicons name="create-outline" size={24} color="#666" />
      </TouchableOpacity>
    </RNView>
  );

  return (
    <RNView style={styles.container}>
      <StatusBar style="dark" />
      
      <RNView style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <RNView style={styles.logoRow}>
          <Image source={require('../../../assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </RNView>
        
        <RNView style={{ width: 40 }} />
      </RNView>

      <RNView style={styles.content}>
        <RNView style={styles.header}>
          <Text style={styles.title}>Vendedores</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/telas/admin/novo-vendedor' as any)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>NOVO</Text>
          </TouchableOpacity>
        </RNView>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={vendedores}
            keyExtractor={(item) => item.id}
            renderItem={renderVendedor}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum vendedor encontrado.</Text>
            }
            onRefresh={loadVendedores}
            refreshing={loading}
          />
        )}
      </RNView>
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
  editButton: { padding: 15, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 }
});
