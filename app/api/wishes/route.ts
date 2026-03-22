import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { getSessionWithFamily } from "@/src/lib/getSession";

export async function GET() {
  try {
    const { familyId } = await getSessionWithFamily();
    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("wishes")
      .select("*")
      .eq("family_id", familyId)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId } = await getSessionWithFamily();
    const body = (await request.json()) as Record<string, unknown>;

    const name = String(body.name ?? "").trim();
    const targetAmount = Number(body.targetAmount ?? 0);
    const importance = String(body.importance ?? "media");

    if (!name || targetAmount <= 0) {
      return NextResponse.json(
        { error: "name and targetAmount (> 0) are required" },
        { status: 400 }
      );
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("wishes")
      .insert({
        family_id: familyId,
        name,
        target_amount: targetAmount,
        importance,
        target_date: body.targetDate ? String(body.targetDate) : null,
        notes: body.notes ? String(body.notes) : null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}
