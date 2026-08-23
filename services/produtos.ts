import api from "./api";

export interface ProdutoVendedor {
  id: string;
  produto_id: string;
  vendedor_id: string;
  preco: number;
  quantidade: number;
  unidade_medida?: string;
  tipo_unidade?: string;
  ativo: boolean;
  produto: {
    nome: string;
    descricao: string;
    imagem_url: string;
    categoria: {
      nome: string;
    };
  };
}

const produtosService = {
  listarMeusProdutos: async () => {
    try {
      const response = await api.get("/vendedores/me/produtos");
      return response.data; // Retorna a lista de produtos do vendedor
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
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
      // Garantir compatibilidade com possíveis nomes de campo no backend
      const payload: any = { ...dados };
      if (dados.estoque !== undefined && payload.quantidade === undefined) {
        payload.quantidade = dados.estoque;
      }
      // Mapear 'unidade_medida' (frontend) para 'tipo_unidade' (backend)
      if (payload.unidade_medida && !payload.tipo_unidade) {
        payload.tipo_unidade = payload.unidade_medida;
      }
      console.debug("Cadastrando produto payload:", payload);

      const response = await api.post("/vendedores/produtos", payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error, {
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
      });
      throw error;
    }
  },

  atualizarProduto: async (
    id: string,
    dados: {
      preco?: number;
      estoque?: number;
      imagem_url?: string | null;
      status?: string;
      unidade_medida?: string;
    },
  ) => {
    try {
      // Alguns backends podem esperar 'quantidade' em vez de 'estoque'
      const payload: any = { ...dados };
      if (dados.estoque !== undefined && payload.quantidade === undefined) {
        payload.quantidade = dados.estoque;
      }
      // Mapear 'unidade_medida' para 'tipo_unidade' se presente
      if (dados.unidade_medida && !payload.tipo_unidade) {
        payload.tipo_unidade = dados.unidade_medida;
      }
      console.debug("Atualizando produto payload:", id, payload);

      const response = await api.put(`/vendedores/produtos/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error, {
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
      });
      throw error;
    }
  },

  deletarProduto: async (id: string) => {
    try {
      const response = await api.delete(`/vendedores/produtos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      throw error;
    }
  },

  listarProdutosBase: async () => {
    try {
      // Endpoint para listar os produtos globais cadastrados no sistema
      const response = await api.get("/produtos/");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar produtos base:", error);
      throw error;
    }
  },
};

export default produtosService;
