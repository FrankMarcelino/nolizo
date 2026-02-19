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
        "id,amount,category_id,description,due_date,status,split_mode,priority,interest_rate,penalty_amount,expense_shares(member_id,percentage,fixed_amount)"
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

    const mapped = expenses.map((e) => ({
      ...mapExpense(e),
      hybridScore: computeHybridScore(e, today),
    }));

    const overdue = mapped
      .filter((e) => e.status !== "paga" && e.dueDate < today)
      .sort((a, b) => a.hybridScore - b.hybridScore || a.dueDate.localeCompare(b.dueDate));

    const upcoming = mapped
      .filter((e) => e.status !== "paga" && e.dueDate >= today)
      .sort((a, b) => a.hybridScore - b.hybridScore || a.dueDate.localeCompare(b.dueDate));

    const paid = mapped
      .filter((e) => e.status === "paga")
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));

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
    priority: Number(row.priority ?? 3),
    interestRate: Number(row.interest_rate ?? 0),
    penaltyAmount: Number(row.penalty_amount ?? 0),
    shares: Array.isArray(row.expense_shares)
      ? (row.expense_shares as Record<string, unknown>[]).map((s) => ({
          memberId: s.member_id as string,
          percentage: s.percentage != null ? Number(s.percentage) : null,
          fixedAmount: s.fixed_amount != null ? Number(s.fixed_amount) : null,
        }))
      : [],
  };
}

/**
 * Hybrid priority score (lower = more urgent).
 * Combines user-defined priority (1-5) with automated urgency factors:
 * - Days overdue (more overdue = higher urgency)
 * - Interest rate (higher rate = higher urgency)
 * - Penalty amount relative to expense (higher = higher urgency)
 */
function computeHybridScore(row: Record<string, unknown>, today: string): number {
  const userPriority = Number(row.priority ?? 3);
  const dueDate = row.due_date as string;
  const interestRate = Number(row.interest_rate ?? 0);
  const penaltyAmount = Number(row.penalty_amount ?? 0);
  const amount = Number(row.amount ?? 1);

  const dueMs = new Date(dueDate + "T00:00:00").getTime();
  const todayMs = new Date(today + "T00:00:00").getTime();
  const daysOverdue = Math.max(0, (todayMs - dueMs) / 86_400_000);

  // Urgency bonus: each overdue day reduces score by 0.05, capped at -2.5 (50 days)
  const overdueBonus = Math.min(daysOverdue * 0.05, 2.5);

  // Interest urgency: higher interest = more urgent, capped at -1.0
  const interestBonus = Math.min(interestRate * 0.1, 1.0);

  // Penalty urgency: penalty as % of amount, capped at -0.5
  const penaltyBonus = amount > 0 ? Math.min((penaltyAmount / amount) * 0.5, 0.5) : 0;

  return userPriority - overdueBonus - interestBonus - penaltyBonus;
}
