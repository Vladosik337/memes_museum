"use client";
import type { MemeStatus } from "@/db/memes.service";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

export interface MemeDetailsShape {
  origin_year: number | null;
  first_seen_date: string | null;
  origin_platform: string | null;
  origin_url: string | null;
  origin_country: string | null;
  language: string | null;
  creator_name: string | null;
  creator_contact: string | null;
  license: string | null;
  attribution_required: boolean;
}

export interface MemeModerationShape {
  nsfw: boolean;
  sensitive: boolean;
  verified: boolean;
  locked: boolean;
  review_notes: string | null;
}

export interface MemeMediaItem {
  id?: number;
  url: string;
  type?: string;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  attribution?: string | null;
  is_primary?: boolean;
  order_index?: number;
}

export interface FullMeme {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  explanation: string;
  status: MemeStatus;
  created_at: string;
  updated_at: string;
  details?: Partial<MemeDetailsShape>;
  moderation?: Partial<MemeModerationShape>;
  alt_titles: string[];
  tags: string[];
  categories: string[];
  formats: string[];
  media: MemeMediaItem[];
}

export interface MemeEditorDraft {
  basic: {
    title: string;
    short_description: string;
    explanation: string;
    status: MemeStatus;
    slug: string; 
  };
  details: MemeDetailsShape;
  moderation: MemeModerationShape;
  taxonomy: {
    alt_titles: string[];
    tags: string[];
    categories: string[];
    formats: string[];
  };
  media: MemeMediaItem[];
}

function toDraft(m: FullMeme): MemeEditorDraft {
  return {
    basic: {
      title: m.title,
      short_description: m.short_description,
      explanation: m.explanation,
      status: m.status,
      slug: m.slug,
    },
    details: {
      origin_year: m.details?.origin_year ?? null,
      first_seen_date: m.details?.first_seen_date ?? null,
      origin_platform: m.details?.origin_platform ?? null,
      origin_url: m.details?.origin_url ?? null,
      origin_country: m.details?.origin_country ?? null,
      language: m.details?.language ?? null,
      creator_name: m.details?.creator_name ?? null,
      creator_contact: m.details?.creator_contact ?? null,
      license: m.details?.license ?? null,
      attribution_required: m.details?.attribution_required ?? false,
    },
    moderation: {
      nsfw: m.moderation?.nsfw ?? false,
      sensitive: m.moderation?.sensitive ?? false,
      verified: m.moderation?.verified ?? false,
      locked: m.moderation?.locked ?? false,
      review_notes: m.moderation?.review_notes ?? null,
    },
    taxonomy: {
      alt_titles: m.alt_titles || [],
      tags: m.tags || [],
      categories: m.categories || [],
      formats: m.formats || [],
    },
    media: m.media || [],
  };
}

type SectionPatch =
  | { section: "basic"; patch: Partial<MemeEditorDraft["basic"]> }
  | { section: "details"; patch: Partial<MemeEditorDraft["details"]> }
  | { section: "moderation"; patch: Partial<MemeEditorDraft["moderation"]> }
  | { section: "taxonomy"; patch: Partial<MemeEditorDraft["taxonomy"]> }
  | { section: "media"; patch: MemeEditorDraft["media"] };

const basicSchema = z.object({
  title: z.string().min(2, "Мінімум 2 символи"),
  short_description: z.string().max(500, "Макс 500"),
  explanation: z.string().min(0),
  status: z.enum(["draft", "published", "archived", "deprecated"]),
  slug: z
    .string()
    .min(2, "Мін 2")
    .max(120, "Макс 120")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Лише lower-case, цифри, тире")
    .optional(),
});
const detailsSchema = z.object({
  origin_year: z.number().int().min(1900).max(2100).nullable().optional(),
  first_seen_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  origin_platform: z.string().max(120).nullable().optional(),
  origin_url: z
    .string()
    .url()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  origin_country: z.string().max(80).nullable().optional(),
  language: z.string().max(16).nullable().optional(),
  creator_name: z.string().max(255).nullable().optional(),
  creator_contact: z.string().max(255).nullable().optional(),
  license: z.string().max(64).nullable().optional(),
  attribution_required: z.boolean(),
});
const moderationSchema = z.object({
  nsfw: z.boolean(),
  sensitive: z.boolean(),
  verified: z.boolean(),
  locked: z.boolean(),
  review_notes: z.string().max(500).nullable().optional(),
});

export type ValidationErrors = Record<string, string>;

function validateDraft(d: MemeEditorDraft): ValidationErrors {
  const errors: ValidationErrors = {};
  const resBasic = basicSchema.safeParse(d.basic);
  if (!resBasic.success)
    resBasic.error.issues.forEach(
      (i: z.ZodIssue) => (errors[`basic.${i.path.join(".")}`] = i.message)
    );
  const resDetails = detailsSchema.safeParse(d.details);
  if (!resDetails.success)
    resDetails.error.issues.forEach(
      (i: z.ZodIssue) => (errors[`details.${i.path.join(".")}`] = i.message)
    );
  const resMod = moderationSchema.safeParse(d.moderation);
  if (!resMod.success)
    resMod.error.issues.forEach(
      (i: z.ZodIssue) => (errors[`moderation.${i.path.join(".")}`] = i.message)
    );
  // перевірка довжини масивів
  if (d.taxonomy.alt_titles.length > 15)
    errors["taxonomy.alt_titles"] = "Макс 15";
  if (d.taxonomy.tags.length > 30) errors["taxonomy.tags"] = "Макс 30";
  return errors;
}

export function useMemeEditor(slug: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [original, setOriginal] = useState<FullMeme | null>(null);
  const [draft, setDraft] = useState<MemeEditorDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [slugUnique, setSlugUnique] = useState(true);
  const dirtyRef = useRef(false);
  const slugCheckTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/memes/slug/${slug}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setOriginal(data.meme as FullMeme);
      setDraft(toDraft(data.meme as FullMeme));
      setErrors({});
      dirtyRef.current = false;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const update = useCallback(({ section, patch }: SectionPatch) => {
    setDraft((d) => {
      if (!d) return d;
      let next: MemeEditorDraft;
      if (section === "media") {
        next = { ...d, media: patch as MemeEditorDraft["media"] };
      } else if (section === "basic") {
        next = {
          ...d,
          basic: {
            ...d.basic,
            ...(patch as Partial<MemeEditorDraft["basic"]>),
          },
        };
      } else if (section === "details") {
        next = {
          ...d,
          details: {
            ...d.details,
            ...(patch as Partial<MemeEditorDraft["details"]>),
          },
        };
      } else if (section === "moderation") {
        next = {
          ...d,
          moderation: {
            ...d.moderation,
            ...(patch as Partial<MemeEditorDraft["moderation"]>),
          },
        };
      } else {
        next = {
          ...d,
          taxonomy: {
            ...d.taxonomy,
            ...(patch as Partial<MemeEditorDraft["taxonomy"]>),
          },
        };
      }
      dirtyRef.current = true;
      setErrors(d ? validateDraft(next) : {});
      return next;
    });
  }, []);

  // дебаунс перевірки унікальності slug
  // перевіряємо slug на унікальність, якщо він змінюється
  useEffect(() => {
    if (!draft) return;
    const currentSlug = draft.basic.slug;
    if (!currentSlug) {
      setSlugUnique(true);
      return;
    }
    if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    slugCheckTimer.current = setTimeout(async () => {
      try {
        if (original && original.slug === currentSlug) {
          setSlugUnique(true);
          return;
        }
        const r = await fetch(`/api/admin/memes/slug/${currentSlug}`);
        if (r.status === 404) {
          setSlugUnique(true);
        } else if (r.ok) {
          const data = await r.json();
          if (data.meme?.id === original?.id) setSlugUnique(true);
          else setSlugUnique(false);
        } else {
          setSlugUnique(true);
        }
      } catch {
        setSlugUnique(true);
      }
    }, 500);
    return () => {
      if (slugCheckTimer.current) clearTimeout(slugCheckTimer.current);
    };
  }, [draft, original]);

  const replaceTaxonomy = useCallback(
    (field: keyof MemeEditorDraft["taxonomy"], values: string[]) => {
      setDraft((d) => {
        if (!d) return d;
        const next: MemeEditorDraft = {
          ...d,
          taxonomy: { ...d.taxonomy, [field]: values },
        };
        dirtyRef.current = true;
        setErrors(validateDraft(next));
        return next;
      });
    },
    []
  );

  function buildPatch(orig: FullMeme, d: MemeEditorDraft) {
    const patch: Record<string, unknown> = {};
    if (orig.slug !== d.basic.slug && d.basic.status === "draft")
      patch.slug = d.basic.slug;
    if (orig.title !== d.basic.title) patch.title = d.basic.title;
    if (orig.short_description !== d.basic.short_description)
      patch.short_description = d.basic.short_description;
    if (orig.explanation !== d.basic.explanation)
      patch.explanation = d.basic.explanation;
    if (orig.status !== d.basic.status) patch.status = d.basic.status;
    const det = d.details;
    const oDet = orig.details || {};
    (
      [
        "origin_year",
        "first_seen_date",
        "origin_platform",
        "origin_url",
        "origin_country",
        "language",
        "creator_name",
        "creator_contact",
        "license",
        "attribution_required",
      ] as const
    ).forEach((k) => {
      const currentValue = (oDet as Partial<MemeDetailsShape>)[k];
      const nextValue = det[k];
      if (currentValue !== nextValue) patch[k] = nextValue;
    });
    const mod = d.moderation;
    const oMod = orig.moderation || {};
    (
      ["nsfw", "sensitive", "verified", "locked", "review_notes"] as const
    ).forEach((k) => {
      const currentValue = (oMod as Partial<MemeModerationShape>)[k];
      const nextValue = mod[k];
      if (currentValue !== nextValue) patch[k] = nextValue;
    });
    const arrays: Array<[keyof MemeEditorDraft["taxonomy"], string[]]> = [
      ["alt_titles", d.taxonomy.alt_titles],
      ["tags", d.taxonomy.tags],
      ["categories", d.taxonomy.categories],
      ["formats", d.taxonomy.formats],
    ];
    arrays.forEach(([k, arr]) => {
      const origRecord = orig as unknown as Record<string, string[]>;
      const origArr: string[] = origRecord[k] || [];
      if (
        origArr.length !== arr.length ||
        origArr.some((v: string, i: number) => v !== arr[i])
      ) {
        (patch as Record<string, unknown>)[k] = arr;
      }
    });
    const mediaChanged = JSON.stringify(orig.media) !== JSON.stringify(d.media);
    if (mediaChanged) {
      (patch as Record<string, unknown>).media = d.media.map((m) => ({
        url: m.url,
        type: m.type,
        width: m.width,
        height: m.height,
        alt_text: m.alt_text,
        attribution: m.attribution,
        is_primary: m.is_primary,
        order_index: m.order_index,
      }));
    }
    return patch;
  }

  const save = useCallback(async () => {
    if (!original || !draft || saving) return;
    const patch = buildPatch(original, draft);
    const vErrors = validateDraft(draft);
    if (!slugUnique) vErrors["basic.slug"] = "Slug вже існує";
    setErrors(vErrors);
    if (Object.keys(vErrors).length) {
      setSaving(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/memes/${original.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setOriginal(data.meme as FullMeme);
      setDraft(toDraft(data.meme as FullMeme));
      setErrors({});
      dirtyRef.current = false;
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }, [original, draft, saving, slugUnique]);

  const isDirty = dirtyRef.current;

  return {
    loading,
    error,
    original,
    draft,
    update,
    replaceTaxonomy,
    save,
    isDirty,
    saving,
    refresh: fetchData,
    errors,
    slugUnique,
  };
}
