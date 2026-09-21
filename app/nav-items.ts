export type IconName = "agenda" | "painel" | "extrato" | "nova" | "plano" | "config";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

/** Rotas onde a navegacao nao deve aparecer. */
export const HIDDEN_ROUTES = ["/", "/login", "/onboarding"];

/**
 * Menu lateral (tablet/desktop).
 */
export const DESKTOP_NAV: NavItem[] = [
  { href: "/mes", label: "Mes", icon: "agenda" },
  { href: "/dashboard", label: "Painel", icon: "painel" },
  { href: "/extrato", label: "Extrato", icon: "extrato" },
  { href: "/despesas/nova", label: "Nova despesa", icon: "nova" },
  { href: "/entradas/nova", label: "Nova entrada", icon: "nova" },
  { href: "/planejamento", label: "Planejamento", icon: "plano" },
  { href: "/desejos", label: "Desejos", icon: "plano" },
  { href: "/patrimonio", label: "Patrimonio", icon: "plano" },
  { href: "/configuracoes", label: "Configuracoes", icon: "config" },
];

/** Barra inferior (celular). No maximo 5 itens — mais que isso nao cabe. */
export const MOBILE_NAV: NavItem[] = [
  { href: "/mes", label: "Mes", icon: "agenda" },
  { href: "/despesas/nova", label: "Lancar", icon: "nova" },
  { href: "/dashboard", label: "Painel", icon: "painel" },
  { href: "/extrato", label: "Extrato", icon: "extrato" },
  { href: "/configuracoes", label: "Config", icon: "config" },
];

function stripTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Um item esta ativo no caminho exato ou quando a rota atual e uma
 * subrota dele. A comparacao e por SEGMENTO: "/extratos-antigos" nao
 * ativa "/extrato".
 */
export function isActive(pathname: string, href: string): boolean {
  const current = stripTrailingSlash(pathname);
  const target = stripTrailingSlash(href);

  if (target === "/") return current === "/";
  if (current === target) return true;

  return current.startsWith(target + "/");
}
