# API - Expenses

## Endpoints

- `GET /api/health`
- `GET /api/expenses?familyId=<uuid>&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD`
- `POST /api/expenses`

## POST /api/expenses (body)

```json
{
  "familyId": "uuid",
  "amount": 320.5,
  "categoryId": "utilities",
  "description": "Conta de energia",
  "dueDate": "2026-02-28",
  "status": "a_vencer",
  "splitMode": "percentual",
  "responsibleMemberIds": ["uuid-1", "uuid-2"],
  "shares": [
    { "memberId": "uuid-1", "percentage": 60 },
    { "memberId": "uuid-2", "percentage": 40 }
  ]
}
```

## Regras principais

- `familyId`, `categoryId`, `dueDate` sao obrigatorios.
- Rateio segue os modos `igual`, `percentual`, `valorFixo`.
- Sem baixa parcial oficial no MVP: status `paga` so com quitacao total.
