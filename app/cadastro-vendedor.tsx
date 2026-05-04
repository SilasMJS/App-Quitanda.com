import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert, Dimensions, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, View } from '../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import authService from '../services/auth';
import vendedoresService, { Endereco } from '../services/vendedores';
import comunidadesService, { Comunidade } from '../services/comunidades';

const { height } = Dimensions.get('window');

export default function CadastroVendedorScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingComunidades, setLoadingComunidades] = useState(true);
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [modalComunidade, setModalComunidade] = useState(false);
  
  // Usuario info
  const [usuarioId, setUsuarioId] = useState('');

  // Endereço info
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Busca CEP automático
  const buscarCEP = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, '');
    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
          setEstado(data.uf);
          // O foco vai para o número automaticamente (opcional)
        } else {
          Alert.alert('CEP não encontrado', 'Verifique o número digitado.');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Vendedor info
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState<Comunidade | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [user, listaComunidades] = await Promise.all([
          authService.getCurrentUser(),
          comunidadesService.listarTodas()
        ]);
        setUsuarioId(user.id);
        setComunidades(listaComunidades);
      } catch (error) {
        // Silencia erros de carregamento inicial (ex: comunidades não disponíveis)
      } finally {
        setLoadingComunidades(false);
      }
    }
    loadData();
  }, []);

  const handleSalvar = async () => {
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos do endereço.');
      return;
    }

    if (!nomeFantasia || !chavePix || !comunidadeSelecionada) {
      Alert.alert('Erro', 'Por favor, preencha o nome fantasia, chave pix e selecione uma comunidade.');
      return;
    }

    setLoading(true);
    try {
      // 1. Salvar endereço
      const endereco: Endereco = {
        cep, rua, numero, bairro, cidade, estado,
        latitude: 0, longitude: 0 // Simplificado para o exemplo
      };
      await vendedoresService.cadastrarEndereco(endereco);

      // 2. Criar perfil de vendedor
      await vendedoresService.criarPerfilVendedor({
        usuario_id: usuarioId,
        comunidade_id: comunidadeSelecionada.id,
        nome_fantasia: nomeFantasia,
        descricao: descricao || undefined,
        chave_pix: chavePix
      });

      Alert.alert('Sucesso', 'Seu perfil de vendedor foi criado com sucesso!', [
        { text: 'Ir para o Dashboard', onPress: () => router.replace('/telas/dashboard') }
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Erro ao criar perfil de vendedor. Verifique seus dados.';
      Alert.alert('Erro no Cadastro', msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingComunidades) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />
      
      {/* Cabeçalho Superior Padronizado */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/images/logo.svg')}
            style={{ width: 35, height: 35 }}
            contentFit="contain"
          />
          <Text style={styles.logoText}>uitanda.com</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Perfil de Vendedor</Text>
            <Text style={styles.subtitle}>Complete as informações da sua quitanda</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço da Quitanda</Text>
            
            <Text style={styles.inputLabel}>CEP</Text>
            <TextInput 
              style={styles.input} 
              placeholder="00000-000" 
              value={cep} 
              onChangeText={buscarCEP} 
              keyboardType="numeric" 
              maxLength={8}
            />

            <View style={styles.row}>
              <View style={{ flex: 3, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Rua</Text>
                <TextInput style={styles.input} placeholder="Rua das Flores" value={rua} onChangeText={setRua} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Nº</Text>
                <TextInput style={styles.input} placeholder="123" value={numero} onChangeText={setNumero} />
              </View>
            </View>

            <Text style={styles.inputLabel}>Bairro</Text>
            <TextInput style={styles.input} placeholder="Centro" value={bairro} onChangeText={setBairro} />

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Cidade</Text>
                <TextInput style={styles.input} placeholder="Sua Cidade" value={cidade} onChangeText={setCidade} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Estado</Text>
                <TextInput style={styles.input} placeholder="SP" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Comerciais</Text>

            <Text style={styles.inputLabel}>Nome da Quitanda (Fantasia)</Text>
            <TextInput style={styles.input} placeholder="Ex: Quitanda do Zé" value={nomeFantasia} onChangeText={setNomeFantasia} />

            <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Fale um pouco sobre o que você vende..." 
              multiline 
              numberOfLines={3}
              value={descricao} 
              onChangeText={setDescricao} 
            />

            <Text style={styles.inputLabel}>Chave PIX (Para Recebimentos)</Text>
            <TextInput style={styles.input} placeholder="CPF, E-mail ou Celular" value={chavePix} onChangeText={setChavePix} />

            <Text style={styles.inputLabel}>Comunidade (Onde você atua?)</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => setModalComunidade(true)}>
              <Text style={comunidadeSelecionada ? styles.selectText : styles.placeholderText}>
                {comunidadeSelecionada?.nome || "Selecionar Comunidade..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, (loading || loadingComunidades) && styles.buttonDisabled]} 
            onPress={handleSalvar}
            disabled={loading || loadingComunidades}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Finalizar Cadastro</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalComunidade} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha sua Comunidade</Text>
              <TouchableOpacity onPress={() => setModalComunidade(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={comunidades}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem} 
                  onPress={() => { setComunidadeSelecionada(item); setModalComunidade(false); }}
                >
                  <Text style={styles.optionText}>{item.nome}</Text>
                  <Text style={styles.optionSubtext}>{item.descricao_curta}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#999' }}>Nenhuma comunidade encontrada.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#FFF' },
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
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  backButton: { padding: 5 },
  scrollContainer: { 
    flexGrow: 1, 
    padding: 25, 
    paddingTop: 10,
  },
  header: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#EEE', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  selectField: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  placeholderText: { color: '#999' },
  selectText: { color: '#333', fontWeight: '500' },
  button: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  buttonDisabled: { backgroundColor: '#A5D6A7' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '70%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  optionText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  optionSubtext: { fontSize: 14, color: '#666' }
});
