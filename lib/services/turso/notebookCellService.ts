/**
 * Notebook Cell Service (Turso)
 * Per-cell entry operations for table cell contributions
 */

import { db } from '@/turso/client';
import type { NotebookEntry } from '@/lib/models/notebook';
import { rowToEntry } from './notebookService';

export async function createCellEntry(
  pageId: string,
  level: string,
  userId: string,
  userName: string,
  blockId: string,
  cellRow: number,
  cellCol: number,
  text: string
): Promise<NotebookEntry | null> {
  try {
    const entryId = crypto.randomUUID();
    const now = Date.now();
    const content = JSON.stringify({ text });

    await db.execute({
      sql: `INSERT INTO notebook_entries (entry_id, page_id, level, user_id, user_name, content, status, created_at, block_id, cell_row, cell_col)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      args: [entryId, pageId, level, userId, userName, content, now, blockId, cellRow, cellCol],
    });

    return {
      entryId, pageId, level, userId, userName,
      content: { text }, status: 'pending', createdAt: now,
      blockId, cellRow, cellCol,
    };
  } catch (error) {
    console.error('[notebookCellService] createCellEntry error:', error);
    return null;
  }
}

export async function getCellEntriesForPage(pageId: string): Promise<NotebookEntry[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM notebook_entries
            WHERE page_id = ? AND block_id IS NOT NULL
            ORDER BY created_at ASC`,
      args: [pageId],
    });
    return result.rows.map(rowToEntry);
  } catch (error) {
    console.error('[notebookCellService] getCellEntriesForPage error:', error);
    return [];
  }
}

export async function approveCellEntry(
  entryId: string,
  reviewedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch the entry
    const entryResult = await db.execute({
      sql: 'SELECT * FROM notebook_entries WHERE entry_id = ?',
      args: [entryId],
    });
    if (entryResult.rows.length === 0) return { success: false, error: 'Entry not found' };

    const entry = rowToEntry(entryResult.rows[0]);
    if (!entry.blockId || entry.cellRow == null || entry.cellCol == null) {
      return { success: false, error: 'Not a cell entry' };
    }

    const cellText = (entry.content as { text?: string }).text ?? '';

    // 2. Fetch page content
    const pageResult = await db.execute({
      sql: 'SELECT content FROM notebook_pages WHERE page_id = ?',
      args: [entry.pageId],
    });
    if (pageResult.rows.length === 0) return { success: false, error: 'Page not found' };

    const pageContent = JSON.parse((pageResult.rows[0].content as string) || '{}');

    // 3. Merge text into page content
    const block = pageContent[entry.blockId];
    if (!block) return { success: false, error: 'Block not found in page content' };

    try {
      const rows = block.value;
      if (!rows || !rows[entry.cellRow] || !rows[entry.cellRow].children?.[entry.cellCol]) {
        return { success: false, error: 'Cell position no longer exists in table' };
      }
      const cell = rows[entry.cellRow].children[entry.cellCol];
      if (cell.children && cell.children.length > 0) {
        cell.children[0].text = cellText;
      } else {
        cell.children = [{ text: cellText }];
      }
    } catch {
      return { success: false, error: 'Failed to merge cell text into page content' };
    }

    // 4. Update page content + approve entry + auto-reject competing entries
    const now = Date.now();
    await db.execute({
      sql: 'UPDATE notebook_pages SET content = ? WHERE page_id = ?',
      args: [JSON.stringify(pageContent), entry.pageId],
    });

    await db.execute({
      sql: 'UPDATE notebook_entries SET status = ?, reviewed_at = ?, reviewed_by = ? WHERE entry_id = ?',
      args: ['approved', now, reviewedBy, entryId],
    });

    await db.execute({
      sql: `UPDATE notebook_entries
            SET status = 'rejected', reviewed_at = ?, reviewed_by = ?
            WHERE page_id = ? AND block_id = ? AND cell_row = ? AND cell_col = ?
              AND entry_id != ? AND status = 'pending'`,
      args: [now, reviewedBy, entry.pageId, entry.blockId, entry.cellRow, entry.cellCol, entryId],
    });

    return { success: true };
  } catch (error) {
    console.error('[notebookCellService] approveCellEntry error:', error);
    return { success: false, error: 'Internal error' };
  }
}
