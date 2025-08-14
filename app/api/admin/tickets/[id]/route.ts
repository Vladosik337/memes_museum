import { db } from "@/db";
import { tickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = Number(id);
    if (Number.isNaN(idNum))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const body = await req.json();
    const status = body.status as string | undefined;
    if (!status)
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    if (!["active", "cancelled", "used"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await db.update(tickets).set({ status }).where(eq(tickets.id, idNum));
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
