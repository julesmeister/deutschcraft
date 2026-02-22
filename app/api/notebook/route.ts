/**
 * Notebook API Routes
 * GET: Fetch pages for a level, entries for a page, or cell entries
 * POST: Action-based operations (createPage, updateContent, updateTitle, submitEntry, reviewEntry,
 *        submitCellEntry, reviewCellEntry, deletePage, deleteEntry)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getNotebookPages,
  createNotebookPage,
  updateNotebookPageContent,
  updateNotebookPageTitle,
  deleteNotebookPage,
  getNotebookEntries,
  createNotebookEntry,
  updateEntryStatus,
  deleteNotebookEntry,
  getEntryStatsByLevel,
  updateBlockAuthors,
} from '@/lib/services/turso/notebookService';
import {
  createCellEntry,
  getCellEntriesForPage,
  approveCellEntry,
} from '@/lib/services/turso/notebookCellService';

export async function GET(req: NextRequest) {
  const level = req.nextUrl.searchParams.get('level');
  const pageId = req.nextUrl.searchParams.get('pageId');
  const cellEntries = req.nextUrl.searchParams.get('cellEntries');

  if (pageId && cellEntries === 'true') {
    const entries = await getCellEntriesForPage(pageId);
    return NextResponse.json({ cellEntries: entries });
  }

  if (pageId) {
    const entries = await getNotebookEntries(pageId);
    return NextResponse.json({ entries });
  }

  if (!level) {
    return NextResponse.json({ error: 'level is required' }, { status: 400 });
  }

  const [pages, entryStats] = await Promise.all([
    getNotebookPages(level),
    getEntryStatsByLevel(level),
  ]);
  return NextResponse.json({ pages, entryStats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'createPage': {
        const { level, title, createdBy } = body;
        if (!level || !title || !createdBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const page = await createNotebookPage(level, title, createdBy);
        return NextResponse.json({ page });
      }

      case 'updateContent': {
        const { pageId, content, userId, userName } = body;
        if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 });
        await updateNotebookPageContent(pageId, content, userId, userName);
        return NextResponse.json({ success: true });
      }

      case 'updateBlockAuthors': {
        const { pageId, blockAuthors, content } = body;
        if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 });
        await updateBlockAuthors(pageId, blockAuthors, content);
        return NextResponse.json({ success: true });
      }

      case 'updateTitle': {
        const { pageId, title } = body;
        if (!pageId || !title) return NextResponse.json({ error: 'pageId and title required' }, { status: 400 });
        await updateNotebookPageTitle(pageId, title);
        return NextResponse.json({ success: true });
      }

      case 'submitEntry': {
        const { pageId, level, userId, userName, content } = body;
        if (!pageId || !level || !userId || !userName) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const entry = await createNotebookEntry(pageId, level, userId, userName, content);
        return NextResponse.json({ entry });
      }

      case 'reviewEntry': {
        const { entryId, status, reviewedBy } = body;
        if (!entryId || !status || !reviewedBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        await updateEntryStatus(entryId, status, reviewedBy);
        return NextResponse.json({ success: true });
      }

      case 'submitCellEntry': {
        const { pageId, level, userId, userName, blockId, cellRow, cellCol, text } = body;
        if (!pageId || !level || !userId || !userName || !blockId || cellRow == null || cellCol == null || !text?.trim()) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const entry = await createCellEntry(pageId, level, userId, userName, blockId, cellRow, cellCol, text.trim());
        return NextResponse.json({ entry });
      }

      case 'reviewCellEntry': {
        const { entryId, status, reviewedBy } = body;
        if (!entryId || !status || !reviewedBy) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (status === 'approved') {
          const result = await approveCellEntry(entryId, reviewedBy);
          if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
          }
          return NextResponse.json({ success: true });
        }
        // Rejected — just update status
        await updateEntryStatus(entryId, 'rejected', reviewedBy);
        return NextResponse.json({ success: true });
      }

      case 'deletePage': {
        const { pageId } = body;
        if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 });
        await deleteNotebookPage(pageId);
        return NextResponse.json({ success: true });
      }

      case 'deleteEntry': {
        const { entryId } = body;
        if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 });
        await deleteNotebookEntry(entryId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[notebook API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
