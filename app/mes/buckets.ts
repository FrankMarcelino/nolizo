export type Bucket = "atrasado" | "estaSemana" | "depois" | "pago";

export type AgendaItem = {
  id: string;
  description: string | null;
  categoryId: string;
  amount: number;
  /** Vencimento em YYYY-MM-DD. Nunca um Date — ver comentario abaixo. */
  date: string;
  status: string;
};

/**
 * Data local em YYYY-MM-DD.
 *
 * NAO use new Date().toISOString().slice(0,10): toISOString() converte para UTC,
 * e no Brasil (UTC-3) qualquer horario antes das 21h devolve o dia seguinte.
 * Uma conta que vence hoje apareceria como "depois".
 */
export function hojeLocal(d: Date = new Date()): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Soma dias a uma data YYYY-MM-DD. Usa UTC internamente so para evitar DST. */
export function somarDias(isoDate: string, dias: number): string {
  const [a, m, d] = isoDate.split("-").map(Number);
  const base = new Date(Date.UTC(a, m - 1, d));
  base.setUTCDate(base.getUTCDate() + dias);
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${base.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * Em qual balde a conta cai.
 *
 * A DATA manda, nao o status do banco — `status` pode estar desatualizado
 * porque nada recalcula "vencida" automaticamente. A unica coisa que o status
 * decide e se ja foi paga.
 *
 * Comparacao de datas e feita como STRING: YYYY-MM-DD ordena
 * lexicograficamente igual a cronologicamente, e assim nao ha fuso envolvido.
 */
export function bucketDe(item: AgendaItem, hoje: string): Bucket {
  if (item.status === "paga") return "pago";
  if (item.date < hoje) return "atrasado";
  if (item.date <= somarDias(hoje, 7)) return "estaSemana";
  return "depois";
}

export function agrupar(
  items: AgendaItem[],
  hoje: string
): Record<Bucket, AgendaItem[]> {
  const out: Record<Bucket, AgendaItem[]> = {
    atrasado: [],
    estaSemana: [],
    depois: [],
    pago: [],
  };

  for (const item of items) {
    out[bucketDe(item, hoje)].push(item);
  }

  for (const chave of Object.keys(out) as Bucket[]) {
    out[chave].sort((x, y) => x.date.localeCompare(y.date));
  }

  return out;
}
