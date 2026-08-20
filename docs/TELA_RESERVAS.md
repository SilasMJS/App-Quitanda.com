# Tela de Reservas (`app/telas/reservas.tsx`)

## Objetivo
A tela de Reservas é o local onde o vendedor parceiro visualiza e gerencia os pedidos realizados pelos clientes finais através do site principal da Quitanda.com.

## Funcionalidades
1. **Listagem de Reservas**: Exibe uma lista de pedidos pendentes com identificação clara do comprador.
2. **Visualização de Detalhes**: Cada card apresenta um resumo com o nome do cliente, quantidade de itens, produtos, total e as **Observações/Recados** deixadas pelo cliente no momento da compra.
3. **Fluxo de Decisão**:
    - **Confirmar Reserva**: Abre um modal de confirmação que assegura a continuidade do pedido.
    - **Recusar Reserva**: Abre um modal permitindo o vendedor selecionar o motivo da recusa (ex: "Item esgotado").
4. **Navegação Uniforme**: Possui o cabeçalho padrão com a logomarca da Quitanda e botão de retornar ("VOLTAR").

## Fluxo
1. Vendedor acessa pelo grande botão "RESERVAS" no Dashboard.
2. Clica em "CONFIRMAR" ou "RECUSAR" e interage com os modais subsequentes.

## Observações de Layout
O design utiliza cores institucionais (Verde Esmeralda e Verde Menta) seguindo o protótipo do Figma, apresentando modais com animação de `fade` no plano de fundo.