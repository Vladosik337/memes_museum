import * as service from "@/db/memes.service";
import { NextRequest, NextResponse } from "next/server";

// Public endpoint: GET /api/memes/[slug]
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const row = await service.getBySlug(params.slug);
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
