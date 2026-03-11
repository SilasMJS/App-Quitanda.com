# Tela de Login (`app/index.tsx`)

Esta é a porta de entrada do aplicativo. Ela foi projetada para ser simples, segura e visualmente alinhada com a marca.

## Funcionalidades
- **Mascara de Celular**: Formata automaticamente o número enquanto o usuário digita no padrão `(XX) XXXXX-XXXX`.
- **Validação de Credenciais**: Verifica se o celular e a senha correspondem aos dados de teste.
- **Segurança Visual**: Campo de senha com `secureTextEntry` para ocultar os caracteres.
- **Fundo Branco Adaptável**: Utiliza cálculos de dimensão da tela para garantir que o fundo branco ocupe 100% da altura, independente do dispositivo.

## Detalhes Técnicos
- **`KeyboardAvoidingView`**: Garante que o teclado não cubra os campos de entrada em dispositivos menores.
- **`Dimensions`**: Usado para garantir que o container ocupe toda a altura da janela.
- **`router.replace`**: Utilizado após o login para que o usuário não consiga voltar para a tela de login usando o botão "voltar" do sistema.
