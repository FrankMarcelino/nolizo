"use client";

import { useState } from "react";
import type { AgendaItem } from "./buckets";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function diaDoMes(iso: string): string {
  return String(Number(iso.slice(8, 10)));
}

export function ContaRow({
  item,
  hoje,
  onMudou,
}: {
  item: AgendaItem;
  hoje: string;
  onMudou: () => void;
}) {
  const [aberta, setAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const paga = item.status === "paga";
  const atrasada = !paga && item.date < hoje;

  async function darBaixa() {
    setSalvando(true);
    setErro("");
    try {
      const r = await fetch(`/api/expenses/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paga" }),
      });
      if (!r.ok) throw new Error("Nao foi possivel marcar como paga.");
      setAberta(false);
      onMudou();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setAberta(true)}
        className={`mb-2 flex min-h-[44px] w-full items-center gap-3 rounded-xl border-l-[3px] px-3 py-2 text-left transition-colors ${
          paga
            ? "border-success bg-bg-card opacity-50"
            : atrasada
              ? "border-danger bg-danger/10"
              : "border-border bg-bg-card"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm">
            {item.description ?? item.categoryId}
          </span>
          <span className="block text-[11px] text-text-muted">
            {paga ? "pago" : `dia ${diaDoMes(item.date)}`}
          </span>
        </span>
        <span className="whitespace-nowrap text-sm font-semibold">
          {brl(item.amount)}
        </span>
      </button>

      {aberta && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          onClick={() => setAberta(false)}
          role="presentation"
        >
          <div
            className="w-full rounded-t-2xl border-t border-border bg-bg-elevated p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <p className="text-base font-semibold">
              {item.description ?? item.categoryId}
            </p>
            <p className="mb-4 text-sm text-text-muted">
              {brl(item.amount)} · vence dia {diaDoMes(item.date)}
            </p>

            {erro && <p className="mb-3 text-sm text-danger">{erro}</p>}

            {paga ? (
              <p className="text-sm text-success">Esta conta ja esta paga.</p>
            ) : (
              <button
                onClick={darBaixa}
                disabled={salvando}
                className="min-h-[44px] w-full rounded-xl bg-primary px-4 font-semibold text-bg disabled:opacity-60"
              >
                {salvando ? "Salvando…" : "Marcar como paga"}
              </button>
            )}

            <button
              onClick={() => setAberta(false)}
              className="mt-2 min-h-[44px] w-full rounded-xl text-sm text-text-muted"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
