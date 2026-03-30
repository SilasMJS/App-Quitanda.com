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
      return response.data;
    } catch (error) {
      console.error('Erro ao listar comunidades da API:', error);
      // Retorna uma lista vazia ou mock se a API falhar completamente
      return [];
    }
  }
};

export default comunidadesService;
