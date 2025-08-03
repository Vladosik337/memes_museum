import { db } from "@/db";
import { purchases, tickets } from "@/db/schema";
import type { MuseumPurchase, MuseumTicket } from "@/types/entities";
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

  // Перевірка дати
  const now = new Date();
  const visitDate = new Date(body.date);
  visitDate.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (visitDate < today) return "Неможливо купити квиток на минулі дні";

  // Перевірка часу (тільки якщо купується на сьогодні)
  if (visitDate.getTime() === today.getTime()) {
    const currentHour = now.getHours();
    if (currentHour < 10 || currentHour >= 17) {
      return "Квитки можна купити лише з 10:00 до 17:00 (за годину до закриття)";
    }
  }
  return null;
}

function formatDateForDB(dateString: string): string {
  // Конвертація у формат YYYY-MM-DD для PostgreSQL
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Некоректний формат дати");
  }
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function generateTicketNumber(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `TKT-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(
    now.getSeconds()
  )}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateQrCode(ticketNumber: string, email: string): string {
  return JSON.stringify({ ticket: ticketNumber, email });
}

function toMuseumTicket(dbTicket: any): MuseumTicket {
  return {
    id: dbTicket.id,
    user_id: dbTicket.user_id,
    purchase_id: dbTicket.purchase_id ?? undefined,
    first_name: dbTicket.first_name,
    last_name: dbTicket.last_name,
    email: dbTicket.email,
    visit_date: String(dbTicket.visit_date),
    comment: dbTicket.comment ?? undefined,
    number: dbTicket.number,
    qr_code: dbTicket.qr_code,
    status: dbTicket.status,
    is_owner: dbTicket.is_owner,
    created_at: dbTicket.created_at ? dbTicket.created_at.toISOString() : "",
  };
}

function toMuseumPurchase(dbPurchase: any): MuseumPurchase {
  return {
    id: dbPurchase.id,
    user_id: dbPurchase.user_id,
    purchase_date: String(dbPurchase.purchase_date),
    total_amount: dbPurchase.total_amount,
    status: dbPurchase.status,
    created_at: dbPurchase.created_at
      ? dbPurchase.created_at.toISOString()
      : "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: TicketPurchaseBody = await req.json();
    const error = validate(body);
    if (error)
      return NextResponse.json({ success: false, error }, { status: 400 });

    // Додати покупку
    const [purchase] = await db
      .insert(purchases)
      .values({
        user_id: body.userId,
        purchase_date: formatDateForDB(body.date),
        total_amount: 1 + (body.guests?.length || 0),
        status: "completed",
      })
      .returning();

    // Квитки для замовника та гостей
    const allTickets: MuseumTicket[] = [];
    // Квиток для замовника
    const ticketNumber = generateTicketNumber();
    const qrCode = generateQrCode(ticketNumber, body.email);
    const [mainTicket] = await db
      .insert(tickets)
      .values({
        user_id: body.userId,
        purchase_id: purchase.id,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        visit_date: formatDateForDB(body.date),
        comment: body.comment,
        qr_code: qrCode,
        status: "active",
        number: ticketNumber,
        is_owner: 1,
      })
      .returning();
    allTickets.push(toMuseumTicket(mainTicket));
    // Квитки для гостей
    if (Array.isArray(body.guests) && body.guests.length > 0) {
      for (const g of body.guests) {
        const guestTicketNumber = generateTicketNumber();
        const guestQrCode = generateQrCode(guestTicketNumber, body.email);
        const [guestTicket] = await db
          .insert(tickets)
          .values({
            user_id: body.userId,
            purchase_id: purchase.id,
            first_name: g.firstName,
            last_name: g.lastName,
            email: body.email, // email замовника
            visit_date: formatDateForDB(body.date),
            comment: body.comment,
            qr_code: guestQrCode,
            status: "active",
            number: guestTicketNumber,
            is_owner: 0,
          })
          .returning();
        allTickets.push(toMuseumTicket(guestTicket));
      }
    }

    return NextResponse.json({
      success: true,
      tickets: allTickets,
      purchase: toMuseumPurchase(purchase),
    });
  } catch (e) {
    console.error("[TicketPurchaseAPI]", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
