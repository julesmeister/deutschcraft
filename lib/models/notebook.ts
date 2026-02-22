/**
 * Notebook Models
 * Types for the collaborative notebook widget (per CEFR level)
 */

/** Per-block edit attribution */
export interface BlockAuthor {
  userId: string;
  userName: string;
  at: number;           // timestamp
}

export interface NotebookPage {
  pageId: string;
  level: string;
  title: string;
  content: object;      // Yoopta JSON
  blockAuthors: Record<string, BlockAuthor>;  // blockId → who last edited it
  pageOrder: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface NotebookEntry {
  entryId: string;
  pageId: string;
  level: string;
  userId: string;
  userName: string;
  content: object;      // Yoopta JSON or { text: "..." } for cell entries
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  // Per-cell fields (null = whole-page entry)
  blockId?: string | null;
  cellRow?: number | null;
  cellCol?: number | null;
}

/** Address of a specific cell within a Yoopta table block */
export interface CellAddress {
  blockId: string;
  row: number;
  col: number;
}
