import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const familyId = request.nextUrl.searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("family_members")
      .select("id, name, email, active")
      .eq("family_id", familyId)
      .eq("active", true)
      .order("name");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
