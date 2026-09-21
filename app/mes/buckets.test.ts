import { describe, expect, it } from "vitest";
import { agrupar, bucketDe, hojeLocal, somarDias, type AgendaItem } from "./buckets";

function conta(over: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id: "x",
    description: "Aluguel",
    categoryId: "moradia",
    amount: 900,
    date: "2026-09-20",
    status: "a_vencer",
    ...over,
  };
}

describe("hojeLocal", () => {
  it("usa a data LOCAL, nao UTC", () => {
    // 20/09/2026 as 22h em UTC-3 ainda e dia 20 localmente.
    // toISOString() daria 2026-09-21 e jogaria a conta no balde errado.
    const d = new Date(2026, 8, 20, 22, 0, 0);
    expect(hojeLocal(d)).toBe("2026-09-20");
  });

  it("preenche mes e dia com zero a esquerda", () => {
    expect(hojeLocal(new Date(2026, 0, 5, 12, 0, 0))).toBe("2026-01-05");
  });
});

describe("somarDias", () => {
  it("soma dentro do mes", () => {
    expect(somarDias("2026-09-20", 7)).toBe("2026-09-27");
  });

  it("atravessa a virada de mes", () => {
    expect(somarDias("2026-09-28", 7)).toBe("2026-10-05");
  });

  it("atravessa a virada de ano", () => {
    expect(somarDias("2026-12-29", 7)).toBe("2027-01-05");
  });

  it("respeita ano bissexto", () => {
    expect(somarDias("2028-02-27", 3)).toBe("2028-03-01");
  });
});

describe("bucketDe", () => {
  const hoje = "2026-09-20";

  it("conta paga vai para pago, mesmo vencida", () => {
    expect(bucketDe(conta({ date: "2026-09-01", status: "paga" }), hoje)).toBe("pago");
  });

  it("vencimento anterior a hoje e atrasado", () => {
    expect(bucketDe(conta({ date: "2026-09-19" }), hoje)).toBe("atrasado");
  });

  it("vencimento hoje entra em estaSemana, nao em atrasado", () => {
    expect(bucketDe(conta({ date: "2026-09-20" }), hoje)).toBe("estaSemana");
  });

  it("vencimento em 7 dias ainda e estaSemana", () => {
    expect(bucketDe(conta({ date: "2026-09-27" }), hoje)).toBe("estaSemana");
  });

  it("vencimento em 8 dias e depois", () => {
    expect(bucketDe(conta({ date: "2026-09-28" }), hoje)).toBe("depois");
  });

  it("status vencida no banco nao sobrepoe a data", () => {
    // O banco pode ter status desatualizado; a data manda.
    expect(bucketDe(conta({ date: "2026-10-15", status: "vencida" }), hoje)).toBe("depois");
  });
});

describe("agrupar", () => {
  const hoje = "2026-09-20";

  it("separa nos quatro baldes", () => {
    const g = agrupar(
      [
        conta({ id: "a", date: "2026-09-10" }),
        conta({ id: "b", date: "2026-09-22" }),
        conta({ id: "c", date: "2026-10-30" }),
        conta({ id: "d", date: "2026-09-05", status: "paga" }),
      ],
      hoje
    );
    expect(g.atrasado.map((i) => i.id)).toEqual(["a"]);
    expect(g.estaSemana.map((i) => i.id)).toEqual(["b"]);
    expect(g.depois.map((i) => i.id)).toEqual(["c"]);
    expect(g.pago.map((i) => i.id)).toEqual(["d"]);
  });

  it("ordena cada balde por data crescente", () => {
    const g = agrupar(
      [
        conta({ id: "tarde", date: "2026-09-26" }),
        conta({ id: "cedo", date: "2026-09-21" }),
      ],
      hoje
    );
    expect(g.estaSemana.map((i) => i.id)).toEqual(["cedo", "tarde"]);
  });

  it("devolve os quatro baldes mesmo sem itens", () => {
    const g = agrupar([], hoje);
    expect(Object.keys(g).sort()).toEqual(["atrasado", "depois", "estaSemana", "pago"]);
    expect(g.atrasado).toEqual([]);
  });
});
