import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

const POSTS_MOCK = [
  { id: '1', imagem: 'https://images.unsplash.com/photo-1488459711635-de8296fe300b?w=500', legenda: 'Colheita fresca de hoje! 🌽 #organico', data: 'Há 2h' },
  { id: '2', imagem: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', legenda: 'Nossa banca está pronta esperando por você. 🍎', data: 'Há 5h' },
];

export default function PostagensScreen() {
  const router = useRouter();
  const [legenda, setLegenda] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const capturarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à câmera para tirar fotos.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 5], quality: 0.8 });
    if (!result.canceled) setImagem(result.assets[0].uri);
  };

  const gravarVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à câmera para gravar vídeos.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsEditing: true, videoMaxDuration: 60, quality: 0.8 });
    if (!result.canceled) setImagem(result.assets[0].uri);
  };

  const selecionarGaleria = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true, aspect: [4, 5], quality: 0.8 });
    if (!result.canceled) setImagem(result.assets[0].uri);
  };

  const publicar = () => {
    if (!imagem || !legenda) {
      Alert.alert('Atenção', 'Adicione uma mídia e uma legenda.');
      return;
    }
    Alert.alert('Sucesso', 'Sua postagem foi enviada para a vitrine!');
    setImagem(null); setLegenda('');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        
        <View style={styles.logoRow}>
          <Image source={require('@/assets/images/Group 2.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.createPostCard}>
            <Text style={styles.cardTitle}>Nova Postagem</Text>
            <View style={styles.imageSelector}>
              {imagem ? <Image source={{ uri: imagem }} style={styles.imagePreview} /> : <View style={styles.imagePlaceholder}><Ionicons name="videocam-outline" size={50} color="#2E7D32" /><Text style={styles.imagePlaceholderText}>Crie um novo conteúdo</Text></View>}
            </View>
            <View style={styles.mediaButtonsRow}>
              <TouchableOpacity style={[styles.mediaBtn, styles.shadow]} onPress={capturarFoto}><Ionicons name="camera" size={20} color="#FFF" /><Text style={styles.mediaBtnText}>Foto</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: '#EF6C00' }, styles.shadow]} onPress={gravarVideo}><Ionicons name="videocam" size={20} color="#FFF" /><Text style={styles.mediaBtnText}>Vídeo</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: '#1976D2' }, styles.shadow]} onPress={selecionarGaleria}><Ionicons name="images" size={20} color="#FFF" /><Text style={styles.mediaBtnText}>Galeria</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.captionInput} placeholder="O que está acontecendo na quitanda agora?" multiline value={legenda} onChangeText={setLegenda} />
            <TouchableOpacity style={styles.postButton} onPress={publicar}><Text style={styles.postButtonText}>Publicar na Vitrine</Text></TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Suas Postagens recentes</Text>
          {POSTS_MOCK.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Image source={{ uri: post.imagem }} style={styles.postImage} />
              <View style={styles.postFooter}>
                <Text style={styles.postLegenda}><Text style={styles.userName}>Silas </Text>{post.legenda}</Text>
                <Text style={styles.postDate}>{post.data}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF',
  },
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
  content: { flex: 1, padding: 20, paddingTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  backButton: { padding: 5 },
  screenTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: '#333', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  createPostCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  imageSelector: { width: '100%', height: 280, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F5F5F5', marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { marginTop: 10, color: '#2E7D32', fontWeight: 'bold' },
  mediaButtonsRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 10, gap: 5 },
  mediaBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  shadow: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3 },
  captionInput: { fontSize: 15, color: '#333', padding: 15, minHeight: 80, textAlignVertical: 'top', backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#EEE', marginBottom: 10 },
  postButton: { backgroundColor: '#40C993', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  postButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  postCard: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  postImage: { width: '100%', height: 380 },
  postFooter: { padding: 15 },
  userName: { fontWeight: 'bold' },
  postLegenda: { fontSize: 14, lineHeight: 22 },
  postDate: { fontSize: 12, color: '#999', marginTop: 8 }
});
