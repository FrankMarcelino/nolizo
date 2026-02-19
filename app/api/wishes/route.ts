import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const familyId = request.nextUrl.searchParams.get("familyId");
    if (!familyId)
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });

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
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const familyId = String(body.familyId ?? "").trim();
    const name = String(body.name ?? "").trim();
    const targetAmount = Number(body.targetAmount ?? 0);
    const importance = String(body.importance ?? "media");

    if (!familyId || !name || targetAmount <= 0) {
      return NextResponse.json(
        { error: "familyId, name and targetAmount (> 0) are required" },
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
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
