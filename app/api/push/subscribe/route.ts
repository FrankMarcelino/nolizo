import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { getSessionWithFamily } from "@/src/lib/getSession";
import { endpointPermitido } from "@/src/domain/pushEndpoint";

export async function POST(request: NextRequest) {
  try {
    const { familyId, userId } = await getSessionWithFamily();
    const body = await request.json();

    const endpoint = String(body?.endpoint ?? "");
    const p256dh = String(body?.keys?.p256dh ?? "");
    const auth = String(body?.keys?.auth ?? "");

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: "endpoint e keys.p256dh/auth sao obrigatorios" },
        { status: 400 }
      );
    }

    // O cron faz POST para este endereco a partir da infraestrutura da
    // Vercel: sem esta checagem, um endpoint arbitrario seria um SSRF.
    // Nao ecoar o endpoint na resposta de erro.
    if (!endpointPermitido(endpoint)) {
      return NextResponse.json(
        { error: "endpoint invalido" },
        { status: 400 }
      );
    }

    const client = createSupabaseAdminClient();

    const { data: membro } = await client
      .from("family_members")
      .select("id")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();

    // onConflict no endpoint: o mesmo aparelho reinscreve sempre que a
    // permissao e reconcedida ou a inscricao expira. Sem isso, duplicaria.
    const { error } = await client.from("push_subscriptions").upsert(
      {
        family_id: familyId,
        member_id: membro?.id ?? null,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // NAO devolver o endpoint nem as chaves — sao credenciais de envio.
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}
