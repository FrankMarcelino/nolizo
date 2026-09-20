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
