import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, first_name, last_name } = body;

  if (!email || !first_name || !last_name) {
    return NextResponse.json(
      { error: "Всі поля обовʼязкові" },
      { status: 400 }
    );
  }

  // Оновити користувача
  await db
    .update(users)
    .set({ first_name, last_name, updated_at: new Date() })
    .where(eq(users.email, email));

  return NextResponse.json({ success: true });
}
