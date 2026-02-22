/**
 * useNotebookData — state management hook for NotebookWidget
 * Handles pages, entries, cell entries, fetching, polling, Firestore sync, and all CRUD handlers.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createYooptaEditor, type YooptaContentValue } from "@yoopta/editor";
import { useOptionalWidgetContext } from "../layout/PlaygroundWidgetContext";
import type { NotebookPage, NotebookEntry, CellAddress } from "@/lib/models/notebook";
import type { PageEntryStat } from "@/lib/services/turso/notebookService";

export interface NotebookWidgetProps {
  userId?: string;
  userName?: string;
  userRole?: string;
  level?: string;
}

export function useNotebookData(props: NotebookWidgetProps) {
  const ctx = useOptionalWidgetContext();
  const userId = props.userId ?? ctx?.userId ?? "";
  const userName = props.userName ?? ctx?.userName ?? "";
  const userRole = props.userRole ?? ctx?.userRole ?? "student";
  const isTeacher = userRole === "teacher";
  const level = props.level ?? ctx?.currentRoom?.level;

  const [pages, setPages] = useState<NotebookPage[]>([]);
  const [entryStats, setEntryStats] = useState<Record<string, PageEntryStat>>({});
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [cellEntries, setCellEntries] = useState<NotebookEntry[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPageDirectory, setShowPageDirectory] = useState(false);
  const [activeCellInput, setActiveCellInput] = useState<CellAddress | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPage = pages[currentPageIndex] || null;

  // Yoopta editor instance — recreate per page to avoid stale Slate refs
  const editorKey = currentPage?.pageId ?? "empty";
  const editor = useMemo(() => createYooptaEditor(), [editorKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const initialEditorValue = useMemo(() => {
    if (!currentPage) return undefined;
    const raw = currentPage.content;
    const isValid =
      raw && typeof raw === "object" && Object.keys(raw).length > 0 &&
      Object.values(raw).every((block: any) => block?.meta && typeof block.meta.order === "number");
    return isValid ? (raw as YooptaContentValue) : undefined;
  }, [editorKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch ───
  const fetchPages = useCallback(async () => {
    if (!level) return;
    try {
      const res = await fetch(`/api/notebook?level=${level}`);
      const data = await res.json();
      setPages(data.pages || []);
      setEntryStats(data.entryStats || {});
    } catch (error) {
      console.error("[NotebookWidget] fetch pages error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [level]);

  const fetchEntries = useCallback(async () => {
    if (!currentPage) { setEntries([]); return; }
    try {
      const res = await fetch(`/api/notebook?pageId=${currentPage.pageId}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("[NotebookWidget] fetch entries error:", error);
    }
  }, [currentPage]);

  const fetchCellEntries = useCallback(async () => {
    if (!currentPage) { setCellEntries([]); return; }
    try {
      const res = await fetch(`/api/notebook?pageId=${currentPage.pageId}&cellEntries=true`);
      const data = await res.json();
      setCellEntries(data.cellEntries || []);
    } catch (error) {
      console.error("[NotebookWidget] fetch cell entries error:", error);
    }
  }, [currentPage]);

  useEffect(() => { fetchPages(); }, [fetchPages]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { fetchCellEntries(); }, [fetchCellEntries]);

  // Poll every 8s
  useEffect(() => {
    const interval = setInterval(() => { fetchPages(); fetchEntries(); fetchCellEntries(); }, 8000);
    return () => clearInterval(interval);
  }, [fetchPages, fetchEntries, fetchCellEntries]);

  // Sync Firestore navigation (playground only)
  const syncedPageId = ctx?.currentRoom?.currentNotebookPageId;
  useEffect(() => {
    if (!syncedPageId || pages.length === 0) return;
    const idx = pages.findIndex(p => p.pageId === syncedPageId);
    if (idx >= 0 && idx !== currentPageIndex) setCurrentPageIndex(idx);
  }, [syncedPageId, pages, currentPageIndex]);

  // ─── Handlers ───
  const handleGoToPage = async (index: number) => {
    setCurrentPageIndex(index);
    setShowPageDirectory(false);
    setActiveCellInput(null);
    if (isTeacher && ctx?.onSetNotebookPage) await ctx.onSetNotebookPage(pages[index].pageId);
  };

  const handleCreatePage = async () => {
    if (!level) return;
    const title = `Page ${pages.length + 1}`;
    const res = await fetch("/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createPage", level, title, createdBy: userId }),
    });
    const data = await res.json();
    await fetchPages();
    if (data.page) {
      setCurrentPageIndex(pages.length);
      if (isTeacher && ctx?.onSetNotebookPage) await ctx.onSetNotebookPage(data.page.pageId);
    }
  };

  const handleDeletePage = async () => {
    if (!currentPage || !confirm(`Delete "${currentPage.title}"?`)) return;
    await fetch("/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deletePage", pageId: currentPage.pageId }),
    });
    await fetchPages();
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
  };

  const handleSaveTitle = async () => {
    if (!currentPage || !titleDraft.trim()) { setEditingTitle(false); return; }
    await fetch("/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateTitle", pageId: currentPage.pageId, title: titleDraft.trim() }),
    });
    setEditingTitle(false);
    await fetchPages();
  };

  const handleNavigate = async (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentPageIndex - 1 : currentPageIndex + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;
    setCurrentPageIndex(newIndex);
    setActiveCellInput(null);
    if (isTeacher && ctx?.onSetNotebookPage) await ctx.onSetNotebookPage(pages[newIndex].pageId);
  };

  const handleSubmitEntry = async (content: object) => {
    if (!currentPage || !level) return;
    await fetch("/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitEntry", pageId: currentPage.pageId, level, userId, userName, content }),
    });
    await fetchEntries();
  };

  const handleReviewEntry = async (entryId: string, status: "approved" | "rejected") => {
    setEntries(prev => prev.map(e => e.entryId === entryId ? { ...e, status } : e));
    try {
      await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reviewEntry", entryId, status, reviewedBy: userId }),
      });
    } catch {
      await fetchEntries();
      return;
    }
    await fetchEntries();
  };

  const handleSubmitCellEntry = async (address: CellAddress, text: string) => {
    if (!currentPage || !level) return;
    await fetch("/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submitCellEntry",
        pageId: currentPage.pageId, level, userId, userName,
        blockId: address.blockId, cellRow: address.row, cellCol: address.col, text,
      }),
    });
    setActiveCellInput(null);
    await fetchCellEntries();
  };

  const handleReviewCellEntry = async (entryId: string, status: "approved" | "rejected") => {
    setCellEntries(prev => prev.map(e => e.entryId === entryId ? { ...e, status } : e));
    try {
      await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reviewCellEntry", entryId, status, reviewedBy: userId }),
      });
    } catch {
      await fetchCellEntries();
      return;
    }
    // Re-fetch both: page content may have changed (on approval)
    await Promise.all([fetchPages(), fetchCellEntries()]);
  };

  const handleEditorChange = useCallback(
    (value: YooptaContentValue, updateCaret: () => void) => {
      if (!currentPage) return;
      requestAnimationFrame(updateCaret);
      if (!isTeacher) return;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        fetch("/api/notebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "updateContent", pageId: currentPage.pageId, content: value }),
        });
      }, 1000);
    },
    [isTeacher, currentPage]
  );

  // Visible entries (teacher sees all, student sees approved + own)
  const visibleEntries = isTeacher
    ? entries
    : entries.filter(e => e.status === "approved" || e.userId === userId);
  const pendingEntries = visibleEntries.filter(e => e.status === "pending");

  // Visible cell entries
  const pendingCellEntries = cellEntries.filter(e => e.status === "pending");

  return {
    // Identity
    userId, userName, userRole, isTeacher, level,
    // Pages
    pages, currentPage, currentPageIndex, entryStats,
    isLoading, editorKey, editor, initialEditorValue,
    // Entries
    entries, visibleEntries, pendingEntries,
    // Cell entries
    cellEntries, pendingCellEntries,
    activeCellInput, setActiveCellInput,
    // UI state
    editingTitle, setEditingTitle, titleDraft, setTitleDraft,
    showExportDialog, setShowExportDialog,
    showPageDirectory, setShowPageDirectory,
    // Handlers
    handleGoToPage, handleCreatePage, handleDeletePage,
    handleSaveTitle, handleNavigate, handleSubmitEntry,
    handleReviewEntry, handleEditorChange,
    handleSubmitCellEntry, handleReviewCellEntry,
  };
}
