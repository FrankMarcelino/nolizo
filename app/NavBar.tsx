"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { DESKTOP_NAV, MOBILE_NAV, isActive, HIDDEN_ROUTES } from "./nav-items";
import { NavIcon } from "./NavIcons";

export function NavBar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const hidden = HIDDEN_ROUTES.some((r) =>
    r === "/" ? pathname === "/" : pathname.startsWith(r)
  );
  if (hidden) return null;

  async function handleLogout() {
    await signOut({ redirectUrl: "/login" });
  }

  return (
    <>
      {/* Lateral: tablet e desktop */}
      <nav className="hidden md:flex flex-col w-56 border-r border-border bg-bg-card p-4 gap-1 shrink-0">
        <Link href="/dashboard" className="text-xl font-bold text-primary mb-6">
          Nolizo
        </Link>
        {DESKTOP_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-light text-primary"
                  : "text-text-muted hover:bg-primary-light hover:text-text"
              }`}
            >
              <NavIcon name={item.icon} className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-primary-light hover:text-text transition-colors text-left"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Barra inferior: celular */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-border bg-bg-card pt-2 pb-safe"
        aria-label="Navegacao principal"
      >
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[44px] min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-text-muted"
              }`}
            >
              <NavIcon name={item.icon} className="w-6 h-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
