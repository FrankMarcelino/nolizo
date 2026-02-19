import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const familyId = searchParams.get("familyId");
    if (!familyId)
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });

    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const client = createSupabaseAdminClient();

    let expQuery = client
      .from("expenses")
      .select(
        "id,amount,category_id,description,due_date,status,split_mode,expense_shares(member_id,percentage,fixed_amount)"
      )
      .eq("family_id", familyId);

    if (fromDate) expQuery = expQuery.gte("due_date", fromDate);
    if (toDate) expQuery = expQuery.lte("due_date", toDate);

    let inflowQuery = client
      .from("inflows")
      .select("id,amount,inflow_date,status")
      .eq("family_id", familyId);

    if (fromDate) inflowQuery = inflowQuery.gte("inflow_date", fromDate);
    if (toDate) inflowQuery = inflowQuery.lte("inflow_date", toDate);

    const [expResult, inflowResult] = await Promise.all([expQuery, inflowQuery]);

    if (expResult.error)
      return NextResponse.json({ error: expResult.error.message }, { status: 500 });
    if (inflowResult.error)
      return NextResponse.json({ error: inflowResult.error.message }, { status: 500 });

    const today = new Date().toISOString().slice(0, 10);
    const expenses = expResult.data ?? [];

    const overdue = expenses
      .filter((e) => e.status !== "paga" && e.due_date < today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .map(mapExpense);

    const upcoming = expenses
      .filter((e) => e.status !== "paga" && e.due_date >= today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .map(mapExpense);

    const paid = expenses
      .filter((e) => e.status === "paga")
      .sort((a, b) => b.due_date.localeCompare(a.due_date))
      .map(mapExpense);

    const totalDebt =
      overdue.reduce((s, e) => s + e.amount, 0) +
      upcoming.reduce((s, e) => s + e.amount, 0);

    const totalIncome = (inflowResult.data ?? []).reduce(
      (s, i) => s + Number(i.amount),
      0
    );

    const coveragePercent =
      totalDebt > 0 ? Math.min(100, (totalIncome / totalDebt) * 100) : 100;

    return NextResponse.json({
      overdue,
      upcoming,
      paid,
      summary: {
        totalDebt,
        totalIncome,
        coveragePercent: Math.round(coveragePercent * 100) / 100,
        gap: Math.max(0, totalDebt - totalIncome),
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function mapExpense(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    amount: Number(row.amount),
    categoryId: row.category_id as string,
    description: (row.description as string) ?? null,
    dueDate: row.due_date as string,
    status: row.status as string,
    shares: Array.isArray(row.expense_shares)
      ? (row.expense_shares as Record<string, unknown>[]).map((s) => ({
          memberId: s.member_id as string,
          percentage: s.percentage != null ? Number(s.percentage) : null,
          fixedAmount: s.fixed_amount != null ? Number(s.fixed_amount) : null,
        }))
      : [],
  };
}
