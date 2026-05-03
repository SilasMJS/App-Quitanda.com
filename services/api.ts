import axios from 'axios';
import Constants from 'expo-constants';
import storage from './storage';

/**
 * Detecta automaticamente o endereço do backend:
 * - Emulador Android: 10.0.2.2
 * - iOS/Físico: IP da máquina que está rodando o Expo
 * - Produção: URL definida
 */
const getBaseUrl = () => {
  // Se estiver em produção, coloque sua URL aqui
  // return 'https://api.suaquitanda.com';

  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':').shift();

  if (!localhost) {
    return 'http://localhost:8000';
  }

  // Se estiver no emulador Android, o localhost da máquina é 10.0.2.2
  // Mas o hostUri do Expo geralmente já aponta para o IP correto da rede local.
  return `http://${localhost}:8000`;
};

const API_URL = getBaseUrl();
console.log('Conectando à API em:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token
api.interceptors.request.use(async (config) => {
  const token = await storage.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta simplificado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Apenas repassa o erro para ser tratado onde a chamada foi feita
    return Promise.reject(error);
  }
);

export default api;
