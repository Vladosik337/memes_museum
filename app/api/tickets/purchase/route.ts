import { db } from "@/db";
import { purchases, ticket_guests, tickets } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Очікувані поля: firstName, lastName, email, date, comment, guests (масив), userId
    const { firstName, lastName, email, date, comment, guests, userId } = body;

    // Створити квиток
    const [ticket] = await db
      .insert(tickets)
      .values({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        visit_date: date,
        comment,
        qr_code: Math.random().toString(36).slice(2, 10), // простий QR
        status: "active",
      })
      .returning();

    // Додати гостей
    if (Array.isArray(guests) && guests.length > 0) {
      await db.insert(ticket_guests).values(
        guests.map((g: any) => ({
          ticket_id: ticket.id,
          first_name: g.firstName,
          last_name: g.lastName,
        }))
      );
    }

    // Додати покупку
    await db.insert(purchases).values({
      user_id: userId,
      purchase_date: date,
      total_amount: 1 + (guests?.length || 0),
      status: "completed",
    });

    return NextResponse.json({ success: true, ticket });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 400 }
    );
  }
}
