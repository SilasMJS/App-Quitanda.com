import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import { pickImage, uploadImage } from '../../../services/uploadService';
import comunidadesService, { Comunidade } from '../../../services/comunidades';
import Constants from 'expo-constants';
import { useToast } from '../../../components/ToastContext';
import PrimaryButton from '../../../components/PrimaryButton';

export default function AdminNovoVendedorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  
  const usuario_id = params.usuario_id as string;
  const usuario_nome = params.usuario_nome as string;

  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [comunidadeId, setComunidadeId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [imagemLocal, setImagemLocal] = useState('');
  
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchingCEP, setFetchingCEP] = useState(false);

  const [usuariosCliente, setUsuariosCliente] = useState<any[]>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState(usuario_id || '');
  const [selectedUsuarioNome, setSelectedUsuarioNome] = useState(usuario_nome || '');
  const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);

  useEffect(() => {
    loadComunidades();
    if (!usuario_id) {
      loadUsuariosClientes();
    }
  }, []);

  const loadUsuariosClientes = async () => {
    try {
      const response = await api.get('/usuarios/');
      const clientes = response.data.filter((u: any) => u.tipo === 'cliente' || u.tipo === 'CLIENTE' || u.tipo === 'Cliente');
      setUsuariosCliente(clientes);
    } catch (error) {
      console.log('Erro ao carregar usuários:', error);
    }
  };

  const loadComunidades = async () => {
    try {
      const data = await comunidadesService.listarTodas();
      setComunidades(data);
      if (data.length > 0) {
        setComunidadeId(data[0].id);
      }
    } catch (error) {
      showToast('Não foi possível carregar as comunidades.', 'error');
    }
  };

  const buscarCEP = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setFetchingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setRua(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setEstado(data.uf);
      } else {
        showToast('CEP não encontrado.', 'error');
      }
    } catch (error) {
      showToast('Falha ao buscar o CEP.', 'error');
    } finally {
      setFetchingCEP(false);
    }
  };

  const handleSalvar = async () => {
    if (!selectedUsuarioId) {
      showToast('Nenhum usuário foi selecionado.', 'error');
      return;
    }
    if (!nomeFantasia || !chavePix || !comunidadeId || !cep || !rua || !numero || !bairro || !cidade || !estado) {
      showToast('Por favor, preencha todos os campos obrigatórios (incluindo o endereço completo).', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = null;
      if (imagemLocal) {
        finalImageUrl = await uploadImage(imagemLocal, 'vendedores');
      }

      const { data: vendedorCriado } = await api.post('/vendedores/', {
        usuario_id: selectedUsuarioId,
        nome_fantasia: nomeFantasia,
        descricao: descricao,
        chave_pix: chavePix,
        comunidade_id: comunidadeId,
        imagem_url: finalImageUrl
      });

      // Endereço é do ponto de venda (a quitanda), não do usuário -
      // por isso só pode ser salvo depois que o vendedor já existe.
      await api.put(`/vendedores/${vendedorCriado.id}/endereco`, {
        cep: cep.replace(/\D/g, ''),
        rua,
        numero,
        bairro,
        cidade,
        estado,
        // latitude/longitude ficam de fora: o backend geocodifica o endereço automaticamente.
      });

      showToast('O usuário foi promovido a Vendedor e a vitrine foi criada!', 'success');
      router.canGoBack() ? router.back() : router.replace('/telas/admin/vendedores');
    } catch (error: any) {
      const msg = typeof error.response?.data?.detail === 'string'
        ? error.response.data.detail
        : error.response?.data?.detail?.[0]?.msg || 'Falha ao promover o usuário a vendedor.';

      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const comunidadeSelecionada = comunidades.find(c => c.id === comunidadeId);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/admin/vendedores')}>
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
          <Text style={styles.title}>Promover Vendedor</Text>
          {!usuario_id ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Selecione o Usuário (Cliente) *</Text>
              <TouchableOpacity 
                style={styles.inputContainer} 
                onPress={() => setModalUsuarioVisible(true)}
              >
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <Text style={[styles.input, { color: selectedUsuarioId ? '#333' : '#999' }]}>
                  {selectedUsuarioId ? selectedUsuarioNome : 'Toque para escolher...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.subtitle}>
              Você está criando uma vitrine para o usuário: <Text style={{fontWeight:'bold', color: '#2E7D32'}}>{selectedUsuarioNome || 'Desconhecido'}</Text>
            </Text>
          )}
          
          <View style={styles.form}>
            <View style={{alignItems: 'center', marginBottom: 20}}>
              <TouchableOpacity onPress={async () => {
                const uri = await pickImage();
                if (uri) setImagemLocal(uri);
              }}>
                <Image 
                  source={imagemLocal ? { uri: imagemLocal } : require('../../../assets/images/logo.svg')} 
                  style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0F0' }} 
                  contentFit={imagemLocal ? 'cover' : 'contain'}
                />
                <View style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2E7D32', padding: 8, borderRadius: 15}}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={{fontSize: 12, color: '#666', marginTop: 10}}>Toque para adicionar foto da quitanda</Text>
            </View>

            <Text style={styles.sectionTitle}>DADOS DA QUITANDA</Text>

            <Text style={styles.inputLabel}>Nome Fantasia da Quitanda *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="storefront-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Quitanda do João"
                value={nomeFantasia}
                onChangeText={setNomeFantasia}
              />
            </View>

            <Text style={styles.inputLabel}>Chave PIX (Para Recebimentos) *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone, CPF, Email ou Chave Aleatória"
                value={chavePix}
                onChangeText={setChavePix}
              />
            </View>

            <Text style={styles.inputLabel}>Comunidade Pertencente *</Text>
            <TouchableOpacity 
              style={styles.inputContainer} 
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="people-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={[styles.input, { color: comunidadeSelecionada ? '#333' : '#999' }]}>
                {comunidadeSelecionada ? comunidadeSelecionada.nome : 'Selecione uma comunidade'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Descrição Curta (Opcional)</Text>
            <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="O que essa quitanda vende?"
                multiline
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            {/* ENDEREÇO */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>ENDEREÇO DO VENDEDOR</Text>
            <Text style={{fontSize: 12, color: '#888', marginBottom: 15}}>Obrigatório para registrar a localização da quitanda.</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>CEP *</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 00000-000"
                    placeholderTextColor="#AAB0B8"
                    keyboardType="numeric"
                    value={cep}
                    onChangeText={setCep}
                    onBlur={buscarCEP}
                    maxLength={9}
                  />
                  {fetchingCEP && <ActivityIndicator size="small" color="#2E7D32" />}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Estado (UF) *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Ex: PI" placeholderTextColor="#AAB0B8" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Cidade *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Ex: Teresina" placeholderTextColor="#AAB0B8" value={cidade} onChangeText={setCidade} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Bairro *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Ex: Centro" placeholderTextColor="#AAB0B8" value={bairro} onChangeText={setBairro} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 3, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Rua / Logradouro *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Ex: Rua das Flores" placeholderTextColor="#AAB0B8" value={rua} onChangeText={setRua} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Número *</Text>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Ex: 123" placeholderTextColor="#AAB0B8" value={numero} onChangeText={setNumero} keyboardType="numeric" />
                </View>
              </View>
            </View>

            <PrimaryButton
              label="CADASTRAR VENDEDOR"
              onPress={handleSalvar}
              loading={loading}
              color="#2E7D32"
              style={{ marginTop: 20 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL DE SELEÇÃO DE COMUNIDADE */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione a Comunidade</Text>
            <FlatList
              data={comunidades}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setComunidadeId(item.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE SELEÇÃO DE USUÁRIO */}
      <Modal
        visible={modalUsuarioVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalUsuarioVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Cliente</Text>
            <FlatList
              data={usuariosCliente}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedUsuarioId(item.id);
                    setSelectedUsuarioNome(item.nome);
                    setModalUsuarioVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nome} ({item.telefone})</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Nenhum cliente disponível</Text>}
            />
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalUsuarioVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15, letterSpacing: 1 },
  form: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9',
    borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE',
    height: 50
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  modalCloseButton: { marginTop: 15, padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, alignItems: 'center' },
  modalCloseButtonText: { fontSize: 16, color: '#D32F2F', fontWeight: 'bold' }
});
