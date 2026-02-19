# UX - Cadastro de despesa familiar (MVP)

## Principios

- Priorizar rapidez de lancamento.
- Revelar complexidade apenas quando necessario.
- Evitar erro de rateio com feedback imediato.

## Fluxo principal

```mermaid
flowchart TD
start[Usuario abre NovaDespesa] --> basicFields[Preenche valor e categoria]
basicFields --> selectResp[Seleciona responsavel(is)]
selectResp --> oneResp{Apenas 1 responsavel?}
oneResp -->|Sim| autoSingle[Rateio implicito 100%]
oneResp -->|Nao| chooseSplit[Escolhe modo de rateio]
chooseSplit --> splitEqual[Igual]
chooseSplit --> splitPercent[Percentual]
chooseSplit --> splitFixed[ValorFixo]
splitEqual --> validate[Validacao em tempo real]
splitPercent --> validate
splitFixed --> validate
autoSingle --> validate
validate --> ready{Formulario valido?}
ready -->|Nao| showError[Mostrar erro objetivo]
ready -->|Sim| save[Salvar despesa]
```

## Comportamento por estado

### Estado A: responsavel unico

- Nao mostrar seletor de modo de rateio.
- Mostrar texto: "Responsabilidade total: 100%".
- Minimo de toques possivel.

### Estado B: multiplos responsaveis

- Exibir seletor de modo: `igual`, `percentual`, `valorFixo`.
- Exibir grade de rateio com nome de cada responsavel.
- Validar fechamento antes de habilitar botao de salvar.

## Regras de produtividade (MVP)

- Pre-selecionar:
  - ultima categoria usada para o mesmo tipo de despesa.
  - ultimo responsavel frequente quando houver padrao pessoal.
- Mostrar resumo compacto antes de salvar:
  - valor total,
  - categoria,
  - responsaveis e cotas.

## Mensagens e microcopy

- Quando faltar fechamento no rateio:
  - "Faltam R$ X,XX para fechar o total."
- Quando exceder no rateio:
  - "Rateio excede o valor em R$ X,XX."
- Quando fechar:
  - "Rateio fechado com sucesso."
