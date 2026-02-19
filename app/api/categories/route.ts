import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function GET() {
  try {
    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("categories")
      .select("id, name, type, is_custom, is_favorite")
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
