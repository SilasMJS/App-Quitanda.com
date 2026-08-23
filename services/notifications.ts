import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Configuração para como o app se comporta quando recebe uma notificação estando ABERTO
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Pede permissão e registra o dispositivo para Push Notifications
   * Retorna o ExpoPushToken se houver sucesso, ou null
   */
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2E7D32',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não foi concedida!');
        return null;
      }
      
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          token = (await Notifications.getExpoPushTokenAsync()).data;
        } else {
          token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
        console.log("Push Token gerado:", token);
      } catch (e) {
        console.error("Erro ao gerar token do Expo Push:", e);
      }
    } else {
      console.log('Push notifications só funcionam em dispositivos físicos, não em simuladores.');
    }

    return token;
  },

  salvarTokenNoBackend: async (token: string) => {
    try {
      await api.put('/usuarios/me', { push_token: token });
      console.log('Push token salvo no backend com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar push token no backend:', error);
    }
  }
};

export default notificationService;
