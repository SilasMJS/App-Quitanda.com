import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import comunidadesService from '../../../services/comunidades';
import Constants from 'expo-constants';
import { pickImage, uploadImage } from '../../../services/uploadService';
import api from '../../../services/api';
import { useToast } from '../../../components/ToastContext';
import PrimaryButton from '../../../components/PrimaryButton';

export default function NovaComunidadeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Dados da Comunidade
  const [nome, setNome] = useState('');
  const [descricaoCurta, setDescricaoCurta] = useState('');
  const [descricaoLonga, setDescricaoLonga] = useState('');
  const [tipo, setTipo] = useState('feira');
  const [corTema, setCorTema] = useState('#2E7D32');
  const [imagemLocal, setImagemLocal] = useState('');

  // Dados de Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [fetchingCEP, setFetchingCEP] = useState(false);
  const [tiposComunidade, setTiposComunidade] = useState<any[]>([]);

  useEffect(() => {
    async function carregarTipos() {
      try {
        const res = await api.get('/tipos-comunidade');
        setTiposComunidade(res.data);
        if (res.data.length > 0 && !tipo) {
          setTipo(res.data[0].id); // Select first by default
        }
      } catch (error) {
        console.log('Erro ao carregar tipos de comunidade', error);
      }
    }
    carregarTipos();
  }, []);

  const buscarCEP = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setFetchingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setRua(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
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
    if (!nome || !descricaoCurta || !cep || !rua || !cidade) {
      showToast('Por favor, preencha os campos obrigatórios (Nome, Descrição Curta, CEP, Rua e Cidade).', 'error');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = null;
      if (imagemLocal) {
        finalImageUrl = await uploadImage(imagemLocal, 'comunidades');
      }

      await comunidadesService.criarComunidade({
        nome,
        descricao_curta: descricaoCurta,
        descricao_longa: descricaoLonga,
        tipo_id: tipo,
        cor_tema: corTema,
        imagem_url: finalImageUrl,
        endereco: {
          cep,
          rua,
          numero,
          bairro,
          cidade,
          estado: estado.toUpperCase(),
          // latitude/longitude ficam de fora: o backend geocodifica o endereço automaticamente.
        }
      });

      showToast('Comunidade criada com sucesso!', 'success');
      router.replace('/telas/admin/comunidades');
    } catch (error: any) {
      let msg = 'Erro ao criar comunidade. Verifique os dados.';
      if (error?.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          msg = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          msg = error.response.data.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('\n');
        }
      }

      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RNView style={styles.container}>
      <StatusBar style="dark" />
      
      <RNView style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/admin/comunidades')}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoRow} onPress={() => router.replace('/telas/dashboard')}>
          <Image source={require('../../../assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>
        <RNView style={{ width: 40 }} />
      </RNView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nova Comunidade</Text>

        <RNView style={{alignItems: 'center', marginBottom: 20}}>
          <TouchableOpacity onPress={async () => {
            const uri = await pickImage();
            if (uri) setImagemLocal(uri);
          }}>
            <Image 
              source={imagemLocal ? { uri: imagemLocal } : require('../../../assets/images/logo.svg')} 
              style={{ width: 120, height: 120, borderRadius: 15, backgroundColor: '#F0F0F0' }} 
              contentFit={imagemLocal ? 'cover' : 'contain'}
            />
            <RNView style={{position: 'absolute', bottom: -10, right: -10, backgroundColor: '#1976D2', padding: 10, borderRadius: 20, elevation: 3}}>
              <Ionicons name="camera" size={20} color="#FFF" />
            </RNView>
          </TouchableOpacity>
          <Text style={{fontSize: 12, color: '#666', marginTop: 15}}>Foto da Comunidade (Opcional)</Text>
        </RNView>

        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>Identificação</Text>
          
          <Text style={styles.label}>Nome da Comunidade *</Text>
          <TextInput style={styles.input} placeholder="Ex: Feira da Vila Maria" value={nome} onChangeText={setNome} />

          <Text style={styles.label}>Descrição Curta *</Text>
          <TextInput style={styles.input} placeholder="Ex: Melhores orgânicos da região" value={descricaoCurta} onChangeText={setDescricaoCurta} maxLength={50} />

          <Text style={styles.label}>Descrição Detalhada (Opcional)</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Conte mais sobre este grupo..." multiline value={descricaoLonga} onChangeText={setDescricaoLonga} />

          <Text style={styles.label}>Tipo de Comunidade</Text>
          <RNView style={styles.typeContainer}>
            {tiposComunidade.map(t => (
              <TouchableOpacity 
                key={t.id} 
                style={[styles.typeBtn, tipo === t.id && styles.typeBtnActive]} 
                onPress={() => setTipo(t.id)}
              >
                <Text style={[styles.typeBtnText, tipo === t.id && styles.typeBtnTextActive]}>{t.nome}</Text>
              </TouchableOpacity>
            ))}
            {tiposComunidade.length === 0 && (
              <Text style={{ color: '#888', fontStyle: 'italic' }}>Nenhum tipo cadastrado. Cadastre em Gerenciamento.</Text>
            )}
          </RNView>
        </RNView>

        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço do Ponto</Text>
          
          <Text style={styles.label}>CEP *</Text>
          <RNView style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ex: 00000-000" placeholderTextColor="#AAB0B8" value={cep} onChangeText={setCep} onBlur={buscarCEP} keyboardType="numeric" maxLength={9} />
            {fetchingCEP && <ActivityIndicator size="small" color="#2E7D32" style={{ marginLeft: 10 }} />}
          </RNView>

          <RNView style={styles.row}>
            <RNView style={{ flex: 3, marginRight: 10 }}>
              <Text style={styles.label}>Rua *</Text>
              <TextInput style={styles.input} placeholder="Ex: Av. Principal" placeholderTextColor="#AAB0B8" value={rua} onChangeText={setRua} />
            </RNView>
            <RNView style={{ flex: 1 }}>
              <Text style={styles.label}>Nº</Text>
              <TextInput style={styles.input} placeholder="Ex: S/N" placeholderTextColor="#AAB0B8" value={numero} onChangeText={setNumero} />
            </RNView>
          </RNView>

          <Text style={styles.label}>Bairro</Text>
          <TextInput style={styles.input} placeholder="Ex: Centro" placeholderTextColor="#AAB0B8" value={bairro} onChangeText={setBairro} />

          <RNView style={styles.row}>
            <RNView style={{ flex: 2, marginRight: 10 }}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput style={styles.input} placeholder="Ex: Teresina" placeholderTextColor="#AAB0B8" value={cidade} onChangeText={setCidade} />
            </RNView>
            <RNView style={{ flex: 1 }}>
              <Text style={styles.label}>UF *</Text>
              <TextInput style={styles.input} placeholder="Ex: PI" placeholderTextColor="#AAB0B8" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
            </RNView>
          </RNView>
        </RNView>

        <PrimaryButton
          label="CRIAR COMUNIDADE"
          onPress={handleSalvar}
          loading={loading}
          color="#2E7D32"
          style={{ marginTop: 20, marginBottom: 50 }}
        />
      </ScrollView>
    </RNView>
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
  scrollContent: { padding: 25 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 25 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#EEE', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  typeBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  typeBtnActive: { backgroundColor: '#2E7D32' },
  typeBtnText: { color: '#666', fontWeight: 'bold' },
  typeBtnTextActive: { color: '#FFF' },
});
