"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.first_name || session?.user?.name || "Адмін";
  return (
    <header className="bg-white shadow-sm  sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Лого зліва */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="logo text-gray-900 hover:text-orange-600 transition-colors text-2xl font-bold"
          >
            MuseMeme
          </Link>
        </div>
        {/* Центр: Навігація */}
        <nav className="flex space-x-2">
          <Link
            href="/admin/exhibitions"
            className="px-4 py-2 rounded-lg font-medium text-gray-700  hover:text-orange-700 transition-colors"
          >
            Виставки
          </Link>
          <Link
            href="/admin/tickets"
            className="px-4 py-2 rounded-lg font-medium text-gray-700  hover:text-orange-700 transition-colors"
          >
            Квитки
          </Link>
          <Link
            href="/admin/tariffs"
            className="px-4 py-2 rounded-lg font-medium text-gray-700  hover:text-orange-700 transition-colors"
          >
            Тарифи
          </Link>
          <Link
            href="/admin/memes"
            className="px-4 py-2 rounded-lg font-medium text-gray-700  hover:text-orange-700 transition-colors"
          >
            Меми
          </Link>
        </nav>
        {/* Справа: Ім'я користувача */}
        <div className="flex items-center gap-3">
          <span className="text-gray-900 font-semibold">{userName}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Вийти
          </button>
        </div>
      </div>
    </header>
  );
}
