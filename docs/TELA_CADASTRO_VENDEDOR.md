# Tela de Cadastro de Vendedor (`app/cadastro-vendedor.tsx`)

Esta tela é utilizada para completar os dados obrigatórios de um vendedor que ainda não preencheu seu endereço e informações fiscais/Pix.

## Funcionalidades
- **Busca de CEP**: Integração com a API ViaCEP para preenchimento automático de logradouro, bairro, cidade e estado.
- **Dados de Localização**: Coleta detalhada de endereço (Rua, Número, Bairro, Cidade, Estado).
- **Vínculo com Comunidade**: Permite que o vendedor selecione ou altere sua comunidade agrícola.
- **Validação de Campos**: Garante que todos os dados essenciais para a operação de entrega e pagamento estejam presentes.

## Detalhes Técnicos
- **`fetch` (ViaCEP)**: Utilizado para agilizar o preenchimento do formulário.
- **`vendedoresService.completarCadastro()`**: Envia os dados estruturados para o backend.
- **Navegação Condicional**: Frequentemente acessada via banner de alerta na tela de Perfil.
