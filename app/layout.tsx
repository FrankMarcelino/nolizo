import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { NavBar } from "./NavBar";
import { MainWrapper } from "./MainWrapper";

export const metadata: Metadata = {
  title: "Nolizo - Financas da Familia",
  description: "Controle financeiro familiar intuitivo e visual.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f19",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className="min-h-screen">
          <div className="flex min-h-screen">
            <NavBar />
            <MainWrapper>{children}</MainWrapper>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
