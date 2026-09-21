// Service worker minimo: habilita instalacao do PWA e serve de base para o
// push da Etapa 5. NAO faz cache de conteudo de propósito — dado financeiro
// desatualizado e pior do que app indisponivel.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Sem handler de fetch: as requisicoes seguem direto para a rede.

// ---------------------------------------------------------------- push

self.addEventListener("push", (event) => {
  // Se o payload nao vier ou nao for JSON, ainda assim mostramos algo:
  // notificacao silenciosamente descartada e pior que uma generica.
  let dados = { titulo: "Nolizo", corpo: "Voce tem contas para revisar." };
  try {
    if (event.data) dados = { ...dados, ...event.data.json() };
  } catch {
    // payload invalido — segue com o texto padrao
  }

  event.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "lembrete-diario", // substitui o anterior em vez de empilhar
      data: { url: "/mes" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = event.notification.data?.url ?? "/mes";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((janelas) => {
        // Se o app ja estiver aberto, foca e navega — nao abre uma segunda aba.
        for (const janela of janelas) {
          if ("focus" in janela) {
            janela.navigate?.(destino);
            return janela.focus();
          }
        }
        return self.clients.openWindow(destino);
      })
  );
});
