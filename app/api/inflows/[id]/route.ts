import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

const VALID_STATUSES = ["confirmada", "projetada"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const update: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json(
          { error: "status must be confirmada or projetada" },
          { status: 400 }
        );
      }
      update.status = body.status;
    }

    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });
      }
      update.amount = amount;
    }

    if (body.source !== undefined) {
      if (!String(body.source).trim()) {
        return NextResponse.json({ error: "source cannot be empty" }, { status: 400 });
      }
      update.source = body.source;
    }

    if (body.inflowDate !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.inflowDate))) {
        return NextResponse.json({ error: "inflowDate must be YYYY-MM-DD" }, { status: 400 });
      }
      update.inflow_date = body.inflowDate;
    }

    if (body.categoryId !== undefined) {
      update.category_id = body.categoryId;
    }

    if (body.notes !== undefined) {
      update.notes = body.notes || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();
    const { data, error } = await client
      .from("inflows")
      .update(update)
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = createSupabaseAdminClient();
    const { error } = await client.from("inflows").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
