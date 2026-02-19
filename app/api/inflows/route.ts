import { NextRequest, NextResponse } from "next/server";
import { createInflow, listInflows } from "@/src/api/inflowsService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const familyId = searchParams.get("familyId");
    if (!familyId)
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });

    const data = await listInflows({
      familyId,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const familyId = String(body.familyId ?? "");
    const amount = Number(body.amount ?? 0);
    const categoryId = String(body.categoryId ?? "");
    const source = String(body.source ?? "");
    const inflowDate = String(body.inflowDate ?? "");

    if (!familyId || !categoryId || !inflowDate || !source) {
      return NextResponse.json(
        { error: "familyId, categoryId, source and inflowDate are required" },
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
    const msg = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
