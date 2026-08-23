import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions, Platform, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Text, View } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import api from '../../services/api';
import { uploadImage } from '../../services/uploadService';

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
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
        if (Platform.OS === 'web') window.alert('O arquivo é muito grande! Escolha um arquivo de até 20MB.');
        else Alert.alert('Arquivo muito grande', 'O limite de upload é de 20MB.');
        return;
      }
      setImagem(asset.uri);
      setTipoMidia(asset.type === 'video' ? 'VIDEO' : 'IMAGE');
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
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
        if (Platform.OS === 'web') window.alert('O vídeo é muito grande! Tente gravar um vídeo mais curto.');
        else Alert.alert('Vídeo muito grande', 'O limite de upload é de 20MB.');
        return;
      }
      setImagem(asset.uri);
      setTipoMidia(asset.type === 'video' ? 'VIDEO' : 'IMAGE');
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Limite de 20MB no app
      if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
        if (Platform.OS === 'web') window.alert('O arquivo é muito grande! Escolha um arquivo de até 20MB.');
        else Alert.alert('Arquivo muito grande', 'O limite de upload é de 20MB.');
        return;
      }
      
      setImagem(asset.uri);
      setTipoMidia(asset.type === 'video' ? 'VIDEO' : 'IMAGE');
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
      let finalImageUrl = imagem;
      // Se for uma imagem local recém-selecionada (blob, file ou base64), faz o upload
      if (imagem && (imagem.startsWith('file:') || imagem.startsWith('data:') || imagem.startsWith('blob:'))) {
        finalImageUrl = await uploadImage(imagem, 'vendedores');
      }

      if (editandoId) {
        await api.put(`/postagens/${editandoId}`, {
          legenda: legenda,
          imagem_url: finalImageUrl,
          tipo_midia: tipoMidia
        });
        Alert.alert('Sucesso', 'Postagem atualizada!');
      } else {
        await api.post('/postagens/', {
          legenda: legenda,
          imagem_url: finalImageUrl,
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/telas/dashboard')}>
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoRow} onPress={() => router.replace('/telas/dashboard')}>
          <Image source={require('@/assets/images/logo.svg')} style={{ width: 35, height: 35 }} contentFit="contain" />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={abrirNovo} style={styles.addButton}>
          <Ionicons name="add-circle" size={30} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              <View style={styles.postHeaderRow}>
                <View style={styles.postAvatarFallback}>
                  <Text style={styles.postAvatarText}>{post.usuario_nome ? post.usuario_nome.charAt(0).toUpperCase() : 'U'}</Text>
                </View>
                <Text style={styles.userName}>{post.usuario_nome}</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
              </View>

              {post.tipo_midia === 'VIDEO' ? (
                <Video 
                  source={{ uri: post.imagem_url }} 
                  style={styles.postImage} 
                  resizeMode={ResizeMode.COVER} 
                  useNativeControls 
                />
              ) : (
                <Image source={{ uri: post.imagem_url }} style={styles.postImage} contentFit="cover" />
              )}
              <View style={styles.postFooter}>
                <Text style={styles.postLegenda} numberOfLines={3}>
                  {post.legenda}
                </Text>
                <View style={styles.postMeta}>
                   <Text style={styles.postDate}>{new Date(post.criado_em).toLocaleDateString('pt-BR')}</Text>
                   <View style={styles.editBadge}>
                     <Ionicons name="pencil" size={12} color="#FFF" />
                     <Text style={styles.editBadgeText}>Editar</Text>
                   </View>
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

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TouchableOpacity onPress={selecionarGaleria} style={styles.imageSelector}>
                  {imagem ? (
                    tipoMidia === 'IMAGE' ? (
                      <Image source={{ uri: imagem }} style={styles.imagePreview} contentFit="cover" />
                    ) : (
                        <Video 
                          source={{ uri: imagem }} 
                          style={styles.imagePreview} 
                          resizeMode={ResizeMode.COVER} 
                          useNativeControls 
                          isLooping 
                        />
                    )
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={50} color="#2E7D32" />
                      <Text style={styles.imagePlaceholderText}>Adicionar mídia</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.mediaButtonsRow}>
                  <TouchableOpacity style={styles.mediaBtn} onPress={capturarFoto}>
                    <Ionicons name="camera" size={18} color="#2E7D32" />
                    <Text style={styles.mediaBtnText}>Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaBtn} onPress={gravarVideo}>
                    <Ionicons name="videocam" size={18} color="#EF6C00" />
                    <Text style={styles.mediaBtnText}>Vídeo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaBtn} onPress={selecionarGaleria}>
                    <Ionicons name="images" size={18} color="#1976D2" />
                    <Text style={styles.mediaBtnText}>Galeria</Text>
                  </TouchableOpacity>
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
  postCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 25, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  postAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postAvatarText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  postImage: { width: '100%', height: 350 },
  postFooter: { padding: 18, paddingTop: 10 },
  userName: { fontWeight: '800', color: '#333', fontSize: 15 },
  postLegenda: { fontSize: 15, lineHeight: 22, color: '#444' },
  postMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  postDate: { fontSize: 12, color: '#999', fontWeight: '500' },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4
  },
  editBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16, marginTop: 15 },
  emptyLink: { color: '#2E7D32', fontWeight: 'bold', marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formContainer: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    maxHeight: '95%',
    width: '100%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  imageSelector: { width: '100%', height: 250, borderRadius: 15, overflow: 'hidden', backgroundColor: '#F5F5F5', marginBottom: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { marginTop: 10, color: '#2E7D32', fontWeight: 'bold' },
  mediaButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEE', paddingVertical: 12, borderRadius: 12, gap: 5 },
  mediaBtnText: { color: '#333', fontWeight: 'bold', fontSize: 13 },
  captionInput: { fontSize: 15, color: '#333', padding: 15, minHeight: 100, textAlignVertical: 'top', backgroundColor: '#F9F9F9', borderRadius: 12, borderWidth: 1, borderColor: '#EEE', marginBottom: 15 },
  postButton: { backgroundColor: '#40C993', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  postButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 8 },
  deleteBtnText: { color: '#FF5252', fontWeight: 'bold' }
});
