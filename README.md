# Quitanda.com - App do Vendedor

![Expo](https://img.shields.io/badge/Expo-54.0.34-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

O **Quitanda.com** é um aplicativo mobile focado na gestão de vitrines digitais. Com ele, o vendedor pode gerenciar seus produtos, reservas e pagamentos de forma ágil e visual, funcionando como a ponte de controle entre o produtor e a loja virtual.

---

## 📖 Índice
- [Ecossistema do Projeto](#ecossistema-do-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Inicializar o Projeto](#como-inicializar-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## 🌍 Ecossistema do Projeto

Este App não trabalha de forma isolada. Ele faz parte de um ecossistema completo que compõe a plataforma Quitanda.com:

- **App Quitanda (Este repositório)**: Aplicativo mobile (React Native/Expo) voltado exclusivamente para os **vendedores** gerenciarem seus pedidos, produtos e receberem alertas em tempo real.
- **Backend API**: O cérebro do ecossistema que processa as regras de negócio, salva no banco e dispara as notificações Push para o App.
- **Frontend Web**: Plataforma voltada para o **cliente final**, onde é possível realizar o Checkout Dinâmico que cairá nas reservas do vendedor neste App.

---

## ⭐ Funcionalidades Principais

- **Gestão de Produtos**: Adicione itens com fotos e legendas de forma simples.
- **Controle de Reservas em Tempo Real**: Gerencie pedidos feitos através do site Web com **Notificações Push (Expo)**, alertando instantaneamente a cada nova reserva.
- **Histórico Financeiro**: Acompanhe todos os pagamentos e fluxo de caixa de forma clara.
- **Navegação Intuitiva**: Controle rápido entre o estoque e o painel utilizando Expo Router.

---

## 🚀 Tecnologias Utilizadas

- **React Native + Expo**: Para o desenvolvimento mobile multiplataforma produtivo.
- **Expo Router**: Roteamento baseado em arquivos (estrutura semelhante ao Next.js, mas para mobile).
- **TypeScript**: Tipagem estática para maior segurança e prevenção de bugs em tempo de compilação.
- **Axios**: Para requisições HTTP consumindo os serviços da Backend API.
- **Reanimated & Gesture Handler**: Motores robustos para animações fluídas e interações de toque nativas.

---

## ⚙️ Como Inicializar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
- [Expo Go](https://expo.dev/expo-go) instalado no seu smartphone, ou um emulador configurado (Android/iOS).

### Instalação e Execução

1. Acesse a pasta do projeto:
   `ash
   cd App-Quitanda.com
   `
2. Instale todas as dependências:
   `ash
   npm install
   `
3. Configure a URL da API (caso necessário) no código ou variável de ambiente apontando para o seu **Backend local** ou de produção.

4. Inicie o servidor do Expo:
   `ash
   npx expo start
   `

5. Durante a execução, o terminal exibirá opções interativas e um **QR Code**:
   -  para abrir no emulador Android
   - i para abrir no simulador iOS (apenas macOS)
   - Escaneie o **QR Code** com a câmera (iOS) ou app **Expo Go** (Android) para rodar nativamente no seu celular físico conectado na mesma rede Wi-Fi.

---

## 📁 Estrutura do Projeto e Documentação

Para mais informações sobre o funcionamento interno e arquitetura adotada, consulte os arquivos técnicos na pasta [docs/](./docs/):

- 📖 **[Visão Geral](./docs/GERAL.md)**
- ⚙️ **[Funcionalidades](./docs/FUNCIONALIDADES.md)**
- 📐 **[Arquitetura](./docs/ARQUITETURA.md)**
- 🛤️ **[Estrutura de Rotas](./docs/ROTAS.md)**
- 🔑 **[Credenciais de Acesso](./docs/ACESSO.md)**

*(Opcional) Credenciais de Teste Sugeridas:*
- **Celular**: 11999999999
- **Senha**: dmin123

---
*Quitanda.com - Conectando o campo à tecnologia.*
