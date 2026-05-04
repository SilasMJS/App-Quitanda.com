# Tela de Cadastro (`app/cadastro.tsx`)

Esta tela gerencia a criação de novas contas no sistema, utilizando um fluxo dividido em etapas (steps).

## Funcionalidades
- **Fluxo Multi-etapa**: 
  - **Passo 1 (Dados Pessoais)**: Coleta de Nome, Celular, E-mail e Senha.
  - **Passo 2 (Perfil/Comunidade)**: Escolha se o usuário deseja ser um vendedor e em qual comunidade ele se integra.
- **Seleção de Comunidade**: Abre um modal para buscar e selecionar comunidades cadastradas no sistema via `comunidadesService`.
- **Validação de Senha**: Garante que a senha e a confirmação sejam idênticas.
- **Mascara de Celular**: Mesma padronização da tela de login `(XX) XXXXX-XXXX`.

## Detalhes Técnicos
- **`useState` (Step)**: Controla qual parte do formulário é exibida ao usuário.
- **`comunidadesService.listarTodas()`**: Chamado quando o usuário chega ao segundo passo para popular a lista de seleção.
- **Integração com Backend**:
  - Cria o usuário via `authService.signup`.
  - Se for vendedor, associa à comunidade e cria o perfil básico via `vendedoresService`.
