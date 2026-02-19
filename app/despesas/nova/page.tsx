"use client";

import { useEffect, useState, useCallback } from "react";

type Category = {
  id: string;
  name: string;
  type: string;
  is_custom: boolean;
  is_favorite: boolean;
};

type FamilyMember = {
  id: string;
  name: string;
  email: string | null;
  active: boolean;
};

type SplitMode = "igual" | "percentual" | "valorFixo";
type Recurrence = "unica" | "mensal" | "anual" | "parcelado";

const CATEGORY_ICONS: Record<string, string> = {
  housing: "\u{1F3E0}",
  utilities: "\u{1F4A1}",
  groceries: "\u{1F6D2}",
  dining_out: "\u{1F37D}",
  transport: "\u{1F697}",
  health: "\u{2695}",
  education: "\u{1F393}",
  debts_loans: "\u{1F4B3}",
  credit_card: "\u{1F4B8}",
  taxes_fees: "\u{1F4C4}",
  insurance: "\u{1F6E1}",
  leisure: "\u{1F3AE}",
  subscriptions: "\u{1F4F1}",
  personal_care: "\u{2728}",
  clothing: "\u{1F455}",
  children_family: "\u{1F46A}",
  pets: "\u{1F43E}",
  home_maintenance: "\u{1F527}",
  travel: "\u{2708}",
  donations: "\u{2764}",
  investments_contribution: "\u{1F4C8}",
  other_expense: "\u{2022}\u{2022}\u{2022}",
};

const FAMILY_ID = typeof window !== "undefined"
  ? localStorage.getItem("familyId") ?? ""
  : "";

export default function NovaDespesaPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyId, setFamilyId] = useState(FAMILY_ID);

  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("unica");
  const [dueDate, setDueDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("igual");
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setCategories(
            json.data.filter((c: Category) => c.type === "saida")
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!familyId) return;
    localStorage.setItem("familyId", familyId);
    fetch(`/api/family-members?familyId=${familyId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setMembers(json.data);
      })
      .catch(() => {});
  }, [familyId]);

  const toggleMember = useCallback((memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  const selectAllMembers = useCallback(() => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  }, [members, selectedMembers.length]);

  function buildShares() {
    if (selectedMembers.length <= 1) return undefined;
    if (splitMode === "igual") return undefined;

    if (splitMode === "percentual") {
      return selectedMembers.map((id) => ({
        memberId: id,
        percentage: Number(percentages[id] ?? 0),
      }));
    }

    return selectedMembers.map((id) => ({
      memberId: id,
      fixedAmount: Number(fixedAmounts[id] ?? 0),
    }));
  }

  function splitSummary(): string | null {
    if (selectedMembers.length <= 1) return null;
    if (splitMode === "igual") {
      const val = Number(amount || 0) / selectedMembers.length;
      return `Cada responsavel paga R$ ${val.toFixed(2)}`;
    }
    if (splitMode === "percentual") {
      const total = selectedMembers.reduce(
        (sum, id) => sum + Number(percentages[id] ?? 0),
        0
      );
      if (Math.abs(total - 100) > 0.01)
        return `Soma: ${total.toFixed(1)}% (deve ser 100%)`;
      return "Rateio fechado";
    }
    const total = selectedMembers.reduce(
      (sum, id) => sum + Number(fixedAmounts[id] ?? 0),
      0
    );
    const diff = Number(amount || 0) - total;
    if (Math.abs(diff) > 0.01) return `Faltam R$ ${diff.toFixed(2)} para fechar o total`;
    return "Rateio fechado";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          familyId,
          amount: Number(amount),
          categoryId: selectedCategory,
          dueDate,
          description: description || undefined,
          splitMode: selectedMembers.length > 1 ? splitMode : "igual",
          responsibleMemberIds:
            selectedMembers.length > 0 ? selectedMembers : undefined,
          shares: buildShares(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? "Erro ao criar despesa");
        return;
      }

      setSuccess(true);
      setAmount("");
      setDueDate("");
      setSelectedCategory("");
      setDescription("");
      setSelectedMembers([]);
      setPercentages({});
      setFixedAmounts({});
    } catch {
      setErrorMsg("Erro de conexao com o servidor");
    } finally {
      setSubmitting(false);
    }
  }

  const summary = splitSummary();

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Nova Despesa</h1>

      {!familyId && (
        <div className="mb-6 rounded-xl bg-bg-card border border-border p-4">
          <label className="block text-sm font-medium mb-1">
            ID da Familia (configure uma vez)
          </label>
          <input
            type="text"
            placeholder="Cole o UUID da familia aqui"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-bg focus:outline-none focus:border-primary"
            onBlur={(e) => setFamilyId(e.target.value.trim())}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recurrence */}
        <div className="grid grid-cols-4 gap-2">
          {(["unica", "mensal", "anual", "parcelado"] as Recurrence[]).map(
            (r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  recurrence === r
                    ? "bg-primary text-white"
                    : "bg-bg-card border border-border text-text-muted hover:border-primary"
                }`}
              >
                {r}
              </button>
            )
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">Valor *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-3 text-2xl font-bold bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Data de vencimento *
          </label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary-light"
                    : "border-border bg-bg-card hover:border-primary"
                }`}
              >
                <span className="text-lg">
                  {CATEGORY_ICONS[cat.id] ?? "\u{1F4CC}"}
                </span>
                <span className="text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Descricao (opcional)
          </label>
          <input
            type="text"
            placeholder="Detalhes adicionais sobre a despesa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Responsible members */}
        {members.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Responsaveis *</label>
              <button
                type="button"
                onClick={selectAllMembers}
                className="text-xs text-primary hover:text-primary-hover"
              >
                {selectedMembers.length === members.length
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </button>
            </div>
            <div className="space-y-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedMembers.includes(member.id)
                      ? "border-primary bg-primary-light"
                      : "border-border bg-bg-card hover:border-primary"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      selectedMembers.includes(member.id)
                        ? "bg-primary"
                        : "bg-text-muted"
                    }`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    {member.email && (
                      <div className="text-xs text-text-muted">
                        {member.email}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Split mode (only when multiple members) */}
        {selectedMembers.length > 1 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Modo de rateio
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(["igual", "percentual", "valorFixo"] as SplitMode[]).map(
                (mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSplitMode(mode)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      splitMode === mode
                        ? "bg-primary text-white"
                        : "bg-bg-card border border-border text-text-muted hover:border-primary"
                    }`}
                  >
                    {mode === "valorFixo" ? "Valor fixo" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                )
              )}
            </div>

            {splitMode !== "igual" && (
              <div className="space-y-2">
                {selectedMembers.map((memberId) => {
                  const member = members.find((m) => m.id === memberId);
                  if (!member) return null;

                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3"
                    >
                      <span className="text-sm font-medium flex-1">
                        {member.name}
                      </span>
                      {splitMode === "percentual" ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={percentages[memberId] ?? ""}
                            onChange={(e) =>
                              setPercentages((prev) => ({
                                ...prev,
                                [memberId]: e.target.value,
                              }))
                            }
                            className="w-20 rounded-lg border border-border px-2 py-1 text-sm text-right bg-bg focus:outline-none focus:border-primary"
                          />
                          <span className="text-sm text-text-muted">%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-text-muted">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={fixedAmounts[memberId] ?? ""}
                            onChange={(e) =>
                              setFixedAmounts((prev) => ({
                                ...prev,
                                [memberId]: e.target.value,
                              }))
                            }
                            className="w-24 rounded-lg border border-border px-2 py-1 text-sm text-right bg-bg focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {summary && (
              <p
                className={`mt-2 text-sm font-medium ${
                  summary === "Rateio fechado" ? "text-success" : "text-warning"
                }`}
              >
                {summary}
              </p>
            )}
          </div>
        )}

        {/* Error / success */}
        {errorMsg && (
          <p className="text-sm text-danger font-medium">{errorMsg}</p>
        )}
        {success && (
          <p className="text-sm text-success font-medium">
            Despesa criada com sucesso!
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Criar Despesa"}
        </button>
      </form>
    </div>
  );
}
