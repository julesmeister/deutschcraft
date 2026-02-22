-- Migration: 053_add_cell_columns_to_notebook_entries
-- Description: Add per-cell tracking columns to notebook_entries for table cell contributions
-- Created: 2026-02-23

ALTER TABLE notebook_entries ADD COLUMN block_id TEXT;
ALTER TABLE notebook_entries ADD COLUMN cell_row INTEGER;
ALTER TABLE notebook_entries ADD COLUMN cell_col INTEGER;

CREATE INDEX IF NOT EXISTS idx_notebook_entries_cell
  ON notebook_entries(page_id, block_id, cell_row, cell_col)
  WHERE block_id IS NOT NULL;
