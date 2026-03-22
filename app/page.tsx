"use client";

import { useEffect, useState } from "react";

const FEATURES = [
  {
    icon: "📊",
    title: "Dashboard Inteligente",
    desc: "Visão geral do mês com gráficos de tendência, categorias e status das contas em um só lugar.",
  },
  {
    icon: "📋",
    title: "Planejamento Kanban",
    desc: "Organize suas dívidas por prioridade híbrida: urgência, juros e dias de atraso calculados automaticamente.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Gestão Familiar",
    desc: "Adicione membros da família, divida despesas por igual, percentual ou valor fixo entre os responsáveis.",
  },
  {
    icon: "🔄",
    title: "Despesas Recorrentes",
    desc: "Cadastre parcelamentos em até 60x, contratos com vigência e despesas mensais ou anuais automáticas.",
  },
  {
    icon: "💎",
    title: "Patrimônio e Desejos",
    desc: "Acompanhe seus bens, invista em objetivos e gerencie a lista de desejos da família com prioridade.",
  },
  {
    icon: "📑",
    title: "Extrato Completo",
    desc: "Histórico unificado de entradas e saídas com filtros por período, balanço e resumo financeiro.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Crie sua conta",
    desc: "Cadastro rápido com email e senha. Sem cartão de crédito.",
  },
  {
    num: "02",
    title: "Configure sua família",
    desc: "Dê um nome para sua família e adicione os membros. Cada um pode ter suas próprias despesas.",
  },
  {
    num: "03",
    title: "Tome o controle",
    desc: "Cadastre receitas, despesas, parcelamentos e acompanhe tudo no dashboard.",
  },
];

export default function LandingPage() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((json) => { if (json.userId) setIsAuth(true); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Nolizo</span>

          <nav className="hidden md:flex items-center gap-6 text-sm text-text-muted">
            <a href="#funcionalidades" className="hover:text-text transition-colors">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="hover:text-text transition-colors">
              Como funciona
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuth ? (
              <a
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Ir ao app →
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm text-text-muted hover:text-text transition-colors"
                >
                  Entrar
                </a>
                <a
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  Criar conta grátis
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Controle financeiro familiar
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
          Suas finanças,{" "}
          <span className="text-primary">sua família,</span>
          <br />
          no mesmo lugar.
        </h1>

        <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-10 leading-relaxed">
          Organize despesas, receitas e parcelamentos da família inteira.
          Dashboard visual, planejamento inteligente e controle real do seu dinheiro.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {isAuth ? (
            <a
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl bg-primary text-bg text-base font-semibold hover:bg-primary-hover transition-colors"
            >
              Abrir Dashboard →
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="px-8 py-3.5 rounded-xl bg-primary text-bg text-base font-semibold hover:bg-primary-hover transition-colors"
              >
                Começar agora — é grátis
              </a>
              <a
                href="#como-funciona"
                className="px-8 py-3.5 rounded-xl border border-border text-text-muted text-base font-medium hover:border-primary hover:text-text transition-colors"
              >
                Como funciona
              </a>
            </>
          )}
        </div>

        {/* Hero visual */}
        <div className="mt-16 w-full max-w-4xl">
          <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
            {/* Fake dashboard preview */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-3 h-3 rounded-full bg-danger/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-2 text-xs text-text-muted">Dashboard — Março 2026</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Entradas", value: "R$ 8.500", color: "text-success" },
                { label: "Despesas", value: "R$ 5.230", color: "text-danger" },
                { label: "Pagas", value: "R$ 3.100", color: "text-primary" },
                { label: "Saldo", value: "R$ 3.270", color: "text-text" },
              ].map((card) => (
                <div key={card.label} className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-text-muted mb-1">{card.label}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl bg-bg h-28 flex items-end p-3 gap-1">
                {[40, 65, 50, 80, 55, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                    <div
                      className="w-full rounded-sm bg-primary/30"
                      style={{ height: `${h * 0.6}%` }}
                    />
                    <div
                      className="w-full rounded-sm bg-success/40"
                      style={{ height: `${h * 0.4}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-bg p-3 flex flex-col gap-2 min-w-32">
                <p className="text-xs text-text-muted">Por categoria</p>
                {["Moradia", "Alimentação", "Transporte"].map((cat, i) => (
                  <div key={cat} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: ["#d4a647", "#34d399", "#6b7a94"][i],
                      }}
                    />
                    <span className="text-xs text-text-muted">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que sua família precisa
            </h2>
            <p className="text-text-muted text-lg max-w-xl mx-auto">
              De despesas fixas a parcelamentos, do planejamento ao patrimônio — tudo em um app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-bg-card p-6 hover:border-primary/40 transition-colors group"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-4 bg-bg-card border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simples de começar
            </h2>
            <p className="text-text-muted text-lg">
              Em menos de 5 minutos você já tem tudo configurado.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-[-calc(50%-2rem)] h-px bg-border" />
                )}
                <div className="w-12 h-12 rounded-full bg-primary-light border border-primary/30 flex items-center justify-center text-primary font-bold text-sm mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-border text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para organizar{" "}
            <span className="text-primary">as finanças da família?</span>
          </h2>
          <p className="text-text-muted text-lg mb-8">
            Gratuito. Sem cartão. Comece agora.
          </p>
          {isAuth ? (
            <a
              href="/dashboard"
              className="inline-block px-10 py-4 rounded-xl bg-primary text-bg text-base font-semibold hover:bg-primary-hover transition-colors"
            >
              Abrir Dashboard →
            </a>
          ) : (
            <a
              href="/login"
              className="inline-block px-10 py-4 rounded-xl bg-primary text-bg text-base font-semibold hover:bg-primary-hover transition-colors"
            >
              Criar conta grátis →
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-primary font-bold text-lg">Nolizo</span>
          <p className="text-text-muted text-sm">
            Controle financeiro familiar — feito com cuidado.
          </p>
        </div>
      </footer>
    </div>
  );
}
