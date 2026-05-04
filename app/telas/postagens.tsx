import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions, Platform, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function PostagensScreen() {
  const router = useRouter();
  const [legenda, setLegenda] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [tipoMidia, setTipoMidia] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  
  // Estados para Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarPostagens();
  }, []);

  const carregarPostagens = async () => {
    try {
      const response = await api.get('/postagens/me');
      setPosts(response.data);
    } catch (error) {
      console.error('Erro ao carregar postagens:', error);
    }
  };

  const capturarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à câmera.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImagem(result.assets[0].uri);
      setTipoMidia('IMAGE');
    }
  };

  const gravarVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à câmera.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      videoMaxDuration: 60,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImagem(result.assets[0].uri);
      setTipoMidia('VIDEO');
    }
  };

  const selecionarGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à galeria.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImagem(result.assets[0].uri);
      setTipoMidia(result.assets[0].type === 'video' ? 'VIDEO' : 'IMAGE');
    }
  };

  const abrirEdicao = (post: any) => {
    setEditandoId(post.id);
    setLegenda(post.legenda);
    setImagem(post.imagem_url);
    setTipoMidia(post.tipo_midia);
    setModalAberto(true);
  };

  const abrirNovo = () => {
    setEditandoId(null);
    setLegenda('');
    setImagem(null);
    setTipoMidia('IMAGE');
    setModalAberto(true);
  };

  const confirmarExclusao = () => {
    if (!editandoId) return;
    Alert.alert('Remover Postagem', 'Deseja excluir esta postagem permanentemente?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: deletarPostagem }
    ]);
  };

  const deletarPostagem = async () => {
    try {
      setLoading(true);
      await api.delete(`/postagens/${editandoId}`);
      Alert.alert('Sucesso', 'Postagem removida.');
      setModalAberto(false);
      carregarPostagens();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover a postagem.');
    } finally {
      setLoading(false);
    }
  };

  const salvarPostagem = async () => {
    if (!imagem || !legenda) {
      Alert.alert('Atenção', 'Adicione uma mídia e uma legenda.');
      return;
    }

    setLoading(true);
    try {
      if (editandoId) {
        await api.put(`/postagens/${editandoId}`, {
          legenda: legenda,
          imagem_url: imagem,
          tipo_midia: tipoMidia
        });
        Alert.alert('Sucesso', 'Postagem atualizada!');
      } else {
        await api.post('/postagens/', {
          legenda: legenda,
          imagem_url: imagem,
          tipo_midia: tipoMidia
        });
        Alert.alert('Sucesso', 'Sua postagem foi publicada!');
      }
      setModalAberto(false);
      carregarPostagens();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a postagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Image source={require('@/assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </View>
        <TouchableOpacity onPress={abrirNovo} style={styles.addButton}>
          <Ionicons name="add-circle" size={30} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Suas Postagens na Vitrine</Text>
          
          {posts.length === 0 && !loading && (
            <TouchableOpacity onPress={abrirNovo} style={styles.emptyContainer}>
               <Ionicons name="images-outline" size={60} color="#DDD" />
               <Text style={styles.emptyText}>Você ainda não fez postagens.</Text>
               <Text style={styles.emptyLink}>Toque aqui para começar</Text>
            </TouchableOpacity>
          )}

          {posts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => abrirEdicao(post)}>
              {post.tipo_midia === 'VIDEO' ? (
                 <View style={[styles.postImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="play-circle" size={60} color="#2E7D32" />
                 </View>
              ) : (
                <Image source={{ uri: post.imagem_url }} style={styles.postImage} contentFit="cover" />
              )}
              <View style={styles.postFooter}>
                <Text style={styles.postLegenda} numberOfLines={2}>
                  <Text style={styles.userName}>{post.usuario_nome} </Text>
                  {post.legenda}
                </Text>
                <View style={styles.postMeta}>
                   <Text style={styles.postDate}>{new Date(post.criado_em).toLocaleDateString('pt-BR')}</Text>
                   <Ionicons name="pencil" size={14} color="#2E7D32" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Modal Criar/Editar */}
      <Modal visible={modalAberto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
           <View style={styles.formContainer}>
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>{editandoId ? 'Editar Postagem' : 'Nova Postagem'}</Text>
                 <TouchableOpacity onPress={() => setModalAberto(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={selecionarGaleria} style={styles.imageSelector}>
                  {imagem ? (
                    tipoMidia === 'IMAGE' ? (
                      <Image source={{ uri: imagem }} style={styles.imagePreview} contentFit="cover" />
                    ) : (
                      <View style={styles.imagePreview}>
                        <Ionicons name="play-circle" size={80} color="#2E7D32" style={{ alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto' }} />
                        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>Vídeo Selecionado</Text>
                      </View>
                    )
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={50} color="#2E7D32" />
                      <Text style={styles.imagePlaceholderText}>Adicionar mídia</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.mediaButtonsRow}>
                  <TouchableOpacity style={styles.mediaBtn} onPress={capturarFoto}><Ionicons name="camera" size={18} color="#FFF" /><Text style={styles.mediaBtnText}>Foto</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: '#EF6C00' }]} onPress={gravarVideo}><Ionicons name="videocam" size={18} color="#FFF" /><Text style={styles.mediaBtnText}>Vídeo</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.mediaBtn, { backgroundColor: '#1976D2' }]} onPress={selecionarGaleria}><Ionicons name="images" size={18} color="#FFF" /><Text style={styles.mediaBtnText}>Galeria</Text></TouchableOpacity>
                </View>

                <TextInput 
                  style={styles.captionInput} 
                  placeholder="Legenda da postagem..." 
                  multiline 
                  value={legenda} 
                  onChangeText={setLegenda} 
                />

                <TouchableOpacity 
                  style={[styles.postButton, loading && { opacity: 0.7 }]} 
                  onPress={salvarPostagem} 
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.postButtonText}>{editandoId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR AGORA'}</Text>}
                </TouchableOpacity>

                {editandoId && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={confirmarExclusao} disabled={loading}>
                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                    <Text style={styles.deleteBtnText}>EXCLUIR POSTAGEM</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
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
  content: { flex: 1, padding: 20, paddingTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: '900', color: '#2E7D32', marginLeft: -2 },
  backButton: { padding: 5 },
  addButton: { padding: 5 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 20 },
  postCard: { backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#EEE', elevation: 2 },
  postImage: { width: '100%', height: 350 },
  postFooter: { padding: 15 },
  userName: { fontWeight: 'bold' },
  postLegenda: { fontSize: 14, lineHeight: 20, color: '#444' },
  postMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  postDate: { fontSize: 12, color: '#999' },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 15 },
  emptyLink: { color: '#2E7D32', fontWeight: 'bold', marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formContainer: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, // Garante que preencha o final
    maxHeight: '95%',
    width: '100%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  imageSelector: { width: '100%', height: 250, borderRadius: 15, overflow: 'hidden', backgroundColor: '#F5F5F5', marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { marginTop: 10, color: '#2E7D32', fontWeight: 'bold' },
  mediaButtonsRow: { flexDirection: 'row', gap: 6, marginBottom: 15 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', paddingVertical: 12, borderRadius: 10, gap: 5 },
  mediaBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  captionInput: { fontSize: 15, color: '#333', padding: 15, minHeight: 100, textAlignVertical: 'top', backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#EEE', marginBottom: 15 },
  postButton: { backgroundColor: '#40C993', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  postButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 8 },
  deleteBtnText: { color: '#FF5252', fontWeight: 'bold' }
});
