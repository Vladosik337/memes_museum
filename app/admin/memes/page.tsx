"use client";
import { useMemesApi } from "@/hooks/useMemesApi";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function AdminMemesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");

  const {
    items,
    loading,
    error,
    activeId,
    select,
    draft,
    updateDraft,
    create,
    save,
    publish,
    archive,
    deprecate,
    revertToDraft,
    remove,
    isDirty,
    saving,
    refresh,
  } = useMemesApi();

  // клієнтська фільтрація мемів
  const filtered = items.filter((m) => {
    if (query && !m.title.toLowerCase().includes(query.toLowerCase()))
      return false;
    if (status !== "all" && m.status !== status) return false;
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пошук
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Назва або опис..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Всі</option>
              <option value="draft">Чернетки</option>
              <option value="published">Опубліковані</option>
              <option value="archived">Архів</option>
              <option value="deprecated">Застарілі</option>
            </select>
          </div>
          <div className="sm:self-end flex gap-2">
            <button
              type="button"
              onClick={() => create()}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-md shadow-sm text-sm"
            >
              + Новий мем
            </button>
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md text-sm"
            >
              ↻
            </button>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="text-sm text-gray-500">Завантаження...</div>
        )}
        {!loading && !filtered.length && !error && (
          <div className="text-sm text-gray-500 border border-dashed rounded-lg p-8 text-center">
            Немає мемів.
          </div>
        )}

        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((m) => {
            const primary =
              m.media && m.media.length
                ? m.media.find((mm) => mm.is_primary) || m.media[0]
                : null;
            const primaryUrl = primary
              ? primary.url.startsWith("http") || primary.url.startsWith("/")
                ? primary.url
                : `/memes/${primary.url.replace(/^\/+/, "")}`
              : null;
            return (
              <li
                key={m.id}
                className={`group rounded-lg border ${
                  m.id === activeId ? "border-orange-500" : "border-gray-200"
                } bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer`}
                onClick={() => select(m.id)}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {primaryUrl && (
                    <Image
                      src={primaryUrl}
                      alt={m.title}
                      fill
                      unoptimized
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.style.display = "none";
                      }}
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  )}
                  <span className="text-4xl" aria-hidden>
                    🖼️
                  </span>
                  <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-md bg-white/85 backdrop-blur border font-medium text-gray-700">
                    {m.status}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 flex-1">
                    {m.short_description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/admin/memes/${m.slug}`}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      Редагувати
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Видалити мем?")) remove();
                      }}
                      className="text-xs text-gray-500 hover:text-red-600"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* бічна панель редагування */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white border border-gray-200 rounded-lg shadow-sm h-max sticky top-4 self-start p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Редактор</h2>
          {activeId && (
            <span className="text-xs text-gray-500">ID: {activeId}</span>
          )}
        </div>
        {!draft && (
          <div className="text-xs text-gray-500">
            Оберіть мем або створіть новий.
          </div>
        )}
        {draft && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium mb-1">
                Заголовок *
              </label>
              <input
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Короткий опис
              </label>
              <textarea
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Пояснення (Markdown)
              </label>
              <textarea
                value={draft.explanation}
                onChange={(e) => updateDraft({ explanation: e.target.value })}
                rows={6}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono resize-y min-h-[140px]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {isDirty
                  ? "Не збережено"
                  : saving
                  ? "Збереження..."
                  : "Збережено"}
              </span>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className="px-3 py-1.5 rounded-md bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium hover:bg-orange-700"
              >
                Зберегти
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => publish()}
                className="px-3 py-1.5 rounded bg-green-600 text-white text-xs hover:bg-green-700"
              >
                Опублікувати
              </button>
              <button
                type="button"
                onClick={() => archive()}
                className="px-3 py-1.5 rounded bg-gray-600 text-white text-xs hover:bg-gray-700"
              >
                Архів
              </button>
              <button
                type="button"
                onClick={() => deprecate()}
                className="px-3 py-1.5 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
              >
                Застарілий
              </button>
              <button
                type="button"
                onClick={() => revertToDraft()}
                className="px-3 py-1.5 rounded bg-yellow-500 text-white text-xs hover:bg-yellow-600"
              >
                Чернетка
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
