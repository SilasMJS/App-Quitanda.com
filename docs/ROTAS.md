# Estrutura de Rotas

O app utiliza o **Expo Router**, onde a estrutura de pastas reflete a navegação.

## Fluxo de Telas
- `app/_layout.tsx`: Root Provider (Stack principal).
- `app/index.tsx`: Tela de entrada / Login.
- `app/telas/`: Grupo de telas protegidas (acesso pós-login).
  - `_layout.tsx`: Configuração do menu lateral (Drawer).
  - `dashboard.tsx`: Resumo de vendas e atividades.
  - `produtos.tsx`: Lista e gerenciamento de estoque.
  - `pagamentos.tsx`: Histórico financeiro.
