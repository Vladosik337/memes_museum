import { db, meme_media, memes } from "@/db";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/memes/random
export async function GET() {
  try {
    const [row] = await db
      .select({
        id: memes.id,
        slug: memes.slug,
        title: memes.title,
        short_description: memes.short_description,
      })
      .from(memes)
      .where(eq(memes.status, "published"))
      .orderBy(sql`random()`)
      .limit(1);

    if (!row) {
      return NextResponse.json({ meme: null }, { status: 200 });
    }

    const media = await db
      .select()
      .from(meme_media)
      .where(eq(meme_media.meme_id, row.id));

    const primary = media.find((m) => m.is_primary) || media[0] || null;

    return NextResponse.json({
      meme: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        short_description: row.short_description,
        media: primary ? [primary] : [],
      },
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
