"use client";
import type { MemeStatus } from "@/db/memes.service";
import { useMemeEditor } from "@/hooks/useMemeEditor";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminMemeEditorPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const {
    loading,
    error,
    draft,
    update,
    save,
    isDirty,
    saving,
    original,
    replaceTaxonomy,
    errors,
  } = useMemeEditor(slug);
  const [newAlt, setNewAlt] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newFmt, setNewFmt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Link href="/admin/memes" className="text-orange-600 hover:underline">
            ← Назад
          </Link>
          {original && (
            <span className="text-xs text-gray-400">ID: {original.id}</span>
          )}
          {original && (
            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {original.slug}
            </code>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={isDirty ? "text-orange-600" : "text-gray-500"}>
            {isDirty ? "Є зміни" : "Без змін"}
          </span>
          <button
            onClick={() => save()}
            disabled={!isDirty || saving}
            className="px-4 py-1.5 rounded-md bg-orange-600 disabled:opacity-50 text-white font-medium hover:bg-orange-700"
          >
            {saving ? "Збереження..." : "Зберегти"}
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Завантаження...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {draft && (
        <div className="space-y-8">
          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Основне</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">
                    Заголовок *
                  </label>
                  <input
                    value={draft.basic.title}
                    onChange={(e) =>
                      update({
                        section: "basic",
                        patch: { title: e.target.value },
                      })
                    }
                    disabled={draft.moderation.locked}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors["basic.title"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${
                      draft.moderation.locked
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  {errors["basic.title"] && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors["basic.title"]}
                    </p>
                  )}
                </div>
                <div className="w-full md:w-64">
                  <label className="block text-xs font-medium mb-1">
                    Slug (draft)
                  </label>
                  <input
                    value={draft.basic.slug}
                    onChange={(e) =>
                      update({
                        section: "basic",
                        patch: { slug: e.target.value },
                      })
                    }
                    disabled={
                      draft.basic.status !== "draft" || draft.moderation.locked
                    }
                    placeholder="auto"
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors["basic.slug"]
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${
                      (draft.basic.status !== "draft" ||
                        draft.moderation.locked) &&
                      "bg-gray-100 cursor-not-allowed"
                    }`}
                  />
                  {errors["basic.slug"] && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors["basic.slug"]}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Статус</label>
                <select
                  value={draft.basic.status}
                  onChange={(e) =>
                    update({
                      section: "basic",
                      patch: { status: e.target.value as MemeStatus },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                  <option value="deprecated">deprecated</option>
                </select>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {(
                    [
                      "draft",
                      "published",
                      "archived",
                      "deprecated",
                    ] as MemeStatus[]
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        update({ section: "basic", patch: { status: s } })
                      }
                      disabled={
                        draft.basic.status === s || draft.moderation.locked
                      }
                      className={`px-2 py-1 rounded text-xs border ${
                        draft.basic.status === s
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white hover:bg-orange-50"
                      } disabled:opacity-40`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Деталі (origin)</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium mb-1">Year</label>
                <input
                  type="number"
                  value={draft.details.origin_year ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: {
                        origin_year: e.target.value
                          ? Number(e.target.value)
                          : null,
                      },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  First seen date
                </label>
                <input
                  type="date"
                  value={draft.details.first_seen_date ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { first_seen_date: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Platform
                </label>
                <input
                  value={draft.details.origin_platform ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { origin_platform: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Origin URL
                </label>
                <input
                  value={draft.details.origin_url ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { origin_url: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Country
                </label>
                <input
                  value={draft.details.origin_country ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { origin_country: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Language
                </label>
                <input
                  value={draft.details.language ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { language: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Creator name
                </label>
                <input
                  value={draft.details.creator_name ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { creator_name: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Creator contact
                </label>
                <input
                  value={draft.details.creator_contact ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { creator_contact: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  License
                </label>
                <input
                  value={draft.details.license ?? ""}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { license: e.target.value || null },
                    })
                  }
                  disabled={draft.moderation.locked}
                  className="w-full border rounded px-2 py-1.5 text-sm disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-3">
                <input
                  id="attrreq"
                  type="checkbox"
                  checked={draft.details.attribution_required}
                  onChange={(e) =>
                    update({
                      section: "details",
                      patch: { attribution_required: e.target.checked },
                    })
                  }
                  disabled={draft.moderation.locked}
                />
                <label htmlFor="attrreq" className="text-xs">
                  Attribution required
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Модерація</h2>
            <div className="grid gap-4 md:grid-cols-4 text-xs">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.moderation.nsfw}
                  onChange={(e) =>
                    update({
                      section: "moderation",
                      patch: { nsfw: e.target.checked },
                    })
                  }
                />{" "}
                NSFW
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.moderation.sensitive}
                  onChange={(e) =>
                    update({
                      section: "moderation",
                      patch: { sensitive: e.target.checked },
                    })
                  }
                />{" "}
                Sensitive
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.moderation.verified}
                  onChange={(e) =>
                    update({
                      section: "moderation",
                      patch: { verified: e.target.checked },
                    })
                  }
                />{" "}
                Verified
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.moderation.locked}
                  onChange={(e) =>
                    update({
                      section: "moderation",
                      patch: { locked: e.target.checked },
                    })
                  }
                />{" "}
                Locked
              </label>
              <div className="md:col-span-4">
                <label className="block text-xs font-medium mb-1">
                  Review notes
                </label>
                <textarea
                  rows={3}
                  value={draft.moderation.review_notes ?? ""}
                  onChange={(e) =>
                    update({
                      section: "moderation",
                      patch: { review_notes: e.target.value || null },
                    })
                  }
                  disabled={false}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Таксономії</h2>
            <div className="grid gap-6 md:grid-cols-2 text-xs">
              <div>
                <label className="block font-medium mb-1">Alt titles</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newAlt}
                    onChange={(e) => setNewAlt(e.target.value)}
                    disabled={draft.moderation.locked}
                    className="flex-1 border rounded px-2 py-1 disabled:bg-gray-100"
                    placeholder="новий"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAlt && !draft.taxonomy.alt_titles.includes(newAlt))
                        replaceTaxonomy("alt_titles", [
                          ...draft.taxonomy.alt_titles,
                          newAlt,
                        ]);
                      setNewAlt("");
                    }}
                    disabled={draft.moderation.locked}
                    className="px-3 py-1 rounded bg-orange-600 text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                {errors["taxonomy.alt_titles"] && (
                  <p className="text-red-600 mb-1">
                    {errors["taxonomy.alt_titles"]}
                  </p>
                )}
                <ul className="flex flex-wrap gap-2">
                  {draft.taxonomy.alt_titles.map((t) => (
                    <li
                      key={t}
                      className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          replaceTaxonomy(
                            "alt_titles",
                            draft.taxonomy.alt_titles.filter((x) => x !== t)
                          )
                        }
                        disabled={draft.moderation.locked}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-40"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block font-medium mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    disabled={draft.moderation.locked}
                    className="flex-1 border rounded px-2 py-1 disabled:bg-gray-100"
                    placeholder="tag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTag && !draft.taxonomy.tags.includes(newTag))
                        replaceTaxonomy("tags", [
                          ...draft.taxonomy.tags,
                          newTag,
                        ]);
                      setNewTag("");
                    }}
                    disabled={draft.moderation.locked}
                    className="px-3 py-1 rounded bg-orange-600 text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                {errors["taxonomy.tags"] && (
                  <p className="text-red-600 mb-1">{errors["taxonomy.tags"]}</p>
                )}
                <ul className="flex flex-wrap gap-2">
                  {draft.taxonomy.tags.map((t) => (
                    <li
                      key={t}
                      className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          replaceTaxonomy(
                            "tags",
                            draft.taxonomy.tags.filter((x) => x !== t)
                          )
                        }
                        disabled={draft.moderation.locked}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-40"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block font-medium mb-1">Categories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    disabled={draft.moderation.locked}
                    className="flex-1 border rounded px-2 py-1 disabled:bg-gray-100"
                    placeholder="category"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCat && !draft.taxonomy.categories.includes(newCat))
                        replaceTaxonomy("categories", [
                          ...draft.taxonomy.categories,
                          newCat,
                        ]);
                      setNewCat("");
                    }}
                    disabled={draft.moderation.locked}
                    className="px-3 py-1 rounded bg-orange-600 text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {draft.taxonomy.categories.map((t) => (
                    <li
                      key={t}
                      className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          replaceTaxonomy(
                            "categories",
                            draft.taxonomy.categories.filter((x) => x !== t)
                          )
                        }
                        disabled={draft.moderation.locked}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-40"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block font-medium mb-1">Formats</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newFmt}
                    onChange={(e) => setNewFmt(e.target.value)}
                    disabled={draft.moderation.locked}
                    className="flex-1 border rounded px-2 py-1 disabled:bg-gray-100"
                    placeholder="format"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFmt && !draft.taxonomy.formats.includes(newFmt))
                        replaceTaxonomy("formats", [
                          ...draft.taxonomy.formats,
                          newFmt,
                        ]);
                      setNewFmt("");
                    }}
                    disabled={draft.moderation.locked}
                    className="px-3 py-1 rounded bg-orange-600 text-white disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {draft.taxonomy.formats.map((t) => (
                    <li
                      key={t}
                      className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          replaceTaxonomy(
                            "formats",
                            draft.taxonomy.formats.filter((x) => x !== t)
                          )
                        }
                        disabled={draft.moderation.locked}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-40"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h2 className="font-semibold text-sm mb-4">Медіа</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement | null; // кешування перед використанням
                if (draft.moderation.locked) return;
                const fileInput = form?.querySelector(
                  "input[type=file]"
                ) as HTMLInputElement | null;
                if (!fileInput?.files?.[0]) return;
                setUploading(true);
                setUploadErr(null);
                try {
                  const formData = new FormData();
                  formData.append("file", fileInput.files[0]);
                  formData.append("slugBase", draft.basic.title);
                  const res = await fetch("/api/admin/memes/upload", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Upload failed");
                  update({
                    section: "media",
                    patch: [
                      ...draft.media,
                      {
                        url: data.url,
                        type: "image",
                        is_primary: draft.media.length === 0,
                        order_index: draft.media.length,
                      },
                    ],
                  });
                } catch (err: any) {
                  setUploadErr(err.message);
                } finally {
                  setUploading(false);
                  if (form) form.reset();
                }
              }}
            >
              <input
                type="file"
                accept="image/jpeg"
                className="text-xs"
                disabled={draft.moderation.locked}
              />
              <button
                type="submit"
                disabled={uploading || draft.moderation.locked}
                className="px-3 py-1.5 rounded bg-orange-600 text-white disabled:opacity-50"
              >
                {uploading ? "Завантаження..." : "Завантажити"}
              </button>
              {uploadErr && <span className="text-red-600">{uploadErr}</span>}
            </form>
            {!draft.media.length && (
              <div className="text-xs text-gray-500">Немає медіа.</div>
            )}
            <ul className="space-y-2">
              {draft.media.map((m, idx) => (
                <li
                  key={m.url}
                  className="border rounded p-2 text-xs flex flex-col gap-1 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium break-all flex-1">
                      {m.url}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          section: "media",
                          patch: draft.media.map((mm, i) =>
                            i === idx
                              ? { ...mm, is_primary: !mm.is_primary }
                              : { ...mm, is_primary: false }
                          ),
                        })
                      }
                      disabled={draft.moderation.locked}
                      className={`px-2 py-0.5 rounded ${
                        m.is_primary ? "bg-green-600 text-white" : "bg-gray-200"
                      } disabled:opacity-40`}
                    >
                      {m.is_primary ? "Primary" : "Make primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          section: "media",
                          patch: draft.media
                            .filter((_, i) => i !== idx)
                            .map((mm, i) => ({ ...mm, order_index: i })),
                        })
                      }
                      disabled={draft.moderation.locked}
                      className="px-2 py-0.5 rounded bg-red-600 text-white disabled:opacity-40"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0 || draft.moderation.locked}
                      onClick={() =>
                        update({
                          section: "media",
                          patch: draft.media.map((mm, i) =>
                            i === idx
                              ? { ...draft.media[idx - 1], order_index: i - 1 }
                              : i === idx - 1
                              ? { ...m, order_index: i }
                              : mm
                          ),
                        })
                      }
                      className="px-2 py-0.5 rounded bg-gray-200 disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={
                        idx === draft.media.length - 1 ||
                        draft.moderation.locked
                      }
                      onClick={() =>
                        update({
                          section: "media",
                          patch: draft.media.map((mm, i) =>
                            i === idx
                              ? { ...draft.media[idx + 1], order_index: i + 1 }
                              : i === idx + 1
                              ? { ...m, order_index: i }
                              : mm
                          ),
                        })
                      }
                      className="px-2 py-0.5 rounded bg-gray-200 disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <span className="text-gray-500">
                      order: {m.order_index}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
