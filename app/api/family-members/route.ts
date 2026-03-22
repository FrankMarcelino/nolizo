import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { getSessionWithFamily } from "@/src/lib/getSession";

export async function GET() {
  try {
    const { familyId } = await getSessionWithFamily();
    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("family_members")
      .select("id, name, email, active")
      .eq("family_id", familyId)
      .eq("active", true)
      .order("name");

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

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("family_members")
      .insert({
        family_id: familyId,
        name,
        email: body.email ? String(body.email).trim() : null,
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
