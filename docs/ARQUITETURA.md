# Arquitetura Técnica

O projeto utiliza tecnologias modernas para garantir performance e facilidade de manutenção.

## Stack Tecnológica
- **Framework**: [Expo](https://expo.dev/) (SDK 54).
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/).
- **Biblioteca Base**: [React Native](https://reactnative.dev/).
- **Navegação**: [Expo Router](https://docs.expo.dev/router/introduction/) (Navegação baseada em arquivos).
- **UI Components**: Componentes customizados com suporte a Dark/Light Mode.

## Camada de Serviços (`services/`)
O app utiliza uma camada de abstração para chamadas de API:
- `api.ts`: Configuração base do Axios e interceptores.
- `auth.ts`: Gestão de autenticação, login, signup e tokens (Storage).
- `comunidades.ts`: Operações relacionadas a comunidades agrícolas.
- `vendedores.ts`: Gestão de perfis de vendedores e endereços.
- `produtos.ts` / `reservas.ts` / `pagamentos.ts`: Serviços específicos de domínio.

## Componentes Globais
- `GlobalHeader.tsx`: Cabeçalho padronizado utilizado em múltiplas telas para manter a identidade visual.
- `Themed.tsx`: Wrappers para componentes nativos que respeitam o tema (Light/Dark).

## Bibliotecas Principais
- `expo-router`: Gerenciamento de rotas e navegação em pilha (Stack).
- `expo-image`: Carregamento otimizado de imagens (suporte a SVG).
- `react-native-reanimated`: Animações fluidas e personalizadas.
