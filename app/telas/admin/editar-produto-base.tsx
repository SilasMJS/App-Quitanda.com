import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, View as RNView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import { pickImage, uploadImage } from '../../../services/uploadService';
import Constants from 'expo-constants';
import { useToast } from '../../../components/ToastContext';
import ConfirmModal from '../../../components/ConfirmModal';

export default function AdminNovoProdutoBaseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { showToast } = useToast();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('HORTALICA');
  const [unidadeMedida, setUnidadeMedida] = useState('UNIDADE');
  const [imagemUrl, setImagemUrl] = useState('');
  const [imagemLocal, setImagemLocal] = useState('');
  
  const [loading, setLoading] = useState(false);

  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    async function carregarProduto() {
      if (!id) return;
      try {
        const res = await api.get(`/produtos/${id}`);
        const p = res.data;
        setNome(p.nome);
        setDescricao(p.descricao);
        setCategoria(p.categoria_id || p.categoria);
        setUnidadeMedida(p.tipo_unidade);
        setImagemUrl(p.imagem_url || '');
      } catch (error) {
        showToast('Não foi possível carregar o produto.', 'error');
        router.back();
      }
    }
    carregarProduto();
  }, [id]);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const res = await api.get('/categorias');
        const formatted = res.data.map((c: any) => ({ label: c.nome, value: c.id }));
        setCategorias(formatted);
        // We only set default if categoria is not already set by carregarProduto
        if (formatted.length > 0 && categoria === 'HORTALICA') {
          setCategoria(formatted[0].value);
        }
      } catch (error) {
        console.log('Erro ao carregar categorias', error);
      }
    }
    carregarCategorias();
  }, []);

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteModalVisible(false);
    setLoading(true);
    try {
      await api.delete(`/produtos/${id}`);
      showToast('Produto apagado!', 'success');
      router.back();
    } catch(e) {
      showToast('Não foi possível apagar o produto.', 'error');
      setLoading(false);
    }
  };

  const unidades = [
    { label: 'Unidade', value: 'UNIDADE' },
    { label: 'Quilo (kg)', value: 'KG' },
    { label: 'Pacote', value: 'PACOTE' },
    { label: 'Caixa', value: 'CAIXA' },
    { label: 'Litro (L)', value: 'LITRO' },
  ];

  const handleSalvar = async () => {
    if (!nome || !descricao) {
      showToast('Por favor, preencha o Nome e a Descrição do produto.', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = null;
      if (imagemLocal) {
        finalImageUrl = await uploadImage(imagemLocal, 'produtos');
      } else {
        const nameStr = nome.trim().replace(/\s+/g, '+');
        finalImageUrl = `https://ui-avatars.com/api/?name=${nameStr}&background=0288D1&color=fff&size=256`;
      }

      await api.put(`/produtos/${id}`, {
        nome,
        descricao,
        categoria_id: categoria,
        tipo_unidade: unidadeMedida,
        imagem_url: finalImageUrl
      });

      showToast('Produto atualizado com sucesso!', 'success');
      router.back();
    } catch (error: any) {
      showToast(error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || 'Falha ao criar o produto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderRadioGroup = (options: {label: string, value: string}[], selectedValue: string, onSelect: (val: string) => void) => (
    <View style={styles.radioGroup}>
      {options.map((opt) => (
        <TouchableOpacity 
          key={opt.value} 
          style={[styles.radioItem, selectedValue === opt.value && styles.radioItemSelected]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.radioItemText, selectedValue === opt.value && styles.radioItemTextSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/admin/produtos-base')}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoRow} onPress={() => router.replace('/telas/dashboard')}>
          <Image source={require('../../../assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>
        
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Editar Produto Base</Text>
          <Text style={styles.subtitle}>Adicione um produto padronizado para os vendedores selecionarem.</Text>
          
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Nome do Produto *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Tomate Carmem"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <Text style={styles.inputLabel}>Foto do Produto (Opcional)</Text>
            <View style={{alignItems: 'flex-start', marginBottom: 20}}>
              <TouchableOpacity onPress={async () => {
                const uri = await pickImage();
                if (uri) setImagemLocal(uri);
              }}>
                <Image 
                  source={imagemLocal ? { uri: imagemLocal } : require('../../../assets/images/logo.svg')} 
                  style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: '#F0F0F0' }} 
                  contentFit={imagemLocal ? 'cover' : 'contain'}
                />
                <View style={{position: 'absolute', bottom: -5, right: -5, backgroundColor: '#0288D1', padding: 6, borderRadius: 15, elevation: 2}}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={{fontSize: 11, color: '#666', marginTop: 10}}>Se não enviar, um avatar com as iniciais será gerado.</Text>
            </View>

            <Text style={styles.inputLabel}>Categoria *</Text>
            {renderRadioGroup(categorias, categoria, setCategoria)}

            <Text style={styles.inputLabel}>Unidade de Medida Padrão *</Text>
            {renderRadioGroup(unidades, unidadeMedida, setUnidadeMedida)}

            <Text style={styles.inputLabel}>Descrição Padrão *</Text>
            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="Descreva o produto de forma genérica..."
                multiline
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && { opacity: 0.7 }]} 
              onPress={handleSalvar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>CADASTRAR PRODUTO</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmModal
        visible={deleteModalVisible}
        title="Remover Produto"
        message="Tem certeza que deseja apagar este produto do catálogo?"
        confirmLabel="Apagar"
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  scrollContent: { padding: 25, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30, lineHeight: 20 },
  form: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 10 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9',
    borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE',
    height: 50
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, marginHorizontal: -5 },
  radioItem: { 
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 20, 
    margin: 5,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  radioItemSelected: { backgroundColor: '#E1F5FE', borderColor: '#0288D1' },
  radioItemText: { color: '#666', fontSize: 13, fontWeight: '600' },
  radioItemTextSelected: { color: '#0288D1' },
  saveButton: { backgroundColor: '#0288D1', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
