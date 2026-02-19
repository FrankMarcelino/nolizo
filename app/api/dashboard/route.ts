import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const familyId = request.nextUrl.searchParams.get("familyId");
    if (!familyId)
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });

    const client = createSupabaseAdminClient();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const [expensesRes, inflowsRes, overdueRes, wishesRes, assetsRes, monthlyExpRes, monthlyInflowRes] =
      await Promise.all([
        client
          .from("expenses")
          .select("id, amount, status, due_date, category_id")
          .eq("family_id", familyId)
          .gte("due_date", monthStart)
          .lte("due_date", monthEnd),

        client
          .from("inflows")
          .select("id, amount, status, received_date")
          .eq("family_id", familyId)
          .gte("received_date", monthStart)
          .lte("received_date", monthEnd),

        client
          .from("expenses")
          .select("id, amount")
          .eq("family_id", familyId)
          .eq("status", "vencida"),

        client
          .from("wishes")
          .select("id, target_amount, fulfilled")
          .eq("family_id", familyId)
          .eq("fulfilled", false),

        client
          .from("assets")
          .select("id, estimated_value, category")
          .eq("family_id", familyId),

        // Last 6 months of expenses for trend chart
        client
          .from("expenses")
          .select("amount, due_date")
          .eq("family_id", familyId)
          .gte("due_date", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10))
          .lte("due_date", monthEnd)
          .order("due_date"),

        // Last 6 months of inflows for trend chart
        client
          .from("inflows")
          .select("amount, received_date")
          .eq("family_id", familyId)
          .gte("received_date", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10))
          .lte("received_date", monthEnd)
          .order("received_date"),
      ]);

    const expenses = expensesRes.data ?? [];
    const inflows = inflowsRes.data ?? [];
    const overdue = overdueRes.data ?? [];
    const wishes = wishesRes.data ?? [];
    const assets = assetsRes.data ?? [];
    const monthlyExpenses = monthlyExpRes.data ?? [];
    const monthlyInflows = monthlyInflowRes.data ?? [];

    const totalExpensesMonth = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalInflowsMonth = inflows.reduce((s, i) => s + Number(i.amount), 0);
    const paidMonth = expenses
      .filter((e) => e.status === "paga")
      .reduce((s, e) => s + Number(e.amount), 0);
    const pendingMonth = totalExpensesMonth - paidMonth;
    const balanceMonth = totalInflowsMonth - totalExpensesMonth;
    const totalOverdue = overdue.reduce((s, e) => s + Number(e.amount), 0);
    const totalWishes = wishes.reduce((s, w) => s + Number(w.target_amount), 0);
    const totalAssets = assets.reduce((s, a) => s + Number(a.estimated_value), 0);

    // Expense breakdown by category (top 5)
    const catMap = new Map<string, number>();
    for (const e of expenses) {
      const cat = e.category_id ?? "sem_categoria";
      catMap.set(cat, (catMap.get(cat) ?? 0) + Number(e.amount));
    }
    const categoryBreakdown = [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

    // Monthly trend (last 6 months)
    const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const trend: { month: string; despesas: number; entradas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${MONTHS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

      const expTotal = monthlyExpenses
        .filter((e) => (e.due_date as string).startsWith(key))
        .reduce((s, e) => s + Number(e.amount), 0);
      const infTotal = monthlyInflows
        .filter((i) => (i.received_date as string).startsWith(key))
        .reduce((s, i) => s + Number(i.amount), 0);

      trend.push({
        month: label,
        despesas: Math.round(expTotal * 100) / 100,
        entradas: Math.round(infTotal * 100) / 100,
      });
    }

    // Status breakdown for pie chart
    const statusBreakdown = [
      { name: "Pagas", value: paidMonth },
      { name: "Pendentes", value: expenses.filter((e) => e.status === "a_vencer").reduce((s, e) => s + Number(e.amount), 0) },
      { name: "Vencidas", value: expenses.filter((e) => e.status === "vencida").reduce((s, e) => s + Number(e.amount), 0) },
    ].filter((s) => s.value > 0);

    // Assets by category for pie chart
    const assetCatMap = new Map<string, number>();
    for (const a of assets) {
      const cat = a.category ?? "Outro";
      assetCatMap.set(cat, (assetCatMap.get(cat) ?? 0) + Number(a.estimated_value));
    }
    const assetBreakdown = [...assetCatMap.entries()].map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    return NextResponse.json({
      summary: {
        totalInflowsMonth,
        totalExpensesMonth,
        paidMonth,
        pendingMonth,
        balanceMonth,
        totalOverdue,
        overdueCount: overdue.length,
        totalWishes,
        wishesCount: wishes.length,
        totalAssets,
        assetsCount: assets.length,
      },
      categoryBreakdown,
      statusBreakdown,
      trend,
      assetBreakdown,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
