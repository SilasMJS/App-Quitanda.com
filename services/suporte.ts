import api from "./api";

export interface TicketSuporte {
  id: string;
  usuario_id: string;
  usuario_nome?: string;
  usuario_email?: string;
  tipo: string;
  mensagem: string;
  status: string;
  resposta_admin?: string;
  criado_em: string;
  atualizado_em: string;
}

const suporteService = {
  criarTicket: async (dados: { tipo: string; mensagem: string }) => {
    const response = await api.post("/suporte/", dados);
    return response.data;
  },

  listarMeusTickets: async (): Promise<TicketSuporte[]> => {
    const response = await api.get("/suporte/me");
    return response.data;
  },

  listarTodosTickets: async (status?: string): Promise<TicketSuporte[]> => {
    const response = await api.get("/suporte/admin", {
      params: status ? { status } : {},
    });
    return response.data;
  },

  responderTicket: async (ticket_id: string, dados: { resposta_admin: string; status: string }) => {
    const response = await api.put(`/suporte/admin/${ticket_id}/responder`, dados);
    return response.data;
  },

  getBadgeCount: async (): Promise<{ user_count: number, admin_count: number }> => {
    try {
      const response = await api.get("/suporte/badge-count");
      return { 
        user_count: response.data.user_count || 0,
        admin_count: response.data.admin_count || 0
      };
    } catch (e) {
      console.error("Erro ao buscar badge count de suporte", e);
      return { user_count: 0, admin_count: 0 };
    }
  },
};

export default suporteService;
