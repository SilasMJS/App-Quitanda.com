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
- [Build de Produção (EAS)](#️-build-de-produção-eas)
- [Estrutura do Projeto](#estrutura-do-projeto-e-documentação)

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

> **Atenção:** desde a SDK 53 do Expo, o app Expo Go **não suporta mais notificações push remotas no Android**. Para testar o fluxo completo de notificações é necessário instalar um build real (veja a seção [Build de Produção](#️-build-de-produção-eas) abaixo) — as demais funcionalidades funcionam normalmente no Expo Go.

### Instalação e Execução

1. Acesse a pasta do projeto:
   ```bash
   cd App-Quitanda.com
   ```
2. Instale todas as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente baseando-se no arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   > Se for testar num celular físico com Expo Go, use o IP interno da sua máquina onde o backend está rodando (ex: `http://192.168.1.100:8000`) — `localhost` não funciona nesse caso, pois aponta para o próprio celular.

4. Inicie o servidor do Expo:
   ```bash
   npx expo start
   ```

5. Durante a execução, o terminal exibirá opções interativas e um **QR Code**:
   - `a` para abrir no emulador Android
   - `i` para abrir no simulador iOS (apenas macOS)
   - Escaneie o **QR Code** com a câmera (iOS) ou app **Expo Go** (Android) para rodar nativamente no seu celular físico conectado na mesma rede Wi-Fi.

---

## ☁️ Build de Produção (EAS)

O app é compilado em um APK instalável através do [EAS Build](https://docs.expo.dev/build/introduction/) da Expo. Ele não é publicado nas lojas (Google Play/App Store) — a distribuição é interna, direto pelo arquivo `.apk`.

### Variável de ambiente
- `EXPO_PUBLIC_API_URL`: URL do backend que o app vai consumir. Já vem configurada em `.env.example` apontando para a API de produção (`https://quitanda-api.onrender.com`).

### Gerando um novo build

```bash
npx eas-cli build -p android --profile preview
```

O perfil `preview` (definido em `eas.json`) gera um APK de distribuição interna, pronto para instalar direto no celular assim que o build terminar (link de download aparece no terminal e no [painel do EAS](https://expo.dev)).

### Notificações Push (Firebase/FCM) — pendente

Notificações push no Android exigem um projeto Firebase configurado (`google-services.json` incluído no projeto + credenciais de conta de serviço FCM enviadas ao EAS via `eas credentials`). **Essa configuração ainda não foi feita neste projeto** — sem ela, o app funciona normalmente em todos os outros aspectos, mas o token de push nunca é gerado no dispositivo e as notificações não chegam na bandeja do celular. O badge de reservas dentro do app continua funcionando normalmente ao abrir a tela.

### ✅ Testado em produção

Múltiplos builds foram gerados via EAS ao longo desta fase de desenvolvimento (perfil `preview`, distribuição interna, SDK 54) e testados em dispositivo físico Android: o APK instala e roda corretamente, consumindo a API de produção no Render, com os fluxos de login, cadastro, gestão de produtos, reservas e pagamentos validados. A configuração de Firebase/FCM para notificações push (item acima) ainda está pendente.

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
- **Senha**: admin123

---
*Quitanda.com - Conectando o campo à tecnologia.*
