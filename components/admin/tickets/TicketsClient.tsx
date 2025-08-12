"use client";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

export interface AdminTicket {
  id: number;
  user_id: number;
  purchase_id?: number | null;
  first_name: string;
  last_name: string;
  email: string;
  visit_date: string; // YYYY-MM-DD
  comment?: string | null;
  number: string;
  qr_code?: string | null;
  status: string; // active, cancelled, used
  isOwner: boolean | number;
  created_at?: string;
}

interface Stats {
  total: number;
  active: number;
  cancelled: number;
  used: number;
  monthCount: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TicketsClient() {
  const [month, setMonth] = useState<string>(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const { data, mutate, isLoading } = useSWR(
    `/api/admin/tickets?status=${statusFilter}&month=${month}`,
    fetcher
  );
  const { data: allData } = useSWR(
    `/api/admin/tickets?month=${month}`,
    fetcher
  );

  const tickets: AdminTicket[] = useMemo(() => data?.tickets || [], [data]);
  const allTickets: AdminTicket[] = useMemo(
    () => allData?.tickets || [],
    [allData]
  );

  const stats: Stats = useMemo(() => {
    const total = allTickets.length;
    const active = allTickets.filter((t) => t.status === "active").length;
    const cancelled = allTickets.filter((t) => t.status === "cancelled").length;
    const used = allTickets.filter((t) => t.status === "used").length;
    const monthCount = tickets.length;
    return { total, active, cancelled, used, monthCount };
  }, [allTickets, tickets]);

  const changeStatus = useCallback(
    async (id: number, status: string) => {
      await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      mutate();
    },
    [mutate]
  );

  const cancelTicket = (id: number) => {
    if (confirm("Скасувати квиток?")) {
      changeStatus(id, "cancelled");
    }
  };

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-");
    return `${m}.${y}`;
  }, [month]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Квитки</h1>

      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Всього" value={stats.total} />
        <StatCard label="Активні" value={stats.active} />
        <StatCard label="Скасовані" value={stats.cancelled} />
        <StatCard label="Використані" value={stats.used} />
        <StatCard label={`Активні (${monthLabel})`} value={stats.monthCount} />
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Рік
          </label>
          <select
            value={month.slice(0, 4)}
            onChange={(e) => setMonth(e.target.value + "-" + month.slice(5))}
            className="border rounded px-2 py-1 text-sm bg-white"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Місяць
          </label>
          <select
            value={month.slice(5)}
            onChange={(e) => setMonth(month.slice(0, 4) + "-" + e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const m = String(i + 1).padStart(2, "0");
              return (
                <option key={m} value={m}>
                  {m}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Статус
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white"
          >
            <option value="active">Активні</option>
            <option value="all">Всі</option>
            <option value="cancelled">Скасовані</option>
            <option value="used">Використані</option>
          </select>
        </div>
        <div className="flex gap-2 pt-5">
          <button
            onClick={() => mutate()}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Оновити
          </button>
          <button
            onClick={() => setMonth(new Date().toISOString().slice(0, 7))}
            className="px-3 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white text-sm"
          >
            Поточний місяць
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-orange-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-orange-50 text-orange-700">
            <tr>
              <Th>#</Th>
              <Th>Номер</Th>
              <Th>Власник</Th>
              <Th>Дата візиту</Th>
              <Th>Email</Th>
              <Th>Статус</Th>
              <Th>Дії</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Завантаження...
                </td>
              </tr>
            )}
            {!isLoading && tickets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Немає квитків
                </td>
              </tr>
            )}
            {tickets.map((t, idx) => (
              <tr
                key={t.id}
                className="border-t border-gray-300 last:border-b hover:bg-orange-50/40 transition"
              >
                <Td>{idx + 1}</Td>
                <Td className="font-mono text-xs">{t.number}</Td>
                <Td>
                  <div className="font-medium text-gray-900">
                    {t.first_name} {t.last_name}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">
                    {t.isOwner ? "Замовник" : "Гість"}
                  </div>
                </Td>
                <Td>{t.visit_date}</Td>
                <Td className="text-gray-600">{t.email}</Td>
                <Td>
                  <StatusBadge status={t.status} />
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {t.status === "active" && (
                      <button
                        onClick={() => cancelTicket(t.id)}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Скасувати
                      </button>
                    )}
                    {t.status === "cancelled" && (
                      <button
                        onClick={() => changeStatus(t.id, "active")}
                        className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Відновити
                      </button>
                    )}
                    {t.status !== "used" && t.status !== "cancelled" && (
                      <button
                        onClick={() => changeStatus(t.id, "used")}
                        className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Позначити використаним
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    used: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold border ${
        map[status] || "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4  bg-white  shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300 ">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
