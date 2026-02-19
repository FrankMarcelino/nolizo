"use client";

import { useEffect, useState } from "react";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type Category = { id: string; name: string; type: string };
type FamilyMember = { id: string; name: string };

export default function NovaEntradaPage() {
  const { familyId } = useFamilyId();
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [inflowDate, setInflowDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [status, setStatus] = useState<"confirmada" | "projetada">("confirmada");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.data)
          setCategories(json.data.filter((c: Category) => c.type === "entrada"));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/inflows", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          familyId,
          amount: Number(amount),
          categoryId: selectedCategory,
          source,
          inflowDate,
          memberId: selectedMember || undefined,
          status,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Erro ao criar entrada");
        return;
      }

      setSuccess(true);
      setAmount("");
      setSource("");
      setInflowDate("");
      setSelectedCategory("");
      setNotes("");
    } catch {
      setErrorMsg("Erro de conexao com o servidor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Nova Entrada</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div className="grid grid-cols-2 gap-2">
          {(["confirmada", "projetada"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                status === s
                  ? "bg-primary text-white"
                  : "bg-bg-card border border-border text-text-muted hover:border-primary"
              }`}
            >
              {s}
            </button>
          ))}
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

        {/* Source */}
        <div>
          <label className="block text-sm font-medium mb-1">Origem *</label>
          <input
            type="text"
            required
            placeholder="Ex: Empresa XYZ, Freelance, Aluguel"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Data *</label>
          <input
            type="date"
            required
            value={inflowDate}
            onChange={(e) => setInflowDate(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Categoria</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg border p-3 text-sm text-left transition-colors ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary-light"
                    : "border-border bg-bg-card hover:border-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Member */}
        {members.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Responsavel (quem recebeu)
            </label>
            <div className="space-y-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setSelectedMember(selectedMember === m.id ? "" : m.id)
                  }
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    selectedMember === m.id
                      ? "border-primary bg-primary-light"
                      : "border-border bg-bg-card hover:border-primary"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      selectedMember === m.id ? "bg-primary" : "bg-text-muted"
                    }`}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Observacao (opcional)
          </label>
          <input
            type="text"
            placeholder="Detalhes adicionais"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>

        {errorMsg && <p className="text-sm text-danger font-medium">{errorMsg}</p>}
        {success && (
          <p className="text-sm text-success font-medium">
            Entrada registrada com sucesso!
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Registrar Entrada"}
        </button>
      </form>
    </div>
  );
}
