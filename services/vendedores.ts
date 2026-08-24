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

export interface AtualizarVendedor {
  comunidade_id?: string;
  nome_fantasia?: string;
  descricao?: string;
  chave_pix?: string;
  imagem_url?: string;
}

const vendedoresService = {
  // O endereço é do ponto de venda (a quitanda), não da pessoa - por isso
  // fica atrelado ao vendedor autenticado, não ao usuário.
  cadastrarEnderecoMeuVendedor: async (endereco: Endereco) => {
    try {
      const response = await api.put('/vendedores/me/endereco', endereco);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar endereco do vendedor:', error);
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

  atualizarPerfilVendedor: async (dados: AtualizarVendedor) => {
    try {
      const response = await api.put('/vendedores/me', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil vendedor:', error);
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
