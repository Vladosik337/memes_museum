import { db } from "@/db";
import { users } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userDb = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email));
  if (!userDb.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const user = userDb[0];
  return NextResponse.json({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    oidc_sub: user.oidc_sub,
    created_at: user.created_at,
    updated_at: user.updated_at,
  });
}
