"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type StatementItem = {
  id: string;
  type: "entrada" | "saida";
  amount: number;
  categoryId: string;
  description: string | null;
  date: string;
  status: string;
  expenseType: string | null;
  recurrence: string | null;
  installmentNumber: number | null;
  totalInstallments: number | null;
};

type Category = { id: string; name: string; type: string };
type Summary = { totalIn: number; totalOut: number; balance: number };
type PeriodPreset = "day" | "week" | "month" | "year" | "custom";
type FilterType = "todas" | "entradas" | "saidas" | "vencidas";

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
  salary: "\u{1F4B0}",
  freelance: "\u{1F4BB}",
  investments_income: "\u{1F4C8}",
  rental_income: "\u{1F3E0}",
  government_benefits: "\u{1F3DB}",
  gifts_received: "\u{1F381}",
  refunds: "\u{1F504}",
  other_income: "\u{2022}\u{2022}\u{2022}",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  paga: { label: "Paga", color: "text-success", bg: "bg-success/10", border: "border-l-success" },
  a_vencer: { label: "A vencer", color: "text-primary", bg: "bg-primary/10", border: "border-l-primary" },
  vencida: { label: "Vencida", color: "text-danger", bg: "bg-danger/10", border: "border-l-danger" },
  confirmada: { label: "Confirmada", color: "text-success", bg: "bg-success/10", border: "border-l-success" },
  projetada: { label: "Projetada", color: "text-warning", bg: "bg-warning/10", border: "border-l-warning" },
};

function numberToCurrencyDisplay(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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

function getPresetRange(preset: Exclude<PeriodPreset, "custom">): {
  from: string;
  to: string;
} {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from: Date;

  switch (preset) {
    case "day":
      from = now;
      break;
    case "week":
      from = new Date(now);
      from.setDate(from.getDate() - 7);
      break;
    case "month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
  }

  return { from: from.toISOString().slice(0, 10), to };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function daysOverdue(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

function formatDateGroupLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (today.getTime() - d.getTime()) / 86400000
  );

  const formatted = d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  if (diffDays === 0) return `Hoje · ${formatted}`;
  if (diffDays === 1) return `Ontem · ${formatted}`;
  if (diffDays === -1) return `Amanha · ${formatted}`;
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/* ─────────── Status Badge ─────────── */

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "text-text-muted",
    bg: "bg-bg-elevated",
    border: "",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${cfg.color} ${cfg.bg}`}
    >
      {cfg.label}
    </span>
  );
}

/* ─────────── Statement Card ─────────── */

function StatementCard({
  item,
  categoryName,
  categoryIcon,
  onClick,
}: {
  item: StatementItem;
  categoryName: string;
  categoryIcon: string;
  onClick: () => void;
}) {
  const isEntrada = item.type === "entrada";
  const isSaida = item.type === "saida";
  const isOverdue = item.status === "vencida";
  const overdueDays = isOverdue ? daysOverdue(item.date) : 0;
  const statusCfg = STATUS_CONFIG[item.status];
  const borderColor = statusCfg?.border ?? "border-l-border";

  const tags: string[] = [];
  if (isSaida && item.expenseType === "fixa") tags.push("Fixa");
  if (isSaida && item.expenseType === "variavel") tags.push("Variavel");
  if (
    isSaida &&
    item.recurrence === "mensal" &&
    item.totalInstallments &&
    item.totalInstallments > 1
  ) {
    tags.push(`Parcela ${item.installmentNumber ?? "?"}/${item.totalInstallments}`);
  } else if (isSaida && item.recurrence && item.recurrence !== "unica") {
    tags.push(item.recurrence.charAt(0).toUpperCase() + item.recurrence.slice(1));
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl bg-bg-card border border-border border-l-4 ${borderColor} p-3.5 hover:border-primary/60 transition-all group`}
    >
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
            isEntrada ? "bg-success/10" : "bg-danger/10"
          }`}
        >
          {categoryIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: description + amount */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold truncate">
              {item.description ?? categoryName}
            </p>
            <p
              className={`text-sm font-bold shrink-0 ${
                isEntrada ? "text-success" : "text-danger"
              }`}
            >
              {isEntrada ? "+" : "-"} {formatCurrency(item.amount)}
            </p>
          </div>

          {/* Row 2: category + date */}
          <div className="flex items-center gap-1.5 mt-1">
            {item.description && (
              <span className="text-[11px] text-text-muted">{categoryName}</span>
            )}
            {item.description && (
              <span className="text-text-muted/40 text-[10px]">·</span>
            )}
            <span className="text-[11px] text-text-muted">
              {new Date(item.date + "T00:00:00").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>

          {/* Row 3: status + tags + overdue */}
          <div className="flex items-center flex-wrap gap-1.5 mt-2">
            <StatusBadge status={item.status} />
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-text-muted bg-bg-elevated"
              >
                {tag}
              </span>
            ))}
            {isOverdue && overdueDays > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-danger bg-danger/10">
                {overdueDays} {overdueDays === 1 ? "dia" : "dias"} em atraso
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ──────────────────────── Edit Modal ──────────────────────── */

function EditModal({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: StatementItem;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amountDisplay, setAmountDisplay] = useState(
    numberToCurrencyDisplay(item.amount)
  );
  const [description, setDescription] = useState(item.description ?? "");
  const [date, setDate] = useState(item.date);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [status, setStatus] = useState(item.status);
  const [expenseType, setExpenseType] = useState(item.expenseType ?? "variavel");

  const alreadyHasInstallments =
    item.totalInstallments != null && item.totalInstallments > 1;
  const isParcelado =
    item.recurrence === "mensal" && alreadyHasInstallments;
  const [recurrence, setRecurrence] = useState(
    isParcelado ? "parcelado" : (item.recurrence ?? "unica")
  );
  const [installmentCount, setInstallmentCount] = useState(
    String(item.totalInstallments ?? 12)
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEntrada = item.type === "entrada";

  const needsInstallmentGeneration =
    !isEntrada &&
    !alreadyHasInstallments &&
    (recurrence === "parcelado" || recurrence === "mensal" || recurrence === "anual");
  const filteredCategories = categories.filter(
    (c) => c.type === (isEntrada ? "entrada" : "saida")
  );
  const statusOptions = isEntrada
    ? ["confirmada", "projetada"]
    : ["a_vencer", "vencida", "paga"];

  async function handleSave() {
    const parsedAmount = parseCurrencyToNumber(amountDisplay);
    if (!parsedAmount || parsedAmount <= 0) return;

    if (needsInstallmentGeneration) {
      const count = Number(installmentCount);
      if (!count || count < 2) return;
    }

    setSaving(true);
    try {
      const endpoint = isEntrada
        ? `/api/inflows/${item.id}`
        : `/api/expenses/${item.id}`;

      const payload: Record<string, unknown> = {
        status,
        amount: parsedAmount,
        categoryId,
      };

      if (isEntrada) {
        payload.source = description;
        payload.inflowDate = date;
      } else {
        payload.description = description;
        payload.dueDate = date;
        payload.expenseType = expenseType;
        payload.recurrence = recurrence === "parcelado" ? "mensal" : recurrence;
      }

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setSaving(false);
        return;
      }

      if (needsInstallmentGeneration) {
        await fetch(`/api/expenses/${item.id}/installments`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            totalInstallments: Number(installmentCount),
            recurrence: recurrence === "parcelado" ? "mensal" : recurrence,
          }),
        });
      }

      onSaved();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const endpoint = isEntrada
        ? `/api/inflows/${item.id}`
        : `/api/expenses/${item.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) onSaved();
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-auto bg-bg border border-border rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-bg border-b border-border px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold">
            Editar {isEntrada ? "Entrada" : "Despesa"}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-bg-elevated text-text-muted transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Amount */}
          <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
            <label className="block text-xs text-text-muted mb-1">Valor</label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-text-muted">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountDisplay}
                onChange={(e) =>
                  setAmountDisplay(formatInputCurrency(e.target.value))
                }
                className="flex-1 text-2xl font-bold bg-transparent focus:outline-none placeholder:text-text-muted/40"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Description / Source */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">
              {isEntrada ? "Fonte" : "Descricao"}
            </label>
            <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isEntrada ? "Ex: Salario, Freelance..." : "Detalhes sobre a despesa"}
                className="w-full bg-transparent focus:outline-none text-sm placeholder:text-text-muted/40"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">
              {isEntrada ? "Data do recebimento" : "Data de vencimento"}
            </label>
            <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Tipo */}
          {!isEntrada && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {([["fixa", "Fixa"], ["variavel", "Variavel"]] as [string, string][]).map(([t, label]) => (
                  <button key={t} type="button" onClick={() => setExpenseType(t)} className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${expenseType === t ? "bg-primary text-bg" : "bg-bg-card border border-border text-text-muted hover:border-primary"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recorrencia */}
          {!isEntrada && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Recorrencia</label>
              <div className="grid grid-cols-2 gap-2">
                {([["unica", "Unica"], ["mensal", "Mensal"], ["anual", "Anual"], ["parcelado", "Parcelado"]] as [string, string][]).map(([r, label]) => (
                  <button key={r} type="button" onClick={() => setRecurrence(r)} className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${recurrence === r ? "bg-primary text-bg" : "bg-bg-card border border-border text-text-muted hover:border-primary"}`}>
                    {label}
                  </button>
                ))}
              </div>
              {alreadyHasInstallments && (
                <div className="mt-3 rounded-xl border border-border bg-bg-card px-4 py-3">
                  <p className="text-xs text-text-muted">
                    Parcela <span className="font-bold text-text">{item.installmentNumber ?? "?"}</span> de <span className="font-bold text-text">{item.totalInstallments}</span>
                  </p>
                </div>
              )}
              {needsInstallmentGeneration && (
                <div className="mt-3 rounded-xl border border-primary/30 bg-primary-light px-4 py-3 space-y-3">
                  <p className="text-xs font-medium text-primary">
                    {recurrence === "parcelado" ? "Sera dividido em parcelas mensais" : recurrence === "mensal" ? "Sera repetido mensalmente" : "Sera repetido anualmente"}
                  </p>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      {recurrence === "parcelado" ? "Numero de parcelas" : "Quantidade de repeticoes"}
                    </label>
                    <input type="number" min="2" max="60" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} className="w-full text-lg font-bold bg-bg rounded-lg border border-border px-3 py-2 focus:outline-none focus:border-primary" />
                  </div>
                  {parseCurrencyToNumber(amountDisplay) > 0 && (
                    <p className="text-xs text-text-muted">
                      {recurrence === "parcelado"
                        ? `${installmentCount}x de R$ ${parseCurrencyToNumber(amountDisplay).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : `${installmentCount} lancamentos de R$ ${parseCurrencyToNumber(amountDisplay).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                      {" · "}Data inicio: {new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-[10px] transition-all ${categoryId === cat.id ? "border-primary bg-primary-light ring-1 ring-primary/30" : "border-border bg-bg-card hover:border-primary/50"}`}>
                  <span className="text-lg">{CATEGORY_ICONS[cat.id] ?? "\u{1F4CC}"}</span>
                  <span className="text-center leading-tight truncate w-full">{cat.name}</span>
                </button>
              ))}
              {!filteredCategories.find((c) => c.id === categoryId) && (
                <button type="button" className="flex flex-col items-center gap-1.5 rounded-xl border border-primary bg-primary-light ring-1 ring-primary/30 p-2.5 text-[10px]">
                  <span className="text-lg">{CATEGORY_ICONS[categoryId] ?? "\u{1F4CC}"}</span>
                  <span className="text-center leading-tight truncate w-full">{categoryId}</span>
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-2">Status</label>
            <div className={`grid gap-2 ${statusOptions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {statusOptions.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)} className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${status === s ? (cfg ? `${cfg.bg} ${cfg.color} ring-1 ring-current` : "bg-primary text-bg") : "bg-bg-card border border-border text-text-muted hover:border-primary"}`}>
                    {cfg?.label ?? s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {!confirmDelete ? (
              <>
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex-1 py-3.5 rounded-xl border border-danger text-danger text-sm font-semibold hover:bg-danger/10 transition-colors">
                  Excluir
                </button>
                <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-3.5 rounded-xl bg-primary text-bg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 py-3.5 rounded-xl border border-border text-text-muted text-sm font-semibold hover:bg-bg-elevated transition-colors">
                  Cancelar
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting} className="flex-1 py-3.5 rounded-xl bg-danger text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {deleting ? "Excluindo..." : "Confirmar Exclusao"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */

export default function ExtratoPage() {
  const { familyId } = useFamilyId();
  const [items, setItems] = useState<StatementItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIn: 0,
    totalOut: 0,
    balance: 0,
  });
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("todas");

  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<StatementItem | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    if (!familyId) return;

    let from: string;
    let to: string;

    if (period === "custom") {
      if (!customFrom || !customTo) return;
      from = customFrom;
      to = customTo;
    } else {
      const range = getPresetRange(period);
      from = range.from;
      to = range.to;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/statement?familyId=${familyId}&fromDate=${from}&toDate=${to}`
      );
      const json = await res.json();
      if (json.data) setItems(json.data);
      if (json.summary) setSummary(json.summary);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [period, familyId, customFrom, customTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handlePreset(p: PeriodPreset) {
    setPeriod(p);
    if (p === "custom" && !customFrom) {
      const now = new Date();
      setCustomFrom(
        new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      );
      setCustomTo(now.toISOString().slice(0, 10));
    }
  }

  function handleSaved() {
    setEditingItem(null);
    fetchData();
  }

  const currentRange =
    period === "custom"
      ? { from: customFrom, to: customTo }
      : getPresetRange(period);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredItems = useMemo(() => {
    if (filter === "todas") return items;
    if (filter === "entradas") return items.filter((i) => i.type === "entrada");
    if (filter === "saidas") return items.filter((i) => i.type === "saida");
    return items.filter((i) => i.status === "vencida");
  }, [items, filter]);

  const groupedItems = useMemo(() => {
    const groups: { date: string; items: StatementItem[] }[] = [];
    let current: { date: string; items: StatementItem[] } | null = null;

    for (const item of filteredItems) {
      if (!current || current.date !== item.date) {
        current = { date: item.date, items: [] };
        groups.push(current);
      }
      current.items.push(item);
    }
    return groups;
  }, [filteredItems]);

  const overdueCount = items.filter((i) => i.status === "vencida").length;
  const pendingCount = items.filter((i) => i.status === "a_vencer").length;

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Extrato</h1>

      {/* Period presets */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {(
          [
            ["day", "Dia"],
            ["week", "Semana"],
            ["month", "Mes"],
            ["year", "Ano"],
            ["custom", "Periodo"],
          ] as [PeriodPreset, string][]
        ).map(([p, label]) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? "bg-primary text-bg"
                : "bg-bg-card border border-border text-text-muted hover:border-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex gap-3 mb-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">De</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1">Ate</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-bg-card focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Period info */}
      <p className="text-xs text-text-muted mb-4">
        {new Date(currentRange.from + "T00:00:00").toLocaleDateString("pt-BR")}{" "}
        — {new Date(currentRange.to + "T00:00:00").toLocaleDateString("pt-BR")}
        {" · "}
        <span className="font-medium text-text">{items.length}</span> movimentacoes
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-bg-card border border-border p-3 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Entradas</p>
          <p className="text-base font-bold text-success">
            {formatCurrency(summary.totalIn)}
          </p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-3 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Saidas</p>
          <p className="text-base font-bold text-danger">
            {formatCurrency(summary.totalOut)}
          </p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-3 text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Saldo</p>
          <p
            className={`text-base font-bold ${
              summary.balance >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Quick status counters */}
      {(overdueCount > 0 || pendingCount > 0) && (
        <div className="flex gap-2 mb-4">
          {overdueCount > 0 && (
            <button
              onClick={() => setFilter(filter === "vencidas" ? "todas" : "vencidas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === "vencidas"
                  ? "bg-danger text-white"
                  : "bg-danger/10 text-danger hover:bg-danger/20"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {overdueCount}
              </span>
              Vencidas
            </button>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                {pendingCount}
              </span>
              A vencer
            </div>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 border-b border-border pb-3">
        {(
          [
            ["todas", "Todas"],
            ["entradas", "Entradas"],
            ["saidas", "Saidas"],
          ] as [FilterType, string][]
        ).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? "bg-bg-elevated text-text"
                : "text-text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items list grouped by date */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-text-muted text-sm">Carregando...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">
            {filter === "vencidas" ? "\u{1F389}" : "\u{1F4CB}"}
          </p>
          <p className="text-text-muted text-sm">
            {filter === "vencidas"
              ? "Nenhuma conta vencida neste periodo!"
              : "Nenhuma movimentacao no periodo."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedItems.map((group) => (
            <div key={group.date}>
              {/* Date header */}
              <p className="text-xs font-semibold text-text-muted mb-2 px-1">
                {formatDateGroupLabel(group.date)}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <StatementCard
                    key={item.id}
                    item={item}
                    categoryName={
                      categoryMap[item.categoryId] ?? item.categoryId
                    }
                    categoryIcon={
                      CATEGORY_ICONS[item.categoryId] ?? "\u{1F4CC}"
                    }
                    onClick={() => setEditingItem(item)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingItem && (
        <EditModal
          item={editingItem}
          categories={categories}
          onClose={() => setEditingItem(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
