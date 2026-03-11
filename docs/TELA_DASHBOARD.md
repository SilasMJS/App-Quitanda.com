# Painel de Controle (`app/telas/dashboard.tsx`)

Esta tela é o coração do aplicativo, fornecendo ao vendedor uma visão clara de como está o negócio dele no dia.

## Funcionalidades
- **Resumo de Vendas e Reservas**: Cards coloridos que mostram as estatísticas diárias.
- **Ações Rápidas**: Atalhos intuitivos para as funcionalidades mais comuns (Postar, Ver Estoque e Pagamentos).
- **Lista de Reservas Recentes**: Exibe os últimos pedidos feitos pelos clientes, ajudando o vendedor a se organizar.
- **Status Visual**: Badges coloridas (verde/laranja) para identificar a situação de cada reserva.

## Detalhes Técnicos
- **`ScrollView`**: Permite navegar em todo o conteúdo em telas pequenas.
- **`Ionicons`**: Conjunto de ícones vetoriais que dão uma aparência profissional ao dashboard.
- **`router.push`**: Utilizado para navegar entre as telas internas do aplicativo.
