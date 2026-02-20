"use client";

import { useEffect, useState, useCallback } from "react";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type ExpenseCard = {
  id: string;
  amount: number;
  categoryId: string;
  description: string | null;
  dueDate: string;
  status: string;
  priority: number;
  interestRate: number;
  penaltyAmount: number;
  hybridScore: number;
  shares: { memberId: string; percentage: number | null; fixedAmount: number | null }[];
};

type PlanSummary = {
  totalDebt: number;
  totalIncome: number;
  coveragePercent: number;
  gap: number;
};

type PeriodPreset = "week" | "month" | "year";

function getDateRange(preset: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  const to_date = new Date(now);
  let from_date: Date;

  switch (preset) {
    case "week":
      from_date = new Date(now);
      from_date.setDate(from_date.getDate() - 30);
      to_date.setDate(to_date.getDate() + 7);
      break;
    case "month":
      from_date = new Date(now);
      from_date.setDate(from_date.getDate() - 60);
      to_date.setMonth(to_date.getMonth() + 1);
      break;
    case "year":
      from_date = new Date(now.getFullYear(), 0, 1);
      to_date.setFullYear(to_date.getFullYear(), 11, 31);
      break;
  }

  return {
    from: from_date.toISOString().slice(0, 10),
    to: to_date.toISOString().slice(0, 10),
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function PlanejamentoPage() {
  const { familyId } = useFamilyId();
  const [overdue, setOverdue] = useState<ExpenseCard[]>([]);
  const [upcoming, setUpcoming] = useState<ExpenseCard[]>([]);
  const [paid, setPaid] = useState<ExpenseCard[]>([]);
  const [summary, setSummary] = useState<PlanSummary>({
    totalDebt: 0,
    totalIncome: 0,
    coveragePercent: 0,
    gap: 0,
  });
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);
    const { from, to } = getDateRange(period);
    try {
      const res = await fetch(
        `/api/planning?familyId=${familyId}&fromDate=${from}&toDate=${to}`
      );
      const json = await res.json();
      if (json.overdue) setOverdue(json.overdue);
      if (json.upcoming) setUpcoming(json.upcoming);
      if (json.paid) setPaid(json.paid);
      if (json.summary) setSummary(json.summary);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [period, familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function markAsPaid(expenseId: string) {
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "paga" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Planejamento</h1>

      {/* Period */}
      <div className="grid grid-cols-3 gap-2 mb-6 max-w-md">
        {(["week", "month", "year"] as PeriodPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? "bg-primary text-bg"
                : "bg-bg-card border border-border text-text-muted hover:border-primary"
            }`}
          >
            {{ week: "Semana", month: "Mes", year: "Ano" }[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-muted text-center py-12">Carregando...</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Kanban columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <KanbanColumn
              title="Vencidas"
              count={overdue.length}
              total={overdue.reduce((s, e) => s + e.amount, 0)}
              color="danger"
              items={overdue}
              onMarkPaid={markAsPaid}
            />
            <KanbanColumn
              title="A vencer"
              count={upcoming.length}
              total={upcoming.reduce((s, e) => s + e.amount, 0)}
              color="warning"
              items={upcoming}
              onMarkPaid={markAsPaid}
            />
            <KanbanColumn
              title="Pagas"
              count={paid.length}
              total={paid.reduce((s, e) => s + e.amount, 0)}
              color="success"
              items={paid}
            />
          </div>

          {/* Coverage bar */}
          <div className="lg:w-20 flex lg:flex-col items-center gap-3">
            <div className="hidden lg:flex flex-col items-center flex-1 w-full">
              <span className="text-xs text-text-muted mb-2">Cobertura</span>
              <div className="relative w-8 flex-1 rounded-full bg-border overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
                  style={{
                    height: `${summary.coveragePercent}%`,
                    backgroundColor:
                      summary.coveragePercent >= 100
                        ? "var(--color-success)"
                        : summary.coveragePercent >= 50
                          ? "var(--color-warning)"
                          : "var(--color-danger)",
                  }}
                />
              </div>
              <span className="text-sm font-bold mt-2">
                {summary.coveragePercent.toFixed(0)}%
              </span>
            </div>

            {/* Mobile coverage */}
            <div className="lg:hidden flex-1 w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-muted">Cobertura</span>
                <span className="text-sm font-bold">
                  {summary.coveragePercent.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summary.coveragePercent}%`,
                    backgroundColor:
                      summary.coveragePercent >= 100
                        ? "var(--color-success)"
                        : summary.coveragePercent >= 50
                          ? "var(--color-warning)"
                          : "var(--color-danger)",
                  }}
                />
              </div>
            </div>

            {/* Summary numbers */}
            <div className="text-center space-y-1 min-w-fit">
              <p className="text-xs text-text-muted">Renda</p>
              <p className="text-sm font-bold text-success">
                {formatCurrency(summary.totalIncome)}
              </p>
              <p className="text-xs text-text-muted mt-2">Dividas</p>
              <p className="text-sm font-bold text-danger">
                {formatCurrency(summary.totalDebt)}
              </p>
              {summary.gap > 0 && (
                <>
                  <p className="text-xs text-text-muted mt-2">Falta</p>
                  <p className="text-sm font-bold text-danger">
                    {formatCurrency(summary.gap)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  total,
  color,
  items,
  onMarkPaid,
}: {
  title: string;
  count: number;
  total: number;
  color: "danger" | "warning" | "success";
  items: ExpenseCard[];
  onMarkPaid?: (id: string) => void;
}) {
  const colorMap = {
    danger: "border-danger",
    warning: "border-warning",
    success: "border-success",
  };
  const bgMap = {
    danger: "bg-danger",
    warning: "bg-warning",
    success: "bg-success",
  };

  return (
    <div className={`rounded-xl border-t-4 ${colorMap[color]} bg-bg-card p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{title}</h2>
          <span
            className={`${bgMap[color]} text-white text-xs font-bold px-2 py-0.5 rounded-full`}
          >
            {count}
          </span>
        </div>
        <span className="text-sm font-bold">{formatCurrency(total)}</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">
            Nenhuma divida
          </p>
        ) : (
          items.map((item) => {
            const daysOverdue = color === "danger"
              ? Math.max(0, Math.floor((Date.now() - new Date(item.dueDate + "T00:00:00").getTime()) / 86_400_000))
              : 0;
            const priorityLabels = ["", "Maxima", "Alta", "Normal", "Baixa", "Minima"];
            const priorityColors = ["", "text-danger", "text-warning", "text-text-muted", "text-text-muted", "text-text-muted"];

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border p-3 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium">
                    {item.description ?? item.categoryId}
                  </p>
                  <p className="text-sm font-bold ml-2 whitespace-nowrap">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                  <span>{formatDate(item.dueDate)}</span>
                  <span className={priorityColors[item.priority] ?? "text-text-muted"}>
                    P{item.priority} {priorityLabels[item.priority]}
                  </span>
                </div>
                {(daysOverdue > 0 || item.interestRate > 0 || item.penaltyAmount > 0) && (
                  <div className="flex gap-2 text-xs mb-1">
                    {daysOverdue > 0 && (
                      <span className="text-danger font-medium">{daysOverdue}d atraso</span>
                    )}
                    {item.interestRate > 0 && (
                      <span className="text-warning">Juros {item.interestRate}%</span>
                    )}
                    {item.penaltyAmount > 0 && (
                      <span className="text-warning">Multa {formatCurrency(item.penaltyAmount)}</span>
                    )}
                  </div>
                )}
                {onMarkPaid && color !== "success" && (
                  <button
                    onClick={() => onMarkPaid(item.id)}
                    className="mt-1 text-xs text-primary hover:text-primary-hover font-medium"
                  >
                    Marcar como paga
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
