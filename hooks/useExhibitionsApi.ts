"use client";
import type { ExhibitionStatus } from "@/types/exhibition";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface AdminExhRecord {
  id: number;
  slug: string;
  title: string;
  emoji: string;
  banner_color: string;
  short_description: string;
  content_md: string;
  start_date: string | null;
  end_date: string | null;
  status: ExhibitionStatus;
  created_at: string;
  updated_at: string;
}

export interface DraftShape {
  title: string;
  emoji: string;
  color: string; // мап до banner_color
  description: string; // короткий опис (short_description)
  content: string; // content_md
  startDate?: string;
  endDate?: string;
}

function toDraft(e: AdminExhRecord): DraftShape {
  return {
    title: e.title,
    emoji: e.emoji,
    color: e.banner_color,
    description: e.short_description,
    content: e.content_md,
    startDate: e.start_date ?? "",
    endDate: e.end_date ?? "",
  };
}

function fromDraft(d: DraftShape) {
  return {
    title: d.title,
    emoji: d.emoji,
    short_description: d.description,
    content_md: d.content,
    banner_color: d.color,
    start_date: d.startDate || null,
    end_date: d.endDate || null,
  };
}

interface UseExhibitionsApiOptions {
  view: "current" | "archived";
  onEvent?: (e: { type: string; detail?: unknown }) => void;
}

export function useExhibitionsApi({ view, onEvent }: UseExhibitionsApiOptions) {
  const [items, setItems] = useState<AdminExhRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftShape | null>(null);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);

  const emit = useCallback(
    (type: string, detail?: unknown) => {
      onEvent?.({ type, detail });
    },
    [onEvent]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (view === "archived") params.append("status", "archived");
      else {
        // всі окрім архівних
        params.append("includeArchived", "false");
      }
      const res = await fetch(`/api/admin/exhibitions?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setItems(data.exhibitions);
      if (data.exhibitions.length && !activeId) {
        setActiveId(data.exhibitions[0].id);
        setDraft(toDraft(data.exhibitions[0]));
      } else if (activeId) {
        const now = data.exhibitions.find(
          (e: AdminExhRecord) => e.id === activeId
        );
        if (now) setDraft(toDraft(now));
        else {
          setActiveId(data.exhibitions[0]?.id ?? null);
          setDraft(data.exhibitions[0] ? toDraft(data.exhibitions[0]) : null);
        }
      }
      emit("refreshed", { count: data.exhibitions.length });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      emit("error", { action: "refresh", message: msg });
    } finally {
      setLoading(false);
    }
  }, [view, activeId, emit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const select = useCallback(
    (id: number) => {
      setActiveId(id);
      const found = items.find((e) => e.id === id);
      setDraft(found ? toDraft(found) : null);
      dirtyRef.current = false;
      emit("select", { id });
    },
    [items, emit]
  );

  const updateDraft = useCallback((patch: Partial<DraftShape>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    dirtyRef.current = true;
  }, []);

  const create = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Нова виставка",
          emoji: "🖼️",
          short_description: "",
          content_md: "",
          banner_color: "green",
          status: "draft",
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      setItems((prev) => [...prev, data.exhibition]);
      setActiveId(data.exhibition.id);
      setDraft(toDraft(data.exhibition));
      dirtyRef.current = false;
      emit("created", { id: data.exhibition.id });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Create failed";
      emit("error", { action: "create", message: msg });
      throw e;
    }
  }, [emit]);

  const save = useCallback(
    async (options?: { auto?: boolean }) => {
      if (!activeId || !draft) return;
      if (savingRef.current) return; // для уникнення повторних запитів
      savingRef.current = true;
      setSaving(true);
      try {
        const payload = fromDraft(draft);
        const res = await fetch(`/api/admin/exhibitions/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        setItems((prev) =>
          prev.map((e) => (e.id === activeId ? data.exhibition : e))
        );
        setDraft(toDraft(data.exhibition));
        dirtyRef.current = false;
        emit("saved", { id: activeId, auto: !!options?.auto });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Save failed";
        emit("error", { action: "save", message: msg, auto: !!options?.auto });
        throw e;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [activeId, draft, emit]
  );

  const changeStatus = useCallback(
    async (status: ExhibitionStatus) => {
      if (!activeId) return;
      try {
        const res = await fetch(`/api/admin/exhibitions/${activeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Status update failed");
        }
        const data = await res.json();
        setItems((prev) =>
          prev.map((e) => (e.id === activeId ? data.exhibition : e))
        );
        emit("statusChanged", { id: activeId, status });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Status update failed";
        emit("error", { action: "status", message: msg, status });
        throw e;
      }
    },
    [activeId, emit]
  );

  const changeStatusById = useCallback(
    async (id: number, status: ExhibitionStatus) => {
      try {
        const res = await fetch(`/api/admin/exhibitions/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Status update failed");
        }
        const data = await res.json();
        setItems((prev) =>
          prev.map((e) => (e.id === id ? data.exhibition : e))
        );
        if (id === activeId) {
          // синхронізуємо активну виставку
          setDraft(toDraft(data.exhibition));
        }
        emit("statusChanged", { id, status });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Status update failed";
        emit("error", { action: "status", message: msg, status, id });
        throw e;
      }
    },
    [activeId, emit]
  );

  // статусні допоміжні обгортки (бракувало -> publish не визначено)
  const publish = useCallback(() => changeStatus("published"), [changeStatus]);
  const archive = useCallback(() => changeStatus("archived"), [changeStatus]);
  const unarchive = useCallback(() => changeStatus("draft"), [changeStatus]);
  const archiveById = useCallback(
    (id: number) => changeStatusById(id, "archived"),
    [changeStatusById]
  );
  const unarchiveById = useCallback(
    (id: number) => changeStatusById(id, "draft"),
    [changeStatusById]
  );
  const publishById = useCallback(
    (id: number) => changeStatusById(id, "published"),
    [changeStatusById]
  );

  const remove = useCallback(async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/admin/exhibitions/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((e) => e.id !== activeId));
      const next = items.filter((e) => e.id !== activeId)[0];
      setActiveId(next?.id ?? null);
      setDraft(next ? toDraft(next) : null);
      emit("deleted", { id: activeId });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      emit("error", { action: "delete", message: msg, id: activeId });
      throw e;
    }
  }, [activeId, items, emit]);

  const isDirty = dirtyRef.current;

  const active = useMemo(
    () => (activeId ? items.find((e) => e.id === activeId) || null : null),
    [activeId, items]
  );

  useEffect(() => {
    // автоматичне збереження драфту
    // якщо є активний драфт, він dirty і не зберігається
    if (!draft || !activeId) return;
    const active = items.find((e) => e.id === activeId);
    if (!active || active.status !== "draft") return;
    if (!isDirty) return;
    const timer = setTimeout(() => {
      // автоматичне збереження
      save({ auto: true }).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [draft, activeId, items, isDirty, save]);

  return {
    items,
    loading,
    error,
    refresh,
    activeId,
    select,
    draft,
    updateDraft,
    create,
    save: () => save({ auto: false }),
    publish,
    archive,
    unarchive,
    archiveById,
    unarchiveById,
    publishById,
    remove,
    active,
    isDirty,
    saving,
    view,
    
    changeStatus,
    changeStatusById,
  };
}
