import * as ImagePicker from 'expo-image-picker';
import api from './api';

export const pickImage = async (): Promise<string | null> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permissionResult.granted === false) {
    alert("Você precisa permitir o acesso à galeria para enviar fotos!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    // O react-native FormData aceita append com objetos simulando arquivos
    formData.append('file', {
      uri: uri,
      name: filename,
      type: type,
    } as any);

    // Envia como multipart/form-data
    const response = await api.post(`/upload/${tipo}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // O backend retorna o path relativo (ex: /storage/vendedores/xyz.jpg)
    // Precisamos concatenar com a baseURL da API para o frontend renderizar
    const baseUrl = api.defaults.baseURL;
    return `${baseUrl}${response.data.url}`;

  } catch (error) {
    console.error('Erro ao enviar imagem', error);
    throw new Error('Não foi possível enviar a imagem. Tente novamente.');
  }
};
