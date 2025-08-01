import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Список приватних маршрутів
const protectedRoutes = ["/profile", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Перевіряємо, чи це приватний маршрут
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = await getToken({ req: request });
    console.log("middleware token:", token, "pathname:", pathname);
    if (!token) {
      // Неавторизований — перенаправити на /login
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Доступ до /profile мають і user, і admin
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/admin/:path*"],
};
