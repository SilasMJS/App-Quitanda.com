import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '../components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; 
import authService from '../services/auth';

const { height } = Dimensions.get('window');

/**
 * SignupScreen - Tela de criação de novo usuário.
 */
export default function SignupScreen() {
  const router = useRouter(); 
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState(''); 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); 
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * formatarCelular - Aplica máscara (XX) XXXXX-XXXX
   */
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

  const handleChangeCelular = (text: string) => {
    setCelular(formatarCelular(text));
  };

  const handleSignup = async () => {
    const celularLimpo = celular.replace(/\D/g, '');
    
    if (!nome || nome.length < 3) {
      Alert.alert('Erro', 'Por favor, informe seu nome completo.');
      return;
    }

    if (celularLimpo.length < 10) {
      Alert.alert('Erro', 'Por favor, informe um número de celular válido.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authService.signup({
        nome,
        telefone: celularLimpo,
        password: senha,
        email: email || undefined
      });
      
      Alert.alert('Sucesso', 'Conta criada com sucesso! Agora vamos configurar sua quitanda.', [
        { text: 'OK', onPress: () => router.replace('/cadastro-vendedor') }
      ]);
    } catch (error: any) {
      console.log('Erro completo:', error.response?.data);
      // O FastAPI costuma devolver erros de validação em 'detail' ou diretamente no corpo
      const data = error?.response?.data;
      let msg = 'Erro ao criar conta. Verifique os dados.';
      
      if (data) {
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => d.msg).join('\n');
        } else if (data.message) {
          msg = data.message;
        } else {
          // Captura erros de validação do Pydantic que enviamos como chaves
          msg = Object.values(data).join('\n');
        }
      }

      Alert.alert('Erro no Cadastro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image 
              source={require('../assets/images/Group 2.svg')} 
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>Nova Conta</Text>
            <Text style={styles.subtitle}>Junte-se à nossa comunidade</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Renan Lira"
                value={nome}
                onChangeText={setNome}
                editable={!loading}
              />
            </View>

            <Text style={styles.inputLabel}>Celular</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                value={celular}
                onChangeText={handleChangeCelular}
                maxLength={15}
                editable={!loading}
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
                editable={!loading}
              />
            </View>

            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
                editable={!loading}
              />
            </View>

            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Repita sua senha"
                secureTextEntry
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Criar Minha Conta</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContainer: { flexGrow: 1, padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 80, height: 80, marginBottom: 10 }, 
  title: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, opacity: 0.6, marginTop: 5 },
  form: { width: '100%' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  button: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A5D6A7' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
