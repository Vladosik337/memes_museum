import { and, eq, ilike, inArray, sql } from "drizzle-orm";
import {
  db,
  meme_alt_titles,
  meme_categories,
  meme_details,
  meme_formats,
  meme_media,
  meme_moderation,
  meme_tags,
  memes,
} from "./index";

export type MemeStatus = "draft" | "published" | "archived" | "deprecated";

export interface MemeCreateDTO {
  slug?: string;
  title: string;
  short_description: string;
  explanation: string;
  status?: MemeStatus;
  origin_year?: number | null;
  first_seen_date?: string | null;
  origin_platform?: string | null;
  origin_url?: string | null;
  origin_country?: string | null;
  language?: string | null;
  creator_name?: string | null;
  creator_contact?: string | null;
  license?: string | null;
  attribution_required?: boolean;
  nsfw?: boolean;
  sensitive?: boolean;
  verified?: boolean;
  locked?: boolean;
  review_notes?: string | null;
  alt_titles?: string[];
  tags?: string[];
  categories?: string[];
  formats?: string[];
  media?: Array<{
    url: string;
    type?: "image" | "video" | "other";
    width?: number | null;
    height?: number | null;
    alt_text?: string | null;
    attribution?: string | null;
    is_primary?: boolean;
    order_index?: number;
  }>;
}

export type MemeUpdateDTO = Partial<MemeCreateDTO>;

export interface MemeFilters {
  q?: string;
  status?: MemeStatus | MemeStatus[];
  tag?: string;
  category?: string;
  format?: string;
  limit?: number;
  offset?: number;
}

// просто перетворює в нижній регістр, замінює пробіли та небезпечні символи на дефіси
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яіїєґ]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function generateUniqueSlug(base: string) {
  let s = slugify(base);
  if (!s) s = `meme-${Date.now()}`;
  let candidate = s;
  let i = 2;
  for (;;) {
    const existing = await db
      .select({ id: memes.id })
      .from(memes)
      .where(eq(memes.slug, candidate))
      .limit(1);
    if (existing.length === 0) return candidate;
    candidate = `${s}-${i++}`;
  }
}

export async function create(data: MemeCreateDTO) {
  const status: MemeStatus = data.status || "draft";
  const slug = data.slug
    ? await generateUniqueSlug(data.slug)
    : await generateUniqueSlug(data.title || "meme");
  const [base] = await db
    .insert(memes)
    .values({
      slug,
      title: data.title,
      short_description: data.short_description,
      explanation: data.explanation,
      status,
    })
    .returning();
  await db.insert(meme_details).values({
    meme_id: base.id,
    origin_year: data.origin_year ?? null,
    first_seen_date: data.first_seen_date ?? null,
    origin_platform: data.origin_platform ?? null,
    origin_url: data.origin_url ?? null,
    origin_country: data.origin_country ?? null,
    language: data.language ?? null,
    creator_name: data.creator_name ?? null,
    creator_contact: data.creator_contact ?? null,
    license: data.license ?? null,
    attribution_required: data.attribution_required ?? false,
  });
  await db.insert(meme_moderation).values({
    meme_id: base.id,
    nsfw: data.nsfw ?? false,
    sensitive: data.sensitive ?? false,
    verified: data.verified ?? false,
    locked: data.locked ?? false,
    review_notes: data.review_notes ?? null,
  });
  if (data.alt_titles?.length)
    await db
      .insert(meme_alt_titles)
      .values(data.alt_titles.map((t) => ({ meme_id: base.id, title: t })));
  if (data.tags?.length)
    await db
      .insert(meme_tags)
      .values(data.tags.map((t) => ({ meme_id: base.id, tag: t })));
  if (data.categories?.length)
    await db
      .insert(meme_categories)
      .values(data.categories.map((c) => ({ meme_id: base.id, category: c })));
  if (data.formats?.length)
    await db
      .insert(meme_formats)
      .values(data.formats.map((f) => ({ meme_id: base.id, format: f })));
  if (data.media?.length)
    await db.insert(meme_media).values(
      data.media.map((m) => ({
        meme_id: base.id,
        url: normalizeMediaUrl(m.url),
        type: m.type || "image",
        width: m.width ?? null,
        height: m.height ?? null,
        alt_text: m.alt_text ?? null,
        attribution: m.attribution ?? null,
        is_primary: m.is_primary ?? false,
        order_index: m.order_index ?? 0,
      }))
    );
  return getById(base.id);
}

export async function update(id: number, patch: MemeUpdateDTO) {
  // дістаємо існуючий запис, щоб перевірити slug та статус блокування
  // НБ: це може бути оптимізовано, якщо не потрібно перевіряти slug
  const current = await getById(id);
  if (!current) throw new Error("Not found");
  // заборона редагування, якщо мем заблокований
  if (current.moderation?.locked) {
    if (
      patch.title !== undefined ||
      patch.short_description !== undefined ||
      patch.explanation !== undefined ||
      patch.status !== undefined ||
      patch.slug !== undefined
    ) {
      throw new Error("Locked meme");
    }
  }
  // обробка slug: тільки якщо статус "draft" та надано
  if (patch.slug !== undefined && current.status === "draft") {
    const newSlug = await generateUniqueSlug(patch.slug);
    if (newSlug !== current.slug) {
      await db
        .update(memes)
        .set({ slug: newSlug, updated_at: sql`now()` })
        .where(eq(memes.id, id));
    }
  }
  if (
    patch.title ||
    patch.short_description ||
    patch.explanation ||
    patch.status
  ) {
    await db
      .update(memes)
      .set({
        ...(patch.title ? { title: patch.title } : {}),
        ...(patch.short_description
          ? { short_description: patch.short_description }
          : {}),
        ...(patch.explanation ? { explanation: patch.explanation } : {}),
        ...(patch.status ? { status: patch.status } : {}),
        updated_at: sql`now()`,
      })
      .where(eq(memes.id, id));
  }
  if (
    patch.origin_year !== undefined ||
    patch.first_seen_date !== undefined ||
    patch.origin_platform !== undefined ||
    patch.origin_url !== undefined ||
    patch.origin_country !== undefined ||
    patch.language !== undefined ||
    patch.creator_name !== undefined ||
    patch.creator_contact !== undefined ||
    patch.license !== undefined ||
    patch.attribution_required !== undefined
  ) {
    await db
      .update(meme_details)
      .set({
        ...(patch.origin_year !== undefined
          ? { origin_year: patch.origin_year }
          : {}),
        ...(patch.first_seen_date !== undefined
          ? { first_seen_date: patch.first_seen_date }
          : {}),
        ...(patch.origin_platform !== undefined
          ? { origin_platform: patch.origin_platform }
          : {}),
        ...(patch.origin_url !== undefined
          ? { origin_url: patch.origin_url }
          : {}),
        ...(patch.origin_country !== undefined
          ? { origin_country: patch.origin_country }
          : {}),
        ...(patch.language !== undefined ? { language: patch.language } : {}),
        ...(patch.creator_name !== undefined
          ? { creator_name: patch.creator_name }
          : {}),
        ...(patch.creator_contact !== undefined
          ? { creator_contact: patch.creator_contact }
          : {}),
        ...(patch.license !== undefined ? { license: patch.license } : {}),
        ...(patch.attribution_required !== undefined
          ? { attribution_required: patch.attribution_required }
          : {}),
      })
      .where(eq(meme_details.meme_id, id));
  }
  if (
    patch.nsfw !== undefined ||
    patch.sensitive !== undefined ||
    patch.verified !== undefined ||
    patch.locked !== undefined ||
    patch.review_notes !== undefined
  ) {
    await db
      .update(meme_moderation)
      .set({
        ...(patch.nsfw !== undefined ? { nsfw: patch.nsfw } : {}),
        ...(patch.sensitive !== undefined
          ? { sensitive: patch.sensitive }
          : {}),
        ...(patch.verified !== undefined ? { verified: patch.verified } : {}),
        ...(patch.locked !== undefined ? { locked: patch.locked } : {}),
        ...(patch.review_notes !== undefined
          ? { review_notes: patch.review_notes }
          : {}),
      })
      .where(eq(meme_moderation.meme_id, id));
  }
  // заміна всіх масивів
  if (patch.alt_titles) {
    await db.delete(meme_alt_titles).where(eq(meme_alt_titles.meme_id, id));
    if (patch.alt_titles.length)
      await db
        .insert(meme_alt_titles)
        .values(patch.alt_titles.map((t) => ({ meme_id: id, title: t })));
  }
  if (patch.tags) {
    await db.delete(meme_tags).where(eq(meme_tags.meme_id, id));
    if (patch.tags.length)
      await db
        .insert(meme_tags)
        .values(patch.tags.map((t) => ({ meme_id: id, tag: t })));
  }
  if (patch.categories) {
    await db.delete(meme_categories).where(eq(meme_categories.meme_id, id));
    if (patch.categories.length)
      await db
        .insert(meme_categories)
        .values(patch.categories.map((c) => ({ meme_id: id, category: c })));
  }
  if (patch.formats) {
    await db.delete(meme_formats).where(eq(meme_formats.meme_id, id));
    if (patch.formats.length)
      await db
        .insert(meme_formats)
        .values(patch.formats.map((f) => ({ meme_id: id, format: f })));
  }
  if (patch.media) {
    await db.delete(meme_media).where(eq(meme_media.meme_id, id));
    if (patch.media.length)
      await db.insert(meme_media).values(
        patch.media.map((m) => ({
          meme_id: id,
          url: normalizeMediaUrl(m.url),
          type: m.type || "image",
          width: m.width ?? null,
          height: m.height ?? null,
          alt_text: m.alt_text ?? null,
          attribution: m.attribution ?? null,
          is_primary: m.is_primary ?? false,
          order_index: m.order_index ?? 0,
        }))
      );
  }
  return getById(id);
}

export async function list(filters: MemeFilters = {}) {
  const { q, status, tag, category, format, limit = 50, offset = 0 } = filters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let condition: any = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const add = (expr: any) => {
    condition = condition ? and(condition, expr) : expr;
  };
  if (q) add(ilike(memes.title, `%${q}%`));
  if (status) {
    if (Array.isArray(status)) add(inArray(memes.status, status));
    else add(eq(memes.status, status));
  }
  if (tag)
    add(
      sql`EXISTS (SELECT 1 FROM meme_tags t WHERE t.meme_id = ${memes.id} AND t.tag = ${tag})`
    );
  if (category)
    add(
      sql`EXISTS (SELECT 1 FROM meme_categories c WHERE c.meme_id = ${memes.id} AND c.category = ${category})`
    );
  if (format)
    add(
      sql`EXISTS (SELECT 1 FROM meme_formats f WHERE f.meme_id = ${memes.id} AND f.format = ${format})`
    );
  const query = condition
    ? db.select().from(memes).where(condition)
    : db.select().from(memes);
  const rows = await query
    .limit(limit)
    .offset(offset)
    .orderBy(memes.created_at);
  return rows;
}

export async function getBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(memes)
    .where(eq(memes.slug, slug))
    .limit(1);
  if (!row) return null;
  return getById(row.id);
}

export async function getById(id: number) {
  const [m] = await db.select().from(memes).where(eq(memes.id, id)).limit(1);
  if (!m) return null;
  const [details] = await db
    .select()
    .from(meme_details)
    .where(eq(meme_details.meme_id, id));
  const [mod] = await db
    .select()
    .from(meme_moderation)
    .where(eq(meme_moderation.meme_id, id));
  const media = await db
    .select()
    .from(meme_media)
    .where(eq(meme_media.meme_id, id));
  const alt = await db
    .select()
    .from(meme_alt_titles)
    .where(eq(meme_alt_titles.meme_id, id));
  const tags = await db
    .select()
    .from(meme_tags)
    .where(eq(meme_tags.meme_id, id));
  const cats = await db
    .select()
    .from(meme_categories)
    .where(eq(meme_categories.meme_id, id));
  const fmts = await db
    .select()
    .from(meme_formats)
    .where(eq(meme_formats.meme_id, id));
  return {
    ...m,
    details,
    moderation: mod,
    alt_titles: alt.map((a) => a.title),
    tags: tags.map((t) => t.tag),
    categories: cats.map((c) => c.category),
    formats: fmts.map((f) => f.format),
    media,
  };
}

export async function remove(id: number) {
  await db.delete(meme_media).where(eq(meme_media.meme_id, id));
  await db.delete(meme_alt_titles).where(eq(meme_alt_titles.meme_id, id));
  await db.delete(meme_tags).where(eq(meme_tags.meme_id, id));
  await db.delete(meme_categories).where(eq(meme_categories.meme_id, id));
  await db.delete(meme_formats).where(eq(meme_formats.meme_id, id));
  await db.delete(meme_moderation).where(eq(meme_moderation.meme_id, id));
  await db.delete(meme_details).where(eq(meme_details.meme_id, id));
  await db.delete(memes).where(eq(memes.id, id));
  return { success: true };
}

// хелпер для нормалізації URL медіа до формату /memes/filename.jpg (відносний, без запитів/хешів)
function normalizeMediaUrl(raw: string): string {
  let u = (raw || "").trim();
  if (!u) return u;
  // обрізаємо запити та хеші
  u = u.split(/[?#]/)[0];
  // якщо містить /memes/ глибше в повному URL, обрізаємо з того місця
  const idx = u.indexOf("/memes/");
  if (idx > -1) {
    u = u.slice(idx);
  }
  // прибираємо залишки протоколу/домену
  u = u.replace(/^https?:\/\/[^/]+/, "");
  if (!u.startsWith("/")) u = "/" + u;
  // базова папка /memes/
  if (!u.startsWith("/memes/")) {
    // якщо просто ім'я файлу, додаємо
    const justName = u.replace(/^\/+/, "");
    u = "/memes/" + justName;
  }
  // безпечні символи в імені файлу
  const parts = u.split("/");
  const file = parts.pop() || "";
  const safe =
    file
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || file;
  u = "/memes/" + safe;
  // якщо інше розширення існує, залишаємо; інакше додаємо .jpg
  if (!/\.jpg$/i.test(u)) {
    // якщо немає розширення, додаємо .jpg
    if (!/\.[a-z0-9]{2,5}$/i.test(u)) u += ".jpg";
  }
  return u;
}
