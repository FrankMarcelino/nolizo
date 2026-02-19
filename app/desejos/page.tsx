"use client";

import { useEffect, useState } from "react";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type Wish = {
  id: string;
  name: string;
  target_amount: number;
  importance: string;
  target_date: string | null;
  notes: string | null;
  fulfilled: boolean;
};

const IMPORTANCE_LABELS: Record<string, string> = {
  essencial: "Essencial",
  alta: "Alta",
  media: "Media",
  baixa: "Baixa",
};

const IMPORTANCE_COLORS: Record<string, string> = {
  essencial: "bg-danger",
  alta: "bg-warning",
  media: "bg-primary",
  baixa: "bg-text-muted",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DesejosPage() {
  const { familyId } = useFamilyId();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [importance, setImportance] = useState("media");
  const [targetDate, setTargetDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!familyId) return;
    fetch(`/api/wishes?familyId=${familyId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setWishes(json.data);
      })
      .catch(() => {});
  }, [familyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          familyId,
          name,
          targetAmount: Number(targetAmount),
          importance,
          targetDate: targetDate || undefined,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error ?? "Erro ao criar desejo");
        return;
      }
      setWishes((prev) => [json.data, ...prev]);
      setName("");
      setTargetAmount("");
      setTargetDate("");
      setNotes("");
      setShowForm(false);
      setMsg("Desejo adicionado!");
    } catch {
      setMsg("Erro de conexao");
    } finally {
      setSubmitting(false);
    }
  }

  const totalWishes = wishes.filter((w) => !w.fulfilled).reduce((s, w) => s + Number(w.target_amount), 0);

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Desejos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Cancelar" : "+ Novo desejo"}
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-bg-card border border-border p-4 mb-6 text-center">
        <p className="text-xs text-text-muted mb-1">Total dos desejos pendentes</p>
        <p className="text-xl font-bold text-primary">{formatCurrency(totalWishes)}</p>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-bg-card border border-border p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">O que voce deseja? *</label>
            <input
              type="text"
              required
              placeholder="Ex: iPhone 16, Viagem para Bahia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor estimado *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Importancia</label>
            <div className="grid grid-cols-4 gap-2">
              {["baixa", "media", "alta", "essencial"].map((imp) => (
                <button
                  key={imp}
                  type="button"
                  onClick={() => setImportance(imp)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    importance === imp
                      ? "bg-primary text-white"
                      : "bg-bg border border-border text-text-muted hover:border-primary"
                  }`}
                >
                  {IMPORTANCE_LABELS[imp]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prazo desejado</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observacao</label>
            <input
              type="text"
              placeholder="Detalhes opcionais"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {submitting ? "Salvando..." : "Adicionar Desejo"}
          </button>
        </form>
      )}

      {msg && <p className="text-sm font-medium text-primary mb-4">{msg}</p>}

      {/* List */}
      {wishes.length === 0 ? (
        <p className="text-text-muted text-center py-8">Nenhum desejo cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {wishes.map((wish) => (
            <div
              key={wish.id}
              className={`rounded-xl bg-bg-card border border-border p-4 ${
                wish.fulfilled ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${IMPORTANCE_COLORS[wish.importance] ?? "bg-text-muted"}`}
                  />
                  <h3 className="font-medium">{wish.name}</h3>
                </div>
                <span className="text-sm font-bold whitespace-nowrap">
                  {formatCurrency(Number(wish.target_amount))}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-text-muted">
                <span>{IMPORTANCE_LABELS[wish.importance] ?? wish.importance}</span>
                {wish.target_date && (
                  <span>
                    Prazo:{" "}
                    {new Date(wish.target_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                )}
                {wish.fulfilled && <span className="text-success">Realizado</span>}
              </div>
              {wish.notes && (
                <p className="text-xs text-text-muted mt-1">{wish.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
