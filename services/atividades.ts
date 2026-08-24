import api from './api';

export interface Atividade {
  id: string;
  tipo: 'VENDEDOR_CRIADO' | 'COMUNIDADE_CRIADA' | 'PRODUTO_CRIADO';
  mensagem: string;
  criado_em: string;
}

const atividadesService = {
  listarRecentes: async (): Promise<Atividade[]> => {
    try {
      const response = await api.get('/atividades/');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },
};

export default atividadesService;
