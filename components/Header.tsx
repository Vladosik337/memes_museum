"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Header головної сторінки музею мемів
export default function Header() {
  const { data: session } = useSession();
  const isAuth = !!session?.user;
  const isAdmin = session?.user?.role === "admin";
  return (
    <header className="z-40 w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link
                href="/"
                className="logo text-gray-900 hover:text-orange-600 transition-colors text-2xl font-bold"
              >
                MuseMeme
              </Link>
          <div className="text-center text-gray-700 font-medium hidden md:block">
            Музей мемів всеосяжного Інтернету
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={isAuth ? "/profile" : "/login"}
              className="text-gray-900 underline hover:text-orange-600"
            >
              Перевірити квиток
            </Link>
            {isAdmin && (
              <Link
                href="/admin/exhibitions"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Адмін-панель
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
