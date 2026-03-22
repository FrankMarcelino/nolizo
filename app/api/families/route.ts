import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { getSession } from "@/src/lib/getSession";

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await getSession();
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();

    // Check if user already belongs to a family
    const { data: existing } = await client
      .from("family_members")
      .select("family_id")
      .eq("user_id", userId)
      .eq("active", true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already belong to a family" },
        { status: 400 }
      );
    }

    // Create the family
    const { data: family, error: familyError } = await client
      .from("families")
      .insert({ name })
      .select()
      .single();

    if (familyError) {
      return NextResponse.json({ error: familyError.message }, { status: 500 });
    }

    // Get the user's display name from metadata (set at signup)
    const { data: authUser } = await client.auth.admin.getUserById(userId);
    const memberName =
      (authUser?.user?.user_metadata?.name as string) ||
      email?.split("@")[0] ||
      "Membro";

    // Add the creator as the first member, linked to their auth account
    const { data: member, error: memberError } = await client
      .from("family_members")
      .insert({
        family_id: family.id,
        name: memberName,
        email,
        user_id: userId,
      })
      .select()
      .single();

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json(
      { data: { ...family, members: [member] } },
      { status: 201 }
    );
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}
