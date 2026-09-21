export type ContaLembrete = {
  description: string | null;
  category_id: string;
  amount: number;
  due_date: string;
  status: string;
};

export type Lembrete = { titulo: string; corpo: string };

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Dia seguinte a uma data YYYY-MM-DD. Date.UTC evita DST; a saida e string. */
function amanhaDe(hoje: string): string {
  const [a, m, d] = hoje.split("-").map(Number);
  const base = new Date(Date.UTC(a, m - 1, d));
  base.setUTCDate(base.getUTCDate() + 1);
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${base.getUTCFullYear()}-${mm}-${dd}`;
}

function nome(c: ContaLembrete): string {
  return c.description?.trim() || c.category_id;
}

/**
 * Monta o texto do lembrete diario.
 *
 * Devolve null quando nao ha nada a dizer. Notificacao vazia e pior que
 * nenhuma: treina a pessoa a ignorar o app.
 *
 * Datas sao comparadas como STRING YYYY-MM-DD — nunca parseadas como Date,
 * que em UTC-3 devolveria o dia anterior.
 */
export function montarLembrete(
  contas: ContaLembrete[],
  hoje: string
): Lembrete | null {
  const abertas = contas.filter((c) => c.status !== "paga");
  const amanha = amanhaDe(hoje);

  const vencidas = abertas.filter((c) => c.due_date < hoje);
  const vencemHoje = abertas.filter((c) => c.due_date === hoje);
  const vencemAmanha = abertas.filter((c) => c.due_date === amanha);

  if (
    vencidas.length === 0 &&
    vencemHoje.length === 0 &&
    vencemAmanha.length === 0
  )
    return null;

  const somaVencidas = vencidas.reduce((s, c) => s + Number(c.amount), 0);
  const partes: string[] = [];

  if (vencidas.length > 0) {
    partes.push(
      `Vencidas: ${vencidas.map(nome).join(", ")} — ${brl(somaVencidas)}`
    );
  }

  if (vencemHoje.length > 0) {
    partes.push(
      `Hoje: ${vencemHoje
        .map((c) => `${nome(c)} ${brl(Number(c.amount))}`)
        .join(", ")}`
    );
  }

  if (vencemAmanha.length > 0) {
    partes.push(
      `Amanha: ${vencemAmanha
        .map((c) => `${nome(c)} ${brl(Number(c.amount))}`)
        .join(", ")}`
    );
  }

  const titulo =
    vencidas.length > 0
      ? `${vencidas.length} conta${vencidas.length > 1 ? "s" : ""} vencida${
          vencidas.length > 1 ? "s" : ""
        }`
      : vencemHoje.length > 0
      ? `Vence hoje: ${brl(
          vencemHoje.reduce((s, c) => s + Number(c.amount), 0)
        )}`
      : `Vence amanha: ${brl(
          vencemAmanha.reduce((s, c) => s + Number(c.amount), 0)
        )}`;

  return { titulo, corpo: partes.join(" · ") };
}
