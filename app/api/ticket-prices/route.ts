import { db } from "@/db";
import { ticket_prices } from "@/db/schema";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  // Витягуємо актуальні ціни для кожного типу (weekday/weekend)
  const prices = await db
    .select()
    .from(ticket_prices)
    .where(
      and(
        eq(ticket_prices.is_active, true),
        lte(ticket_prices.valid_from, today),
        or(isNull(ticket_prices.valid_to), gte(ticket_prices.valid_to, today))
      )
    );
  // Повертаємо лише найсвіжіші ціни для кожного типу
  const latest: Record<string, { price: number; type: string }> = {};
  for (const p of prices) {
    if (
      !latest[p.type] ||
      new Date(p.valid_from) > new Date(latest[p.type].valid_from)
    ) {
      latest[p.type] = p;
    }
  }
  return NextResponse.json({ prices: Object.values(latest) });
}
