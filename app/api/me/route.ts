import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/getSession";

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      userId: session.userId,
      familyId: session.familyId,
      email: session.email,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
