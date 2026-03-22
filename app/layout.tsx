import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "./NavBar";
import { MainWrapper } from "./MainWrapper";

export const metadata: Metadata = {
  title: "Nolizo - Financas da Familia",
  description: "Controle financeiro familiar intuitivo e visual.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <NavBar />
          <MainWrapper>{children}</MainWrapper>
        </div>
      </body>
    </html>
  );
}
