# Gerenciamento de Estoque (`app/telas/produtos.tsx`)

Esta tela é responsável pelo cadastro técnico dos produtos do vendedor, com foco em dados de venda.

## Funcionalidades
- **Seleção do Produto**: Um modal que apresenta uma lista suspensa de nomes de produtos comuns.
- **Foto do Produto**: Opção para capturar uma foto com a câmera ou selecionar da galeria.
- **Preço de Venda**: Campo numérico para inserir o valor que o produto será vendido.
- **Feedback de Sucesso**: Alerta de confirmação após o cadastro.

## Detalhes Técnicos
- **`expo-image-picker`**: Biblioteca para acessar os recursos de imagem do dispositivo (câmera/galeria).
- **`Modal`**: Utilizado para a lista de seleção de nomes, economizando espaço na tela.
- **`FlatList`**: Renderiza os nomes de produtos sugeridos no modal de forma eficiente.
