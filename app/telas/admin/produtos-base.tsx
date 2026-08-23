import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, View as RNView, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import Constants from 'expo-constants';

export default function AdminProdutosBaseScreen() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProdutos();
    }, [])
  );

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        api.get('/produtos/'),
        api.get('/categorias')
      ]);
      const mapCat = new Map();
      resCat.data.forEach((c: any) => mapCat.set(c.id, c.nome));
      const produtosMapeados = resProd.data.map((p: any) => ({
        ...p,
        categoriaNome: mapCat.get(p.categoria) || 'Sem Categoria'
      }));
      setProdutos(produtosMapeados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o catálogo de produtos.');
    } finally {
      setLoading(false);
    }
  };

  const getUnidadeText = (unidade: string) => {
    switch (unidade) {
      case 'KG': case 'kg': return 'Quilo (kg)';
      case 'UNIDADE': case 'unidade': return 'Unidade (un)';
      case 'MOLHO': case 'molho': return 'Molho';
      case 'DUZIA': return 'Dúzia';
      case 'CAIXA': case 'caixa': return 'Caixa';
        case 'pacote': return 'Pacote';
      case 'GRAMA': case 'grama': return 'Gramas (g)';
      case 'LITRO': case 'litro': return 'Litro (L)';
      default: return unidade;
    }
  };

  const renderProduto = ({ item }: { item: any }) => (
    <RNView style={styles.card}>
      <RNView style={[styles.colorBar, { backgroundColor: '#0288D1' }]} />
      <Image 
        source={{ uri: item.imagem_url || 'https://via.placeholder.com/150?text=Quitanda' }} 
        style={styles.productImage} 
        contentFit="cover"
      />
      <RNView style={styles.cardContent}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.categoria}>{item.categoriaNome || item.categoria}</Text>
        <RNView style={styles.statusRow}>
          <Ionicons name="pricetag-outline" size={12} color="#888" style={{marginRight: 4}} />
          <Text style={styles.statusText}>Vendido por: {getUnidadeText(item.unidade_medida)}</Text>
        </RNView>
      </RNView>
      <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/telas/admin/editar-produto-base', params: { id: item.id }})}>
        <Ionicons name="create-outline" size={24} color="#666" />
      </TouchableOpacity>
    </RNView>
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
          <RNView>
            <Text style={styles.title}>Catálogo Base</Text>
            <Text style={styles.subtitle}>Produtos padronizados da plataforma</Text>
          </RNView>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/telas/admin/novo-produto-base' as any)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </RNView>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderProduto}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum produto base cadastrado.</Text>
            }
            onRefresh={loadProdutos}
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
  subtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  addButton: { 
    width: 44,
    height: 44,
    backgroundColor: '#0288D1', 
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2
  },
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
  productImage: { width: 70, height: 70, margin: 10, borderRadius: 8, backgroundColor: '#F0F0F0' },
  cardContent: { flex: 1, paddingVertical: 12, justifyContent: 'center' },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  categoria: { fontSize: 12, color: '#0288D1', fontWeight: 'bold', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusText: { fontSize: 11, color: '#666' },
  editButton: { padding: 15, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 }
});
