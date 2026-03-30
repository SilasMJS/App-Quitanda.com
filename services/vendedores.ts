import api from './api';

export interface CriarVendedor {
  usuario_id: string;
  comunidade_id: string;
  nome_fantasia: string;
  descricao?: string;
  chave_pix: string;
}

export interface Endereco {
  cep: string;
  cidade: string;
  rua: string;
  numero: string;
  bairro: string;
  estado: string;
  latitude?: number;
  longitude?: number;
}

const vendedoresService = {
  cadastrarEndereco: async (endereco: Endereco) => {
    try {
      const response = await api.put('/usuarios/me/endereco', endereco);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar endereco:', error);
      throw error;
    }
  },

  criarPerfilVendedor: async (dados: CriarVendedor) => {
    try {
      const response = await api.post('/vendedores/', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar perfil vendedor:', error);
      throw error;
    }
  },

  listarTodosVendedores: async () => {
    try {
      const response = await api.get('/vendedores/');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar vendedores:', error);
      return [];
    }
  }
};

export default vendedoresService;
