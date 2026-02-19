import { describe, expect, it } from "vitest";
import { buildEqualShares, validateExpenseDraft } from "./financeModels";

describe("buildEqualShares", () => {
  it("divide igualmente e fecha centavos no ultimo responsavel", () => {
    const shares = buildEqualShares(100, ["u1", "u2", "u3"]);
    const total = shares.reduce((acc, share) => acc + (share.fixedAmount ?? 0), 0);

    expect(shares).toHaveLength(3);
    expect(total).toBe(100);
  });
});

describe("validateExpenseDraft", () => {
  it("retorna erro quando soma percentual difere de 100", () => {
    const issues = validateExpenseDraft({
      amount: 400,
      categoryId: "housing",
      responsibleMemberIds: ["u1", "u2"],
      splitMode: "percentual",
      shares: [
        { memberId: "u1", percentage: 60 },
        { memberId: "u2", percentage: 30 }
      ]
    });

    expect(issues.some((issue) => issue.code === "split.percentual.invalidTotal")).toBe(
      true
    );
  });

  it("retorna erro quando valor fixo nao fecha total", () => {
    const issues = validateExpenseDraft({
      amount: 300,
      categoryId: "utilities",
      responsibleMemberIds: ["u1", "u2"],
      splitMode: "valorFixo",
      shares: [
        { memberId: "u1", fixedAmount: 100 },
        { memberId: "u2", fixedAmount: 100 }
      ]
    });

    expect(issues.some((issue) => issue.code === "split.valorFixo.invalidTotal")).toBe(
      true
    );
  });

  it("nao gera erro com responsavel unico sem shares", () => {
    const issues = validateExpenseDraft({
      amount: 120,
      categoryId: "transport",
      responsibleMemberIds: ["u1"],
      splitMode: "igual",
      shares: []
    });

    expect(issues).toHaveLength(0);
  });
});
