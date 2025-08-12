"use client";
import ExhibitionForm, {
  ExhibitionFormData,
} from "@/components/admin/ExhibitionForm";
import ExhibitionPreview from "@/components/admin/ExhibitionPreview";
import ExhibitionsTabs from "@/components/admin/ExhibitionsTabs";
import { useExhibitionsApi } from "@/hooks/useExhibitionsApi";
import type { ExhibitionStatus } from "@/types/exhibition";
import { useState } from "react";

export default function ExhibitionsPage() {
  const [view, setView] = useState<"current" | "archived">(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("admin_exhibitions_view");
      if (stored === "archived" || stored === "current") return stored;
    }
    return "current";
  });
  const {
    items,
    activeId,
    select,
    draft,
    updateDraft,
    create,
    save,
    publish,
    archive,
    unarchive,
    remove,
    isDirty,
    archiveById,
    unarchiveById,
    saving,
  } = useExhibitionsApi({ view });

  const setViewPersist = (v: "current" | "archived") => {
    setView(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_exhibitions_view", v);
    }
  };

  const current: ExhibitionFormData = draft
    ? {
        title: draft.title,
        emoji: draft.emoji,
        color: draft.color,
        description: draft.description,
        startDate: draft.startDate || "",
        endDate: draft.endDate || "",
        content: draft.content,
        slug: items.find((e) => e.id === activeId)?.slug || "",
      }
    : {
        title: "",
        emoji: "",
        color: "green",
        description: "",
        startDate: "",
        endDate: "",
        content: "",
        slug: "",
      };

  const statusActionsInline = () => {
    const active = items.find((e) => e.id === activeId) || null;
    if (!active) return null;
    const s: ExhibitionStatus = active.status;
    return (
      <div className="flex flex-wrap gap-3 mt-8">
        {s === "archived" ? (
          <button
            type="button"
            onClick={() => unarchive()}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-5 py-2 rounded"
          >
            Розархівувати
          </button>
        ) : (
          s !== "published" && (
            <button
              type="button"
              onClick={() => publish()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded"
            >
              Опублікувати
            </button>
          )
        )}
        {(s === "draft" || s === "archived") && (
          <button
            type="button"
            onClick={() => remove()}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2 rounded"
          >
            Видалити
          </button>
        )}
        {s !== "archived" && (
          <button
            type="button"
            onClick={() => save()}
            disabled={!isDirty || saving}
            className={`text-white text-sm font-semibold px-5 py-2 rounded ${
              isDirty
                ? saving
                  ? "bg-green-400 cursor-wait"
                  : "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Збереження..." : isDirty ? "Зберегти" : "Збережено"}
          </button>
        )}
        {s !== "archived" && s !== "draft" && (
          <button
            type="button"
            onClick={() => archive()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold px-5 py-2 rounded"
          >
            Архівувати
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Керування виставками</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewPersist("current")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              view === "current"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-orange-100 hover:text-orange-700"
            }`}
          >
            Поточні
          </button>
          <button
            type="button"
            onClick={() => setViewPersist("archived")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              view === "archived"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-orange-100 hover:text-orange-700"
            }`}
          >
            Архів
          </button>
        </div>
      </div>
      <ExhibitionsTabs
        exhibitions={items.map((e) => ({
          id: e.id,
          title: e.title || e.slug,
          status: e.status,
        }))}
        onSelect={select}
        onCreate={create}
        onArchive={archiveById}
        onUnarchive={unarchiveById}
        activeId={activeId}
        showCreate={view !== "archived"}
      />
      {view === "archived" && items.length === 0 ? (
        <div className="p-8 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          Архів порожній.
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          Немає виставок. Натисніть &quot;Створити нову&quot;.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <ExhibitionForm
              value={current}
              status={items.find((e) => e.id === activeId)?.status}
              onChange={(d) =>
                updateDraft({
                  title: d.title,
                  emoji: d.emoji,
                  color: d.color,
                  description: d.description,
                  startDate: d.startDate,
                  endDate: d.endDate,
                  content: d.content,
                })
              }
            />
            {statusActionsInline()}
          </div>
          <div>
            <ExhibitionPreview markdown={current.content} />
          </div>
        </div>
      )}
    </div>
  );
}
