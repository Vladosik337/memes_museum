import { db } from "@/db";
import { ticket_prices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// PUT: оновити тариф
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const { price, valid_from, valid_to, type, description, is_active } = body;
  const [updated] = await db
    .update(ticket_prices)
    .set({ price, valid_from, valid_to, type, description, is_active })
    .where(eq(ticket_prices.id, Number(id)))
    .returning();
  return NextResponse.json({ price: updated });
}

// PATCH: активувати/деактивувати тариф
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const { is_active } = body;
  const [updated] = await db
    .update(ticket_prices)
    .set({ is_active })
    .where(eq(ticket_prices.id, Number(id)))
    .returning();
  return NextResponse.json({ price: updated });
}
