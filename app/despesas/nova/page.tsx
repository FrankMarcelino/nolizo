"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFamilyId } from "@/src/hooks/useFamilyId";

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
type ExpenseType = "fixa" | "variavel";
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

function formatInputCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyToNumber(formatted: string): number {
  if (!formatted) return 0;
  const clean = formatted.replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
}

export default function NovaDespesaPage() {
  const router = useRouter();
  const { familyId } = useFamilyId();
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [amountDisplay, setAmountDisplay] = useState("");
  const [expenseType, setExpenseType] = useState<ExpenseType>("fixa");
  const [recurrence, setRecurrence] = useState<Recurrence>("unica");
  const [totalInstallments, setTotalInstallments] = useState("12");
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

  const amount = parseCurrencyToNumber(amountDisplay);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setCategories(json.data.filter((c: Category) => c.type === "saida"));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!familyId) return;
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
      const val = amount / selectedMembers.length;
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
    const diff = amount - total;
    if (Math.abs(diff) > 0.01)
      return `Faltam R$ ${diff.toFixed(2)} para fechar o total`;
    return "Rateio fechado";
  }

  function getApiRecurrence(): string {
    if (recurrence === "parcelado") return "mensal";
    return recurrence;
  }

  function getApiInstallments(): number {
    if (recurrence === "unica") return 1;
    if (recurrence === "parcelado") return Math.max(2, Math.min(60, Number(totalInstallments) || 12));
    return Math.max(2, Math.min(60, Number(totalInstallments) || 12));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!amount || amount <= 0) {
      setErrorMsg("Informe o valor da despesa");
      return;
    }
    if (!dueDate) {
      setErrorMsg("Informe a data de vencimento");
      return;
    }
    if (!selectedCategory) {
      setErrorMsg("Selecione uma categoria");
      return;
    }
    if (showInstallments) {
      const count = Number(totalInstallments);
      if (!count || count < 2) {
        setErrorMsg("Informe a quantidade de parcelas (minimo 2)");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          familyId,
          amount,
          categoryId: selectedCategory,
          dueDate,
          description: description || undefined,
          expenseType,
          recurrence: getApiRecurrence(),
          totalInstallments: getApiInstallments(),
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
      setAmountDisplay("");
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
  const showInstallments = recurrence === "mensal" || recurrence === "anual" || recurrence === "parcelado";

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nova Despesa</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-elevated text-text-muted transition-colors"
        >
          ✕
        </button>
      </div>

      {!familyId && (
        <div className="mb-6 rounded-xl bg-bg-card border border-border p-4 text-center">
          <p className="text-sm text-text-muted mb-2">
            Configure sua familia antes de cadastrar despesas.
          </p>
          <a
            href="/configuracoes"
            className="inline-block px-4 py-2 rounded-lg bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Ir para Configuracoes
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Amount ── */}
        <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-text-muted">R$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(formatInputCurrency(e.target.value))}
              className="flex-1 text-2xl font-bold bg-transparent focus:outline-none placeholder:text-text-muted/40"
            />
          </div>
        </div>

        {/* ── Tipo (Fixa / Variavel) ── */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["fixa", "Fixa"],
                ["variavel", "Variavel"],
              ] as [ExpenseType, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setExpenseType(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  expenseType === t
                    ? "bg-primary text-bg"
                    : "bg-bg-card border border-border text-text-muted hover:border-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recorrencia ── */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">
            Recorrencia
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["unica", "Unica"],
                ["mensal", "Mensal"],
                ["anual", "Anual"],
                ["parcelado", "Parcelado"],
              ] as [Recurrence, string][]
            ).map(([r, label]) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  recurrence === r
                    ? "bg-primary text-bg"
                    : "bg-bg-card border border-border text-text-muted hover:border-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {showInstallments && (
            <div className="mt-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <label className="block text-xs text-text-muted mb-1">
                {recurrence === "parcelado" ? "Numero de parcelas" : "Quantidade de repeticoes"}
              </label>
              <input
                type="number"
                min="2"
                max="60"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                className="w-full text-lg font-bold bg-transparent focus:outline-none"
              />
              {amount > 0 && (
                <p className="text-xs text-text-muted mt-1">
                  {recurrence === "parcelado"
                    ? `${totalInstallments}x de R$ ${(amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : `${totalInstallments} lancamentos de R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Data de vencimento ── */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">
            {showInstallments ? "Data da primeira parcela *" : "Data de vencimento *"}
          </label>
          <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* ── Categoria ── */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">
            Categoria
          </label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary-light ring-1 ring-primary/30"
                    : "border-border bg-bg-card hover:border-primary/50"
                }`}
              >
                <span className="text-xl">
                  {CATEGORY_ICONS[cat.id] ?? "\u{1F4CC}"}
                </span>
                <span className="text-center leading-tight truncate w-full">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Descricao ── */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-2">
            Descricao <span className="text-text-muted/60">(opcional)</span>
          </label>
          <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
            <input
              type="text"
              placeholder="Detalhes adicionais sobre a despesa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-sm placeholder:text-text-muted/40"
            />
          </div>
        </div>

        {/* ── Responsaveis ── */}
        {members.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-muted">
                Responsaveis *
              </label>
              <button
                type="button"
                onClick={selectAllMembers}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                {selectedMembers.length === members.length
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </button>
            </div>
            <div className="space-y-2">
              {members.map((member) => {
                const selected = selectedMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary-light ring-1 ring-primary/30"
                        : "border-border bg-bg-card hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        selected
                          ? "bg-primary text-bg"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {member.name}
                      </div>
                      {member.email && (
                        <div className="text-xs text-text-muted truncate">
                          {member.email}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Modo de rateio ── */}
        {selectedMembers.length > 1 && (
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">
              Modo de rateio
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(["igual", "percentual", "valorFixo"] as SplitMode[]).map(
                (mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSplitMode(mode)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      splitMode === mode
                        ? "bg-primary text-bg"
                        : "bg-bg-card border border-border text-text-muted hover:border-primary"
                    }`}
                  >
                    {mode === "valorFixo"
                      ? "Valor fixo"
                      : mode.charAt(0).toUpperCase() + mode.slice(1)}
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
                      className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-3"
                    >
                      <span className="text-sm font-medium flex-1 truncate">
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
                            className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm text-right bg-bg focus:outline-none focus:border-primary"
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
                            className="w-24 rounded-lg border border-border px-2 py-1.5 text-sm text-right bg-bg focus:outline-none focus:border-primary"
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

        {/* ── Feedback ── */}
        {errorMsg && (
          <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3">
            <p className="text-sm text-danger font-medium">{errorMsg}</p>
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-3">
            <p className="text-sm text-success font-medium">
              Despesa criada com sucesso!
            </p>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={submitting || !familyId}
          className="w-full py-3.5 rounded-xl bg-primary text-bg font-semibold text-base hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Criar Despesa"}
        </button>
      </form>
    </div>
  );
}
