"use client";
import type { Exhibition } from "@/types/exhibition";
import { useEffect, useState } from "react";

// прив'язка кольорів до градієнтів
const colorMap: Record<string, string> = {
  green: "from-green-400 to-green-600",
  yellow: "from-yellow-400 to-yellow-600",
  blue: "from-blue-400 to-blue-600",
  red: "from-red-400 to-red-600",
  violet: "from-purple-400 to-pink-600",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function buildDateBadge(ex: Exhibition) {
  const start = formatDate(ex.start_date || undefined);
  const end = formatDate(ex.end_date || undefined);
  if (!start && !end) return "Постійна експозиція";
  const today = new Date().toISOString().slice(0, 10);
  if (start && !end) return `З ${start}`;
  if (!start && end) return `До ${end}`;
  if (start && end) {
    if (today < (ex.start_date || "")) return `З ${start}`;
    if (today > (ex.end_date || "")) return `Завершено`;
    return `${start} – ${end}`;
  }
  return "";
}

export default function CurrentExhibitionsSection() {
  const [items, setItems] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/exhibitions?activeOnly=true`, {
          next: { revalidate: 60 },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) {
          setItems(data.exhibitions || []);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Помилка завантаження";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-white py-16" id="current-exhibitions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Поточні виставки
        </h2>
        {loading && (
          <div className="text-center text-gray-500 py-8">Завантаження...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-600 py-8 text-sm">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Наразі немає активних виставок. Загляньте пізніше!
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((ex) => {
            const gradient =
              colorMap[ex.banner_color || "green"] || colorMap.green;
            const badge = buildDateBadge(ex);
            return (
              <div
                key={ex.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div
                  className={`h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}
                >
                  <span className="text-6xl" aria-hidden>
                    {ex.emoji}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {ex.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-4">
                    {ex.short_description}
                  </p>
                  {badge && (
                    <span className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full mb-4 self-start">
                      {badge}
                    </span>
                  )}
                  <div className="mt-auto flex justify-center">
                    <a
                      href={`/exhibitions/${ex.slug}`}
                      className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                    >
                      Детальніше
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
