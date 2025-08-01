import { db } from "@/db";
import { purchases, ticket_guests, tickets } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

// Тип для тіла запиту
interface Guest {
  firstName: string;
  lastName: string;
}
interface TicketPurchaseBody {
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  comment?: string;
  guests: Guest[];
  userId: number;
}

function validate(body: TicketPurchaseBody): string | null {
  if (!body.firstName?.trim()) return "Вкажіть ім'я";
  if (!body.lastName?.trim()) return "Вкажіть прізвище";
  if (!body.email?.trim() || !body.email.includes("@"))
    return "Некоректний email";
  if (!body.date?.trim()) return "Вкажіть дату";
  if (!body.userId) return "userId обов'язковий";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: TicketPurchaseBody = await req.json();
    const error = validate(body);
    if (error)
      return NextResponse.json({ success: false, error }, { status: 400 });

    // Створити квиток
    const [ticket] = await db
      .insert(tickets)
      .values({
        user_id: body.userId,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        visit_date: body.date,
        comment: body.comment,
        qr_code: Math.random().toString(36).slice(2, 10),
        status: "active",
      })
      .returning();

    // Додати гостей
    let guestsResult: Guest[] = [];
    if (Array.isArray(body.guests) && body.guests.length > 0) {
      await db.insert(ticket_guests).values(
        body.guests.map((g) => ({
          ticket_id: ticket.id,
          first_name: g.firstName,
          last_name: g.lastName,
        }))
      );
      guestsResult = body.guests;
    }

    // Додати покупку
    const [purchase] = await db
      .insert(purchases)
      .values({
        user_id: body.userId,
        purchase_date: body.date,
        total_amount: 1 + (body.guests?.length || 0),
        status: "completed",
      })
      .returning();

    return NextResponse.json({
      success: true,
      ticket,
      guests: guestsResult,
      purchase,
    });
  } catch (e) {
    console.error("[TicketPurchaseAPI]", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
