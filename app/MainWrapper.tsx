"use client";

import { usePathname } from "next/navigation";

const NO_PADDING_ROUTES = ["/", "/login", "/onboarding"];

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noPadding = NO_PADDING_ROUTES.includes(pathname);

  return (
    <main
      className={
        noPadding
          ? "flex-1"
          : "flex-1 p-4 md:p-8 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-8"
      }
    >
      {children}
    </main>
  );
}
