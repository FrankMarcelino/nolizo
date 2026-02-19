"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type Summary = {
  totalInflowsMonth: number;
  totalExpensesMonth: number;
  paidMonth: number;
  pendingMonth: number;
  balanceMonth: number;
  totalOverdue: number;
  overdueCount: number;
  totalWishes: number;
  wishesCount: number;
  totalAssets: number;
  assetsCount: number;
};

type ChartItem = { name: string; value: number };
type TrendItem = { month: string; despesas: number; entradas: number };

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6366f1", "#06b6d4", "#ec4899"];
const STATUS_COLORS: Record<string, string> = {
  Pagas: "#22c55e",
  Pendentes: "#f59e0b",
  Vencidas: "#ef4444",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const { familyId } = useFamilyId();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<ChartItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<ChartItem[]>([]);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [assetBreakdown, setAssetBreakdown] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!familyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?familyId=${familyId}`);
      const json = await res.json();
      if (json.summary) setSummary(json.summary);
      if (json.categoryBreakdown) setCategoryBreakdown(json.categoryBreakdown);
      if (json.statusBreakdown) setStatusBreakdown(json.statusBreakdown);
      if (json.trend) setTrend(json.trend);
      if (json.assetBreakdown) setAssetBreakdown(json.assetBreakdown);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!familyId) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-text-muted mb-4">
          Configure sua familia primeiro para ver o dashboard.
        </p>
        <a
          href="/configuracoes"
          className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
        >
          Ir para Configuracoes
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-text-muted">Carregando dashboard...</p>
      </div>
    );
  }

  const s = summary ?? {
    totalInflowsMonth: 0,
    totalExpensesMonth: 0,
    paidMonth: 0,
    pendingMonth: 0,
    balanceMonth: 0,
    totalOverdue: 0,
    overdueCount: 0,
    totalWishes: 0,
    wishesCount: 0,
    totalAssets: 0,
    assetsCount: 0,
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <SummaryCard label="Entradas (mes)" value={fmt(s.totalInflowsMonth)} color="text-success" />
        <SummaryCard label="Despesas (mes)" value={fmt(s.totalExpensesMonth)} color="text-danger" />
        <SummaryCard
          label="Saldo do mes"
          value={fmt(s.balanceMonth)}
          color={s.balanceMonth >= 0 ? "text-success" : "text-danger"}
        />
        <SummaryCard label="Pagas no mes" value={fmt(s.paidMonth)} color="text-primary" />
      </div>

      {/* Alert row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <SummaryCard
          label="Dividas vencidas"
          value={`${s.overdueCount} (${fmt(s.totalOverdue)})`}
          color={s.overdueCount > 0 ? "text-danger" : "text-success"}
        />
        <SummaryCard label="Pendente no mes" value={fmt(s.pendingMonth)} color="text-warning" />
        <SummaryCard
          label="Desejos"
          value={`${s.wishesCount} (${fmt(s.totalWishes)})`}
          color="text-primary"
        />
        <SummaryCard
          label="Patrimonio"
          value={`${s.assetsCount} (${fmt(s.totalAssets)})`}
          color="text-success"
        />
      </div>

      {/* Trend chart - last 6 months */}
      <div className="rounded-xl bg-bg-card border border-border p-4 mb-6">
        <h2 className="font-semibold mb-4">Evolucao nos ultimos 6 meses</h2>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend} barGap={2}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} width={70} tickFormatter={(v) => fmt(v)} />
              <Tooltip
                formatter={(value) => fmt(Number(value ?? 0))}
                contentStyle={{
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Legend />
              <Bar dataKey="entradas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Entradas" />
              <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-text-muted text-center py-8">Sem dados no periodo.</p>
        )}
      </div>

      {/* Bottom charts grid */}
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Status breakdown */}
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <h2 className="font-semibold mb-4">Status das despesas (mes)</h2>
          {statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusBreakdown.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={STATUS_COLORS[entry.name] ?? PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => fmt(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted text-center py-8">Sem despesas no mes.</p>
          )}
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl bg-bg-card border border-border p-4">
          <h2 className="font-semibold mb-4">Despesas por categoria</h2>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${String(name).replace(/_/g, " ")} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => fmt(Number(value ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-muted text-center py-8">Sem despesas no mes.</p>
          )}
        </div>
      </div>

      {/* Assets by category */}
      {assetBreakdown.length > 0 && (
        <div className="rounded-xl bg-bg-card border border-border p-4 mb-6">
          <h2 className="font-semibold mb-4">Patrimonio por categoria</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={assetBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {assetBreakdown.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => fmt(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickLink href="/planejamento" label="Planejamento" />
        <QuickLink href="/despesas/nova" label="Nova Despesa" />
        <QuickLink href="/entradas/nova" label="Nova Entrada" />
        <QuickLink href="/extrato" label="Extrato" />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-bg-card border border-border p-3">
      <p className="text-xs text-text-muted mb-1 truncate">{label}</p>
      <p className={`text-sm font-bold ${color} truncate`}>{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block text-center rounded-xl bg-bg-card border border-border py-3 text-sm font-medium text-text-muted hover:border-primary hover:text-primary transition-colors"
    >
      {label}
    </a>
  );
}
