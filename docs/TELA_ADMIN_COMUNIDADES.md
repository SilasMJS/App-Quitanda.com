# Gestão de Comunidades (`app/telas/admin/comunidades.tsx`)

Tela exclusiva para usuários com perfil `ADMIN`, permitindo o gerenciamento das comunidades agrícolas integradas ao sistema.

## Funcionalidades
- **Listagem Geral**: Visualização de todas as comunidades cadastradas, com informações de localidade.
- **Navegação para Cadastro**: Botão flutuante ou de destaque para acessar a tela de criação de nova comunidade.
- **Busca/Filtro**: Facilita a localização de comunidades específicas (conforme implementado).

## Tela de Nova Comunidade (`app/telas/admin/nova-comunidade.tsx`)
- **Formulário de Cadastro**: Coleta Nome da Comunidade, Descrição e Localização.
- **Validação**: Garante que não existam comunidades duplicadas ou com dados faltantes.

## Detalhes Técnicos
- **`comunidadesService`**: Utilizado para todas as operações de CRUD (Create, Read, Update, Delete).
- **Proteção de Rota**: Apenas usuários com `user.tipo === 'ADMIN'` conseguem visualizar os links para estas telas no Dashboard.
