import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; // Usando expo-image para suportar SVG nativamente

const { height } = Dimensions.get('window');

/**
 * LoginScreen - Tela inicial do aplicativo.
 */
export default function LoginScreen() {
  const router = useRouter(); 
  const [celular, setCelular] = useState(''); 
  const [senha, setSenha] = useState(''); 

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

  const handleLogin = () => {
    const celularLimpo = celular.replace(/\D/g, '');
    const CELULAR_CORRETO = '11999999999';
    const SENHA_CORRETA = 'admin123';

    if (celularLimpo === CELULAR_CORRETO && senha === SENHA_CORRETA) {
      router.replace('/telas/dashboard');
    } else {
      Alert.alert('Erro de Acesso', 'Celular ou senha incorretos.');
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
          
          {/* Cabeçalho com a Logo Oficial (SVG) */}
          <View style={styles.header}>
            <Image 
              source={require('@/assets/images/Group 2.svg')} 
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>Quitanda.com</Text>
            <Text style={styles.subtitle}>Sua vitrine digital no campo</Text>
          </View>

          {/* Formulário */}
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
              />
            </View>

            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Acessar Minha Quitanda</Text>
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
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 25, minHeight: height },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120, marginBottom: 15 }, // Tamanho ajustado para sua logo
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
  button: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
