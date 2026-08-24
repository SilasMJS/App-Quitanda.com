import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text, View } from '../../../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import Constants from 'expo-constants';
import { useToast } from '../../../components/ToastContext';

export default function AdminNovoUsuarioScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const formatarCelular = (text: string) => {
    const cleaned = ('' + text).replace(/\D/g, '');
    const limited = cleaned.substring(0, 11);
    const match = limited.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += `(${match[1]}`;
      if (match[1].length === 2) formatted += ') ';
      if (match[2]) formatted += match[2];
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return limited;
  };

  const handleSalvar = async () => {
    if (!nome || !telefone || !senha) {
      showToast('Preencha os campos obrigatórios: Nome, Celular e Senha.', 'error');
      return;
    }

    const celularLimpo = telefone.replace(/\D/g, '');

    setLoading(true);
    try {
      await api.post('/usuarios/', {
        nome,
        telefone: celularLimpo,
        email: email || null,
        password: senha
      });
      
      showToast('Usuário criado com sucesso!', 'success');
      router.replace('/telas/admin/usuarios');
    } catch (error: any) {
      const msg = typeof error.response?.data?.detail === 'string'
        ? error.response.data.detail
        : error.response?.data?.detail?.[0]?.msg || 'Falha ao criar usuário.';

      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/admin/usuarios')}>
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
          <Text style={styles.title}>Novo Usuário</Text>
          <Text style={styles.subtitle}>Crie uma nova conta de acesso para um cliente ou futuro vendedor.</Text>
          
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Nome Completo *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: João Silva"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <Text style={styles.inputLabel}>Celular *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={(text) => setTelefone(formatarCelular(text))}
                maxLength={15}
              />
            </View>
            
            <Text style={styles.inputLabel}>Email (Opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.inputLabel}>Senha Provisória *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={senha}
                onChangeText={setSenha}
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
                <Text style={styles.saveButtonText}>CRIAR USUÁRIO</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9',
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
