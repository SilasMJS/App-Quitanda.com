# Acesso ao Sistema

O aplicativo **Quitanda.com** utiliza autenticação integrada via API.

## 🔐 Login
O acesso é realizado através do número de celular e senha cadastrados.
- **Formato do Celular**: `(XX) XXXXX-XXXX`
- **Ambiente de Desenvolvimento**: Certifique-se de que o backend esteja rodando para validar as credenciais.

## 📝 Cadastro
Novos usuários podem criar suas próprias contas diretamente pela tela de **Cadastro**:
1. Clique em "Criar uma conta" na tela inicial.
2. Preencha seus dados pessoais.
3. Escolha seu perfil (Vendedor ou apenas Usuário).
4. Selecione sua comunidade agrícola (se aplicável).

## 🚀 Administrador
Para acessar funcionalidades de gestão global (Comunidades, Catálogo Base), o usuário deve possuir a flag `tipo: ADMIN` no banco de dados.
- **Credencial Padrão Admin (Local)**:
  - **Celular**: `11999999999`
  - **Senha**: `admin123`

---
*Nota: A segurança é garantida via Tokens JWT armazenados de forma segura no dispositivo.*
