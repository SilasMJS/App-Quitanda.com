import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; 
import Constants from 'expo-constants';
import authService from '../services/auth';

/**
 * LoginScreen - Tela inicial do aplicativo.
 */
export default function LoginScreen() {
  const router = useRouter(); 
  const [celular, setCelular] = useState(''); 
  const [senha, setSenha] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { height } = Dimensions.get('window');

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

  const handleLogin = async () => {
    const celularLimpo = celular.replace(/\D/g, '');
    
    if (celularLimpo.length < 10) {
      Alert.alert('Erro', 'Por favor, informe um número de celular válido.');
      return;
    }

    if (!senha) {
      Alert.alert('Erro', 'Por favor, informe sua senha.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(celularLimpo, senha);
      router.replace('/telas/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Erro ao realizar login. Verifique seus dados.';
      Alert.alert('Erro de Acesso', msg);
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
        <ScrollView contentContainerStyle={[styles.scrollContainer, { minHeight: height }]} bounces={false} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Image 
              source={require('@/assets/images/logo.svg')} 
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>Quitanda.com</Text>
            <Text style={styles.subtitle}>Sua vitrine digital no campo</Text>
          </View>

          <View style={styles.form}>
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

            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Acessar Minha Quitanda</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={() => router.push('/cadastro')}
              disabled={loading}
            >
              <Text style={styles.signupText}>Não tem uma conta? <Text style={styles.signupTextBold}>Cadastre-se</Text></Text>
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
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 25, 
    paddingTop: Constants.statusBarHeight + 10,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120, marginBottom: 15 }, 
  title: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, opacity: 0.6, marginTop: 5 },
  form: { width: '100%' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE'
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  eyeIcon: { padding: 5 },
  button: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A5D6A7' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  signupButton: { marginTop: 25, alignItems: 'center' },
  signupText: { color: '#666', fontSize: 15 },
  signupTextBold: { color: '#2E7D32', fontWeight: 'bold' },
});
