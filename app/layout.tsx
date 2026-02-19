import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nolizo - Financas da Familia",
  description: "Controle financeiro familiar intuitivo e visual.",
};

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/despesas/nova", label: "Nova Despesa" },
  { href: "/entradas/nova", label: "Nova Entrada" },
  { href: "/extrato", label: "Extrato" },
  { href: "/planejamento", label: "Planejamento" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <nav className="hidden md:flex flex-col w-56 border-r border-border bg-bg-card p-4 gap-1">
            <a href="/" className="text-xl font-bold text-primary mb-6">
              Nolizo
            </a>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-primary-light hover:text-text transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border flex justify-around py-3 z-50">
          <MobileLink href="/" label="Inicio" />
          <MobileLink href="/despesas/nova" label="Despesa" />
          <MobileLink href="/entradas/nova" label="Entrada" />
          <MobileLink href="/extrato" label="Extrato" />
          <MobileLink href="/planejamento" label="Plano" />
        </nav>
      </body>
    </html>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-xs font-medium text-text-muted hover:text-primary transition-colors"
    >
      {label}
    </a>
  );
}
