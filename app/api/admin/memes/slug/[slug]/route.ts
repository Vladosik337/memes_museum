import * as service from "@/db/memes.service";
import { NextResponse } from "next/server";

// /api/admin/memes/slug/[slug]
// GET: fetch full meme by slug (admin view)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug)
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    const meme = await service.getBySlug(slug);
    if (!meme)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ meme });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
