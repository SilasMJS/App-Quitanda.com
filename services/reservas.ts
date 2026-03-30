import api from './api';

export interface PedidoItem {
  id: string;
  produto_vendedor_id: string;
  quantidade: number;
  preco_unitario: number;
  valor_total_item: number;
  produto_nome: string; // Geralmente mapeado no backend ou precisamos buscar
}

export interface Pedido {
  id: string;
  cliente_id: string;
  cliente_nome?: string;
  vendedor_id: string;
  comunidade_id: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO';
  valor_total: number;
  criado_em: string;
  itens: PedidoItem[];
}

const reservasService = {
  listarRecebidos: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get('/pedidos/recebidos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar reservas recebidas:', error);
      throw error;
    }
  },

  aprovar: async (pedidoId: string) => {
    try {
      const response = await api.put(`/pedidos/${pedidoId}/aprovar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
      throw error;
    }
  },

  recusar: async (pedidoId: string, motivo: string) => {
    try {
      const response = await api.put(`/pedidos/${pedidoId}/recusar`, { motivo });
      return response.data;
    } catch (error) {
      console.error('Erro ao recusar pedido:', error);
      throw error;
    }
  }
};

export default reservasService;
