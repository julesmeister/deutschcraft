import { DailyTheme, CreateDailyThemeInput, UpdateDailyThemeInput } from '@/lib/models/dailyTheme';
import { IDailyThemeService } from '../dailyThemeService';
import { db } from '@/turso/client';

/**
 * Turso implementation of daily theme service
 */
export class TursoDailyThemeService implements IDailyThemeService {
  async getActiveTheme(batchId: string): Promise<DailyTheme | null> {
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM daily_themes WHERE batch_id = ? AND active = 1 ORDER BY updated_at DESC LIMIT 1',
        args: [batchId],
      });

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return this.rowToDailyTheme(row);
    } catch (error) {
      console.error('[dailyThemeService:turso] Error fetching active theme:', error);
      throw error;
    }
  }

  async createTheme(input: CreateDailyThemeInput): Promise<string> {
    try {
      const themeId = `THEME_${Date.now()}`;
      const now = Date.now();

      await db.execute({
        sql: `INSERT INTO daily_themes (
                theme_id, batch_id, title, description, created_by,
                created_at, updated_at, active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          themeId,
          input.batchId,
          input.title,
          input.description,
          input.createdBy,
          now,
          now,
          1, // true as 1 for SQLite
        ],
      });

      return themeId;
    } catch (error) {
      console.error('[dailyThemeService:turso] Error creating theme:', error);
      throw error;
    }
  }

  async updateTheme(themeId: string, input: UpdateDailyThemeInput): Promise<void> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];

      if (input.title !== undefined) {
        setClauses.push('title = ?');
        values.push(input.title);
      }
      if (input.description !== undefined) {
        setClauses.push('description = ?');
        values.push(input.description);
      }
      if (input.active !== undefined) {
        setClauses.push('active = ?');
        values.push(input.active ? 1 : 0);
      }

      if (setClauses.length === 0) {
        return;
      }

      setClauses.push('updated_at = ?');
      values.push(Date.now());

      values.push(themeId);

      const sql = `UPDATE daily_themes SET ${setClauses.join(', ')} WHERE theme_id = ?`;

      await db.execute({ sql, args: values });
    } catch (error) {
      console.error('[dailyThemeService:turso] Error updating theme:', error);
      throw error;
    }
  }

  async deactivateTheme(themeId: string): Promise<void> {
    try {
      await db.execute({
        sql: 'UPDATE daily_themes SET active = 0, updated_at = ? WHERE theme_id = ?',
        args: [Date.now(), themeId],
      });
    } catch (error) {
      console.error('[dailyThemeService:turso] Error deactivating theme:', error);
      throw error;
    }
  }

  private rowToDailyTheme(row: any): DailyTheme {
    return {
      themeId: row.theme_id as string,
      batchId: row.batch_id as string,
      title: row.title as string,
      description: row.description as string,
      createdBy: row.created_by as string,
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
      active: Boolean(row.active),
    };
  }
}
