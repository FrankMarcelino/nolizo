# Personal Finance (MVP Familiar)

Base inicial de dominio e infraestrutura para o app de controle financeiro familiar.

## Estrutura

- `src/domain`: regras de negocio de categorias, rateio e validacao de despesas.
- `specs/mvp`: documentos funcionais do MVP.
- `supabase`: config, migrations e seed do banco.
- `.github/workflows`: CI e deploy por GitHub Actions.

## Inicio rapido

```bash
npm install
npm run check
npm run test
```

## Deploy

Deploy do app e automatico pela integracao GitHub -> Vercel.
Detalhes de migrations e variaveis em `docs/infra-supabase-vercel-github.md`.
