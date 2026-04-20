import axios from 'axios';
import storage from './storage';

// URL principal da sua API
// Para emulador Android: http://10.0.2.2:8000
// Para celular físico: http://SEU_IP_LOCAL:8000 (ex: http://192.168.1.50:8000)
// Para produção (HTTPS): Use seu domínio (ex: https://api.quitanda.com)

// IMPORTANTE: O Android exige HTTPS com certificado válido para produção.
// Se estiver usando HTTP puro, certifique-se de que o app.json permite Cleartext Traffic.
const API_URL = 'http://163.176.44.29'; // Alterado para http:// conforme orientação do servidor

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
