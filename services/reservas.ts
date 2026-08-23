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
  cliente_telefone?: string;
  vendedor_id: string;
  comunidade_id: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'ENTREGUE';
  forma_pagamento?: string;
  data_retirada?: string;
  observacao?: string;
  valor_total: number;
  criado_em: string;
  itens: PedidoItem[];
}

const reservasService = {
  listarRecebidos: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get('/pedidos/recebidos');
      const pedidos = response.data || [];
      // Normaliza o status para maiúsculo pois o backend envia minúsculo (pendente, aprovado)
      return pedidos.map((p: any) => ({
        ...p,
        status: p.status ? p.status.toUpperCase() : 'PENDENTE'
      }));
    } catch (error) {
      // Retorna uma lista vazia silenciosamente se a API falhar
      return [];
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

  entregar: async (pedidoId: string) => {
    try {
      const response = await api.put(`/pedidos/${pedidoId}/entregar`);
      return response.data;
    } catch (error) {
      console.error('Erro ao entregar pedido:', error);
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
