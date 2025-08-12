import type { ExhibitionStatus } from "@/types/exhibition";
import React, { useState } from "react";

export type ExhibitionFormData = {
  title: string;
  emoji: string;
  color: string;
  description: string;
  startDate?: string;
  endDate: string;
  content: string;
  slug?: string; // відображається лише для опублікованих виставок
};

const defaultData: ExhibitionFormData = {
  title: "",
  emoji: "",
  color: "green",
  description: "",
  startDate: "",
  endDate: "",
  content: "",
  slug: "",
};

export default function ExhibitionForm({
  value,
  status,
  onChange,
  missingRequired,
}: {
  value: ExhibitionFormData;
  status?: ExhibitionStatus;
  onChange: (data: ExhibitionFormData) => void;
  missingRequired?: string[]; // поля, які не заповнені
}) {
  const [local, setLocal] = useState(value || defaultData);

  // Синхронізація з value при зміні активної виставки
  React.useEffect(() => {
    setLocal(value || defaultData);
  }, [value]);

  const handleField = (field: keyof ExhibitionFormData, val: string) => {
    const updated = { ...local, [field]: val };
    setLocal(updated);
    onChange(updated);
  };

  const statusLabel =
    status === "published"
      ? "Опубліковано"
      : status === "archived"
      ? "Архівовано"
      : "Драфт";
  const statusColor =
    status === "published"
      ? "bg-green-600"
      : status === "archived"
      ? "bg-yellow-600"
      : "bg-gray-400";
  const invalidDate =
    local.endDate && local.startDate && local.endDate < local.startDate;

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-2 text-sm font-semibold flex items-center gap-2">
            <span>Статус:</span>
            <span
              className={`text-xs uppercase tracking-wide text-white px-2 py-1 rounded ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Назва виставки
          </label>
          <input
            type="text"
            value={local.title}
            onChange={(e) => handleField("title", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              missingRequired?.includes("title")
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <input
            type="text"
            value={local.slug || ""}
            readOnly
            className="w-full border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Емодзі
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={local.emoji}
            onChange={(e) => handleField("emoji", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              missingRequired?.includes("emoji")
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          <EmojiQuickPicker onSelect={(emoji) => handleField("emoji", emoji)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Колір банера
        </label>
        <select
          value={local.color}
          onChange={(e) => handleField("color", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="green">Зелена (green-400 to green-600)</option>
          <option value="yellow">Жовта (yellow-400 to yellow-600)</option>
          <option value="blue">Синя (blue-400 to purple-600)</option>
          <option value="red">Червона (red-400 to red-600)</option>
          <option value="purple">Фіолетова (purple-400 to purple-600)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Короткий опис
        </label>
        <textarea
          value={local.description}
          onChange={(e) => handleField("description", e.target.value)}
          rows={3}
          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            missingRequired?.includes("short_description")
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Дата початку
          </label>
          <input
            type="date"
            value={local.startDate}
            onChange={(e) => handleField("startDate", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Дата завершення
          </label>
          <input
            type="date"
            value={local.endDate}
            onChange={(e) => handleField("endDate", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              invalidDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          <p
            className={`text-xs mt-1 ${
              invalidDate ? "text-red-600" : "text-gray-500"
            }`}
          >
            {invalidDate
              ? "Дата завершення не може бути раніше дати початку"
              : "Не обов'язково. Залиште порожнім для постійної експозиції"}
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Детальний опис (Markdown/HTML)
        </label>
        <span className="text-xs text-gray-500">
          Підтримується Markdown і HTML як у GitHub. Заголовки #, ##, ###
          формують меню навігації.
        </span>
        <textarea
          value={local.content}
          onChange={(e) => handleField("content", e.target.value)}
          rows={16}
          className={`markdown-editor w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm ${
            missingRequired?.includes("content_md")
              ? "border-red-500"
              : "border-gray-300"
          }`}
          placeholder="# Заголовок\nОпис секції..."
        />
      </div>
    </form>
  );
}

// EmojiQuickPicker компонент для вибору емодзі
function EmojiQuickPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const common = [
    "😀",
    "😎",
    "😂",
    "🤣",
    "🔥",
    "⭐",
    "🚀",
    "🐸",
    "👀",
    "💡",
    "🎯",
    "🧠",
    "❤️",
    "🥳",
  ];
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="border border-gray-300 bg-orange rounded-lg px-3 py-2 hover:bg-orange-50 text-lg"
        title="Emoji picker"
        onClick={() => setOpen((o) => !o)}
      >
        🙂
      </button>
      {open && (
        <div className="absolute z-10 top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded shadow-lg w-56 animate-fade-in">
          <div className="grid grid-cols-7 gap-1 text-xl">
            {common.map((e) => (
              <button
                key={e}
                type="button"
                className="hover:bg-orange-100 rounded"
                onClick={() => {
                  onSelect(e);
                  setOpen(false);
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
