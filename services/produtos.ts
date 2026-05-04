import api from './api';

export interface ProdutoVendedor {
  id: string;
  produto_id: string;
  vendedor_id: string;
  preco: number;
  quantidade: number;
  unidade_medida: string;
  ativo: boolean;
  produto: {
    nome: string;
    descricao: string;
    imagem_url: string;
    categoria: {
      nome: string;
    }
  }
}

const produtosService = {
  listarMeusProdutos: async () => {
    try {
      const response = await api.get('/vendedores/me/produtos');
      return response.data; // Retorna a lista de produtos do vendedor
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  },

  cadastrarProduto: async (dados: {
    produto_id: string;
    preco: number;
    estoque: number;
    imagem_url?: string | null;
    unidade_medida: string;
  }) => {
    try {
      const response = await api.post('/vendedores/produtos', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      throw error;
    }
  },

  atualizarProduto: async (id: string, dados: {
    preco?: number;
    estoque?: number;
    imagem_url?: string | null;
    status?: string;
  }) => {
    try {
      const response = await api.put(`/vendedores/produtos/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  deletarProduto: async (id: string) => {
    try {
      const response = await api.delete(`/vendedores/produtos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  listarProdutosBase: async () => {
    try {
      // Endpoint para listar os produtos globais cadastrados no sistema
      const response = await api.get('/produtos/');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos base:', error);
      throw error;
    }
  }
};

export default produtosService;
