import api from './api';
import storage from './storage';

/**
 * authService - Gerencia login e persistência do token
 */
const authService = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/signin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { access_token } = response.data;
    if (access_token) {
      await storage.save('access_token', access_token);
    }
    return response.data;
  },

  signup: async (dados: { nome: string; telefone: string; password: string; email?: string }) => {
    // USANDO A ROTA CORRETA: /auth/signup
    await api.post('/auth/signup', dados);
    
    // Tenta logar automaticamente após criar
    return authService.login(dados.telefone, dados.password);
  },

  logout: async () => {
    await storage.remove('access_token');
  },

  isAuthenticated: async () => {
    const token = await storage.get('access_token');
    return !!token;
  },

  getCurrentUser: async () => {
    const response = await api.get('/usuarios/me');
    const user = response.data;
    
    // Força o perfil ADMIN para o seu número específico, já que o backend está na nuvem
    // Remove qualquer máscara que possa vir da API para comparar apenas os números
    const cleanPhone = user?.telefone?.replace(/\D/g, '');
    if (cleanPhone === '86994800318') {
      user.tipo = 'ADMIN';
    }
    
    return user;
  }
};

export default authService;
