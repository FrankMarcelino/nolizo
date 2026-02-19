# Modelo de dados - Despesa familiar e rateio

## Entidades

## `FamilyMember`

- `id: string`
- `name: string`
- `active: boolean`

## `Category`

- `id: string`
- `name: string`
- `type: entrada | saida`
- `isCustom: boolean`
- `isFavorite: boolean`

## `Expense`

- `id: string`
- `amount: number`
- `categoryId: string`
- `dueDate: string`
- `description?: string`
- `status: a_vencer | vencida | paga`
- `responsibleMemberIds: string[]`
- `splitMode: igual | percentual | valorFixo`
- `shares: ResponsibilityShare[]`

## `ResponsibilityShare`

- `memberId: string`
- `percentage?: number`
- `fixedAmount?: number`

## Regras de consistencia

- `responsibleMemberIds.length >= 1`
- `shares.length` deve ser igual ao numero de responsaveis quando houver mais de 1.
- `splitMode = igual` -> valores calculados automaticamente.
- `splitMode = percentual` -> soma de `percentage = 100`.
- `splitMode = valorFixo` -> soma de `fixedAmount = amount`.

## Observacao de produto

No MVP, a despesa nao aceita baixa parcial oficial. Projeções de cobertura parcial existem apenas na tela de Planejamento.
