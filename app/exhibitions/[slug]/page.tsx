import * as service from "@/db/exhibitions.service";
import type { Exhibition } from "@/types/exhibition";
import { marked, Renderer } from "marked";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

const getExhibition = cache(async (slug: string) => {
  const ex = await service.getBySlug(slug);
  if (!ex || ex.status !== "published") return null;
  return ex;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ex = await getExhibition(slug);
  if (!ex) return { title: "Виставка не знайдена" };
  return {
    title: `${ex.title} | Музей Мемів`,
    description: ex.short_description,
    openGraph: {
      title: ex.title,
      description: ex.short_description,
    },
  };
}

function formatDate(date?: string | null) {
  if (!date) return null;
  try {
    return new Date(date + "T00:00:00").toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function buildDateLabel(ex: Pick<Exhibition, "start_date" | "end_date">) {
  const s = formatDate(ex.start_date || undefined);
  const e = formatDate(ex.end_date || undefined);
  if (!s && !e) return "Постійна експозиція";
  if (s && !e) return `З ${s}`;
  if (!s && e) return `До ${e}`;
  if (s && e) return `${s} – ${e}`;
  return null;
}

const colorMap: Record<string, string> = {
  green: "from-green-400 to-green-600",
  yellow: "from-yellow-400 to-yellow-600",
  blue: "from-blue-400 to-blue-600",
  red: "from-red-400 to-red-600",
  violet: "from-purple-400 to-pink-600",
};

function parseMarkdownWithHeadings(md: string) {
  const headings: { depth: number; text: string; id: string }[] = [];
  const renderer = new Renderer();
  renderer.heading = function ({ depth, tokens, raw }) {
    const text = tokens
      ? (tokens as Array<{ raw?: string; text?: string }>)
          .map((t) => t.raw || t.text || "")
          .join("")
      : raw || "";
    const id = text
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    headings.push({ depth, text, id });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  const html = marked.parse(md, { renderer }) as string;
  return { html, headings };
}

export default async function ExhibitionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ex = await getExhibition(slug);
  if (!ex) notFound();
  const { html, headings } = parseMarkdownWithHeadings(ex.content_md || "");
  const dateLabel = buildDateLabel(ex);
  const gradient = colorMap[ex.banner_color || "green"] || colorMap.green;
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* emoji background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-[0.08] animate-float"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 10) * 0.6}s`,
            }}
          >
            {ex.emoji}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes floatUpDown {0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        .animate-float{animation:floatUpDown 9s ease-in-out infinite;}
      `}</style>
      <div
        className={`h-56 bg-gradient-to-br ${gradient} flex items-center justify-center relative z-10`}
      >
        <div className="text-center text-white px-4">
          <div className="text-7xl mb-4" aria-hidden>
            {ex.emoji}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            {ex.title}
          </h1>
          {dateLabel && (
            <div className="text-sm md:text-base opacity-90">{dateLabel}</div>
          )}
        </div>
      </div>
      <main className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 border-l border-orange-200 pl-4">
            <h2 className="text-xs font-semibold text-orange-600 tracking-wide mb-2">
              ЗМІСТ
            </h2>
            {headings.length ? (
              <ul className="space-y-1 text-sm">
                {headings
                  .filter((h) => h.depth <= 3)
                  .map((h) => (
                    <li key={h.id} style={{ marginLeft: (h.depth - 1) * 8 }}>
                      <a
                        href={`#${h.id}`}
                        className="block py-1 px-2 rounded hover:bg-orange-50 hover:text-orange-700 text-gray-600 transition-colors"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-xs">
                Додайте заголовки (#) у тексті
              </p>
            )}
          </div>
        </aside>
        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-gray-700 mb-8 text-lg leading-relaxed md:leading-[1.85]">
            {ex.short_description}
          </p>
          <article
            className="exhibition-markdown"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="mt-12 flex gap-6 flex-wrap">
            <Link
              href="/"
              className="text-orange-600 hover:underline font-medium"
            >
              ← На головну
            </Link>
            <a
              href="#top"
              className="text-orange-600 hover:underline font-medium"
            >
              Вгору ↑
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
