import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const totalInstallments = Math.max(2, Math.min(60, Number(body.totalInstallments ?? 0)));
    const recurrenceType = body.recurrence === "anual" ? "anual" : "mensal";

    if (!totalInstallments || totalInstallments < 2) {
      return NextResponse.json(
        { error: "totalInstallments must be between 2 and 60" },
        { status: 400 }
      );
    }

    const client = createSupabaseAdminClient();

    const { data: original, error: fetchErr } = await client
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const { error: updateErr } = await client
      .from("expenses")
      .update({
        recurrence: recurrenceType,
        installment_number: 1,
        total_installments: totalInstallments,
        description: `${original.description ?? original.category_id} (1/${totalInstallments})`,
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const startDate = new Date(original.due_date + "T00:00:00");
    const created = [];

    for (let i = 2; i <= totalInstallments; i++) {
      const nextDate = new Date(startDate);
      if (recurrenceType === "mensal") {
        nextDate.setMonth(nextDate.getMonth() + (i - 1));
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + (i - 1));
      }

      const { data: inst, error: instErr } = await client
        .from("expenses")
        .insert({
          family_id: original.family_id,
          amount: original.amount,
          category_id: original.category_id,
          description: `${original.description ?? original.category_id} (${i}/${totalInstallments})`,
          due_date: nextDate.toISOString().slice(0, 10),
          status: "a_vencer",
          split_mode: original.split_mode,
          expense_type: original.expense_type,
          recurrence: recurrenceType,
          recurrence_parent_id: id,
          installment_number: i,
          total_installments: totalInstallments,
          priority: original.priority,
          interest_rate: original.interest_rate,
          penalty_amount: original.penalty_amount,
        })
        .select("id")
        .single();

      if (instErr) {
        return NextResponse.json({ error: instErr.message }, { status: 500 });
      }

      if (original.split_mode && original.family_id) {
        const { data: shares } = await client
          .from("expense_shares")
          .select("member_id,percentage,fixed_amount")
          .eq("expense_id", id);

        if (shares && shares.length > 0 && inst) {
          await client.from("expense_shares").insert(
            shares.map((s) => ({
              expense_id: inst.id,
              member_id: s.member_id,
              percentage: s.percentage,
              fixed_amount: s.fixed_amount,
            }))
          );
        }
      }

      created.push(inst);
    }

    return NextResponse.json(
      { message: `${created.length} installments created`, count: created.length },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
