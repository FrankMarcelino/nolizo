/**
 * Aceita apenas endpoints HTTPS de servicos de push reais.
 * O cron faz POST para este endereco a partir da infraestrutura da Vercel:
 * sem esta checagem, qualquer usuario logado poderia apontar o servidor
 * para um endereco interno (SSRF).
 */
const HOSTS_PERMITIDOS = [
  "fcm.googleapis.com",                 // Chrome / Android
  "updates.push.services.mozilla.com",  // Firefox
  "web.push.apple.com",                 // Safari / iOS
];
const SUFIXOS_PERMITIDOS = [".push.apple.com", ".notify.windows.com"];

export function endpointPermitido(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== "443") return false;
  const host = url.hostname.toLowerCase();
  return (
    HOSTS_PERMITIDOS.includes(host) ||
    SUFIXOS_PERMITIDOS.some((s) => host.endsWith(s))
  );
}
