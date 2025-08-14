import { db } from "@/db";
import { ticket_prices } from "@/db/schema";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET: всі тарифи
export async function GET() {
  const prices = await db
    .select()
    .from(ticket_prices)
    .orderBy(desc(ticket_prices.valid_from));
  return NextResponse.json({ prices });
}

// POST: створити тариф
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { price, valid_from, valid_to, type, description, is_active } = body;
  // Деактивуємо всі інші активні тарифи цього типу
  if (is_active) {
    await db
      .update(ticket_prices)
      .set({ is_active: false })
      .where(
        and(eq(ticket_prices.type, type), eq(ticket_prices.is_active, true))
      );
  }
  const [created] = await db
    .insert(ticket_prices)
    .values({
      price,
      valid_from,
      valid_to: valid_to || null,
      type,
      description,
      is_active: is_active ?? true,
    })
    .returning();
  // Перевірка: чи є хоча б один активний тариф для кожного типу
  for (const t of ["weekday", "weekend"]) {
    const activeCount = await db
      .select({ count: count() })
      .from(ticket_prices)
      .where(and(eq(ticket_prices.type, t), eq(ticket_prices.is_active, true)));
    if (!activeCount[0] || activeCount[0].count === 0) {
      // Якщо не залишилось активного тарифу — активуємо найновіший
      const latest = await db
        .select()
        .from(ticket_prices)
        .where(eq(ticket_prices.type, t))
        .orderBy(desc(ticket_prices.valid_from))
        .limit(1);
      if (latest[0]) {
        await db
          .update(ticket_prices)
          .set({ is_active: true })
          .where(eq(ticket_prices.id, latest[0].id));
      }
    }
  }
  return NextResponse.json({ price: created });
}

// PATCH: активувати/деактивувати тариф
export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const idStr = url.searchParams.get("id");
  if (!idStr) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const body = await req.json();
  const { is_active } = body;
  // Дістаємо поточний тариф і його тип
  const current = await db
    .select()
    .from(ticket_prices)
    .where(eq(ticket_prices.id, id));
  const type = current[0]?.type;
  console.log("PATCH ticket-prices", { id, is_active, type });
  if (!type) {
    console.log("Тариф не знайдено");
    return NextResponse.json({ error: "Тариф не знайдено" }, { status: 404 });
  }
  if (is_active) {
    // Деактивуємо всі інші тарифи цього типу (включаючи неактивні)
    const updateRes = await db
      .update(ticket_prices)
      .set({ is_active: false })
      .where(and(eq(ticket_prices.type, type), ne(ticket_prices.id, id)));
    console.log("Деактивовано тарифи типу", type, "updateRes:", updateRes);
    // Активуємо лише цей тариф
    const [updated] = await db
      .update(ticket_prices)
      .set({ is_active: true })
      .where(eq(ticket_prices.id, id))
      .returning();
    console.log("Активовано тариф", updated);
    return NextResponse.json({ price: updated });
  } else {
    // Деактивація: перевіряємо, чи залишиться хоча б один активний тариф цього типу
    const activeCount = await db
      .select({ count: count() })
      .from(ticket_prices)
      .where(
        and(
          eq(ticket_prices.type, type),
          eq(ticket_prices.is_active, true),
          ne(ticket_prices.id, id)
        )
      );
    console.log("activeCount для типу", type, ":", activeCount);
    if (!activeCount[0] || activeCount[0].count === 0) {
      console.log("Спроба залишити тип", type, "без активного тарифу");
      return NextResponse.json(
        { error: `Має бути хоча б один активний тариф для типу ${type}` },
        { status: 400 }
      );
    }
    const [updated] = await db
      .update(ticket_prices)
      .set({ is_active: false })
      .where(eq(ticket_prices.id, id))
      .returning();
    console.log("Деактивовано тариф", updated);
    return NextResponse.json({ price: updated });
  }
}
