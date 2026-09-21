import { describe, expect, it } from "vitest";
import { montarLembrete, type ContaLembrete } from "./lembretes";

function conta(over: Partial<ContaLembrete> = {}): ContaLembrete {
  return {
    description: "Aluguel",
    category_id: "housing",
    amount: 900,
    due_date: "2026-09-21",
    status: "a_vencer",
    ...over,
  };
}

const HOJE = "2026-09-21";

describe("montarLembrete", () => {
  it("devolve null quando nao ha nada a dizer", () => {
    expect(montarLembrete([], HOJE)).toBeNull();
  });

  it("devolve null quando tudo esta pago", () => {
    const r = montarLembrete(
      [conta({ due_date: "2026-09-10", status: "paga" })],
      HOJE
    );
    expect(r).toBeNull();
  });

  it("devolve null quando o vencimento e depois de amanha", () => {
    expect(montarLembrete([conta({ due_date: "2026-09-25" })], HOJE)).toBeNull();
  });

  it("avisa de uma conta que vence amanha", () => {
    const r = montarLembrete([conta({ due_date: "2026-09-22" })], HOJE);
    expect(r).not.toBeNull();
    expect(r!.titulo).toContain("amanha");
    expect(r!.corpo).toContain("Aluguel");
    expect(r!.corpo).toContain("900");
  });

  it("avisa de conta que vence HOJE, mas nao como se fosse amanha", () => {
    const r = montarLembrete([conta({ due_date: HOJE })], HOJE);
    expect(r).not.toBeNull();
    expect(r!.corpo).toContain("Hoje");
    expect(r!.corpo).toContain("Aluguel");
    expect(r!.titulo.toLowerCase()).not.toContain("amanha");
  });

  it("avisa de contas vencidas com a soma", () => {
    const r = montarLembrete(
      [
        conta({ due_date: "2026-09-10", amount: 900 }),
        conta({ due_date: "2026-09-15", amount: 100, description: "Luz" }),
      ],
      HOJE
    );
    expect(r).not.toBeNull();
    expect(r!.titulo).toContain("2");
    expect(r!.corpo).toContain("1.000");
  });

  it("vencidas tem prioridade no titulo sobre as de amanha", () => {
    const r = montarLembrete(
      [
        conta({ due_date: "2026-09-10", description: "Atrasada" }),
        conta({ due_date: "2026-09-22", description: "Amanha" }),
      ],
      HOJE
    );
    expect(r!.titulo.toLowerCase()).toContain("vencid");
  });

  it("menciona as duas situacoes no corpo quando ambas existem", () => {
    const r = montarLembrete(
      [
        conta({ due_date: "2026-09-10", description: "Atrasada" }),
        conta({ due_date: "2026-09-22", description: "Amanha" }),
      ],
      HOJE
    );
    expect(r!.corpo).toContain("Atrasada");
    expect(r!.corpo).toContain("Amanha");
  });

  it("usa a categoria quando a descricao esta vazia", () => {
    const r = montarLembrete(
      [conta({ due_date: "2026-09-22", description: null, category_id: "housing" })],
      HOJE
    );
    expect(r!.corpo).toContain("housing");
  });

  it("atravessa a virada de mes ao calcular amanha", () => {
    const r = montarLembrete([conta({ due_date: "2026-10-01" })], "2026-09-30");
    expect(r).not.toBeNull();
    expect(r!.titulo).toContain("amanha");
  });

  it("avisa de uma conta que vence hoje", () => {
    const r = montarLembrete(
      [conta({ due_date: HOJE, description: "Parcela" })],
      HOJE
    );
    expect(r).not.toBeNull();
    expect(r!.titulo.toLowerCase()).toContain("hoje");
    expect(r!.corpo).toContain("Parcela");
    expect(r!.titulo.toLowerCase()).not.toContain("amanha");
  });

  it("vencidas tem prioridade no titulo sobre as de hoje", () => {
    const r = montarLembrete(
      [
        conta({ due_date: "2026-09-10", description: "Atrasada" }),
        conta({ due_date: HOJE, description: "DoDia" }),
      ],
      HOJE
    );
    expect(r!.titulo.toLowerCase()).toContain("vencid");
    expect(r!.corpo).toContain("Atrasada");
    expect(r!.corpo).toContain("DoDia");
  });

  it("menciona as tres situacoes no corpo quando todas existem", () => {
    const r = montarLembrete(
      [
        conta({ due_date: "2026-09-10", description: "Atrasada" }),
        conta({ due_date: HOJE, description: "DoDia" }),
        conta({ due_date: "2026-09-22", description: "Amanha" }),
      ],
      HOJE
    );
    expect(r!.corpo).toContain("Atrasada");
    expect(r!.corpo).toContain("DoDia");
    expect(r!.corpo).toContain("Amanha");
  });
});
