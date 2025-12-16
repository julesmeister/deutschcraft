import { DailyTheme, CreateDailyThemeInput, UpdateDailyThemeInput } from '@/lib/models/dailyTheme';
import { IDailyThemeService } from '../dailyThemeService';

/**
 * Turso implementation of daily theme service
 *
 * TODO: Implement when migrating to Turso database
 * This is a placeholder for future implementation
 */
export class TursoDailyThemeService implements IDailyThemeService {
  async getActiveTheme(batchId: string): Promise<DailyTheme | null> {
    // TODO: Implement Turso query
    // Example SQL: SELECT * FROM daily_themes WHERE batch_id = ? AND active = true ORDER BY updated_at DESC LIMIT 1
    throw new Error('Turso implementation not yet available');
  }

  async createTheme(input: CreateDailyThemeInput): Promise<string> {
    // TODO: Implement Turso insert
    // Example SQL: INSERT INTO daily_themes (batch_id, title, description, created_by, created_at, updated_at, active) VALUES (?, ?, ?, ?, ?, ?, ?)
    throw new Error('Turso implementation not yet available');
  }

  async updateTheme(themeId: string, input: UpdateDailyThemeInput): Promise<void> {
    // TODO: Implement Turso update
    // Example SQL: UPDATE daily_themes SET title = ?, description = ?, updated_at = ? WHERE theme_id = ?
    throw new Error('Turso implementation not yet available');
  }

  async deactivateTheme(themeId: string): Promise<void> {
    // TODO: Implement Turso update
    // Example SQL: UPDATE daily_themes SET active = false, updated_at = ? WHERE theme_id = ?
    throw new Error('Turso implementation not yet available');
  }
}
