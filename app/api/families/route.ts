import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("families")
      .insert({ name })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const members = Array.isArray(body.members) ? body.members : [];
    const insertedMembers = [];

    for (const m of members) {
      const member = m as Record<string, unknown>;
      const memberName = String(member.name ?? "").trim();
      if (!memberName) continue;

      const { data: memberData, error: memberError } = await client
        .from("family_members")
        .insert({
          family_id: data.id,
          name: memberName,
          email: member.email ? String(member.email).trim() : null,
        })
        .select()
        .single();

      if (!memberError && memberData) insertedMembers.push(memberData);
    }

    return NextResponse.json(
      { data: { ...data, members: insertedMembers } },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
