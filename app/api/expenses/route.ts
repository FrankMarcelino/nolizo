import { NextRequest, NextResponse } from "next/server";
import { createExpense, listExpenses } from "@/src/api/expensesService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const familyId = searchParams.get("familyId");

    if (!familyId) {
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });
    }

    const data = await listExpenses({
      familyId,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
    });

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const familyId = String(body.familyId ?? "");
    const amount = Number(body.amount ?? 0);
    const categoryId = String(body.categoryId ?? "");
    const dueDate = String(body.dueDate ?? "");
    const splitMode = String(body.splitMode ?? "igual") as
      | "igual"
      | "percentual"
      | "valorFixo";
    const responsibleMemberIds = Array.isArray(body.responsibleMemberIds)
      ? body.responsibleMemberIds.map((item) => String(item))
      : [];

    if (!familyId || !categoryId || !dueDate) {
      return NextResponse.json(
        { error: "familyId, categoryId and dueDate are required" },
        { status: 400 }
      );
    }

    const shares = Array.isArray(body.shares)
      ? body.shares.map((item) => {
          const s = item as Record<string, unknown>;
          return {
            memberId: String(s.memberId ?? ""),
            percentage:
              s.percentage == null ? undefined : Number(s.percentage),
            fixedAmount:
              s.fixedAmount == null ? undefined : Number(s.fixedAmount),
          };
        })
      : undefined;

    const data = await createExpense({
      familyId,
      amount,
      categoryId,
      dueDate,
      splitMode,
      responsibleMemberIds,
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description
          : undefined,
      status:
        body.status === "a_vencer" ||
        body.status === "vencida" ||
        body.status === "paga"
          ? body.status
          : undefined,
      shares,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const details =
      error instanceof Error && "details" in error
        ? (error as Error & { details?: unknown }).details
        : undefined;
    return NextResponse.json({ error: message, details }, { status: 400 });
  }
}
