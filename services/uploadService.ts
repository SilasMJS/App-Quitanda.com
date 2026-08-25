import * as ImagePicker from 'expo-image-picker';
import api from './api';
import { Platform } from 'react-native';
import storage from './storage';

export const pickImage = async (): Promise<string | null> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    alert("Você precisa permitir o acesso à galeria para enviar fotos!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1], // Força proporção quadrada ideal para avatares e produtos
    quality: 0.7, // Comprime a imagem para não sobrecarregar o servidor
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    return result.assets[0].uri;
  }

  return null;
};

export const uploadImage = async (uri: string, tipo: 'comunidades' | 'vendedores' | 'produtos' | 'usuarios'): Promise<string> => {
  try {
    const filename = uri.split('/').pop() || 'imagem.jpg';
    
    // Identifica o mime type (por padrão jpeg se não encontrar)
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    
    const baseUrl = api.defaults.baseURL;

    if (Platform.OS === 'web') {
      const fetchResponse = await fetch(uri);
      const blob = await fetchResponse.blob();
      formData.append('file', blob, filename);
      
      const token = await storage.get('access_token');
      const res = await fetch(`${baseUrl}/upload/${tipo}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      // O backend pode retornar uma URL absoluta (R2) ou um caminho relativo
      // (fallback em disco local) - so' prefixa com baseUrl nesse segundo caso.
      return data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
    } else {
      formData.append('file', {
        uri: uri,
        name: filename,
        type: type,
      } as any);

      const response = await api.post(`/upload/${tipo}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url.startsWith('http') ? response.data.url : `${baseUrl}${response.data.url}`;
    }

  } catch (error) {
    console.error('Erro ao enviar imagem', error);
    throw new Error('Não foi possível enviar a imagem. Tente novamente.');
  }
};
