import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { purchases, tickets } from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = Number(session.user.id);

  // параметри запиту
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // "active" | "expired" | "completed" | null
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const limit = Number(searchParams.get("limit") || 20);
  const offset = Number(searchParams.get("offset") || 0);

  // Побудова where
  let whereClause = eq(purchases.user_id, userId);
  if (dateFrom) {
    whereClause = and(whereClause, gte(purchases.purchase_date, dateFrom));
  }
  if (dateTo) {
    whereClause = and(whereClause, lte(purchases.purchase_date, dateTo));
  }

  // Отримати покупки з фільтрами та пагінацією
  let purchaseRows = await db
    .select()
    .from(purchases)
    .where(whereClause)
    .orderBy(desc(purchases.created_at))
    .limit(limit)
    .offset(offset);

  // Якщо фільтр по статусу квитка (active/expired), залишаємо лише ті покупки, де є хоча б один квиток з цим статусом
  const result: Array<{
    id: number;
    date: string;
    total: number;
    status: string;
    tickets: Array<{
      id: number;
      number: string;
      firstName: string;
      lastName: string;
      status: string;
    }>;
  }> = [];
  for (const purchase of purchaseRows) {
    const ticketRows = await db
      .select()
      .from(tickets)
      .where(eq(tickets.purchase_id, purchase.id));
    // Якщо status === 'active' або 'expired', фільтруємо квитки
    let filteredTickets = ticketRows;
    if (status === "active" || status === "expired") {
      filteredTickets = ticketRows.filter((t) => t.status === status);
    }
    // Додаємо елемент "покупки" лише якщо є квитки після фільтрації
    if (filteredTickets.length > 0 || status === "all" || !status) {
      result.push({
        id: purchase.id,
        date: purchase.purchase_date,
        total: purchase.total_amount,
        status: purchase.status || "completed",
        tickets: filteredTickets.map((t) => ({
          id: t.id,
          number: t.number,
          firstName: t.first_name,
          lastName: t.last_name,
          status: t.status || "active",
        })),
      });
    }
  }
  return NextResponse.json({ purchases: result });
}
