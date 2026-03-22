import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { getSession } from "@/src/lib/getSession";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, familyId: currentFamilyId } = await getSession();

    if (currentFamilyId) {
      return NextResponse.json(
        { error: "You already belong to a family" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const familyCode = String(body.familyCode ?? "").trim();

    if (!familyCode) {
      return NextResponse.json(
        { error: "familyCode is required" },
        { status: 400 }
      );
    }

    const client = createSupabaseAdminClient();

    // Verify the family exists
    const { data: family, error: familyError } = await client
      .from("families")
      .select("id, name")
      .eq("id", familyCode)
      .maybeSingle();

    if (familyError || !family) {
      return NextResponse.json(
        { error: "Family not found. Check the code and try again." },
        { status: 404 }
      );
    }

    // Check if there's already a member with this email (link user_id to it)
    if (email) {
      const { data: existingMember } = await client
        .from("family_members")
        .select("id")
        .eq("family_id", family.id)
        .eq("email", email)
        .maybeSingle();

      if (existingMember) {
        await client
          .from("family_members")
          .update({ user_id: userId })
          .eq("id", existingMember.id);

        return NextResponse.json({ data: family });
      }
    }

    // Otherwise create a new member record
    const memberName =
      name ?? email?.split("@")[0] ?? "Membro";

    const { error: insertError } = await client
      .from("family_members")
      .insert({
        family_id: family.id,
        name: memberName,
        email,
        user_id: userId,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: family });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}
