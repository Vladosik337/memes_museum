import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const { text, allow_publish } = await req.json();
  if (!text || typeof allow_publish !== "boolean") {
    return NextResponse.json(
      { success: false, error: "Некоректні дані" },
      { status: 400 }
    );
  }
  await db.insert(reviews).values({
    user_id: Number(session.user.id),
    text,
    allow_publish,
  });
  return NextResponse.json({ success: true });
}
