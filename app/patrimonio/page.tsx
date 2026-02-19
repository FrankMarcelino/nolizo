"use client";

import { useEffect, useState } from "react";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type Asset = {
  id: string;
  name: string;
  estimated_value: number;
  acquisition_date: string | null;
  category: string | null;
  notes: string | null;
};

const ASSET_CATEGORIES = [
  "Imovel",
  "Veiculo",
  "Eletronico",
  "Movel",
  "Investimento",
  "Outro",
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PatrimonioPage() {
  const { familyId } = useFamilyId();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!familyId) return;
    fetch(`/api/assets?familyId=${familyId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setAssets(json.data);
      })
      .catch(() => {});
  }, [familyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          familyId,
          name,
          estimatedValue: Number(estimatedValue),
          acquisitionDate: acquisitionDate || undefined,
          category: category || undefined,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error ?? "Erro ao cadastrar bem");
        return;
      }
      setAssets((prev) => [json.data, ...prev]);
      setName("");
      setEstimatedValue("");
      setAcquisitionDate("");
      setCategory("");
      setNotes("");
      setShowForm(false);
      setMsg("Bem cadastrado!");
    } catch {
      setMsg("Erro de conexao");
    } finally {
      setSubmitting(false);
    }
  }

  const totalPatrimonio = assets.reduce((s, a) => s + Number(a.estimated_value), 0);

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patrimonio</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Cancelar" : "+ Novo bem"}
        </button>
      </div>

      {/* Total */}
      <div className="rounded-xl bg-bg-card border border-border p-4 mb-6 text-center">
        <p className="text-xs text-text-muted mb-1">Patrimonio total estimado</p>
        <p className="text-xl font-bold text-success">{formatCurrency(totalPatrimonio)}</p>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-bg-card border border-border p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nome do bem *</label>
            <input
              type="text"
              required
              placeholder="Ex: Apartamento, Carro, Notebook"
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
              min="0"
              required
              placeholder="0,00"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <div className="grid grid-cols-3 gap-2">
              {ASSET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-primary text-white"
                      : "bg-bg border border-border text-text-muted hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de aquisicao</label>
            <input
              type="date"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
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
            {submitting ? "Salvando..." : "Cadastrar Bem"}
          </button>
        </form>
      )}

      {msg && <p className="text-sm font-medium text-primary mb-4">{msg}</p>}

      {/* List */}
      {assets.length === 0 ? (
        <p className="text-text-muted text-center py-8">Nenhum bem cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl bg-bg-card border border-border p-4"
            >
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-medium">{asset.name}</h3>
                <span className="text-sm font-bold text-success whitespace-nowrap">
                  {formatCurrency(Number(asset.estimated_value))}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-text-muted">
                {asset.category && <span>{asset.category}</span>}
                {asset.acquisition_date && (
                  <span>
                    Adquirido:{" "}
                    {new Date(asset.acquisition_date + "T00:00:00").toLocaleDateString(
                      "pt-BR"
                    )}
                  </span>
                )}
              </div>
              {asset.notes && (
                <p className="text-xs text-text-muted mt-1">{asset.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
