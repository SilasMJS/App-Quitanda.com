import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import comunidadesService from '../../../services/comunidades';
import Constants from 'expo-constants';

const TIPOS_COMUNIDADE = [
  { label: 'Feira', value: 'feira' },
  { label: 'Mercado', value: 'mercado' },
  { label: 'Hortifruti', value: 'hortifruti' },
  { label: 'Associação', value: 'associacao' },
];

export default function NovaComunidadeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Dados da Comunidade
  const [nome, setNome] = useState('');
  const [descricaoCurta, setDescricaoCurta] = useState('');
  const [descricaoLonga, setDescricaoLonga] = useState('');
  const [tipo, setTipo] = useState('feira');
  const [corTema, setCorTema] = useState('#2E7D32');

  // Dados de Endereço
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  const handleSalvar = async () => {
    if (!nome || !descricaoCurta || !cep || !rua || !cidade) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios (Nome, Descrição Curta, CEP, Rua e Cidade).');
      return;
    }

    setLoading(true);
    try {
      await comunidadesService.criarComunidade({
        nome,
        descricao_curta: descricaoCurta,
        descricao_longa: descricaoLonga,
        tipo,
        cor_tema: corTema,
        imagem_url: null,
        endereco: {
          cep,
          rua,
          numero,
          bairro,
          cidade,
          estado: estado.toUpperCase(),
          latitude: 0,
          longitude: 0
        }
      });

      Alert.alert('Sucesso', 'Comunidade criada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Erro ao criar comunidade. Verifique os dados.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nova Comunidade</Text>

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
            {TIPOS_COMUNIDADE.map(t => (
              <TouchableOpacity 
                key={t.value} 
                style={[styles.typeBtn, tipo === t.value && styles.typeBtnActive]} 
                onPress={() => setTipo(t.value)}
              >
                <Text style={[styles.typeBtnText, tipo === t.value && styles.typeBtnTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </RNView>
        </RNView>

        <RNView style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço do Ponto</Text>
          
          <Text style={styles.label}>CEP *</Text>
          <TextInput style={styles.input} placeholder="00000-000" value={cep} onChangeText={setCep} keyboardType="numeric" />

          <RNView style={styles.row}>
            <RNView style={{ flex: 3, marginRight: 10 }}>
              <Text style={styles.label}>Rua *</Text>
              <TextInput style={styles.input} placeholder="Av. Principal" value={rua} onChangeText={setRua} />
            </RNView>
            <RNView style={{ flex: 1 }}>
              <Text style={styles.label}>Nº</Text>
              <TextInput style={styles.input} placeholder="S/N" value={numero} onChangeText={setNumero} />
            </RNView>
          </RNView>

          <Text style={styles.label}>Bairro</Text>
          <TextInput style={styles.input} placeholder="Centro" value={bairro} onChangeText={setBairro} />

          <RNView style={styles.row}>
            <RNView style={{ flex: 2, marginRight: 10 }}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput style={styles.input} placeholder="Teresina" value={cidade} onChangeText={setCidade} />
            </RNView>
            <RNView style={{ flex: 1 }}>
              <Text style={styles.label}>UF *</Text>
              <TextInput style={styles.input} placeholder="PI" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
            </RNView>
          </RNView>
        </RNView>

        <TouchableOpacity 
          style={[styles.saveButton, loading && { opacity: 0.7 }]} 
          onPress={handleSalvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>CRIAR COMUNIDADE</Text>
          )}
        </TouchableOpacity>
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
  saveButton: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 50 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
