import { db } from "@/db";
import { purchases, ticket_prices, tickets } from "@/db/schema";
import type { MuseumPurchase, MuseumTicket } from "@/types/entities";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
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

export async function POST(req: NextRequest) {
  try {
    const body: TicketPurchaseBody = await req.json();
    const error = validate(body);
    if (error)
      return NextResponse.json({ success: false, error }, { status: 400 });

    // Визначаємо дату для ціни
    const visitDate = formatDateForDB(body.date);
    // Визначаємо тип квитка за датою (weekend/weekday)
    const jsDate = new Date(body.date);
    const day = jsDate.getDay(); // 0=неділя, 6=субота
    const ticketType = day === 0 || day === 6 ? "weekend" : "weekday";
    const ticketCount = 1 + (body.guests?.length || 0);
    // Отримуємо актуальну ціну для типу на цю дату
    const [priceRow] = await db
      .select()
      .from(ticket_prices)
      .where(
        and(
          eq(ticket_prices.type, ticketType),
          eq(ticket_prices.is_active, true),
          lte(ticket_prices.valid_from, visitDate),
          or(
            isNull(ticket_prices.valid_to),
            gte(ticket_prices.valid_to, visitDate)
          )
        )
      )
      .orderBy(ticket_prices.valid_from, ticket_prices.id);
    if (!priceRow) {
      return NextResponse.json(
        { success: false, error: `Ціна не знайдена для типу ${ticketType}` },
        { status: 400 }
      );
    }
    const ticketPrice = priceRow.price;
    const totalAmount = ticketCount * ticketPrice;

    // Додаємо покупку з сумою
    const [purchase] = await db
      .insert(purchases)
      .values({
        user_id: body.userId,
        purchase_date: visitDate,
        total_amount: totalAmount,
        status: "completed",
      })
      .returning();

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
        visit_date: visitDate,
        comment: body.comment,
        qr_code: qrCode,
        status: "active",
        number: ticketNumber,
        isOwner: true,
      })
      .returning();
    const allTickets: MuseumTicket[] = [toMuseumTicket(mainTicket)];
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
            visit_date: visitDate,
            comment: body.comment,
            qr_code: guestQrCode,
            status: "active",
            number: guestTicketNumber,
            isOwner: false,
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

// Типізація для toMuseumTicket/toMuseumPurchase
function toMuseumTicket(dbTicket: unknown): MuseumTicket {
  const t = dbTicket as {
    id: number;
    user_id: number;
    purchase_id: number | null;
    first_name: string;
    last_name: string;
    email: string;
    visit_date: string | Date;
    comment: string | null;
    number: string;
    qr_code: string;
    status: MuseumTicket["status"];
    isOwner: boolean;
    created_at?: Date | null;
  };
  return {
    id: t.id,
    user_id: t.user_id,
    purchase_id: t.purchase_id ?? undefined,
    first_name: t.first_name,
    last_name: t.last_name,
    email: t.email,
    visit_date:
      typeof t.visit_date === "string"
        ? t.visit_date
        : t.visit_date.toISOString().split("T")[0],
    comment: t.comment ?? undefined,
    number: t.number,
    qr_code: t.qr_code,
    status: t.status,
    is_owner: t.isOwner ? 1 : 0,
    created_at: t.created_at ? t.created_at.toISOString() : "",
  };
}
function toMuseumPurchase(dbPurchase: unknown): MuseumPurchase {
  const p = dbPurchase as {
    id: number;
    user_id: number;
    purchase_date: string | Date;
    total_amount: number;
    status: MuseumPurchase["status"];
    created_at?: Date | null;
  };
  return {
    id: p.id,
    user_id: p.user_id,
    purchase_date:
      typeof p.purchase_date === "string"
        ? p.purchase_date
        : p.purchase_date.toISOString().split("T")[0],
    total_amount: p.total_amount,
    status: p.status,
    created_at: p.created_at ? p.created_at.toISOString() : "",
  };
}
