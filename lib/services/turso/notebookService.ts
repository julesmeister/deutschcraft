/**
 * Notebook Service (Turso)
 * CRUD operations for notebook pages and whole-page entries
 */

import { db } from '@/turso/client';
import type { NotebookPage, NotebookEntry } from '@/lib/models/notebook';

export function rowToPage(row: any): NotebookPage {
  return {
    pageId: row.page_id as string,
    level: row.level as string,
    title: row.title as string,
    content: JSON.parse((row.content as string) || '{}'),
    blockAuthors: JSON.parse((row.block_authors as string) || '{}'),
    pageOrder: row.page_order as number,
    createdBy: row.created_by as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function rowToEntry(row: any): NotebookEntry {
  return {
    entryId: row.entry_id as string,
    pageId: row.page_id as string,
    level: row.level as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    content: JSON.parse((row.content as string) || '{}'),
    status: row.status as 'pending' | 'approved' | 'rejected',
    createdAt: row.created_at as number,
    reviewedAt: row.reviewed_at as number | undefined,
    reviewedBy: row.reviewed_by as string | undefined,
    blockId: (row.block_id as string | null) ?? null,
    cellRow: row.cell_row != null ? (row.cell_row as number) : null,
    cellCol: row.cell_col != null ? (row.cell_col as number) : null,
  };
}

// ─── PAGE OPERATIONS ───

export async function getNotebookPages(level: string): Promise<NotebookPage[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM notebook_pages WHERE level = ? ORDER BY page_order ASC',
      args: [level],
    });
    return result.rows.map(rowToPage);
  } catch (error) {
    console.error('[notebookService] getNotebookPages error:', error);
    return [];
  }
}

export async function createNotebookPage(
  level: string,
  title: string,
  createdBy: string
): Promise<NotebookPage | null> {
  try {
    const pageId = crypto.randomUUID();
    const orderResult = await db.execute({
      sql: 'SELECT COALESCE(MAX(page_order), -1) + 1 AS next_order FROM notebook_pages WHERE level = ?',
      args: [level],
    });
    const pageOrder = (orderResult.rows[0]?.next_order as number) ?? 0;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO notebook_pages (page_id, level, title, content, page_order, created_by, created_at, updated_at)
            VALUES (?, ?, ?, '{}', ?, ?, ?, ?)`,
      args: [pageId, level, title, pageOrder, createdBy, now, now],
    });

    return { pageId, level, title, content: {}, blockAuthors: {}, pageOrder, createdBy, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error('[notebookService] createNotebookPage error:', error);
    return null;
  }
}

export async function updateNotebookPageContent(
  pageId: string,
  content: object,
  userId?: string,
  userName?: string
): Promise<void> {
  try {
    if (!userId || !userName) {
      // No user info — just save content (backwards compat)
      await db.execute({
        sql: 'UPDATE notebook_pages SET content = ? WHERE page_id = ?',
        args: [JSON.stringify(content), pageId],
      });
      return;
    }

    // Fetch current page to diff blocks
    const current = await db.execute({
      sql: 'SELECT content, block_authors FROM notebook_pages WHERE page_id = ?',
      args: [pageId],
    });
    const oldContent: Record<string, any> = JSON.parse((current.rows[0]?.content as string) || '{}');
    const blockAuthors: Record<string, any> = JSON.parse((current.rows[0]?.block_authors as string) || '{}');
    const newContent = content as Record<string, any>;
    const now = Date.now();

    // Find blocks that were added or modified
    for (const blockId of Object.keys(newContent)) {
      const oldBlock = oldContent[blockId];
      const newBlock = newContent[blockId];
      if (!oldBlock || JSON.stringify(oldBlock) !== JSON.stringify(newBlock)) {
        blockAuthors[blockId] = { userId, userName, at: now };
      }
    }
    // Clean up authors for deleted blocks
    for (const blockId of Object.keys(blockAuthors)) {
      if (!newContent[blockId]) delete blockAuthors[blockId];
    }

    await db.execute({
      sql: 'UPDATE notebook_pages SET content = ?, block_authors = ? WHERE page_id = ?',
      args: [JSON.stringify(content), JSON.stringify(blockAuthors), pageId],
    });
  } catch (error) {
    console.error('[notebookService] updateNotebookPageContent error:', error);
  }
}

export async function updateNotebookPageTitle(
  pageId: string,
  title: string
): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE notebook_pages SET title = ? WHERE page_id = ?',
      args: [title, pageId],
    });
  } catch (error) {
    console.error('[notebookService] updateNotebookPageTitle error:', error);
  }
}

export async function deleteNotebookPage(pageId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM notebook_pages WHERE page_id = ?',
      args: [pageId],
    });
  } catch (error) {
    console.error('[notebookService] deleteNotebookPage error:', error);
  }
}

// ─── ENTRY OPERATIONS ───

export async function getNotebookEntries(pageId: string): Promise<NotebookEntry[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM notebook_entries WHERE page_id = ? ORDER BY created_at ASC',
      args: [pageId],
    });
    return result.rows.map(rowToEntry);
  } catch (error) {
    console.error('[notebookService] getNotebookEntries error:', error);
    return [];
  }
}

export async function createNotebookEntry(
  pageId: string,
  level: string,
  userId: string,
  userName: string,
  content: object
): Promise<NotebookEntry | null> {
  try {
    const entryId = crypto.randomUUID();
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO notebook_entries (entry_id, page_id, level, user_id, user_name, content, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      args: [entryId, pageId, level, userId, userName, JSON.stringify(content), now],
    });

    return { entryId, pageId, level, userId, userName, content, status: 'pending', createdAt: now };
  } catch (error) {
    console.error('[notebookService] createNotebookEntry error:', error);
    return null;
  }
}

export async function updateEntryStatus(
  entryId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string
): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE notebook_entries SET status = ?, reviewed_at = ?, reviewed_by = ? WHERE entry_id = ?',
      args: [status, Date.now(), reviewedBy, entryId],
    });
  } catch (error) {
    console.error('[notebookService] updateEntryStatus error:', error);
  }
}

export interface PageEntryStat {
  entryCount: number;
  contributors: string[];
}

export async function getEntryStatsByLevel(level: string): Promise<Record<string, PageEntryStat>> {
  try {
    const result = await db.execute({
      sql: 'SELECT page_id, user_name, COUNT(*) as cnt FROM notebook_entries WHERE level = ? GROUP BY page_id, user_name',
      args: [level],
    });
    const stats: Record<string, PageEntryStat> = {};
    for (const row of result.rows) {
      const pageId = row.page_id as string;
      const userName = row.user_name as string;
      const cnt = Number(row.cnt);
      if (!stats[pageId]) stats[pageId] = { entryCount: 0, contributors: [] };
      stats[pageId].entryCount += cnt;
      stats[pageId].contributors.push(userName);
    }
    return stats;
  } catch (error) {
    console.error('[notebookService] getEntryStatsByLevel error:', error);
    return {};
  }
}

export async function deleteNotebookEntry(entryId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM notebook_entries WHERE entry_id = ?',
      args: [entryId],
    });
  } catch (error) {
    console.error('[notebookService] deleteNotebookEntry error:', error);
  }
}
