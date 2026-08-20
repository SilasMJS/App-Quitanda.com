# Quitanda.com - App do Vendedor

![Expo](https://img.shields.io/badge/Expo-54.0.34-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

O **Quitanda.com** é um aplicativo mobile focado na gestão de vitrines digitais. Com ele, o vendedor pode gerenciar seus produtos, reservas e pagamentos de forma ágil e visual, funcionando como uma ponte entre sua produção e o site de vendas.

## 🚀 Funcionalidades Principais

- **Gestão de Produtos**: Adicione itens com fotos e legendas estilo rede social.
- **Controle de Reservas**: Gerencie pedidos feitos através do site em tempo real com **Notificações Push (Expo)** para cada nova reserva recebida.
- **Histórico Financeiro**: Acompanhe todos os pagamentos e entradas.
- **Interface Intuitiva**: Navegação rápida entre o estoque e o painel de controle utilizando Expo Router.

## 🛠 Tecnologias Utilizadas

- **React Native** + **Expo**: Para o desenvolvimento mobile multiplataforma.
- **Expo Router**: Roteamento baseado em arquivos (semelhante ao Next.js).
- **TypeScript**: Tipagem estática para maior segurança.
- **Axios**: Para requisições HTTP à API Backend.
- **Reanimated & Gesture Handler**: Para animações fluídas e interações de toque.

## 🏃 Como Inicializar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [Expo Go](https://expo.dev/expo-go) instalado no seu smartphone, ou um emulador configurado.

### Instalação
1. Acesse a pasta do projeto:
   ```bash
   cd App-Quitanda.com
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start
   ```

Use as opções que aparecerão no terminal para abrir no seu ambiente:
- `a` para Android
- `i` para iOS (apenas macOS)
- `w` para Web
- Escaneie o QR Code com o app **Expo Go** no seu celular físico.

## 📖 Documentação

Para mais informações sobre o funcionamento interno e arquitetura, consulte a pasta [`docs/`](./docs/):

- [Visão Geral](./docs/GERAL.md)
- [Funcionalidades](./docs/FUNCIONALIDADES.md)
- [Arquitetura](./docs/ARQUITETURA.md)
- [Estrutura de Rotas](./docs/ROTAS.md)
- [Credenciais de Acesso](./docs/ACESSO.md)

*(Opcional) Credenciais de Teste sugeridas:*
- **Celular**: `11999999999`
- **Senha**: `admin123`

---
*Quitanda.com - Conectando o campo à tecnologia.*
