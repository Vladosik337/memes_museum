"use client";
import ExhibitionForm, {
  ExhibitionFormData,
} from "@/components/admin/ExhibitionForm";
import ExhibitionPreview from "@/components/admin/ExhibitionPreview";
import { Exhibition, ExhibitionStatus } from "@/types/exhibition";
import { slugify } from "@/utils/slugify";
import { useEffect, useMemo, useState } from "react";

// Тимчасове джерело (буде замінено на API)
interface LocalExhibition extends Exhibition {
  content_md: string;
  _isNew?: boolean;
  _dirty?: boolean;
}

function createDraft(data: ExhibitionFormData, id: number): LocalExhibition {
  return {
    id,
    slug: slugify(data.title || `draft-${id}`),
    title: data.title,
    emoji: data.emoji || "🎨",
    short_description: data.description,
    content_md: data.content,
    start_date: null,
    end_date: data.endDate || null,
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    _isNew: true,
    _dirty: true,
  };
}

export default function ExhibitionsClient() {
  const [items, setItems] = useState<LocalExhibition[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // початкове завантаження
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/exhibitions", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: Exhibition[] = data.exhibitions || [];
        setItems(list.map((ex) => ({ ...ex, _isNew: false, _dirty: false })));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg || "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = useMemo(
    () => items.find((x) => x.id === activeId) || null,
    [items, activeId]
  );

  const updateItem = (id: number, patch: Partial<LocalExhibition>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch, _dirty: true } : it))
    );
  };

  const handleCreate = () => {
    const newId = Date.now();
    const draft = createDraft(
      {
        title: "",
        emoji: "",
        color: "green",
        description: "",
        endDate: "",
        content: "",
      },
      newId
    );
    setItems((prev) => [draft, ...prev]);
    setActiveId(newId);
    setShowEditor(true);
  };

  const handleSelect = (id: number) => {
    setActiveId(id);
    setShowEditor(true);
  };

  const handleArchive = async (id: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (target._isNew) {
      // архівувати локально
      updateItem(id, { status: "archived" });
      return;
    }
    try {
      const res = await fetch(`/api/admin/exhibitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (!res.ok) throw new Error("Archive failed");
      const data = await res.json();
      setItems((prev) =>
        prev.map((ex) =>
          ex.id === id ? { ...ex, ...data.exhibition, _dirty: false } : ex
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const requiredMissing = (ex?: LocalExhibition) => {
    if (!ex) return [] as string[];
    const miss: string[] = [];
    if (!ex.title?.trim()) miss.push("title");
    if (!ex.emoji?.trim()) miss.push("emoji");
    if (!ex.content_md?.trim()) miss.push("content_md");
    return miss;
  };

  const handlePublish = async (id: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (requiredMissing(target).length) return; // block publish
    if (target._isNew) {
      // спершу збереження
      // потім публікація
      await handleSave(id, { forcePublish: true });
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/exhibitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (!res.ok) throw new Error("Publish failed");
      const data = await res.json();
      setItems((prev) =>
        prev.map((ex) =>
          ex.id === id ? { ...ex, ...data.exhibition, _dirty: false } : ex
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (data: ExhibitionFormData) => {
    if (!active) return;
    updateItem(active.id, {
      title: data.title,
      emoji: data.emoji || "🎨",
      short_description: data.description,
      content_md: data.content,
      end_date: data.endDate || null,
      updated_at: new Date().toISOString(),
    });
  };

  const handleSave = async (id?: number, opts?: { forcePublish?: boolean }) => {
    if (!active) return;
    const targetId = id ?? active.id;
    const ex = items.find((i) => i.id === targetId);
    if (!ex) return;
    try {
      setSaving(true);
      if (ex._isNew) {
        const payload = {
          title: ex.title || "Untitled exhibition",
          emoji: ex.emoji || "🎨",
          short_description: ex.short_description || "",
          content_md: ex.content_md || "",
          end_date: ex.end_date,
          start_date: ex.start_date,
          status: opts?.forcePublish ? "published" : ex.status,
        };
        if (opts?.forcePublish && requiredMissing(ex).length) {
          throw new Error("Заповніть обов'язкові поля перед публікацією");
        }
        const res = await fetch("/api/admin/exhibitions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        const data = await res.json();
        setItems((prev) =>
          prev.map((it) =>
            it.id === ex.id
              ? { ...data.exhibition, _isNew: false, _dirty: false }
              : it
          )
        );
        setActiveId(data.exhibition.id);
      } else if (ex._dirty || opts?.forcePublish) {
        const res = await fetch(`/api/admin/exhibitions/${ex.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: ex.title,
            emoji: ex.emoji,
            short_description: ex.short_description,
            content_md: ex.content_md,
            end_date: ex.end_date,
            start_date: ex.start_date,
            status: opts?.forcePublish ? "published" : ex.status,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
        const data = await res.json();
        setItems((prev) =>
          prev.map((it) =>
            it.id === ex.id
              ? { ...data.exhibition, _isNew: false, _dirty: false }
              : it
          )
        );
      }
      setShowEditor(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!active || active._isNew) return; // nothing to reset for drafts
    try {
      const resList = await fetch(
        "/api/admin/exhibitions?includeArchived=true",
        { cache: "no-store" }
      );
      if (!resList.ok) throw new Error("Reload failed");
      const data = await resList.json();
      const list: Exhibition[] = data.exhibitions || [];
      setItems(list.map((ex) => ({ ...ex, _isNew: false, _dirty: false })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    const ex = items.find((x) => x.id === id);
    if (!ex) return;
    if (ex._isNew) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setShowEditor(false);
      }
      return;
    }
    const ok = window.confirm("Видалити виставку? Цю дію не можна скасувати.");
    if (!ok) return;
    // зберігаємо попередній стан
    const prevItems = items;
    setItems((p) => p.filter((i) => i.id !== id));
    try {
      const res = await fetch(`/api/admin/exhibitions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      if (activeId === id) {
        setActiveId(null);
        setShowEditor(false);
      }
    } catch (e) {
      console.error(e);
      // відкат
      setItems(prevItems);
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Виставки</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg"
            disabled={saving}
          >
            + Нова виставка
          </button>
          {active && (
            <>
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="bg-white border border-orange-600 text-orange-700 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 disabled:opacity-50"
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>
              <button
                onClick={() => handlePublish(active.id)}
                disabled={saving || requiredMissing(active).length > 0}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
              >
                Опублікувати
              </button>
              <button
                onClick={handleReset}
                disabled={saving || active._isNew}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
              >
                Скинути
              </button>
              <button
                onClick={() => handleDelete(active.id)}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Видалити
              </button>
            </>
          )}
        </div>
      </header>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      {loading && (
        <div className="mb-4 text-sm text-gray-500">Завантаження...</div>
      )}

      <ExhibitionsTable
        items={items}
        activeId={activeId}
        onSelect={handleSelect}
        onArchive={handleArchive}
      />

      {showEditor && active && (
        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div>
            <ExhibitionForm
              value={{
                title: active.title,
                emoji: active.emoji,
                color: "green",
                description: active.short_description,
                endDate: active.end_date || "",
                content: active.content_md,
              }}
              onChange={handleFormChange}
              status={active.status}
              missingRequired={requiredMissing(active)}
            />
          </div>
          <div>
            <ExhibitionPreview markdown={active.content_md} />
          </div>
        </div>
      )}
    </div>
  );
}

interface TableProps {
  items: LocalExhibition[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onArchive: (id: number) => void;
}

function ExhibitionsTable({
  items,
  activeId,
  onSelect,
  onArchive,
}: TableProps) {
  return (
    <div className="overflow-x-auto border border-orange-200 rounded-lg bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-orange-50 text-orange-700">
          <tr>
            <Th>Назва</Th>
            <Th>Емодзі</Th>
            <Th>Статус</Th>
            <Th>Slug</Th>
            <Th>Оновлено</Th>
            <Th>Дії</Th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                Немає виставок
              </td>
            </tr>
          )}
          {items.map((ex) => (
            <tr
              key={ex.id}
              className={`border-t last:border-b hover:bg-orange-50/40 transition cursor-pointer ${
                activeId === ex.id ? "bg-orange-50" : ""
              }`}
              onClick={() => onSelect(ex.id)}
            >
              <Td className="font-medium text-gray-900 flex items-center gap-2">
                <span className="text-lg" aria-hidden>
                  {ex.emoji || "🎨"}
                </span>
                {ex.title || <span className="text-gray-400">(Без назви)</span>}
              </Td>
              <Td>{ex.emoji || "—"}</Td>
              <Td>
                <StatusBadge status={ex.status} />
              </Td>
              <Td className="font-mono text-xs">{ex.slug}</Td>
              <Td className="text-xs text-gray-500">
                {new Date(ex.updated_at).toLocaleDateString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Td>
              <Td>
                <div className="flex gap-2">
                  {ex.status !== "archived" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(ex.id);
                      }}
                      className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                    >
                      Архівувати
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function StatusBadge({ status }: { status: ExhibitionStatus }) {
  const map: Record<ExhibitionStatus, string> = {
    draft: "bg-gray-200 text-gray-700 border-gray-300",
    published: "bg-green-100 text-green-700 border-green-200",
    archived: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold border ${map[status]}`}
    >
      {status}
    </span>
  );
}
