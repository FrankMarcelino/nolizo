import { NextRequest, NextResponse } from "next/server";
import { createInflow, listInflows } from "@/src/api/inflowsService";
import { getSessionWithFamily } from "@/src/lib/getSession";

export async function GET(request: NextRequest) {
  try {
    const { familyId } = await getSessionWithFamily();
    const { searchParams } = request.nextUrl;

    const data = await listInflows({
      familyId,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId } = await getSessionWithFamily();
    const body = (await request.json()) as Record<string, unknown>;

    const amount = Number(body.amount ?? 0);
    const categoryId = String(body.categoryId ?? "");
    const source = String(body.source ?? "");
    const inflowDate = String(body.inflowDate ?? "");

    if (!categoryId || !inflowDate || !source) {
      return NextResponse.json(
        { error: "categoryId, source and inflowDate are required" },
        { status: 400 }
      );
    }

    const data = await createInflow({
      familyId,
      amount,
      categoryId,
      source,
      inflowDate,
      memberId: body.memberId ? String(body.memberId) : undefined,
      status:
        body.status === "confirmada" || body.status === "projetada"
          ? body.status
          : undefined,
      recurrence: body.recurrence ? String(body.recurrence) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 400;
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status });
  }
}
