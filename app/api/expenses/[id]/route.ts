import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const status = body.status;

    if (status !== "a_vencer" && status !== "vencida" && status !== "paga") {
      return NextResponse.json(
        { error: "status must be a_vencer, vencida or paga" },
        { status: 400 }
      );
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("expenses")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
