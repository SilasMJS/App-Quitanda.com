import React, { useState, useEffect } from 'react';


import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert, Dimensions, ActivityIndicator, Modal, FlatList, View as RNView } from 'react-native';


import { useRouter } from 'expo-router';


import { Text, View } from '../components/Themed';


import { StatusBar } from 'expo-status-bar';


import { Ionicons } from '@expo/vector-icons';


import { Image } from 'expo-image'; 


import Constants from 'expo-constants';


import authService from '../services/auth';


import comunidadesService, { Comunidade } from '../services/comunidades';


import api from '../services/api';





const { height, width } = Dimensions.get('window');





export default function SignupScreen() {


  const router = useRouter(); 


  const [step, setStep] = useState(1);


  const [loading, setLoading] = useState(false);





  // Passo 1: Dados Pessoais


  const [nome, setNome] = useState('');


  const [celular, setCelular] = useState(''); 


  const [email, setEmail] = useState('');


  const [senha, setSenha] = useState(''); 


  const [confirmarSenha, setConfirmarSenha] = useState('');





  // Passo 2: Endereço (Completar Cadastro)


  const [cep, setCep] = useState('');


  const [rua, setRua] = useState('');


  const [numero, setNumero] = useState('');


  const [bairro, setBairro] = useState('');


  const [cidade, setCidade] = useState('');


  const [estado, setEstado] = useState('');





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


        }


      } catch (error) {}


    }


  };








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





  const handleNextStep = async () => {


    const celularLimpo = celular.replace(/\D/g, '');


    


    if (!nome || celularLimpo.length < 10 || senha.length < 6) {


      Alert.alert('Erro', 'Preencha os dados obrigatórios corretamente.');


      return;


    }


    if (senha !== confirmarSenha) {


      Alert.alert('Erro', 'As senhas não coincidem.');


      return;


    }





    setLoading(true);


    try {


      // Cria o usuário primeiro


      await authService.signup({
        nome,
        telefone: celularLimpo,
        password: senha,
        email: email ? email : undefined
      });


      // Avança para o passo opcional


      setStep(2);


    } catch (error: any) {


      const msg = error?.response?.data?.detail || 'Não foi possível iniciar o cadastro.';


      Alert.alert('Erro', msg);


    } finally {


      setLoading(false);


    }


  };





  const handleFinalizeFull = async () => {


    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {


      Alert.alert('Atenção', 'Por favor, preencha todos os campos do endereço ou clique em "Pular".');


      return;


    }





    setLoading(true);


    try {


      let latitude = 0;


      let longitude = 0;


      try {


        const query = encodeURIComponent(`${rua}, ${numero}, ${cidade}, ${estado}, Brasil`);


        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);


        const geoData = await geoRes.json();


        if (geoData && geoData.length > 0) {


          latitude = parseFloat(geoData[0].lat);


          longitude = parseFloat(geoData[0].lon);


        } else {


          const queryFallback = encodeURIComponent(`${rua}, ${cidade}, ${estado}, Brasil`);


          const geoResFb = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${queryFallback}`);


          const geoDataFb = await geoResFb.json();


          if (geoDataFb && geoDataFb.length > 0) {


            latitude = parseFloat(geoDataFb[0].lat);


            longitude = parseFloat(geoDataFb[0].lon);


          }


        }


      } catch (e) {


        console.log("Erro ao buscar coordenadas", e);


      }





      await api.put('/usuarios/me/endereco', {


        cep, rua, numero, bairro, cidade, estado,


        latitude, longitude


      });


      


            if (Platform.OS === 'web') {
        alert('Conta criada com sucesso!');
        router.replace('/telas/dashboard');
      } else {
        Alert.alert('Sucesso!', 'Conta criada com sucesso!', [
          { text: 'Ir para o App', onPress: () => router.replace('/telas/dashboard') }
        ]);
      }


    } catch (error: any) {


      Alert.alert('Erro', 'Houve um erro ao salvar o endereço. Você pode tentar novamente pelo Perfil.');


      router.replace('/telas/dashboard');


    } finally {


      setLoading(false);


    }


  };





  return (


    <RNView style={styles.outerContainer}>


      <StatusBar style="dark" />


      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>


        


        {/* Cabeçalho Superior Padronizado */}


        <RNView style={styles.topHeader}>


          <TouchableOpacity style={styles.backButton} onPress={() => step === 2 ? setStep(1) : router.canGoBack() ? router.back() : router.replace('/')}>


            <Ionicons name="arrow-back" size={26} color="#2E7D32" />


          </TouchableOpacity>


          <TouchableOpacity style={styles.logoRow} onPress={() => router.replace('/telas/dashboard')}>


            <Image source={require('../assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />


            <Text style={styles.logoText}>uitanda.com</Text>


          </TouchableOpacity>


          <RNView style={{ width: 40 }} />


        </RNView>





        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>


          


          <RNView style={styles.stepIndicator}>


            <RNView style={[styles.stepDot, styles.stepActive]} />


            <RNView style={[styles.stepLine, step === 2 && styles.stepActive]} />


            <RNView style={[styles.stepDot, step === 2 && styles.stepActive]} />


          </RNView>





          <Text style={styles.title}>{step === 1 ? 'Dados Pessoais' : 'Seu Endereço'}</Text>


          <Text style={styles.subtitle}>


            {step === 1 ? 'Primeiro, as informações de acesso.' : 'Para finalizar a conta, informe sua localização.'}


          </Text>





          {step === 1 ? (


            <RNView style={styles.form}>


              <Text style={styles.inputLabel}>Nome Completo</Text>


              <TextInput style={styles.input} placeholder="Ex: Renan Lira" value={nome} onChangeText={setNome} />





              <Text style={styles.inputLabel}>Celular</Text>


              <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={celular} onChangeText={t => setCelular(formatarCelular(t))} maxLength={15} />





              <Text style={styles.inputLabel}>E-mail (Opcional)</Text>
              <TextInput style={styles.input} placeholder="seuemail@exemplo.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

              <Text style={styles.inputLabel}>Senha</Text>


              <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" secureTextEntry value={senha} onChangeText={setSenha} />





              <Text style={styles.inputLabel}>Confirmar Senha</Text>


              <TextInput style={styles.input} placeholder="Repita sua senha" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />





              <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleNextStep} disabled={loading}>


                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Continuar</Text>}


              </TouchableOpacity>


            </RNView>


          ) : (


            <RNView style={styles.form}>


              <Text style={styles.inputLabel}>CEP</Text>


              <TextInput style={styles.input} placeholder="00000-000" keyboardType="numeric" value={cep} onChangeText={buscarCEP} maxLength={8} />





              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>


                <RNView style={{ flex: 3, marginRight: 10 }}>


                  <Text style={styles.inputLabel}>Rua</Text>


                  <TextInput style={styles.input} placeholder="Rua das Flores" value={rua} onChangeText={setRua} />


                </RNView>


                <RNView style={{ flex: 1 }}>


                  <Text style={styles.inputLabel}>Nº</Text>


                  <TextInput style={styles.input} placeholder="123" value={numero} onChangeText={setNumero} />


                </RNView>


              </RNView>





              <Text style={styles.inputLabel}>Bairro</Text>


              <TextInput style={styles.input} placeholder="Centro" value={bairro} onChangeText={setBairro} />





              <RNView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>


                <RNView style={{ flex: 2, marginRight: 10 }}>


                  <Text style={styles.inputLabel}>Cidade</Text>


                  <TextInput style={styles.input} placeholder="Sua Cidade" value={cidade} onChangeText={setCidade} />


                </RNView>


                <RNView style={{ flex: 1 }}>


                  <Text style={styles.inputLabel}>Estado</Text>


                  <TextInput style={styles.input} placeholder="SP" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />


                </RNView>


              </RNView>





              <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleFinalizeFull} disabled={loading}>


                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Finalizar Cadastro</Text>}


              </TouchableOpacity>





              <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/telas/dashboard')}>


                <Text style={styles.skipButtonText}>Pular e preencher depois</Text>


              </TouchableOpacity>


            </RNView>


          )}


        </ScrollView>





      </KeyboardAvoidingView>


    </RNView>


  );


}





const styles = StyleSheet.create({


  outerContainer: { flex: 1, backgroundColor: '#FFF' },


  container: { flex: 1 },


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


  scrollContainer: { padding: 25 },


  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },


  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E0E0E0' },


  stepLine: { width: 40, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 5 },


  stepActive: { backgroundColor: '#2E7D32' },


  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },


  subtitle: { fontSize: 16, color: '#666', marginTop: 5, marginBottom: 30 },


  form: { width: '100%' },


  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8, marginTop: 15 },


  input: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#EEE' },


  selectField: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },


  placeholderText: { color: '#999' },


  selectText: { color: '#333', fontWeight: '500' },


  primaryButton: { backgroundColor: '#2E7D32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },


  buttonDisabled: { backgroundColor: '#A5D6A7' },


  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },


  skipButton: { marginTop: 20, alignItems: 'center', padding: 10 },


  skipButtonText: { color: '#666', fontSize: 14, textDecorationLine: 'underline' },


  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },


  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '80%' },


  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },


  optionItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },


  optionText: { fontSize: 16, color: '#333', fontWeight: '500' },


  closeModal: { marginTop: 20, alignItems: 'center', padding: 15, backgroundColor: '#F5F5F5', borderRadius: 10 },


  closeModalText: { fontWeight: 'bold', color: '#333' }


});





