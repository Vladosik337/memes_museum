"use client";
import { ExhibitionStatus } from "@/types/exhibition";
import { slugify } from "@/utils/slugify";
import { useCallback, useState } from "react";

// локальний інтерфейс для роботи з виставками в адмінці
export interface AdminExhibition {
  id: string; // тимчасовий ID для нових елементів
  slug: string;
  title: string;
  emoji: string;
  color: string; // колір банера
  description: string; // мап на short_description
  content: string; // мап на content_md
  startDate?: string; // мап на start_date
  endDate: string; // мапуємо на end_date
  status: ExhibitionStatus;
  createdAt: string;
  updatedAt: string;
}

const nowISO = () => new Date().toISOString();

function ensureUniqueSlug(
  existing: AdminExhibition[],
  base: string,
  currentId?: string
) {
  const normalized = slugify(base);
  let candidate = normalized || `exhibition-${Date.now()}`;
  let i = 2;
  while (
    existing.some(
      (e) => e.slug === candidate && (currentId ? e.id !== currentId : true)
    )
  ) {
    candidate = `${normalized}-${i++}`;
  }
  return candidate;
}

const initialExhibitions: AdminExhibition[] = [
  {
    id: "pepe",
    slug: "pepe",
    title: "Еволюція Пепе",
    emoji: "🐸",
    color: "green",
    description:
      "Від коміксу до світового феномену. Історія найвідомішої жаби інтернету.",
    startDate: "",
    endDate: "",
    content:
      "# Походження персонажа\n\nПепе Жаба вперше з'явився у 2005 році...",
    status: "draft",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "2024",
    slug: "2024",
    title: "Кращі меми 2024",
    emoji: "😂",
    color: "yellow",
    description: "Вірусний контент, який підкорив соцмережі цього року.",
    startDate: "2024-01-05",
    endDate: "2024-12-31",
    content: "# Топ-меми року\n\n2024 рік був насичений вірусним контентом...",
    status: "published",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "space",
    slug: "space",
    title: "Меми про космос",
    emoji: "🚀",
    color: "blue",
    description: 'Від "Houston, we have a problem" до SpaceX мемів.',
    startDate: "2025-01-10",
    endDate: "2025-03-31",
    content:
      "# Класичні космічні меми\n\nІсторія космічних мемів починається...",
    status: "archived",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

export function useExhibitions() {
  const [exhibitions, setExhibitions] =
    useState<AdminExhibition[]>(initialExhibitions);

  const create = useCallback(() => {
    const id = `new-${Date.now()}`;
    const base: AdminExhibition = {
      id,
      slug: id,
      title: "",
      emoji: "",
      color: "green",
      description: "",
      startDate: "",
      endDate: "",
      content: "",
      status: "draft",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setExhibitions((prev) => [...prev, base]);
    return id;
  }, []);

  const update = useCallback((id: string, patch: Partial<AdminExhibition>) => {
    setExhibitions((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const next: AdminExhibition = { ...e, ...patch, updatedAt: nowISO() };
        if ("title" in patch && e.status === "draft") {
          const currentSlug = next.slug;
          const generatedFromOldTitle = slugify(e.title);
          const looksAuto =
            currentSlug === generatedFromOldTitle ||
            currentSlug.startsWith(generatedFromOldTitle + "-");
          if (looksAuto) {
            next.slug = ensureUniqueSlug(prev, next.title || "", id);
          }
        }
        return next;
      })
    );
  }, []);

  const regenerateSlugFromTitle = useCallback((id: string) => {
    setExhibitions((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              slug: ensureUniqueSlug(prev, e.title, id),
              updatedAt: nowISO(),
            }
          : e
      )
    );
  }, []);

  const setStatus = useCallback(
    (id: string, status: ExhibitionStatus) => {
      update(id, { status });
    },
    [update]
  );

  const remove = useCallback((id: string) => {
    setExhibitions((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    exhibitions,
    create,
    update,
    regenerateSlugFromTitle,
    setStatus,
    remove,
  };
}
