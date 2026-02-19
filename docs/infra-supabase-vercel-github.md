# Infraestrutura - Supabase + Vercel + GitHub

## Arquitetura

- **Banco**: Supabase (PostgreSQL). Migrations e seeds rodados manualmente.
- **Hospedagem**: Vercel com integracao nativa ao GitHub (deploy automatico no push).
- **CI**: GitHub Actions roda type check e testes em cada push/PR.

## Fluxo de deploy

1. Valida localmente com `npm run dev`.
2. Push para `main`.
3. GitHub Actions roda CI (check + test).
4. Vercel detecta o push e faz build/deploy automatico.

## Banco de dados

Migrations ficam em `supabase/migrations/` como referencia.
Seed fica em `supabase/seed.sql`.
Ambos sao aplicados **manualmente** no painel ou CLI do Supabase.

## Variaveis de ambiente

### Local (`.env`)

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### Vercel (painel do projeto)

Configurar as mesmas variaveis em Settings -> Environment Variables.
