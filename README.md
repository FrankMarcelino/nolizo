# Personal Finance (MVP Familiar)

App de controle financeiro familiar.

## Estrutura

- `src/domain`: regras de negocio (categorias, rateio, validacao).
- `src/api`: servicos de acesso ao Supabase.
- `src/lib`: cliente Supabase e utilitarios.
- `api/`: serverless functions (Vercel).
- `supabase/`: migrations e seed (rodados manualmente no Supabase).
- `specs/mvp`: documentos funcionais do MVP.

## Rodar localmente

1) Configure `.env` na raiz com:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

2) Instale e suba:

```bash
npm install
npm run dev
```

3) Teste:

```bash
curl http://localhost:3333/api/health
```

## Fluxo de trabalho

1. Desenvolve e testa localmente com `npm run dev`.
2. Faz push para `main` no GitHub.
3. Vercel detecta o push e faz deploy automaticamente.
4. Migrations e seeds do Supabase sao aplicados manualmente.

## Scripts

- `npm run dev` — servidor local na porta 3333
- `npm run check` — type check
- `npm run test` — testes

## API

- `GET /api/health`
- `GET /api/expenses?familyId=<uuid>`
- `POST /api/expenses`

Detalhes em `docs/api-expenses.md`.
