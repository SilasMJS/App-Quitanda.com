import api from './api';
import { Pedido } from './reservas';

const pagamentosService = {
  listarPendentes: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get('/pedidos/recebidos');
      const pedidos = response.data || [];
      return pedidos
        .map((p: any) => ({ ...p, status: p.status?.toUpperCase() }))
        .filter((p: any) => p.status === 'APROVADO');
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      return [];
    }
  },

  listarHistorico: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get('/pedidos/recebidos');
      const pedidos = response.data || [];
      return pedidos
        .map((p: any) => ({ ...p, status: p.status?.toUpperCase() }))
        .filter((p: any) => p.status !== 'PENDENTE' && p.status !== 'APROVADO');
    } catch (error) {
      console.error('Erro ao listar histórico:', error);
      return [];
    }
  },

  confirmarPagamento: async (pedidoId: string) => {
    try {
      const response = await api.put(`/pedidos/${pedidoId}/entregar`); 
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default pagamentosService;
