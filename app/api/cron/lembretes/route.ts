import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import webpush from "web-push";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { montarLembrete, type ContaLembrete } from "@/src/domain/lembretes";
import { endpointPermitido } from "@/src/domain/pushEndpoint";

/**
 * ESTA ROTA NAO USA getSession().
 *
 * Ela roda sem usuario, chamada pelo cron da Vercel. A autenticacao e o header
 * Authorization: Bearer ${CRON_SECRET}. Sem essa checagem, seria uma URL publica
 * capaz de disparar notificacoes para a familia. E a unica rota do projeto com
 * esse padrao.
 */

/** Data local de Fortaleza (UTC-3) em YYYY-MM-DD, sem depender do TZ do runtime. */
function hojeEmFortaleza(): string {
  const agora = new Date();
  const utc = agora.getTime() + agora.getTimezoneOffset() * 60_000;
  const local = new Date(utc - 3 * 60 * 60_000);
  const mes = String(local.getMonth() + 1).padStart(2, "0");
  const dia = String(local.getDate()).padStart(2, "0");
  return `${local.getFullYear()}-${mes}-${dia}`;
}

export async function GET(request: NextRequest) {
  const esperado = process.env.CRON_SECRET;
  if (!esperado) {
    return NextResponse.json({ error: "CRON_SECRET nao configurado" }, { status: 500 });
  }
  const recebido = request.headers.get("authorization") ?? "";
  const esperadoBearer = `Bearer ${esperado}`;
  const bufRecebido = Buffer.from(recebido);
  const bufEsperado = Buffer.from(esperadoBearer);
  // timingSafeEqual lanca excecao se os buffers tiverem tamanhos diferentes,
  // entao o tamanho e comparado antes — essa comparacao de tamanho nao vaza
  // o segredo, so o comprimento do header recebido.
  if (
    bufRecebido.length !== bufEsperado.length ||
    !timingSafeEqual(bufRecebido, bufEsperado)
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const publica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privada = process.env.VAPID_PRIVATE_KEY;
  const assunto = process.env.VAPID_SUBJECT;
  if (!publica || !privada || !assunto) {
    return NextResponse.json({ error: "Chaves VAPID nao configuradas" }, { status: 500 });
  }
  webpush.setVapidDetails(assunto, publica, privada);

  const client = createSupabaseAdminClient();
  const hoje = hojeEmFortaleza();

  const { data: inscricoes, error: erroInsc } = await client
    .from("push_subscriptions")
    .select("id,family_id,endpoint,p256dh,auth");

  if (erroInsc) {
    return NextResponse.json({ error: erroInsc.message }, { status: 500 });
  }

  const familias = [...new Set((inscricoes ?? []).map((i) => i.family_id))];
  let enviadas = 0;
  let removidas = 0;
  const semNovidade: string[] = [];

  // Amanha entra na janela: sem isso, montarLembrete nunca veria as contas do
  // dia seguinte e o aviso "vence amanha" seria codigo morto.
  const amanha = (() => {
    const [a, m, d] = hoje.split("-").map(Number);
    const base = new Date(Date.UTC(a, m - 1, d));
    base.setUTCDate(base.getUTCDate() + 1);
    const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(base.getUTCDate()).padStart(2, "0");
    return `${base.getUTCFullYear()}-${mm}-${dd}`;
  })();

  for (const familyId of familias) {
    const { data: contas } = await client
      .from("expenses")
      .select("description,category_id,amount,due_date,status")
      .eq("family_id", familyId)
      .neq("status", "paga")
      .lte("due_date", amanha)
      .order("due_date");

    const lembrete = montarLembrete((contas ?? []) as ContaLembrete[], hoje);
    if (!lembrete) {
      semNovidade.push(familyId);
      continue;
    }

    const alvos = (inscricoes ?? []).filter((i) => i.family_id === familyId);
    for (const alvo of alvos) {
      // Defesa em profundidade: uma linha gravada antes da validacao de
      // entrada em /api/push/subscribe nao e confiavel. Nao remover aqui —
      // so nao enviar.
      if (!endpointPermitido(alvo.endpoint)) {
        continue;
      }
      try {
        await webpush.sendNotification(
          {
            endpoint: alvo.endpoint,
            keys: { p256dh: alvo.p256dh, auth: alvo.auth },
          },
          JSON.stringify(lembrete)
        );
        enviadas++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 = inscricao morta (app desinstalado, permissao revogada).
        // Remover, senao o cron tenta para sempre.
        if (status === 404 || status === 410) {
          await client.from("push_subscriptions").delete().eq("id", alvo.id);
          removidas++;
        }
      }
    }
  }

  // Nunca logar endpoint nem chaves — sao credenciais de envio.
  return NextResponse.json({
    ok: true,
    hoje,
    familias: familias.length,
    enviadas,
    removidas,
    semNovidade: semNovidade.length,
  });
}
