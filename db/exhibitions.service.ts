import type { ExhibitionStatus } from "@/types/exhibition";
import { slugify } from "@/utils/slugify";
import { and, eq, inArray, ne, sql, SQL } from "drizzle-orm";
import { db, exhibitions } from "./index";

export interface ExhibitionCreateDTO {
  title: string;
  emoji: string;
  short_description: string;
  content_md: string;
  banner_color?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: ExhibitionStatus;
  slug?: string;
}

export interface ExhibitionUpdateDTO {
  title?: string;
  emoji?: string;
  short_description?: string;
  content_md?: string;
  banner_color?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: ExhibitionStatus;
  slug?: string;
}

export interface ExhibitionFilters {
  status?: ExhibitionStatus | ExhibitionStatus[];
  q?: string; // пошук по title, short_description
  activeOnly?: boolean; // start_date <= today <= end_date (чи без end_date)
  includeArchived?: boolean;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function generateUniqueSlug(base: string, skipId?: number) {
  const baseSlug = slugify(base);
  if (!baseSlug) {
    return `exhibition-${Date.now()}`;
  }
  let candidate = baseSlug;
  let counter = 2;
  // цикл поки не знайдемо унікальний slug
  // НБ: може бути оптимізовано за допомогою SELECT .. WHERE slug LIKE baseSlug% і потім парсингом
  for (;;) {
    const existing = await db
      .select({ id: exhibitions.id })
      .from(exhibitions)
      .where(
        skipId
          ? and(eq(exhibitions.slug, candidate), ne(exhibitions.id, skipId))
          : eq(exhibitions.slug, candidate)
      )
      .limit(1);
    if (existing.length === 0) return candidate;
    candidate = `${baseSlug}-${counter++}`;
  }
}

function assertPublishable(data: {
  title?: string;
  emoji?: string;
  content_md?: string;
}) {
  if (!data.title || !data.emoji || !data.content_md) {
    throw new Error(
      "Неможливо опублікувати: відсутні title / emoji / content_md"
    );
  }
}

export async function create(data: ExhibitionCreateDTO) {
  const status: ExhibitionStatus = data.status || "draft";
  if (status === "published") {
    assertPublishable(data);
  }
  const baseTitle = data.title && data.title.trim().length ? data.title : "";
  const slug = data.slug
    ? await generateUniqueSlug(data.slug)
    : await generateUniqueSlug(baseTitle);
  const insertValues: typeof exhibitions.$inferInsert = {
    slug,
    title: data.title,
    emoji: data.emoji,
    short_description: data.short_description,
    content_md: data.content_md,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    status,
    ...(data.banner_color ? { banner_color: data.banner_color } : {}),
  };
  const [row] = await db.insert(exhibitions).values(insertValues).returning();
  return row;
}

export async function update(id: number, patch: ExhibitionUpdateDTO) {
  // якщо статус "published", перевіряємо, що всі поля заповнені
  if (patch.status === "published") {
    // дістаємо існуючий запис, щоб заповнити відсутні поля для валідації
    const existing = await db
      .select()
      .from(exhibitions)
      .where(eq(exhibitions.id, id))
      .limit(1);
    if (existing.length === 0) throw new Error("Exhibition not found");
    const merged = { ...existing[0], ...patch };
    assertPublishable({
      title: merged.title,
      emoji: merged.emoji,
      content_md: merged.content_md,
    });
  }

  let slug: string | undefined = undefined;
  if (patch.slug) {
    slug = await generateUniqueSlug(patch.slug, id);
  } else if (patch.title) {
    // авто-генерація slug, якщо title змінився
    slug = await generateUniqueSlug(patch.title, id);
  }

  const [row] = await db
    .update(exhibitions)
    .set({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.emoji !== undefined ? { emoji: patch.emoji } : {}),
      ...(patch.short_description !== undefined
        ? { short_description: patch.short_description }
        : {}),
      ...(patch.content_md !== undefined
        ? { content_md: patch.content_md }
        : {}),
      ...(patch.banner_color !== undefined
        ? { banner_color: patch.banner_color }
        : {}),
      ...(patch.start_date !== undefined
        ? { start_date: patch.start_date }
        : {}),
      ...(patch.end_date !== undefined ? { end_date: patch.end_date } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(slug ? { slug } : {}),
      updated_at: sql`now()`,
    })
    .where(eq(exhibitions.id, id))
    .returning();
  return row;
}

export async function setStatus(id: number, status: ExhibitionStatus) {
  if (status === "published") {
    const existing = await db
      .select({
        title: exhibitions.title,
        emoji: exhibitions.emoji,
        content_md: exhibitions.content_md,
      })
      .from(exhibitions)
      .where(eq(exhibitions.id, id))
      .limit(1);
    if (existing.length === 0) throw new Error("Not found");
    assertPublishable(existing[0]);
  }
  const [row] = await db
    .update(exhibitions)
    .set({ status, updated_at: sql`now()` })
    .where(eq(exhibitions.id, id))
    .returning();
  return row;
}

export async function getBySlug(slug: string) {
  const rows = await db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.slug, slug))
    .limit(1);
  return rows[0] || null;
}

export async function getById(id: number) {
  const rows = await db
    .select()
    .from(exhibitions)
    .where(eq(exhibitions.id, id))
    .limit(1);
  return rows[0] || null;
}

export async function list(filters: ExhibitionFilters = {}) {
  const clauses: SQL[] = [];
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      if (filters.status.length === 1) {
        clauses.push(eq(exhibitions.status, filters.status[0]!));
      } else if (filters.status.length > 1) {
        clauses.push(
          inArray(exhibitions.status, filters.status as ExhibitionStatus[])
        );
      }
    } else {
      clauses.push(eq(exhibitions.status, filters.status));
    }
  } else if (!filters.includeArchived) {
    clauses.push(ne(exhibitions.status, "archived"));
  }
  if (filters.q) {
    const like = `%${filters.q}%`;
    clauses.push(
      sql`(${exhibitions.title} ILIKE ${like} OR ${exhibitions.short_description} ILIKE ${like})`
    );
  }
  if (filters.activeOnly) {
    const today = todayISO();
    clauses.push(
      sql`( ( ${exhibitions.start_date} IS NULL OR ${exhibitions.start_date} <= ${today} ) AND ( ${exhibitions.end_date} IS NULL OR ${exhibitions.end_date} >= ${today} ) )`
    );
  }
  const where = clauses.length
    ? clauses.reduce<SQL | undefined>(
        (acc, c) => (acc ? and(acc, c) : c),
        undefined
      )
    : undefined;
  const query = db.select().from(exhibitions).orderBy(exhibitions.created_at);
  const rows = where ? await query.where(where) : await query;
  return rows;
}

export async function remove(id: number) {
  // НБ: це видалить всі пов'язані медіа, якщо вони є
  // повне видалення (може бути замінено на м'яке видалення пізніше)
  await db.delete(exhibitions).where(eq(exhibitions.id, id));
  return { success: true };
}
