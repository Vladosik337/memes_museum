"use client";
import { useCallback, useEffect, useState } from "react";

interface MemeMedia {
  id: number;
  meme_id: number;
  url: string;
  type: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  attribution: string | null;
  is_primary: boolean | null;
}
interface MemeItem {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  media: MemeMedia[];
}

const TARGET_COUNT = 15;

export default function MemesGallerySection() {
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({}); // відстеження невдалих завантажень зображень

  
  useEffect(() => {
    const timer = setTimeout(() => {
      const imgs =
        document.querySelectorAll<HTMLImageElement>("img[data-meme-key]");
      imgs.forEach((img) => {
        const k = img.getAttribute("data-meme-key");
        if (!k) return;
        if (img.complete) {
          setLoaded((prev) => (prev[k] ? prev : { ...prev, [k]: true }));
        }
        if (img.complete && img.naturalWidth === 0) {
          // broken image
          setFailed((prev) => (prev[k] ? prev : { ...prev, [k]: true }));
        }
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [memes]);

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // завантажити до 100 опублікованих мемів
      const res = await fetch(`/api/memes?limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let list: MemeItem[] = data.memes || [];
      if (!Array.isArray(list)) list = [];
      const base = [...list];
      // перемішати та обмежити до TARGET_COUNT
      list = [...base].sort(() => Math.random() - 0.5);
      if (list.length >= TARGET_COUNT) {
        list = list.slice(0, TARGET_COUNT);
      } else if (list.length > 0) {
        // Заповнити випадковими вибірками (не послідовно), щоб уникнути групових дублікатів
        while (list.length < TARGET_COUNT) {
          list.push(base[Math.floor(Math.random() * base.length)]);
        }
        // Остаточне перемішування для розподілу дублікатів
        list = list.sort(() => Math.random() - 0.5);
      }
      setMemes(list);
      setLoaded({});
      setFailed({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load memes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const handleRefresh = () => fetchInitial();

  const fetchRandom = useCallback(async () => {
    try {
      const res = await fetch(`/api/memes/random`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const meme: MemeItem | null = data.meme || null;
      if (meme) {
        const primary = meme.media?.[0];
        if (primary?.url) {
          // відкрити зображення в новій вкладці
          window.open(primary.url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {
      void e;
    }
  };

  return (
    <section className="bg-orange-50 pt-16" id="memes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Популярні меми (рандомна підбірка)
          </h2>

          {/* API коротка інформація */}
          <div className="api-info mb-10">
            <h4 className="flex items-center gap-2 justify-center mb-2 text-orange-700 font-semibold">
              <svg
                className="icon w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <span>API для розробників</span>
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Отримайте доступ до нашої колекції мемів через публічне API
            </p>
            <code
              onClick={() => handleCopy("GET /api/memes?limit=100")}
              title="Натисніть для копіювання"
              className="cursor-pointer select-all block mx-auto text-xs font-mono bg-gray-900 text-orange-200 px-4 py-2 rounded shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              GET /api/memes?limit=100
            </code>
            <div className="api-features mt-4">
              <div className="feature-grid ">
                <div className="feature-item">
                  <span className="feature-icon ">
                    <svg
                      className="icon w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </span>
                  <span className="font-medium">Швидкий доступ</span>
                </div>
                <div className="feature-item ">
                  <span className="feature-icon ">
                    <svg
                      className="icon w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </span>
                  <span className="font-medium">Реальний час</span>
                </div>
                <div className="feature-item ">
                  <span className="feature-icon ">
                    <svg
                      className="icon w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </span>
                  <span className="font-medium">JSON формат</span>
                </div>
              </div>
            </div>
          </div>

          <p className=" text-gray-600 mb-4">
            Кожне оновлення – новий випадковий набір мемів.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-lg transition-colors"
            >
              {loading ? "Завантаження..." : "Оновити набір"}
            </button>
            <button
              onClick={fetchRandom}
              className="bg-white border border-orange-600 text-orange-700 font-semibold py-2 px-5 rounded-lg hover:bg-orange-50"
            >
              Випадковий мем
            </button>
          </div>
        </div>

        {/* Masonry Grid */}
        {error && <div className="text-center text-red-600 mb-6">{error}</div>}
        {!error && (
          <div
            className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 relative"
            style={{ orphans: 1, widows: 1 }}
          >
            {memes
              .filter((m) =>
                m.media?.some((mm) => mm.type === "image" && mm.url)
              )
              .map((m, i) => {
                const primary =
                  m.media.find((mm) => mm.is_primary && mm.type === "image") ||
                  m.media.find((mm) => mm.type === "image");
                if (!primary || !primary.url) return null; // skip completely to avoid empty card
                const key = `${m.id}-${i}`;
                const isLoaded = loaded[key];
                const isFailed = failed[key];
                const originalUrl = primary.url;
                const src = isFailed
                  ? "/museum-logo.png"
                  : originalUrl.startsWith("http")
                  ? originalUrl
                  : originalUrl.startsWith("/")
                  ? originalUrl
                  : `/${originalUrl}`;
                return (
                  <figure
                    key={key}
                    className="break-inside-avoid rounded-lg overflow-hidden shadow-sm bg-white border border-orange-100 hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-full">
                      {/* Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={primary.alt_text || m.title}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        data-meme-key={key}
                        onLoad={() => {
                          setLoaded((prev) => ({ ...prev, [key]: true }));
                        }}
                        onError={() => {
                          setFailed((prev) => ({ ...prev, [key]: true }));
                          setLoaded((prev) => ({ ...prev, [key]: true }));
                        }}
                        className={`block w-full h-auto object-cover transition-opacity duration-300 ${
                          isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        style={{ imageRendering: "auto" }}
                      />
                      {!isLoaded && !isFailed && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 to-orange-200/30 animate-pulse" />
                      )}
                    </div>
                    <figcaption className="p-3">
                      <div className="text-sm font-semibold text-gray-800">
                        {m.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {m.short_description}
                      </div>
                      {isFailed && (
                        <div className="mt-1 text-[10px] text-red-500">
                          Проблема із зображенням
                        </div>
                      )}
                    </figcaption>
                  </figure>
                );
              })}
            {loading && !memes.length && (
              <div className="text-center col-span-full py-10">Loading...</div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white"></div>
          </div>
        )}
      </div>
    </section>
  );
}
