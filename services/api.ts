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
  // Pega da variável de ambiente EXPO_PUBLIC_API_URL configurada no .env
  // Se não existir, faz um fallback para localhost (útil apenas para emuladores locais)
  return process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

const API_URL = getBaseUrl();
console.log('Conectando à API em:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  // O Render (plano free) hiberna o backend após inatividade; a primeira
  // requisição depois disso pode levar 30-50s para "acordar" o servidor.
  timeout: 45000,
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
