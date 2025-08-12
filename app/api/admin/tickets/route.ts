import { db } from "@/db";
import { tickets } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/tickets?status=active&month=2025-08
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // active | cancelled | used | all | null
    const month = searchParams.get("month"); // YYYY-MM

    type Expr = ReturnType<typeof eq> | ReturnType<typeof and>;
    const conditions: Expr[] = [];

    if (status && status !== "all") {
      conditions.push(eq(tickets.status, status));
    }

    if (month) {
      const [yy, mm] = month.split("-");
      if (yy && mm && mm.length === 2) {
        const start = new Date(Number(yy), Number(mm) - 1, 1);
        const end = new Date(Number(yy), Number(mm), 1);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        conditions.push(
          and(
            gte(tickets.visit_date, fmt(start)),
            lt(tickets.visit_date, fmt(end))
          )
        );
      }
    }

    let rows;
    if (conditions.length === 0) {
      rows = await db.select().from(tickets);
    } else if (conditions.length === 1) {
      rows = await db.select().from(tickets).where(conditions[0]);
    } else {
      const combined = conditions.reduce((acc, c) => (acc ? and(acc, c) : c));
      rows = await db.select().from(tickets).where(combined);
    }

    // newest first
    rows.sort((a, b) => b.id - a.id);

    return NextResponse.json({ tickets: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

