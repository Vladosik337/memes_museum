import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, firstName, lastName } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: "Всі поля обовʼязкові" },
      { status: 400 }
    );
  }

  // Перевірка чи email вже існує
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Користувач з таким email вже існує" },
      { status: 409 }
    );
  }

  // Хешування пароля
  const passwordHash = await bcrypt.hash(password, 10);

  // Додавання користувача
  await db.insert(users).values({
    email,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    role: "user",
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json({ success: true });
}
