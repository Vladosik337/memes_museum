import * as service from "@/db/memes.service";
import { NextResponse } from "next/server";

// Public endpoint: GET /api/memes/[slug]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const row = await service.getBySlug(slug);
    if (!row || row.status !== "published")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ meme: row });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
