"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) {
          setError(error.message);
          return;
        }
        setSuccess(
          "Conta criada! Verifique seu email para confirmar o cadastro."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setError(
            error.message === "Invalid login credentials"
              ? "Email ou senha incorretos."
              : error.message
          );
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto pt-16">
      <h1 className="text-3xl font-bold text-center mb-1 text-primary">
        Nolizo
      </h1>
      <p className="text-center text-text-muted text-sm mb-8">
        Finanças da Família
      </p>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex gap-1 mb-6 bg-bg rounded-lg p-1">
          <button
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "login"
                ? "bg-primary text-bg"
                : "text-text-muted hover:text-text"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "signup"
                ? "bg-primary text-bg"
                : "text-text-muted hover:text-text"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              required
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-bg text-sm focus:outline-none focus:border-primary"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full rounded-lg border border-border px-3 py-2 bg-bg text-sm focus:outline-none focus:border-primary"
          />

          {error && <p className="text-xs text-danger">{error}</p>}
          {success && <p className="text-xs text-success">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
