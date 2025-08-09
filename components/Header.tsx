"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

// Header головної сторінки музею мемів
export default function Header() {
  const { data: session } = useSession();
  const isAuth = !!session?.user;
  return (
    <header className="z-40 w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <h1 className="logo text-gray-900 text-2xl font-bold">MuseMeme</h1>
          </div>
          <div className="text-center text-gray-700 font-medium hidden md:block">
            Музей мемів всеосяжного Інтернету
          </div>
          <Link
            href={isAuth ? "/profile" : "/login"}
            className="text-gray-900 underline hover:text-orange-600"
          >
            Перевірити квиток
          </Link>
        </div>
      </div>
    </header>
  );
}
