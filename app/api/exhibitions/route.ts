import * as service from "@/db/exhibitions.service";
import type { ExhibitionStatus } from "@/types/exhibition";
import { NextRequest, NextResponse } from "next/server";

// Public list: GET /api/exhibitions?activeOnly=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const q = searchParams.get("q") || undefined;
    // Simplify: default single status string
    const statusParam = searchParams.getAll("status");
    let status: ExhibitionStatus | undefined = "published";
    if (statusParam.length === 1) status = statusParam[0] as ExhibitionStatus;
    else if (statusParam.length > 1) {
      const unique = Array.from(new Set(statusParam)) as ExhibitionStatus[];
      if (unique.length === 1) status = unique[0]!;
      else {
        // використовується перший елемент для статусу (ігнорується) і масив передається через фільтри нижче
        const list = await service.list({ status: unique, q, activeOnly });
        return NextResponse.json({ exhibitions: list });
      }
    }
    const list = await service.list({ status, q, activeOnly });
    return NextResponse.json({ exhibitions: list });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
