import { db, meme_media } from "@/db";
import type { MemeStatus } from "@/db/memes.service";
import * as service from "@/db/memes.service";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Public list: GET /api/memes?q=&tag=&category=&format=&status=published
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const category = searchParams.get("category") || undefined;
    const format = searchParams.get("format") || undefined;
    const statusParams = searchParams.getAll("status");
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    let status: MemeStatus | MemeStatus[] | undefined = ["published"];
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

    // повертаємо тільки опубліковані або дозволені статуси (вже відфільтровані) + мінімальні медіа
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
    }
    return NextResponse.json({
      memes: list.map((m) => ({
        id: m.id,
        slug: m.slug,
        title: m.title,
        short_description: m.short_description,
        status: m.status,
        media: mediaMap[m.id]?.filter((x) => x.is_primary).slice(0, 1) || [],
      })),
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
