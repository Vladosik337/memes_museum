import * as service from "@/db/memes.service";
import { NextResponse } from "next/server";

// /api/admin/memes/[id]
// PATCH: update meme (partial)
// DELETE: delete meme
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);
  if (Number.isNaN(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    const updated = await service.update(idNum, body);
    return NextResponse.json({ meme: updated });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);
  if (Number.isNaN(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await service.remove(idNum);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
