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

    let expensesQuery = client
      .from("expenses")
      .select("id,amount,category_id,description,due_date,status")
      .eq("family_id", familyId);
    if (fromDate) expensesQuery = expensesQuery.gte("due_date", fromDate);
    if (toDate) expensesQuery = expensesQuery.lte("due_date", toDate);

    let inflowsQuery = client
      .from("inflows")
      .select("id,amount,category_id,source,inflow_date,status")
      .eq("family_id", familyId);
    if (fromDate) inflowsQuery = inflowsQuery.gte("inflow_date", fromDate);
    if (toDate) inflowsQuery = inflowsQuery.lte("inflow_date", toDate);

    const [expensesResult, inflowsResult] = await Promise.all([
      expensesQuery,
      inflowsQuery,
    ]);

    if (expensesResult.error)
      return NextResponse.json({ error: expensesResult.error.message }, { status: 500 });
    if (inflowsResult.error)
      return NextResponse.json({ error: inflowsResult.error.message }, { status: 500 });

    const items = [
      ...(expensesResult.data ?? []).map((e) => ({
        id: e.id,
        type: "saida" as const,
        amount: Number(e.amount),
        categoryId: e.category_id,
        description: e.description ?? null,
        date: e.due_date,
        status: e.status,
      })),
      ...(inflowsResult.data ?? []).map((i) => ({
        id: i.id,
        type: "entrada" as const,
        amount: Number(i.amount),
        categoryId: i.category_id,
        description: i.source,
        date: i.inflow_date,
        status: i.status,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const totalIn = items
      .filter((i) => i.type === "entrada")
      .reduce((s, i) => s + i.amount, 0);
    const totalOut = items
      .filter((i) => i.type === "saida")
      .reduce((s, i) => s + i.amount, 0);

    return NextResponse.json({
      data: items,
      summary: { totalIn, totalOut, balance: totalIn - totalOut },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
