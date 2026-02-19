# Regras de validacao - Cadastro de despesas familiar

## Objetivo

Garantir consistencia do cadastro de despesas quando houver um ou mais responsaveis da familia.

## Regras gerais

- `valor` deve ser maior que zero.
- `categoria` e obrigatoria e precisa ser do tipo `saida`.
- `responsaveis` deve conter ao menos 1 membro ativo.
- Nao pode repetir o mesmo membro na lista de responsaveis.

## Rateio por modo

### 1) Modo `igual`

- Disponivel quando existe mais de 1 responsavel.
- O sistema divide automaticamente por numero de responsaveis.
- Ajuste de centavos acontece no ultimo responsavel para fechar exatamente o total.
- Usuario nao edita manualmente os valores nesse modo.

### 2) Modo `percentual`

- Soma dos percentuais precisa fechar em `100%`.
- Nenhum percentual pode ser negativo.
- Campos obrigatorios para todos os responsaveis.

### 3) Modo `valorFixo`

- Soma dos valores fixos precisa fechar exatamente o valor total da despesa.
- Nenhum valor fixo pode ser negativo.
- Campos obrigatorios para todos os responsaveis.

## Regra de status financeiro da despesa

- Nao existe pagamento parcial no MVP como baixa oficial.
- A despesa so muda para `paga` quando atingir `100%` do valor quitado.
- Caso exista cobertura parcial prevista no planejamento, exibir apenas como projeção:
  - `falta_cobrir = valor_total - cobertura_prevista`
  - sem alterar status real da despesa.

## Exclusao de membros

- Membro da familia nao pode ser removido se tiver pendencias ativas atribuídas.
- Antes da exclusao, pendencias devem ser:
  - quitadas, ou
  - reatribuídas para outro membro.

## Mensagens de erro recomendadas

- "Valor da despesa deve ser maior que zero."
- "Defina ao menos um responsavel."
- "Nao e permitido repetir responsaveis."
- "No modo percentual, a soma deve ser 100%."
- "No modo valor fixo, a soma do rateio deve fechar o valor total."
