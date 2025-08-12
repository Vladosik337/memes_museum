import * as service from "@/db/exhibitions.service";
import type { ExhibitionStatus } from "@/types/exhibition";
import { NextRequest, NextResponse } from "next/server";

// /api/admin/exhibitions
// GET: list exhibitions (query params: status, q, activeOnly, includeArchived)
// POST: create exhibition
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.getAll("status");
    const q = searchParams.get("q") || undefined;
    const activeOnly = searchParams.get("activeOnly") === "true";
    const includeArchived = searchParams.get("includeArchived") === "true";

    let status: ExhibitionStatus | ExhibitionStatus[] | undefined = undefined;
    if (statusParam.length === 1) status = statusParam[0] as ExhibitionStatus;
    else if (statusParam.length > 1) status = statusParam as ExhibitionStatus[]; // масив статусів

    const list = await service.list({ status, q, activeOnly, includeArchived });
    return NextResponse.json({ exhibitions: list });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await service.create(body);
    return NextResponse.json({ exhibition: created }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
