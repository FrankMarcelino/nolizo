export default function Home() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">Nolizo</h1>
      <p className="text-text-muted text-lg mb-8">
        Controle financeiro da familia. Simples, visual e direto ao ponto.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <NavCard
          href="/despesas/nova"
          title="Nova Despesa"
          desc="Cadastre uma conta ou despesa rapidamente."
        />
        <NavCard
          href="/entradas/nova"
          title="Nova Entrada"
          desc="Registre salarios, freelances e outras receitas."
        />
        <NavCard
          href="/extrato"
          title="Extrato"
          desc="Veja todas as movimentacoes por periodo."
        />
        <NavCard
          href="/planejamento"
          title="Planejamento"
          desc="Kanban de dividas com barra de cobertura."
        />
      </div>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl bg-bg-card border border-border p-6 hover:border-primary transition-colors"
    >
      <h2 className="font-semibold text-lg mb-1">{title}</h2>
      <p className="text-sm text-text-muted">{desc}</p>
    </a>
  );
}
