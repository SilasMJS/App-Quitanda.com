import api from './api';

export interface Comunidade {
  id: string;
  nome: string;
  descricao_curta: string;
  cor_tema: string;
  tipo: string;
  ativo: boolean;
}

const comunidadesService = {
  listarTodas: async (): Promise<Comunidade[]> => {
    try {
      const response = await api.get('/comunidades/');
      return response.data || [];
    } catch (error) {
      // Retorna uma lista vazia silenciosamente se a API falhar
      return [];
    }
  },

  criarComunidade: async (dados: any) => {
    const response = await api.post('/comunidades/', dados);
    return response.data;
  }
};

export default comunidadesService;
