import { useState, useEffect } from 'react';
import { dailyThemeService } from '@/lib/services/dailyThemeService';
import { DailyTheme, CreateDailyThemeInput, UpdateDailyThemeInput } from '@/lib/models/dailyTheme';

/**
 * Hook to get the active daily theme for a batch
 * Uses the service layer to abstract database implementation
 */
export function useDailyTheme(batchId: string | undefined) {
  const [theme, setTheme] = useState<DailyTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId) {
      setLoading(false);
      return;
    }

    const fetchTheme = async () => {
      try {
        setLoading(true);
        const fetchedTheme = await dailyThemeService.getActiveTheme(batchId);
        setTheme(fetchedTheme);
      } catch (err) {
        console.error('Error fetching daily theme:', err);
        setError('Failed to load daily theme');
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [batchId]);

  const createTheme = async (input: CreateDailyThemeInput): Promise<string | null> => {
    try {
      const themeId = await dailyThemeService.createTheme(input);

      // Refresh theme after creation
      const newTheme = await dailyThemeService.getActiveTheme(input.batchId);
      setTheme(newTheme);

      return themeId;
    } catch (err) {
      console.error('Error creating daily theme:', err);
      setError('Failed to create theme');
      return null;
    }
  };

  const updateTheme = async (themeId: string, input: UpdateDailyThemeInput): Promise<boolean> => {
    try {
      await dailyThemeService.updateTheme(themeId, input);

      // Update local state
      if (theme && theme.themeId === themeId) {
        setTheme({
          ...theme,
          ...input,
          updatedAt: Date.now(),
        });
      }

      return true;
    } catch (err) {
      console.error('Error updating daily theme:', err);
      setError('Failed to update theme');
      return false;
    }
  };

  const deactivateTheme = async (themeId: string): Promise<boolean> => {
    try {
      await dailyThemeService.deactivateTheme(themeId);
      setTheme(null);
      return true;
    } catch (err) {
      console.error('Error deactivating daily theme:', err);
      setError('Failed to deactivate theme');
      return false;
    }
  };

  return {
    theme,
    loading,
    error,
    createTheme,
    updateTheme,
    deactivateTheme,
  };
}
