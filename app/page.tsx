export default function Home() {
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-4">Nolizo</h1>
      <p className="text-text-muted text-lg mb-8">
        Controle financeiro da familia. Simples, visual e direto ao ponto.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <NavCard
          href="/dashboard"
          title="Dashboard"
          desc="Visao geral com graficos e metricas."
          highlight
        />
        <NavCard
          href="/planejamento"
          title="Planejamento"
          desc="Kanban de dividas com barra de cobertura."
        />
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
          href="/desejos"
          title="Desejos"
          desc="Liste o que voce quer adquirir e priorize."
        />
        <NavCard
          href="/patrimonio"
          title="Patrimonio"
          desc="Cadastre bens e veja o total do patrimonio."
        />
        <NavCard
          href="/configuracoes"
          title="Configuracoes"
          desc="Configure sua familia e membros."
        />
      </div>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  highlight,
}: {
  href: string;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block rounded-xl border p-6 transition-colors ${
        highlight
          ? "bg-primary text-bg border-primary hover:bg-primary-hover"
          : "bg-bg-card border-border hover:border-primary"
      }`}
    >
      <h2 className="font-semibold text-lg mb-1">{title}</h2>
      <p className={`text-sm ${highlight ? "text-bg/80" : "text-text-muted"}`}>
        {desc}
      </p>
    </a>
  );
}
