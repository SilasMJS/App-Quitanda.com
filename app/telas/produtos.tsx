import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, FlatList, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [novoValor, setNovoValor] = useState('');
  const [novoQuantidade, setNovoQuantidade] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('un');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [meusProdutos, base] = await Promise.all([
        produtosService.listarMeusProdutos(),
        produtosService.listarProdutosBase()
      ]);
      setEstoque(meusProdutos);
      setProdutosBase(base);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = estoque.filter(item => 
    item.produto.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const salvarProduto = async () => {
    if (!produtoSelecionado || !novoValor || !novoQuantidade) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setSalvando(true);
    try {
      await produtosService.cadastrarProduto({
        produto_id: produtoSelecionado.id,
        preco: parseFloat(novoValor.replace(',', '.')),
        quantidade: parseFloat(novoQuantidade),
        unidade_medida: unidadeMedida
      });
      
      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
      setModalAberto(false);
      setProdutoSelecionado(null);
      setNovoValor('');
      setNovoQuantidade('');
      carregarDados(); // Recarrega a lista
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar produto.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={require('@/assets/images/Group 2.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
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

        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput style={styles.searchInput} placeholder="Buscar no estoque..." value={pesquisa} onChangeText={setPesquisa} />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalAberto(true)}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#999' }}>Nenhum produto no seu estoque.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.produto.imagem_url }} style={styles.productImage} />
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityBadgeText}>{item.quantidade}{item.unidade_medida}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.produto.nome}</Text>
                <Text style={styles.productPrice}>R$ {item.preco.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      </View>

      <Modal visible={modalAberto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.modalHeaderTitleRow}>
              <Text style={styles.modalHeaderTitle}>Novo Produto</Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.imageSelector}>
                {produtoSelecionado?.imagem_url ? (
                  <Image source={{ uri: produtoSelecionado.imagem_url }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="basket-outline" size={40} color="#2E7D32" />
                    <Text style={styles.imagePlaceholderText}>Selecione um produto base abaixo</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.inputLabel}>Escolher Produto</Text>
              <TouchableOpacity style={styles.selectField} onPress={() => setModalSelecaoNome(true)}>
                <Text style={produtoSelecionado ? styles.selectText : styles.placeholderText}>
                  {produtoSelecionado?.nome || "Selecionar da lista..."}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Preço (R$)</Text>
                  <TextInput style={styles.input} placeholder="0,00" keyboardType="numeric" value={novoValor} onChangeText={setNovoValor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Quantidade</Text>
                  <TextInput style={styles.input} placeholder="Ex: 10" keyboardType="numeric" value={novoQuantidade} onChangeText={setNovoQuantidade} />
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Unidade de Medida</Text>
              <View style={styles.mediaButtonsRow}>
                {['un', 'kg', 'dz'].map(u => (
                  <TouchableOpacity 
                    key={u} 
                    style={[styles.mediaBtn, unidadeMedida === u ? styles.shadow : { opacity: 0.5 }]} 
                    onPress={() => setUnidadeMedida(u)}
                  >
                    <Text style={styles.mediaBtnText}>{u.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, salvando && { opacity: 0.7 }]} 
                onPress={salvarProduto}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Adicionar ao meu Estoque</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
        
        <Modal visible={modalSelecaoNome} animationType="fade" transparent={true}>
          <View style={styles.subModalOverlay}>
            <View style={styles.subModalContent}>
              <Text style={styles.subModalTitle}>Produtos Disponíveis</Text>
              <FlatList
                data={produtosBase}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.optionBtn} 
                    onPress={() => { setProdutoSelecionado(item); setModalSelecaoNome(false); }}
                  >
                    <Text style={styles.optionText}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalSelecaoNome(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  btnVoltar: { backgroundColor: '#0A4D2E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnVoltarText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 5 },
  searchHeader: { flexDirection: 'row', paddingVertical: 15, alignItems: 'center', gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 15, borderRadius: 10, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  addButton: { backgroundColor: '#40C993', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 10 },
  productCard: { backgroundColor: '#FFF', width: (width / 2) - 25, margin: 5, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  productImage: { width: '100%', height: 120 },
  quantityBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(46, 125, 50, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  quantityBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  productInfo: { padding: 10 },
  productName: { fontWeight: 'bold', fontSize: 14 },
  productPrice: { color: '#2E7D32', fontWeight: 'bold', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, height: '90%' },
  modalHeaderTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalHeaderTitle: { fontSize: 20, fontWeight: 'bold' },
  imageSelector: { width: '100%', height: 200, backgroundColor: '#F9F9F9', borderRadius: 15, borderWidth: 2, borderColor: '#EEE', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 15 },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', padding: 20 },
  imagePlaceholderText: { color: '#2E7D32', fontWeight: '600', marginTop: 10, textAlign: 'center' },
  mediaButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 10, gap: 8 },
  mediaBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 8 },
  selectField: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  placeholderText: { color: '#999' },
  selectText: { color: '#333', fontWeight: '500' },
  input: { padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveBtn: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 30 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 30 },
  subModalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  subModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  optionBtn: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  optionText: { fontSize: 16, color: '#333' },
  cancelBtn: { marginTop: 15, alignItems: 'center' },
  cancelBtnText: { color: '#FF5252', fontWeight: 'bold' }
});

