"use client";

import { useEffect, useState } from "react";
import { useFamilyId } from "@/src/hooks/useFamilyId";

type FamilyMember = { id: string; name: string; email: string | null; active: boolean };

export default function ConfiguracoesPage() {
  const { familyId, saveFamilyId, clearFamilyId } = useFamilyId();
  const [familyName, setFamilyName] = useState("");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (familyId) loadMembers(familyId);
  }, [familyId]);

  async function loadMembers(fid: string) {
    try {
      const res = await fetch(`/api/family-members?familyId=${fid}`);
      const json = await res.json();
      if (json.data) setMembers(json.data);
    } catch {
      /* ignore */
    }
  }

  async function handleCreateFamily(e: React.FormEvent) {
    e.preventDefault();
    if (!familyName.trim()) return;
    setCreating(true);
    setMsg("");

    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: familyName }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error ?? "Erro ao criar familia");
        return;
      }
      const newId = json.data.id;
      saveFamilyId(newId);
      setMsg("Familia criada! ID salvo automaticamente.");
    } catch {
      setMsg("Erro de conexao");
    } finally {
      setCreating(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId || !newMemberName.trim()) return;
    setMsg("");

    try {
      const res = await fetch("/api/family-members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          familyId,
          name: newMemberName,
          email: newMemberEmail || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error ?? "Erro ao adicionar membro");
        return;
      }
      setNewMemberName("");
      setNewMemberEmail("");
      setMsg("Membro adicionado!");
      loadMembers(familyId);
    } catch {
      setMsg("Erro de conexao");
    }
  }

  function handleConnectExisting(e: React.FormEvent) {
    e.preventDefault();
    const input = (
      document.getElementById("existingFamilyId") as HTMLInputElement
    )?.value?.trim();
    if (!input) return;
    saveFamilyId(input);
    setMsg("Familia conectada!");
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Configuracoes</h1>

      {familyId ? (
        <>
          {/* Connected family */}
          <div className="rounded-xl bg-bg-card border border-border p-4 mb-6">
            <p className="text-sm text-text-muted mb-1">Familia conectada</p>
            <p className="text-sm font-mono bg-bg rounded px-2 py-1 break-all">
              {familyId}
            </p>
            <button
              onClick={() => {
                clearFamilyId();
                setMembers([]);
                setMsg("Desconectado.");
              }}
              className="mt-2 text-xs text-danger hover:underline"
            >
              Desconectar
            </button>
          </div>

          {/* Members */}
          <h2 className="text-lg font-semibold mb-3">Membros da familia</h2>
          <div className="space-y-2 mb-6">
            {members.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum membro cadastrado.</p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    {m.email && (
                      <p className="text-xs text-text-muted">{m.email}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add member */}
          <form onSubmit={handleAddMember} className="space-y-3">
            <h3 className="text-sm font-semibold">Adicionar membro</h3>
            <input
              type="text"
              required
              placeholder="Nome"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
            />
            <input
              type="email"
              placeholder="Email (opcional)"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg-card focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Adicionar
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Create new family */}
          <div className="rounded-xl bg-bg-card border border-border p-6 mb-6">
            <h2 className="font-semibold mb-3">Criar nova familia</h2>
            <form onSubmit={handleCreateFamily} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Nome da familia (ex: Familia Silva)"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {creating ? "Criando..." : "Criar Familia"}
              </button>
            </form>
          </div>

          {/* Connect existing */}
          <div className="rounded-xl bg-bg-card border border-border p-6">
            <h2 className="font-semibold mb-3">Conectar familia existente</h2>
            <form onSubmit={handleConnectExisting} className="space-y-3">
              <input
                id="existingFamilyId"
                type="text"
                required
                placeholder="Cole o UUID da familia"
                className="w-full rounded-lg border border-border px-3 py-2 bg-bg focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Conectar
              </button>
            </form>
          </div>
        </>
      )}

      {msg && (
        <p className="mt-4 text-sm font-medium text-primary">{msg}</p>
      )}
    </div>
  );
}
