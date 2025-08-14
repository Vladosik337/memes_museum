import * as service from "@/db/exhibitions.service";
import type { ExhibitionStatus } from "@/types/exhibition";
import { NextResponse } from "next/server";

// /api/admin/exhibitions/[id]
// PATCH: update fields (including status)
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
    return NextResponse.json({ exhibition: updated });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

// POST /api/admin/exhibitions/[id]/status  (alternative we keep setStatus under PATCH? But we expose dedicated method via query param)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);
  if (Number.isNaN(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    const status = body.status as ExhibitionStatus | undefined;
    if (!status)
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    const updated = await service.setStatus(idNum, status);
    return NextResponse.json({ exhibition: updated });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

// /api/admin/exhibitions/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idNum = Number(id);
  if (Number.isNaN(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    const existing = await service.getById(idNum);
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ exhibition: existing });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
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
