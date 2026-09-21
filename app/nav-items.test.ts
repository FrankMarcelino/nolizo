import { describe, expect, it } from "vitest";
import { DESKTOP_NAV, MOBILE_NAV, isActive, HIDDEN_ROUTES } from "./nav-items";

describe("config de navegacao", () => {
  it("nao repete href no menu desktop", () => {
    const hrefs = DESKTOP_NAV.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("nao repete href no menu mobile", () => {
    const hrefs = MOBILE_NAV.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("mantem a barra inferior com no maximo 5 itens", () => {
    expect(MOBILE_NAV.length).toBeLessThanOrEqual(5);
  });

  it("todo item tem href absoluto e rotulo nao vazio", () => {
    for (const item of [...DESKTOP_NAV, ...MOBILE_NAV]) {
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("os menus nao estao vazios", () => {
    expect(DESKTOP_NAV.length).toBeGreaterThan(0);
    expect(MOBILE_NAV.length).toBeGreaterThan(0);
  });

  it("a agenda e o primeiro item da barra inferior", () => {
    expect(MOBILE_NAV[0].href).toBe("/mes");
  });
});

describe("isActive", () => {
  it("marca ativo no caminho exato", () => {
    expect(isActive("/dashboard", "/dashboard")).toBe(true);
  });

  it("marca ativo em subrota", () => {
    expect(isActive("/despesas/nova", "/despesas")).toBe(true);
  });

  it("nao marca ativo em prefixo parcial de outro segmento", () => {
    expect(isActive("/extratos-antigos", "/extrato")).toBe(false);
  });

  it("nao marca ativo em caminho diferente", () => {
    expect(isActive("/extrato", "/dashboard")).toBe(false);
  });

  it("trata a raiz sem casar com tudo", () => {
    expect(isActive("/dashboard", "/")).toBe(false);
    expect(isActive("/", "/")).toBe(true);
  });

  it("ignora barra final", () => {
    expect(isActive("/dashboard/", "/dashboard")).toBe(true);
  });
});

describe("HIDDEN_ROUTES", () => {
  it("esconde a navegacao em login, raiz e onboarding", () => {
    expect(HIDDEN_ROUTES).toContain("/login");
    expect(HIDDEN_ROUTES).toContain("/");
    expect(HIDDEN_ROUTES).toContain("/onboarding");
  });
});
