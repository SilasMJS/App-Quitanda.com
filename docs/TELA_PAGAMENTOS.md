# Pagamentos (`app/telas/pagamentos.tsx`)

Esta tela oferece ao vendedor o controle total sobre o seu faturamento mensal e o histórico detalhado de vendas.

## Funcionalidades
- **Resumo Mensal**: Um painel verde no topo com o faturamento acumulado do mês corrente.
- **Histórico de Vendas**: Lista completa das transações recentes com detalhes do cliente.
- **Métodos de Pagamento**: Identifica visualmente o pagamento via Pix, Cartão ou Dinheiro através de ícones específicos.
- **Status da Transação**: Mostra se a venda foi paga ou se ainda está pendente.

## Detalhes Técnicos
- **`FlatList`**: Usado para renderizar a lista de transações com alto desempenho.
- **`StatusBadge`**: Componente condicional que altera a cor conforme a situação de pagamento.
- **`summaryContainer`**: Design customizado com bordas arredondadas e contraste de cores.
