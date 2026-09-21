"use client";

import { useEffect, useState } from "react";

type Estado = "carregando" | "indisponivel" | "negado" | "ativo" | "inativo" | "sem-sw";

/** VAPID public key (base64url) -> Uint8Array, formato que o browser exige. */
function base64ParaUint8(base64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function AtivarNotificacoes() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setEstado("indisponivel");
      return;
    }
    if (Notification.permission === "denied") {
      setEstado("negado");
      return;
    }
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!reg) {
          setEstado("sem-sw");
          return;
        }
        return reg.pushManager.getSubscription().then((sub) => setEstado(sub ? "ativo" : "inativo"));
      })
      .catch(() => setEstado("sem-sw"));
  }, []);

  async function ativar() {
    setErro("");
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setEstado("negado");
        return;
      }

      const chave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!chave) throw new Error("Chave VAPID publica nao configurada.");

      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) throw new Error("Service worker nao registrado neste navegador.");

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ParaUint8(chave),
      });

      const r = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!r.ok) throw new Error("Nao foi possivel salvar a inscricao.");

      setEstado("ativo");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    }
  }

  return (
    <section className="mt-8 pt-6 border-t border-border">
      <h2 className="text-lg font-semibold mb-1">Lembretes</h2>
      <p className="text-sm text-text-muted mb-4">
        Um aviso por dia sobre contas vencidas e as que vencem amanha.
      </p>

      {estado === "indisponivel" && (
        <p className="text-sm text-text-muted">
          Este navegador nao suporta notificacoes. No iPhone, adicione o app a
          Tela de Inicio pelo Safari — notificacao so funciona com ele instalado.
        </p>
      )}

      {estado === "sem-sw" && (
        <p className="text-sm text-text-muted">
          Os lembretes so funcionam na versao publicada do app, porque o service
          worker nao esta registrado em desenvolvimento.
        </p>
      )}

      {estado === "negado" && (
        <p className="text-sm text-danger">
          As notificacoes foram bloqueadas. Libere nos ajustes do navegador ou do
          aparelho e volte aqui.
        </p>
      )}

      {estado === "ativo" && (
        <p className="text-sm text-success">Lembretes ativados neste aparelho.</p>
      )}

      {estado === "inativo" && (
        <button
          onClick={ativar}
          className="min-h-[44px] w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-bg sm:w-auto"
        >
          Ativar lembretes
        </button>
      )}

      {erro && <p className="mt-3 text-sm text-danger">{erro}</p>}
    </section>
  );
}
