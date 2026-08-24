# Estrutura de Rotas

O app utiliza o **Expo Router**, onde a estrutura de pastas reflete a navegação.

## Fluxo de Telas

- `app/_layout.tsx`: Root Provider (Stack principal).
- `app/index.tsx`: Tela de entrada / Login.
- `app/cadastro.tsx`: Cadastro inicial de usuário e escolha de perfil/comunidade.
- `app/cadastro-vendedor.tsx`: Complementação de dados do vendedor (endereço, etc.).
- `app/telas/`: Grupo de telas protegidas (acesso pós-login).
  - `_layout.tsx`: Configuração de navegação em pilha (Stack) ocultando os cabeçalhos padrões.
  - `dashboard.tsx`: Resumo de vendas, atividades e botões de navegação.
  - `reservas.tsx`: Lista de compradores e aprovação/recusa de pedidos.
  - `produtos.tsx`: Lista e gerenciamento de estoque.
  - `postagens.tsx`: Criação de postagens para a vitrine digital.
  - `pagamentos.tsx`: Histórico financeiro.
  - `perfil.tsx`: Informações da conta, status do cadastro e logout.
  - `admin/`: Telas exclusivas para administradores.
    - `comunidades.tsx`: Lista e gestão de comunidades cadastradas.
    - `nova-comunidade.tsx`: Formulário para cadastrar novas comunidades.
