"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { agrupar, hojeLocal, ultimoDiaDoMes, type AgendaItem, type Bucket } from "./buckets";
import { ContaRow } from "./ContaRow";

const TITULOS: Record<Bucket, string> = {
  atrasado: "Atrasado",
  estaSemana: "Esta semana",
  depois: "Depois",
  pago: "Pago",
};

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MesPage() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const hoje = useMemo(() => hojeLocal(), []);
  const primeiroDia = `${hoje.slice(0, 7)}-01`;
  const ultimoDia = ultimoDiaDoMes(hoje);

  const carregar = useCallback(async () => {
    setErro("");
    try {
      const r = await fetch(
        `/api/statement?fromDate=${primeiroDia}&toDate=${ultimoDia}`
      );
      if (!r.ok) throw new Error("Nao foi possivel carregar o mes.");
      const json = await r.json();
      const saidas = (json.data ?? []).filter(
        (i: { type: string }) => i.type === "saida"
      );
      setItems(saidas as AgendaItem[]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }, [primeiroDia, ultimoDia]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const grupos = useMemo(() => agrupar(items, hoje), [items, hoje]);

  const faltaPagar = items
    .filter((i) => i.status !== "paga")
    .reduce((s, i) => s + i.amount, 0);
  const atrasado = grupos.atrasado.reduce((s, i) => s + i.amount, 0);

  if (carregando) {
    return <p className="text-text-muted">Carregando o mes…</p>;
  }

  if (erro) {
    return (
      <div className="rounded-lg border border-danger bg-danger/10 p-4">
        <p className="text-sm text-danger">{erro}</p>
        <button
          onClick={carregar}
          className="mt-3 min-h-[44px] rounded-lg border border-danger px-4 text-sm font-semibold text-danger"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <p className="text-sm text-text-muted">Este mes</p>
        <p className="text-3xl font-bold tracking-tight">{brl(faltaPagar)}</p>
        <p className="text-xs text-text-muted">ainda falta pagar</p>
        {atrasado > 0 && (
          <p className="mt-1 text-xs font-semibold text-danger">
            ● {brl(atrasado)} atrasado
          </p>
        )}
      </header>

      {(["atrasado", "estaSemana", "depois", "pago"] as Bucket[]).map((b) =>
        grupos[b].length === 0 ? null : (
          <section key={b} className="mb-6">
            <div className="mb-2 flex items-center gap-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  b === "atrasado" ? "text-danger" : "text-text-muted"
                }`}
              >
                {TITULOS[b]}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            {grupos[b].map((item) => (
              <ContaRow
                key={item.id}
                item={item}
                hoje={hoje}
                onMudou={carregar}
              />
            ))}
          </section>
        )
      )}

      {items.length === 0 && (
        <p className="text-sm text-text-muted">
          Nenhuma conta lancada para este mes ainda.
        </p>
      )}
    </div>
  );
}
