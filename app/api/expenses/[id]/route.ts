import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

const VALID_STATUSES = ["a_vencer", "vencida", "paga"] as const;
const EXTRA_COLUMNS = ["expense_type", "recurrence"] as const;

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
          { error: "status must be a_vencer, vencida or paga" },
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

    if (body.description !== undefined) {
      update.description = body.description || null;
    }

    if (body.dueDate !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.dueDate))) {
        return NextResponse.json({ error: "dueDate must be YYYY-MM-DD" }, { status: 400 });
      }
      update.due_date = body.dueDate;
    }

    if (body.categoryId !== undefined) {
      update.category_id = body.categoryId;
    }

    if (body.expenseType !== undefined) {
      if (body.expenseType !== "fixa" && body.expenseType !== "variavel") {
        return NextResponse.json(
          { error: "expenseType must be fixa or variavel" },
          { status: 400 }
        );
      }
      update.expense_type = body.expenseType;
    }

    if (body.recurrence !== undefined) {
      if (!["unica", "mensal", "anual"].includes(body.recurrence as string)) {
        return NextResponse.json(
          { error: "recurrence must be unica, mensal or anual" },
          { status: 400 }
        );
      }
      update.recurrence = body.recurrence;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();

    const { data, error } = await client
      .from("expenses")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      const isColumnError = EXTRA_COLUMNS.some(
        (col) => col in update && error.message.includes(col)
      );
      if (isColumnError) {
        const safeUpdate = { ...update };
        for (const col of EXTRA_COLUMNS) delete safeUpdate[col];

        if (Object.keys(safeUpdate).length === 0) {
          return NextResponse.json({ data: { id } });
        }

        const retry = await client
          .from("expenses")
          .update(safeUpdate)
          .eq("id", id)
          .select()
          .single();

        if (retry.error) {
          return NextResponse.json({ error: retry.error.message }, { status: 500 });
        }
        return NextResponse.json({ data: retry.data });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
    const { error } = await client.from("expenses").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
