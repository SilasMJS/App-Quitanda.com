import api from './api';
import { Pedido } from './reservas';

const pagamentosService = {
  listarPendentes: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get('/pedidos/recebidos');
      // Filtra apenas os pedidos APROVADOS que ainda não foram marcados como ENTREGUES/PAGOS
      return response.data.filter((p: Pedido) => p.status === 'APROVADO');
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      return [];
    }
  },

  listarHistorico: async (): Promise<Pedido[]> => {
    try {
      const response = await api.get('/pedidos/recebidos');
      // Filtra pedidos que já foram finalizados (ENTREGUE ou outro status final)
      return response.data.filter((p: Pedido) => p.status !== 'PENDENTE' && p.status !== 'APROVADO');
    } catch (error) {
      console.error('Erro ao listar histórico:', error);
      return [];
    }
  },

  confirmarPagamento: async (pedidoId: string) => {
    try {
      // Como não há rota de pagamento, vamos usar a lógica de marcar como ENTREGUE ou apenas simular
      // No seu backend real, você pode criar a rota /pedidos/{id}/pagar
      const response = await api.put(`/pedidos/${pedidoId}/aprovar`); 
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default pagamentosService;
