/**
 * NotebookWidget — Notion-like collaborative notebook using Yoopta Editor
 * Composes: useNotebookData (state), NotebookHeader, NotebookCursor,
 * TableCellOverlay, and sub-components for directory, entries, and export.
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import YooptaEditor, { type YooptaContentValue } from "@yoopta/editor";
import ActionMenuList, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import { YOOPTA_PLUGINS, YOOPTA_MARKS } from "./NotebookToolbar";
import { NotebookExportDialog } from "./NotebookExportDialog";
import { NotebookPageDirectory } from "./NotebookPageDirectory";
import { NotebookHeader } from "./NotebookHeader";
import { NotebookCursor } from "./NotebookCursor";
import { TableCellOverlay } from "./TableCellOverlay";
import { useNotebookData, type NotebookWidgetProps } from "./useNotebookData";

export function NotebookWidget(props: NotebookWidgetProps = {}) {
  const nb = useNotebookData(props);
  const {
    userId, userName, isTeacher, level,
    pages, currentPage, currentPageIndex, entryStats,
    isLoading, editorKey, editor, initialEditorValue,
    pendingEntries,
    cellEntries, pendingCellEntries,
    activeCellInput, setActiveCellInput,
    editingTitle, setEditingTitle, titleDraft, setTitleDraft,
    showExportDialog, setShowExportDialog,
    showPageDirectory, setShowPageDirectory,
    handleGoToPage, handleCreatePage, handleDeletePage,
    handleSaveTitle, handleNavigate,
    handleReviewEntry, handleEditorChange,
    handleSubmitCellEntry, handleReviewCellEntry,
  } = nb;

  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const TOOLS = useMemo(() => ({
    ActionMenu: { render: DefaultActionMenuRender, tool: ActionMenuList },
    Toolbar: { render: DefaultToolbarRender, tool: Toolbar },
  }), []);

  // Track caret position inside editor container
  const updateCaret = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorContainerRef.current) return;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rect = range.getBoundingClientRect();
    const box = editorContainerRef.current.getBoundingClientRect();
    if (rect.height === 0) return;
    setCursorPos({ x: rect.left - box.left, y: rect.top - box.top });
  }, []);

  // Track cursor on selection change
  useEffect(() => {
    const onSelChange = () => {
      if (!editorContainerRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      if (editorContainerRef.current.contains(sel.anchorNode)) {
        requestAnimationFrame(updateCaret);
      }
    };
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, [updateCaret]);

  const onEditorChange = useCallback(
    (value: YooptaContentValue) => handleEditorChange(value, updateCaret),
    [handleEditorChange, updateCaret]
  );

  const pendingCount = pendingEntries.length;
  const firstPending = pendingEntries[0] ?? null;

  // ─── Early returns ───
  if (!level) {
    return (
      <div className="bg-white rounded-3xl p-5 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No level set for this room</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-5 h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-pastel-ocean rounded-full animate-spin" />
          Loading notebook...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl flex flex-col h-full overflow-hidden">
      <NotebookHeader
        level={level}
        currentPageIndex={currentPageIndex}
        pageCount={pages.length}
        hasCurrentPage={!!currentPage}
        isTeacher={isTeacher}
        showPageDirectory={showPageDirectory}
        onNavigate={handleNavigate}
        onToggleDirectory={() => setShowPageDirectory(v => !v)}
        onExport={() => setShowExportDialog(true)}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
      />

      <div className="flex-1 overflow-y-auto min-h-0">
        {showPageDirectory ? (
          <NotebookPageDirectory
            pages={pages}
            currentPageIndex={currentPageIndex}
            entryStats={entryStats}
            currentUserId={userId}
            currentUserName={userName}
            onGoToPage={handleGoToPage}
          />
        ) : currentPage ? (
          <div className="flex flex-col h-full">
            {/* Inline editable page title */}
            <div className="px-5 pt-4 pb-1">
              {editingTitle && isTeacher ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  className="text-xl font-bold text-neutral-900 w-full outline-none border-b-2 border-pastel-ocean bg-transparent pb-0.5"
                />
              ) : (
                <h1
                  className={`text-xl font-bold text-neutral-900 ${
                    isTeacher ? "cursor-text hover:text-pastel-ocean/80 transition-colors" : ""
                  }`}
                  onClick={() => {
                    if (!isTeacher || !currentPage) return;
                    setTitleDraft(currentPage.title);
                    setEditingTitle(true);
                  }}
                >
                  {currentPage.title}
                </h1>
              )}
            </div>

            {/* Editor + cursor overlay + table cell overlay */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-5 py-2 relative overflow-x-hidden" ref={editorContainerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }}>
                <YooptaEditor
                  key={editorKey}
                  editor={editor}
                  plugins={YOOPTA_PLUGINS}
                  marks={YOOPTA_MARKS}
                  value={initialEditorValue}
                  tools={isTeacher ? TOOLS : undefined}
                  readOnly={!isTeacher}
                  onChange={onEditorChange}
                  autoFocus={isTeacher}
                  placeholder={isTeacher ? "Type '/' for commands..." : undefined}
                  style={{ width: "100%" }}
                />

                {cursorPos && (
                  <NotebookCursor
                    cursorPos={cursorPos}
                    userName={userName}
                    isTeacher={isTeacher}
                    pendingCount={pendingCount}
                    firstPending={firstPending}
                    containerWidth={editorContainerRef.current?.clientWidth ?? 600}
                    onReview={handleReviewEntry}
                  />
                )}

                <TableCellOverlay
                  editorContainerRef={editorContainerRef}
                  editorKey={editorKey}
                  pageContent={initialEditorValue}
                  cellEntries={cellEntries}
                  isTeacher={isTeacher}
                  userId={userId}
                  activeCellInput={activeCellInput}
                  onSetActiveCellInput={setActiveCellInput}
                  onSubmitCellEntry={handleSubmitCellEntry}
                  onReviewCellEntry={handleReviewCellEntry}
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-1">No pages yet</p>
            {isTeacher && (
              <button
                onClick={handleCreatePage}
                className="text-sm text-pastel-ocean hover:text-pastel-ocean/70 font-medium transition-colors"
              >
                + Create first page
              </button>
            )}
          </div>
        )}
      </div>

      {showExportDialog && (
        <NotebookExportDialog
          pages={pages}
          level={level}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}
