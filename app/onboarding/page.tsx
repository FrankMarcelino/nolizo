"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "escolha" | "criar" | "entrar" | "membros" | "pronto";

type CreatedFamily = { id: string; name: string };

type Member = { name: string; email: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState<Step>("escolha");
  const [family, setFamily] = useState<CreatedFamily | null>(null);

  // Familia nova
  const [familyName, setFamilyName] = useState("");
  // Entrar em familia
  const [familyCode, setFamilyCode] = useState("");
  // Membros
  const [members, setMembers] = useState<Member[]>([{ name: "", email: "" }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((json) => {
        // If already has family, skip onboarding
        if (json.familyId) {
          router.replace("/dashboard");
          return;
        }
        if (json.name) setUserName(json.name);
        else if (json.email) setUserName(json.email.split("@")[0]);
      })
      .catch(() => {});
  }, [router]);

  // ── Step: criar família ──────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!familyName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: familyName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erro ao criar família"); return; }
      setFamily({ id: json.data.id, name: json.data.name });
      setStep("membros");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  // ── Step: entrar em família ──────────────────────────────────
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!familyCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/families/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ familyCode: familyCode.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Código inválido"); return; }
      setFamily({ id: json.data.id, name: json.data.name });
      setStep("pronto");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  // ── Step: adicionar membros ──────────────────────────────────
  function updateMember(i: number, field: keyof Member, value: string) {
    setMembers((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  }

  function addMemberRow() {
    setMembers((prev) => [...prev, { name: "", email: "" }]);
  }

  async function handleAddMembers(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const valid = members.filter((m) => m.name.trim());
      for (const m of valid) {
        await fetch("/api/family-members", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: m.name.trim(), email: m.email.trim() || undefined }),
        });
      }
      setStep("pronto");
    } catch {
      setError("Erro ao adicionar membros");
    } finally {
      setLoading(false);
    }
  }

  // ── Layout wrapper ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <StepIndicator step={step} />
      </div>

      <div className="w-full max-w-md">
        {/* ── ESCOLHA ── */}
        {step === "escolha" && (
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Olá{userName ? `, ${userName}` : ""}! 👋
            </h1>
            <p className="text-text-muted text-sm mb-8">
              Vamos configurar suas finanças. Você quer criar uma família nova ou entrar em uma existente?
            </p>

            <div className="grid gap-3">
              <button
                onClick={() => setStep("criar")}
                className="flex items-start gap-4 rounded-xl border border-border bg-bg-card p-5 text-left hover:border-primary transition-colors group"
              >
                <span className="text-2xl mt-0.5">🏠</span>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    Criar uma família nova
                  </p>
                  <p className="text-text-muted text-sm mt-0.5">
                    Sou o primeiro a usar. Vou configurar e convidar os outros.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setStep("entrar")}
                className="flex items-start gap-4 rounded-xl border border-border bg-bg-card p-5 text-left hover:border-primary transition-colors group"
              >
                <span className="text-2xl mt-0.5">🔑</span>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">
                    Entrar em família existente
                  </p>
                  <p className="text-text-muted text-sm mt-0.5">
                    Alguém já criou. Tenho o código da família.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── CRIAR ── */}
        {step === "criar" && (
          <div>
            <button
              onClick={() => { setStep("escolha"); setError(""); }}
              className="text-xs text-text-muted hover:text-text mb-6 flex items-center gap-1"
            >
              ← Voltar
            </button>
            <h2 className="text-xl font-bold mb-1">Como se chama sua família?</h2>
            <p className="text-text-muted text-sm mb-6">
              Pode ser o sobrenome, um apelido — como preferir.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Família Silva, Eu e a Mari, Casa dos Amigos..."
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-bg-card focus:outline-none focus:border-primary text-sm"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading || !familyName.trim()}
                className="w-full py-3 rounded-xl bg-primary text-bg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar família →"}
              </button>
            </form>
          </div>
        )}

        {/* ── ENTRAR ── */}
        {step === "entrar" && (
          <div>
            <button
              onClick={() => { setStep("escolha"); setError(""); }}
              className="text-xs text-text-muted hover:text-text mb-6 flex items-center gap-1"
            >
              ← Voltar
            </button>
            <h2 className="text-xl font-bold mb-1">Código da família</h2>
            <p className="text-text-muted text-sm mb-6">
              Peça para quem criou a família o código (UUID) e cole aqui.
            </p>

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-bg-card focus:outline-none focus:border-primary text-sm font-mono"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading || !familyCode.trim()}
                className="w-full py-3 rounded-xl bg-primary text-bg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar na família →"}
              </button>
            </form>
          </div>
        )}

        {/* ── MEMBROS ── */}
        {step === "membros" && (
          <div>
            <h2 className="text-xl font-bold mb-1">Quem mora com você?</h2>
            <p className="text-text-muted text-sm mb-6">
              Adicione os outros membros da família. Você pode pular e fazer isso depois.
            </p>

            <form onSubmit={handleAddMembers} className="space-y-3">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={m.name}
                    onChange={(e) => updateMember(i, "name", e.target.value)}
                    className="flex-1 rounded-xl border border-border px-3 py-2.5 bg-bg-card focus:outline-none focus:border-primary text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email (opcional)"
                    value={m.email}
                    onChange={(e) => updateMember(i, "email", e.target.value)}
                    className="flex-1 rounded-xl border border-border px-3 py-2.5 bg-bg-card focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addMemberRow}
                className="text-xs text-primary hover:underline"
              >
                + Adicionar mais um
              </button>

              {error && <p className="text-xs text-danger">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("pronto")}
                  className="flex-1 py-3 rounded-xl border border-border text-text-muted text-sm hover:border-primary hover:text-text transition-colors"
                >
                  Pular por agora
                </button>
                <button
                  type="submit"
                  disabled={loading || !members.some((m) => m.name.trim())}
                  className="flex-1 py-3 rounded-xl bg-primary text-bg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm"
                >
                  {loading ? "Salvando..." : "Continuar →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── PRONTO ── */}
        {step === "pronto" && (
          <div className="text-center">
            <div className="text-5xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Tudo pronto!</h2>
            {family && (
              <p className="text-text-muted text-sm mb-2">
                A família <span className="text-text font-medium">{family.name}</span> está configurada.
              </p>
            )}
            <p className="text-text-muted text-sm mb-8">
              Agora você pode começar a registrar suas finanças.
            </p>

            {family && (
              <div className="rounded-xl bg-bg-card border border-border p-4 mb-8 text-left">
                <p className="text-xs text-text-muted mb-1">Código da família</p>
                <p className="text-xs font-mono text-text break-all">{family.id}</p>
                <p className="text-xs text-text-muted mt-2">
                  Compartilhe esse código com os membros para que eles possam entrar.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-xl bg-primary text-bg font-semibold hover:bg-primary-hover transition-colors"
            >
              Ir ao Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ["escolha", "criar", "membros", "pronto"];
  // "entrar" bypasses membros
  const currentIndex = steps.indexOf(step === "entrar" ? "criar" : step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const labels: Record<Step, string> = {
          escolha: "Início",
          criar: "Família",
          entrar: "Família",
          membros: "Membros",
          pronto: "Pronto",
        };
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-success text-bg"
                    : active
                    ? "bg-primary text-bg"
                    : "bg-bg-elevated text-text-muted"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className="text-[10px] text-text-muted mt-1 hidden sm:block">
                {labels[s]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px transition-colors ${
                  done ? "bg-success" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
