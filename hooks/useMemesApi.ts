"use client";
import type { MemeStatus } from "@/db/memes.service";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface AdminMemeRecord {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  explanation: string;
  status: MemeStatus;
  created_at: string;
  updated_at: string;
  media?: Array<{
    id: number;
    url: string;
    is_primary: boolean;
    order_index: number;
  }>;
}

export interface MemeDraftShape {
  title: string;
  description: string; // short_description
  explanation: string; // markdown / rich text
}

function toDraft(m: AdminMemeRecord): MemeDraftShape {
  return {
    title: m.title,
    description: m.short_description,
    explanation: m.explanation,
  };
}

function fromDraft(d: MemeDraftShape) {
  return {
    title: d.title,
    short_description: d.description,
    explanation: d.explanation,
  };
}

interface UseMemesApiOptions {
  onEvent?: (e: { type: string; detail?: unknown }) => void;
}

export function useMemesApi({ onEvent }: UseMemesApiOptions = {}) {
  const [items, setItems] = useState<AdminMemeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState<MemeDraftShape | null>(null);
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const emit = useCallback(
    (type: string, detail?: unknown) => onEvent?.({ type, detail }),
    [onEvent]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/memes`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = (await res.json()) as { memes: AdminMemeRecord[] };
      setItems(data.memes);
      if (data.memes.length && !activeId) {
        setActiveId(data.memes[0].id);
        setDraft(toDraft(data.memes[0]));
      } else if (activeId) {
        const now = data.memes.find((m) => m.id === activeId);
        if (now) setDraft(toDraft(now));
        else if (data.memes[0]) {
          setActiveId(data.memes[0].id);
          setDraft(toDraft(data.memes[0]));
        } else {
          setActiveId(null);
          setDraft(null);
        }
      }
      emit("refreshed", { count: data.memes.length });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      setError(msg);
      emit("error", { action: "refresh", message: msg });
    } finally {
      setLoading(false);
    }
  }, [activeId, emit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const select = useCallback(
    (id: number) => {
      setActiveId(id);
      const found = items.find((m) => m.id === id);
      setDraft(found ? toDraft(found) : null);
      dirtyRef.current = false;
      emit("select", { id });
    },
    [items, emit]
  );

  const updateDraft = useCallback((patch: Partial<MemeDraftShape>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    dirtyRef.current = true;
  }, []);

  const create = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/memes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Новий мем",
          short_description: "",
          explanation: "",
          status: "draft",
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      setItems((prev) => [...prev, data.meme]);
      setActiveId(data.meme.id);
      setDraft(toDraft(data.meme));
      dirtyRef.current = false;
      emit("created", { id: data.meme.id });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Create failed";
      emit("error", { action: "create", message: msg });
      throw e;
    }
  }, [emit]);

  const save = useCallback(
    async (options?: { auto?: boolean }) => {
      if (!activeId || !draft) return;
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      try {
        const payload = fromDraft(draft);
        const res = await fetch(`/api/admin/memes/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        setItems((prev) =>
          prev.map((m) => (m.id === activeId ? data.meme : m))
        );
        setDraft(toDraft(data.meme));
        dirtyRef.current = false;
        emit("saved", { id: activeId, auto: !!options?.auto });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Save failed";
        emit("error", { action: "save", message: msg, auto: !!options?.auto });
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [activeId, draft, emit]
  );

  const changeStatus = useCallback(
    async (status: MemeStatus) => {
      if (!activeId) return;
      try {
        const res = await fetch(`/api/admin/memes/${activeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Status update failed");
        const data = await res.json();
        setItems((prev) =>
          prev.map((m) => (m.id === activeId ? data.meme : m))
        );
        emit("statusChanged", { id: activeId, status });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Status update failed";
        emit("error", { action: "status", message: msg, status });
      }
    },
    [activeId, emit]
  );

  const remove = useCallback(async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/admin/memes/${activeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((m) => m.id !== activeId));
      const next = items.filter((m) => m.id !== activeId)[0];
      setActiveId(next?.id ?? null);
      setDraft(next ? toDraft(next) : null);
      emit("deleted", { id: activeId });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      emit("error", { action: "delete", message: msg, id: activeId });
    }
  }, [activeId, items, emit]);

  const publish = useCallback(() => changeStatus("published"), [changeStatus]);
  const archive = useCallback(() => changeStatus("archived"), [changeStatus]);
  const deprecate = useCallback(
    () => changeStatus("deprecated"),
    [changeStatus]
  );
  const revertToDraft = useCallback(
    () => changeStatus("draft"),
    [changeStatus]
  );

  const active = useMemo(
    () => (activeId ? items.find((m) => m.id === activeId) || null : null),
    [activeId, items]
  );
  const isDirty = dirtyRef.current;

  useEffect(() => {
    if (!draft || !activeId) return;
    const current = items.find((m) => m.id === activeId);
    if (!current || current.status !== "draft") return;
    if (!isDirty) return;
    const t = setTimeout(() => {
      save({ auto: true });
    }, 1200);
    return () => clearTimeout(t);
  }, [draft, activeId, items, isDirty, save]);

  return {
    items,
    loading,
    error,
    activeId,
    select,
    draft,
    updateDraft,
    create,
    save: () => save({ auto: false }),
    remove,
    publish,
    archive,
    deprecate,
    revertToDraft,
    active,
    isDirty,
    saving,
    refresh,
  };
}
