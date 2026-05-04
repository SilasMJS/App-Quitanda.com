import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, FlatList, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import produtosService from '../../services/produtos';

const { width } = Dimensions.get('window');

export default function ProdutosScreen() {
  const router = useRouter();
  const [estoque, setEstoque] = useState<any[]>([]);
  const [produtosBase, setProdutosBase] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSelecaoNome, setModalSelecaoNome] = useState(false);

  // Estados do formulário
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [fotoPersonalizada, setFotoPersonalizada] = useState<string | null>(null);
  const [novoValor, setNovoValor] = useState('');
  const [novoQuantidade, setNovoQuantidade] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await produtosService.listarMeusProdutos();
      const listaProdutos = response?.produtos_vendedores || [];
      setEstoque(Array.isArray(listaProdutos) ? listaProdutos : []);
      
      const base = await produtosService.listarProdutosBase();
      setProdutosBase(Array.isArray(base) ? base : []);
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error);
      setEstoque([]);
    } finally {
      setLoading(false);
    }
  };

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Precisamos de acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setFotoPersonalizada(result.assets[0].uri);
    }
  };

  const escolherDaGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Precisamos de acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setFotoPersonalizada(result.assets[0].uri);
    }
  };

  const abrirEdicao = (item: any) => {
    setEditandoId(item.produto_vendedor_id);
    const base = produtosBase.find(p => p.id === item.produto_id);
    setProdutoSelecionado(base || { id: item.produto_id, nome: item.produto_nome, imagem_url: item.imagem_url });
    setFotoPersonalizada(item.imagem_url);
    setNovoValor(item.preco.toString());
    setNovoQuantidade(item.estoque.toString());
    setModalAberto(true);
  };

  const abrirNovo = () => {
    resetForm();
    setModalAberto(true);
  };

  const confirmarExclusao = () => {
    if (!editandoId) return;

    Alert.alert(
      'Remover Produto',
      'Tem certeza que deseja remover este produto da sua vitrine?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: deletarProduto }
      ]
    );
  };

  const deletarProduto = async () => {
    if (!editandoId) return;
    
    setSalvando(true);
    try {
      await produtosService.deletarProduto(editandoId);
      Alert.alert('Sucesso', 'Produto removido com sucesso.');
      setModalAberto(false);
      resetForm();
      carregarDados();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarProduto = async () => {
    if (!produtoSelecionado || !novoValor || !novoQuantidade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setSalvando(true);
    try {
      if (editandoId) {
        await produtosService.atualizarProduto(editandoId, {
          preco: parseFloat(novoValor.replace(',', '.')),
          estoque: parseInt(novoQuantidade),
          imagem_url: fotoPersonalizada
        });
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        await produtosService.cadastrarProduto({
          produto_id: produtoSelecionado.id,
          preco: parseFloat(novoValor.replace(',', '.')),
          estoque: parseInt(novoQuantidade),
          imagem_url: fotoPersonalizada,
          unidade_medida: 'un'
        } as any);
        Alert.alert('Sucesso', 'Produto adicionado!');
      }
      
      setModalAberto(false);
      resetForm();
      carregarDados();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setEditandoId(null);
    setProdutoSelecionado(null);
    setFotoPersonalizada(null);
    setNovoValor('');
    setNovoQuantidade('');
  };

  const produtosFiltrados = estoque.filter(item => 
    item?.produto_nome?.toLowerCase().includes(pesquisa.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Image source={require('@/assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Meus Produtos</Text>
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Buscar..." value={pesquisa} onChangeText={setPesquisa} />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={abrirNovo}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.produto_vendedor_id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>Estoque Vazio</Text>
              <Text style={styles.emptySubtitle}>Clique no "+" para adicionar itens</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => abrirEdicao(item)}>
              <View style={styles.productImageContainer}>
                 <Image 
                    source={{ uri: item?.imagem_url || 'https://via.placeholder.com/150' }} 
                    style={styles.productImage} 
                    contentFit="cover"
                 />
              </View>
              <View style={styles.quantityBadge}><Text style={styles.quantityBadgeText}>{item?.estoque || 0}{item?.tipo_unidade || 'un'}</Text></View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item?.produto_nome}</Text>
                <Text style={styles.productPrice}>R$ {(item?.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </View>
              <View style={styles.editBadge}>
                 <Ionicons name="pencil" size={10} color="#FFF" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal visible={modalAberto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.modalHeaderTitleRow}>
              <Text style={styles.modalHeaderTitle}>{editandoId ? 'Editar Produto' : 'Novo Produto'}</Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.imageSelectorContainer}>
                <View style={styles.imageSelector}>
                  {fotoPersonalizada || produtoSelecionado?.imagem_url ? (
                    <Image 
                      source={{ uri: fotoPersonalizada || produtoSelecionado?.imagem_url }} 
                      style={styles.imagePreview} 
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={40} color="#2E7D32" />
                      <Text style={styles.imagePlaceholderText}>Foto do Produto</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.imageActionButtons}>
                  <TouchableOpacity onPress={tirarFoto} style={styles.imageActionBtn}>
                    <Ionicons name="camera" size={20} color="#FFF" />
                    <Text style={styles.imageActionText}>Câmera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={escolherDaGaleria} style={[styles.imageActionBtn, { backgroundColor: '#1976D2' }]}>
                    <Ionicons name="images" size={20} color="#FFF" />
                    <Text style={styles.imageActionText}>Galeria</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Escolher Item</Text>
              <TouchableOpacity 
                style={[styles.selectField, editandoId && { opacity: 0.6 }]} 
                onPress={() => !editandoId && setModalSelecaoNome(true)}
                disabled={!!editandoId}
              >
                <Text style={produtoSelecionado ? styles.selectText : styles.placeholderText}>
                  {produtoSelecionado?.nome || "Selecione na lista..."}
                </Text>
                {!editandoId && <Ionicons name="chevron-down" size={20} color="#666" />}
              </TouchableOpacity>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Preço (R$)</Text>
                  <TextInput style={styles.input} placeholder="0,00" keyboardType="numeric" value={novoValor} onChangeText={setNovoValor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Estoque</Text>
                  <TextInput style={styles.input} placeholder="10" keyboardType="numeric" value={novoQuantidade} onChangeText={setNovoQuantidade} />
                </View>
              </View>

              <TouchableOpacity style={[styles.saveBtn, salvando && { opacity: 0.7 }]} onPress={salvarProduto} disabled={salvando}>
                {salvando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{editandoId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR'}</Text>}
              </TouchableOpacity>

              {editandoId && (
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={confirmarExclusao}
                  disabled={salvando}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                  <Text style={styles.deleteBtnText}>REMOVER PRODUTO</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>

        <Modal visible={modalSelecaoNome} animationType="fade" transparent={true}>
          <View style={styles.subModalOverlay}>
            <View style={styles.subModalContent}>
              <Text style={styles.subModalTitle}>Catálogo</Text>
              <FlatList
                data={produtosBase}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.optionItem} onPress={() => { setProdutoSelecionado(item); setModalSelecaoNome(false); }}>
                    <Text style={styles.optionText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalSelecaoNome(false)}><Text style={styles.cancelBtnText}>CANCELAR</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 + Constants.statusBarHeight, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingTop: Constants.statusBarHeight },
  content: { flex: 1, padding: 20, paddingTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#333', marginBottom: 5 },
  searchHeader: { flexDirection: 'row', paddingVertical: 15, alignItems: 'center', gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 15, borderRadius: 10, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  addButton: { backgroundColor: '#40C993', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 10 },
  productCard: { backgroundColor: '#FFF', width: (width / 2) - 25, margin: 5, borderRadius: 12, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: '#F0F0F0', position: 'relative' },
  productImageContainer: { width: '100%', height: 120, backgroundColor: '#f9f9f9' },
  productImage: { width: '100%', height: '100%' },
  quantityBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(46, 125, 50, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  quantityBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  editBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: 10 },
  productName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  productPrice: { color: '#2E7D32', fontWeight: 'bold', marginTop: 4, fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { color: '#999', fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySubtitle: { color: '#CCC', fontSize: 14, textAlign: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formContainer: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Garante que preencha o final
    maxHeight: '95%',
    width: '100%',
  },
  modalHeaderTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitle: { fontSize: 20, fontWeight: 'bold' },
  imageSelectorContainer: { marginBottom: 15 },
  imageSelector: { width: '100%', height: 180, backgroundColor: '#F9F9F9', borderRadius: 15, borderWidth: 2, borderColor: '#EEE', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 10 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', padding: 20 },
  imagePlaceholderText: { color: '#2E7D32', fontWeight: '600', marginTop: 10, textAlign: 'center' },
  imageActionButtons: { flexDirection: 'row', gap: 10 },
  imageActionBtn: { flex: 1, backgroundColor: '#2E7D32', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 5 },
  imageActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  selectField: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  placeholderText: { color: '#999' },
  selectText: { color: '#333', fontWeight: '500' },
  input: { padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE', fontSize: 16 },
  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginTop: 10, gap: 8 },
  deleteBtnText: { color: '#FF5252', fontWeight: 'bold', fontSize: 14 },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 30 },
  subModalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  subModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionText: { fontSize: 16, color: '#333', fontWeight: '500' },
  cancelBtn: { marginTop: 15, alignItems: 'center', padding: 10 },
  cancelBtnText: { color: '#FF5252', fontWeight: 'bold', letterSpacing: 1 }
});
