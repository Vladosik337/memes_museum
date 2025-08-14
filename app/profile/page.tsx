"use client";
import { ActiveTickets } from "@/components/profile/ActiveTickets";
import { PurchaseHistory } from "@/components/profile/PurchaseHistory";
import { QuickActions } from "@/components/profile/QuickActions";
import { UserInfo } from "@/components/profile/UserInfo";
import { UserStats } from "@/components/profile/UserStats";
import type { Purchase, Ticket } from "@/types/profile";
import { generateTicketsPDF } from "@/utils/generateTicketPDF";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import "/public/style.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const ProfilePage = () => {
  const { data: session, update } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  // Єдиний state для всіх фільтрів
  const [filter, setFilter] = useState<{
    type: "all" | "active" | "expired";
    dateFrom?: string;
    dateTo?: string;
  }>({
    type: "all",
    dateFrom: undefined,
    dateTo: undefined,
  });
  const [page, setPage] = useState(0);
  const limit = 10;
  const query = new URLSearchParams({
    status: filter.type,
    limit: String(limit),
    offset: String(page * limit),
    ...(filter.dateFrom ? { dateFrom: filter.dateFrom } : {}),
    ...(filter.dateTo ? { dateTo: filter.dateTo } : {}),
  }).toString();
  const { data } = useSWR<{ purchases: Purchase[] }>(
    `/api/user/purchases?${query}`,
    fetcher
  );
  const purchases: Purchase[] = data?.purchases || [];
  // SWR для всіх покупок (без фільтрів) — для Поточних квитків
  const { data: allPurchasesData } = useSWR<{ purchases: Purchase[] }>(
    "/api/user/purchases?status=all&limit=1000",
    fetcher
  );
  const allPurchases: Purchase[] = allPurchasesData?.purchases || [];
  // Витягуємо всі активні квитки з усіх покупок (незалежно від фільтрів)
  const activeTickets: Ticket[] = allPurchases
    .flatMap((p) =>
      p.tickets.map((t) => ({
        ...t,
        visitDate: t.visitDate || p.date || "",
        qrSvgId: t.qrSvgId || `qr-svg-${t.number}`,
      }))
    )
    .filter((t) => t.status === "active");
  // Отримати профіль напряму з БД (тільки при першому завантаженні, без автооновлення)
  const { data: profile, mutate: mutateProfile } = useSWR(
    "/api/user/profile",
    fetcher,
    {
      revalidateOnFocus: false, // не оновлювати при фокусі
      revalidateOnReconnect: false, // не оновлювати при reconnect
      dedupingInterval: 60 * 60 * 1000, // 1 година кешу
    }
  );

  // Статистика
  const memberSince = profile?.created_at
    ? formatMemberSince(profile.created_at)
    : "—";
  const stats = {
    totalVisits: purchases.length,
    activeTickets: activeTickets.length,
    totalSpent: purchases.reduce((sum, p) => sum + (p.total || 0), 0),
    memberSince,
  };
  // Масове завантаження PDF для всіх активних квитків (один PDF)
  const handleDownloadAll = async () => {
    await generateTicketsPDF(
      activeTickets.map((ticket) => ({
        museumName: "Музей Мемів",
        firstName: ticket.firstName,
        lastName: ticket.lastName,
        ticketNumber: ticket.number,
        visitDate: ticket.visitDate || "",
        qrSvgId: ticket.qrSvgId || `qr-svg-${ticket.number}`,
      }))
    );
  };

  return (
    <div className="text-gray-900 min-h-screen dashboard-bg">
      <header className="z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link href="/" className="logo text-gray-900">
                MuseMeme
              </Link>
            </div>
            <div className="text-center text-gray-700 font-medium hidden md:block">
              Особистий кабінет
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  href="/admin/exhibitions"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Адмін-панель
                </Link>
              )}
              <span className="text-gray-700 hidden sm:block">
                {user?.first_name ? `Привіт, ${user.first_name}!` : "Вітаємо!"}
              </span>
              <button
                className="text-gray-900 underline hover:text-orange-600"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <section className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="user-avatar w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  <span>  
                    {user?.first_name && user?.last_name
                      ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                      : "?"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.email}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ласкаво просимо до вашого особистого кабінету. Тут ви можете
                переглядати свої квитки, історію покупок та статистику
                відвідувань.
              </p>
            </div>
          </section> */}
          <main className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <UserInfo
                firstName={profile?.first_name}
                lastName={profile?.last_name}
                email={profile?.email || ""}
                onProfileUpdate={async (firstName, lastName) => {
                  const res = await fetch("/api/profile/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: profile?.email,
                      first_name: firstName,
                      last_name: lastName,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    await mutateProfile(); // явно оновити кеш профілю після зміни
                    await update();
                  } else {
                    throw new Error(data.error || "Помилка оновлення");
                  }
                }}
              />
              <UserStats {...stats} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                  <ActiveTickets tickets={activeTickets} />
                </div>
                <div>
                  <QuickActions
                    ticketCount={activeTickets.length}
                    onDownloadAll={handleDownloadAll}
                  />
                </div>
              </div>
              <PurchaseHistory
                purchases={purchases}
                onFilterChange={(f) => {
                  setFilter((prev) => ({ ...prev, ...f }));
                  setPage(0);
                }}
                onDateChange={(from, to) => {
                  setFilter((prev) => ({
                    ...prev,
                    dateFrom: from || undefined,
                    dateTo: to || undefined,
                  }));
                  setPage(0);
                }}
                dateFrom={filter.dateFrom}
                dateTo={filter.dateTo}
              />
              {/* Пагінація */}
              <div className="flex justify-center mt-6 gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Назад
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={purchases.length < limit}
                >
                  Далі
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
