import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const PRODUTOS_SUGERIDOS = [
  'Tomate Italiano', 'Alface Crespa', 'Ovos Caipira', 'Mel Orgânico', 
  'Banana Prata', 'Cenoura', 'Maçã Fuji', 'Queijo Frescal', 'Pão Caseiro'
];

const ESTOQUE_INICIAL = [
  { id: '1', nome: 'Tomate Italiano', valor: '8.50', quantidade: '15kg', imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500' },
  { id: '2', nome: 'Ovos Caipira', valor: '18.00', quantidade: '12 dúzias', imagem: 'https://images.unsplash.com/photo-1582722872445-44ad5c786462?w=500' },
  { id: '3', nome: 'Mel Orgânico', valor: '35.00', quantidade: '8 potes', imagem: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500' },
  { id: '4', nome: 'Alface Crespa', valor: '4.20', quantidade: '20 unidades', imagem: 'https://images.unsplash.com/photo-1622206141540-5844544d3f17?w=500' },
];

export default function ProdutosScreen() {
  const router = useRouter();
  const [estoque, setEstoque] = useState(ESTOQUE_INICIAL);
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSelecaoNome, setModalSelecaoNome] = useState(false);

  const [novoNome, setNovoNome] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoQuantidade, setNovoQuantidade] = useState('');
  const [novaImagem, setNovaImagem] = useState<string | null>(null);

  const produtosFiltrados = estoque.filter(item => 
    item.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à câmera para tirar fotos.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setNovaImagem(result.assets[0].uri);
  };

  const selecionarGaleria = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setNovaImagem(result.assets[0].uri);
  };

  const salvarProduto = () => {
    if (!novoNome || !novoValor || !novoQuantidade || !novaImagem) {
      Alert.alert('Erro', 'Preencha todos os campos e adicione uma foto.');
      return;
    }
    const novoItem = { id: Math.random().toString(), nome: novoNome, valor: novoValor, quantidade: novoQuantidade, imagem: novaImagem };
    setEstoque([novoItem, ...estoque]);
    setModalAberto(false);
    setNovoNome(''); setNovoValor(''); setNovoQuantidade(''); setNovaImagem(null);
  };

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
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.imagem }} style={styles.productImage} />
              <View style={styles.quantityBadge}><Text style={styles.quantityBadgeText}>{item.quantidade}</Text></View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.nome}</Text>
                <Text style={styles.productPrice}>R$ {item.valor}</Text>
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
              <TouchableOpacity style={styles.imageSelector} onPress={tirarFoto}>
                {novaImagem ? <Image source={{ uri: novaImagem }} style={styles.imagePreview} /> : <View style={styles.imagePlaceholder}><Ionicons name="camera-outline" size={40} color="#2E7D32" /><Text style={styles.imagePlaceholderText}>Toque para usar a Câmera</Text></View>}
              </TouchableOpacity>
              <View style={styles.mediaButtonsRow}>
                <TouchableOpacity style={[styles.mediaBtn, styles.shadow]} onPress={tirarFoto}><Ionicons name="camera" size={20} color="#FFF" /><Text style={styles.mediaBtnText}>Câmera</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mediaBtn, styles.galleryBtn, styles.shadow]} onPress={selecionarGaleria}><Ionicons name="images" size={20} color="#FFF" /><Text style={styles.mediaBtnText}>Galeria</Text></TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Nome do Produto</Text>
              <TouchableOpacity style={styles.selectField} onPress={() => setModalSelecaoNome(true)}><Text style={novoNome ? styles.selectText : styles.placeholderText}>{novoNome || "Selecionar..."}</Text><Ionicons name="chevron-down" size={20} color="#666" /></TouchableOpacity>
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 10 }}><Text style={styles.inputLabel}>Preço (R$)</Text><TextInput style={styles.input} placeholder="0,00" keyboardType="numeric" value={novoValor} onChangeText={setNovoValor} /></View>
                <View style={{ flex: 1 }}><Text style={styles.inputLabel}>Quantidade</Text><TextInput style={styles.input} placeholder="Ex: 10kg" value={novoQuantidade} onChangeText={setNovoQuantidade} /></View>
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={salvarProduto}><Text style={styles.saveBtnText}>Salvar no Estoque</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
        <Modal visible={modalSelecaoNome} animationType="fade" transparent={true}>
          <View style={styles.subModalOverlay}><View style={styles.subModalContent}><Text style={styles.subModalTitle}>Produtos Comuns</Text>{PRODUTOS_SUGERIDOS.map(item => (<TouchableOpacity key={item} style={styles.optionBtn} onPress={() => { setNovoNome(item); setModalSelecaoNome(false); }}><Text style={styles.optionText}>{item}</Text></TouchableOpacity>))}<TouchableOpacity style={styles.cancelBtn} onPress={() => setModalSelecaoNome(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity></View></View>
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
  screenTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: '#333', marginBottom: 20 },
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
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#2E7D32', fontWeight: '600', marginTop: 10 },
  mediaButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 10, gap: 8 },
  galleryBtn: { backgroundColor: '#1976D2' },
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
