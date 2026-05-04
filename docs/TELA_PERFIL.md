# Tela de Perfil (`app/telas/perfil.tsx`)

A tela de perfil centraliza as informações do usuário logado e serve como ponto de controle para o status da conta.

## Funcionalidades
- **Status da Conta**:
  - Exibe badges identificando se o usuário é `VENDEDOR`, `ADMIN` ou se possui `CADASTRO INCOMPLETO`.
- **Alerta de Pendência**: Exibe um banner chamativo caso o vendedor precise completar seus dados para começar a vender.
- **Logout**: Opção de sair da conta com confirmação via `Alert`.
- **Navegação de Retorno**: Cabeçalho customizado com botão de voltar para o Dashboard.

## Detalhes Técnicos
- **`authService.getCurrentUser()`**: Recupera os dados em tempo real para garantir que o status do cadastro esteja atualizado.
- **Renderização Condicional**: O banner de "Ação Necessária" só aparece para vendedores com `cadastro_completo === false`.
- **Estilização Dinâmica**: Cores das badges mudam de acordo com o tipo de usuário (ex: Amarelo para Admin).
