import { DailyTheme, CreateDailyThemeInput, UpdateDailyThemeInput } from '@/lib/models/dailyTheme';

/**
 * Abstract service interface for daily theme operations
 * This allows switching between database implementations (Firebase, Turso, etc.)
 */
export interface IDailyThemeService {
  /**
   * Get the active daily theme for a batch
   */
  getActiveTheme(batchId: string): Promise<DailyTheme | null>;

  /**
   * Create a new daily theme
   */
  createTheme(input: CreateDailyThemeInput): Promise<string>;

  /**
   * Update an existing daily theme
   */
  updateTheme(themeId: string, input: UpdateDailyThemeInput): Promise<void>;

  /**
   * Deactivate a daily theme
   */
  deactivateTheme(themeId: string): Promise<void>;
}

// Export the current implementation
// Can be easily switched to Turso implementation later
import { FirebaseDailyThemeService } from './firebase/dailyThemeService';
export const dailyThemeService: IDailyThemeService = new FirebaseDailyThemeService();
