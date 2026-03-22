import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";
import { getSessionWithFamily } from "@/src/lib/getSession";

const VALID_STATUSES = ["a_vencer", "vencida", "paga"] as const;
const EXTRA_COLUMNS = ["expense_type", "recurrence", "has_contract", "contract_start_date", "contract_end_date"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId } = await getSessionWithFamily();
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

    if (body.hasContract !== undefined) {
      update.has_contract = Boolean(body.hasContract);
    }

    if (body.contractStartDate !== undefined) {
      if (body.contractStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.contractStartDate))) {
        return NextResponse.json({ error: "contractStartDate must be YYYY-MM-DD" }, { status: 400 });
      }
      update.contract_start_date = body.contractStartDate || null;
    }

    if (body.contractEndDate !== undefined) {
      if (body.contractEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.contractEndDate))) {
        return NextResponse.json({ error: "contractEndDate must be YYYY-MM-DD" }, { status: 400 });
      }
      update.contract_end_date = body.contractEndDate || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const client = createSupabaseAdminClient();

    // Scope update to the user's family to prevent cross-family access
    const { data, error } = await client
      .from("expenses")
      .update(update)
      .eq("id", id)
      .eq("family_id", familyId)
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
          .eq("family_id", familyId)
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
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId } = await getSessionWithFamily();
    const { id } = await params;
    const client = createSupabaseAdminClient();
    const { error } = await client
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("family_id", familyId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}
