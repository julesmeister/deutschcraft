/**
 * NotebookExportDialog — Page selection + PDF export for notebook
 * Uses html2pdf.js for client-side PDF generation
 * Manual Yoopta content → HTML serializer (no editor dependency)
 */

"use client";

import { useState, useCallback } from "react";
import type { NotebookPage } from "@/lib/models/notebook";

interface Props {
  pages: NotebookPage[];
  level: string;
  onClose: () => void;
}

// ─── Yoopta Content → HTML Serializer ───

function serializeMarks(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return escapeHtml(node);
  if (Array.isArray(node)) return node.map(serializeMarks).join("");

  let text = escapeHtml(node.text ?? "");
  if (!text && node.children) return node.children.map(serializeMarks).join("");
  if (!text) return "";

  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  if (node.strike) text = `<s>${text}</s>`;
  if (node.code) text = `<code>${text}</code>`;
  if (node.highlight) text = `<mark>${text}</mark>`;

  return text;
}

function serializeElement(el: any): string {
  if (!el) return "";
  const children = (el.children || []).map(serializeMarks).join("");
  const type = (el.type || "").toLowerCase();

  if (type.includes("heading-one") || type.includes("headingone"))
    return `<h2>${children}</h2>`;
  if (type.includes("heading-two") || type.includes("headingtwo"))
    return `<h3>${children}</h3>`;
  if (type.includes("heading-three") || type.includes("headingthree"))
    return `<h4>${children}</h4>`;
  if (type.includes("bulleted") || type.includes("unordered"))
    return `<li>${children}</li>`;
  if (type.includes("numbered") || type.includes("ordered"))
    return `<li>${children}</li>`;
  if (type.includes("todo") || type.includes("checklist")) {
    const checked = el.checked ? "checked" : "";
    return `<li><input type="checkbox" ${checked} disabled /> ${children}</li>`;
  }
  if (type.includes("blockquote"))
    return `<blockquote>${children}</blockquote>`;
  if (type.includes("callout"))
    return `<div class="callout">${children}</div>`;
  if (type.includes("code"))
    return `<pre><code>${children}</code></pre>`;
  if (type.includes("table-row")) {
    const cells = (el.children || [])
      .map((cell: any) => {
        const cellContent = (cell.children || []).map(serializeMarks).join("");
        return `<td>${cellContent}</td>`;
      })
      .join("");
    return `<tr>${cells}</tr>`;
  }
  if (type.includes("divider"))
    return `<hr />`;

  // Default: paragraph
  return `<p>${children}</p>`;
}

function serializeBlock(block: any): string {
  if (!block) return "";
  const blockType = (block.type || "").toLowerCase();
  const elements = block.value || [];

  // List blocks: wrap items in ul/ol
  if (blockType.includes("bulleted") || blockType.includes("unordered")) {
    const items = elements.map(serializeElement).join("");
    return `<ul>${items}</ul>`;
  }
  if (blockType.includes("numbered") || blockType.includes("ordered")) {
    const items = elements.map(serializeElement).join("");
    return `<ol>${items}</ol>`;
  }
  if (blockType.includes("todo") || blockType.includes("checklist")) {
    const items = elements.map(serializeElement).join("");
    return `<ul style="list-style:none;padding-left:4px;">${items}</ul>`;
  }
  if (blockType.includes("table")) {
    const rows = elements.map(serializeElement).join("");
    return `<table>${rows}</table>`;
  }
  if (blockType.includes("divider")) {
    return "<hr />";
  }

  // Default: render each element
  return elements.map(serializeElement).join("");
}

function yooptaContentToHtml(content: any): string {
  if (!content || typeof content !== "object") return "";

  const blocks = Object.values(content) as any[];
  blocks.sort((a, b) => (a?.meta?.order ?? 0) - (b?.meta?.order ?? 0));

  return blocks.map(serializeBlock).join("\n");
}

// ─── Dialog Component ───

export function NotebookExportDialog({ pages, level, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(pages.map((p) => p.pageId))
  );
  const [exporting, setExporting] = useState(false);

  const allSelected = selected.size === pages.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(pages.map((p) => p.pageId)));
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExport = useCallback(async () => {
    if (selected.size === 0) return;
    setExporting(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const sections = pages
        .filter((p) => selected.has(p.pageId))
        .map((page) => {
          const bodyHtml = yooptaContentToHtml(page.content);
          return `<div class="page-section">
            <h1>${escapeHtml(page.title)}</h1>
            <div class="page-body">${bodyHtml || "<p><em>Empty page</em></p>"}</div>
          </div>`;
        })
        .join('<div style="page-break-after:always;"></div>');

      const fullHtml = `<div class="notebook-export">${sections}</div>`;

      const container = document.createElement("div");
      container.innerHTML = `
        <style>
          .notebook-export {
            font-family: Inter, system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.7;
            color: #333;
            padding: 4px;
          }
          .notebook-export h1 {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #1a1a2e;
            border-bottom: 2px solid #778BEB;
            padding-bottom: 6px;
          }
          .notebook-export h2 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; color: #222; }
          .notebook-export h3 { font-size: 16px; font-weight: 600; margin: 12px 0 6px; color: #333; }
          .notebook-export h4 { font-size: 15px; font-weight: 600; margin: 10px 0 4px; color: #444; }
          .notebook-export p { margin: 6px 0; }
          .notebook-export ul, .notebook-export ol { padding-left: 24px; margin: 8px 0; }
          .notebook-export li { margin: 3px 0; }
          .notebook-export blockquote {
            border-left: 3px solid #778BEB;
            padding-left: 12px;
            margin: 8px 0;
            color: #555;
            font-style: italic;
          }
          .notebook-export .callout {
            background: #f0f4ff;
            border-left: 3px solid #778BEB;
            padding: 8px 12px;
            margin: 8px 0;
            border-radius: 4px;
          }
          .notebook-export pre {
            background: #f5f5f5;
            padding: 10px 14px;
            border-radius: 6px;
            margin: 8px 0;
            overflow-x: auto;
          }
          .notebook-export code {
            background: #f0f0f0;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 13px;
            font-family: 'Fira Code', 'Consolas', monospace;
          }
          .notebook-export pre code {
            background: none;
            padding: 0;
          }
          .notebook-export table {
            border-collapse: collapse;
            width: 100%;
            margin: 8px 0;
          }
          .notebook-export td, .notebook-export th {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
          }
          .notebook-export hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin: 16px 0;
          }
          .notebook-export mark {
            background: #fff3bf;
            padding: 0 2px;
            border-radius: 2px;
          }
          .notebook-export strong { font-weight: 600; }
        </style>
        ${fullHtml}
      `;

      const date = new Date().toISOString().slice(0, 10);
      const filename = `Notebook-${level}-${date}.pdf`;

      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        } as any)
        .from(container)
        .save();

      onClose();
    } catch (err) {
      console.error("[NotebookExport] PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [selected, pages, level, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-[360px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-neutral-900">Export PDF</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select pages to include</p>
        </div>

        {/* Select all toggle */}
        <div className="px-5 py-2 border-b border-gray-50">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-gray-300 text-pastel-ocean focus:ring-pastel-ocean/30"
            />
            {allSelected ? "Deselect all" : "Select all"}
          </label>
        </div>

        {/* Page list */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
          {pages.map((page, i) => (
            <label
              key={page.pageId}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.has(page.pageId)}
                onChange={() => toggle(page.pageId)}
                className="w-4 h-4 rounded border-gray-300 text-pastel-ocean focus:ring-pastel-ocean/30"
              />
              <span className="text-[11px] text-gray-400 tabular-nums w-5 text-right">{i + 1}.</span>
              <span className="text-sm text-neutral-700 truncate">{page.title}</span>
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selected.size === 0 || exporting}
            className="px-4 py-1.5 text-sm font-medium text-white bg-pastel-ocean rounded-lg hover:bg-pastel-ocean/80 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {exporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>Export {selected.size} page{selected.size !== 1 ? "s" : ""}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
