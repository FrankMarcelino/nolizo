"use client";

import { useEffect, useState } from "react";

type FamilyMember = { id: string; name: string; email: string | null; active: boolean };
type Session = { userId: string; familyId: string | null; email: string | null };

export default function ConfiguracoesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.userId) {
          setSession(json);
          if (json.familyId) loadMembers();
        }
      })
      .catch(() => {});
  }, []);

  async function loadMembers() {
    try {
      const res = await fetch("/api/family-members");
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
      setSession((s) => s ? { ...s, familyId: json.data.id } : s);
      setMembers(json.data.members ?? []);
      setMsg("Familia criada com sucesso!");
      setFamilyName("");
    } catch {
      setMsg("Erro de conexao");
    } finally {
      setCreating(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setMsg("");

    try {
      const res = await fetch("/api/family-members", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
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
      loadMembers();
    } catch {
      setMsg("Erro de conexao");
    }
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-text-muted text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-6">Configuracoes</h1>

      {/* Account info */}
      <div className="rounded-xl bg-bg-card border border-border p-4 mb-6">
        <p className="text-xs text-text-muted mb-1">Conta</p>
        <p className="text-sm">{session.email}</p>
      </div>

      {session.familyId ? (
        <>
          <div className="rounded-xl bg-bg-card border border-border p-4 mb-6">
            <p className="text-xs text-text-muted mb-1">ID da familia</p>
            <p className="text-xs font-mono bg-bg rounded px-2 py-1 break-all">
              {session.familyId}
            </p>
          </div>

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
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-bg text-sm font-bold">
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
              className="px-4 py-2 rounded-lg bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Adicionar
            </button>
          </form>
        </>
      ) : (
        <div className="rounded-xl bg-bg-card border border-border p-6">
          <h2 className="font-semibold mb-1">Criar sua familia</h2>
          <p className="text-sm text-text-muted mb-4">
            Voce ainda nao pertence a nenhuma familia.
          </p>
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
              className="px-4 py-2 rounded-lg bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {creating ? "Criando..." : "Criar Familia"}
            </button>
          </form>
        </div>
      )}

      {msg && (
        <p className="mt-4 text-sm font-medium text-primary">{msg}</p>
      )}
    </div>
  );
}
