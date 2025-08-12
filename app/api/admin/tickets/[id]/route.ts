import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const body = await req.json();
    const status = body.status as string | undefined;
    if (!status)
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    if (!["active", "cancelled", "used"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db.update(tickets).set({ status }).where(eq(tickets.id, id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
