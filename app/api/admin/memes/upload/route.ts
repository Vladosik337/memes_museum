import crypto from "crypto";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// POST /api/admin/memes/upload
// приймає multipart/form-data з полем: file (image/jpeg)
// опціональне поле: slugBase (використовується для генерації slug-friendly імені файлу)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }
    if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
      return NextResponse.json({ error: "Only jpg/jpeg" }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }
    const slugBase = (
      formData.get("slugBase") ||
      file.name ||
      "meme"
    ).toString();
    const slug =
      slugBase
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-") || crypto.randomBytes(4).toString("hex");
    const fileName = slug + ".jpg";
    const publicDir = path.join(process.cwd(), "public", "memes");
    const dest = path.join(publicDir, fileName);
    await writeFile(dest, buffer);
    return NextResponse.json({ slug, url: `/memes/${fileName}` });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
