# Infraestrutura de deploy - Supabase + Vercel + GitHub

## Arquitetura alvo

- Banco: Supabase (PostgreSQL + migrations SQL versionadas em `supabase/migrations`).
- Hospedagem app: Vercel com integracao nativa ao GitHub.
- Orquestração de CI/CD: GitHub Actions.

## Fluxo de deploy

1. Push para `main`.
2. Workflow `CI` valida tipos e testes.
3. Workflow `Deploy Database` aplica migrations no Supabase remoto.
4. Vercel detecta o push no GitHub e realiza build/deploy automaticamente.

## Secrets obrigatórios no GitHub

Configurar em `Settings -> Secrets and variables -> Actions`:

- `SUPABASE_DB_URL`

Nao e necessario configurar secrets da Vercel no GitHub quando a integracao GitHub <-> Vercel estiver ativa.

## Comandos locais recomendados

```bash
npm install
npm run check
npm run test
```

## Supabase local (opcional para desenvolvimento)

```bash
supabase start
supabase db reset
```

## Observações importantes

- O seed inicial de categorias está em `supabase/seed.sql`.
- O app já considera modelo de rateio familiar (`igual`, `percentual`, `valorFixo`).
- No MVP, baixa parcial de despesa não muda status real para `paga`.
