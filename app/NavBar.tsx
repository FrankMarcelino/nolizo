"use client";

import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planejamento", label: "Planejamento" },
  { href: "/despesas/nova", label: "Nova Despesa" },
  { href: "/entradas/nova", label: "Nova Entrada" },
  { href: "/extrato", label: "Extrato" },
  { href: "/desejos", label: "Desejos" },
  { href: "/patrimonio", label: "Patrimonio" },
  { href: "/configuracoes", label: "Configuracoes" },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/planejamento", label: "Plano" },
  { href: "/despesas/nova", label: "Despesa" },
  { href: "/extrato", label: "Extrato" },
  { href: "/configuracoes", label: "Config" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login" || pathname === "/" || pathname.startsWith("/onboarding")) return null;

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav className="hidden md:flex flex-col w-56 border-r border-border bg-bg-card p-4 gap-1 shrink-0">
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
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-primary-light hover:text-text transition-colors text-left"
          >
            Sair
          </button>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border flex justify-around py-3 z-50">
        {MOBILE_NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-xs font-medium text-text-muted hover:text-primary transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
