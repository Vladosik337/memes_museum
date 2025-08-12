import { db, meme_media } from "@/db";
import type { MemeStatus } from "@/db/memes.service";
import * as service from "@/db/memes.service";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// /api/admin/memes
// GET: list memes (query params: q, status, tag, category, format, limit, offset)
// POST: create meme
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const statusParams = searchParams.getAll("status");
    const tag = searchParams.get("tag") || undefined;
    const category = searchParams.get("category") || undefined;
    const format = searchParams.get("format") || undefined;
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    let status: MemeStatus | MemeStatus[] | undefined = undefined;
    if (statusParams.length === 1) status = statusParams[0] as MemeStatus;
    else if (statusParams.length > 1) status = statusParams as MemeStatus[];

    const list = await service.list({
      q,
      status,
      tag,
      category,
      format,
      limit,
      offset,
    });

    // прив'язка медіа до мемів
    const ids = list.map((m) => m.id);
    const mediaMap: Record<number, (typeof meme_media.$inferSelect)[]> = {};
    if (ids.length) {
      const rows = await db
        .select()
        .from(meme_media)
        .where(inArray(meme_media.meme_id, ids));
      for (const r of rows) {
        if (!mediaMap[r.meme_id]) mediaMap[r.meme_id] = [];
        mediaMap[r.meme_id].push(r);
      }
      // сортування масивів медіа за is_primary desc, а потім order_index asc
      for (const id of Object.keys(mediaMap)) {
        mediaMap[+id].sort(
          (a, b) =>
            (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) ||
            (a.order_index ?? 0) - (b.order_index ?? 0)
        );
      }
    }

    return NextResponse.json({
      memes: list.map((m) => ({ ...m, media: mediaMap[m.id] || [] })),
    });
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
    return NextResponse.json({ meme: created }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
