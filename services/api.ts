import axios from 'axios';
import storage from './storage';

// URL principal da sua API
const API_URL = 'https://163.176.44.29';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Aumentado para dar tempo em conexões lentas
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

// Interceptor de resposta simplificado para evitar travamentos no LogBox
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Apenas loga no terminal, sem interromper o fluxo se formos tratar o erro depois
    console.log('API Info:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;
