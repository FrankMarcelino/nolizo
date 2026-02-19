"use client";

import { useEffect, useState, useCallback } from "react";

type StatementItem = {
  id: string;
  type: "entrada" | "saida";
  amount: number;
  categoryId: string;
  description: string | null;
  date: string;
  status: string;
};

type Summary = { totalIn: number; totalOut: number; balance: number };
type PeriodPreset = "day" | "week" | "month" | "year";

function getDateRange(preset: PeriodPreset): { from: string; to: string } {
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

const FAMILY_ID =
  typeof window !== "undefined" ? localStorage.getItem("familyId") ?? "" : "";

export default function ExtratoPage() {
  const [items, setItems] = useState<StatementItem[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIn: 0,
    totalOut: 0,
    balance: 0,
  });
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!FAMILY_ID) return;
    setLoading(true);
    const { from, to } = getDateRange(period);
    try {
      const res = await fetch(
        `/api/statement?familyId=${FAMILY_ID}&fromDate=${from}&toDate=${to}`
      );
      const json = await res.json();
      if (json.data) setItems(json.data);
      if (json.summary) setSummary(json.summary);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Extrato</h1>

      {/* Period selector */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {(["day", "week", "month", "year"] as PeriodPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              period === p
                ? "bg-primary text-white"
                : "bg-bg-card border border-border text-text-muted hover:border-primary"
            }`}
          >
            {{
              day: "Dia",
              week: "Semana",
              month: "Mes",
              year: "Ano",
            }[p]}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-bg-card border border-border p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Entradas</p>
          <p className="text-lg font-bold text-success">
            {formatCurrency(summary.totalIn)}
          </p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Saidas</p>
          <p className="text-lg font-bold text-danger">
            {formatCurrency(summary.totalOut)}
          </p>
        </div>
        <div className="rounded-xl bg-bg-card border border-border p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Saldo</p>
          <p
            className={`text-lg font-bold ${
              summary.balance >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      {/* Items list */}
      {loading ? (
        <p className="text-text-muted text-center py-8">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-text-muted text-center py-8">
          Nenhuma movimentacao no periodo.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-bg-card border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    item.type === "entrada" ? "bg-success" : "bg-danger"
                  }`}
                >
                  {item.type === "entrada" ? "+" : "-"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {item.description ?? item.categoryId}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(item.date + "T00:00:00").toLocaleDateString("pt-BR")} ·{" "}
                    {item.status}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-bold ${
                  item.type === "entrada" ? "text-success" : "text-danger"
                }`}
              >
                {item.type === "entrada" ? "+" : "-"}{" "}
                {formatCurrency(item.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
