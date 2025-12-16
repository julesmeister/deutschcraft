import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { DailyTheme, CreateDailyThemeInput, UpdateDailyThemeInput } from '@/lib/models/dailyTheme';
import { IDailyThemeService } from '../dailyThemeService';

/**
 * Firebase implementation of daily theme service
 */
export class FirebaseDailyThemeService implements IDailyThemeService {
  private readonly collectionName = 'dailyThemes';

  async getActiveTheme(batchId: string): Promise<DailyTheme | null> {
    try {
      const themesRef = collection(db, this.collectionName);
      const q = query(
        themesRef,
        where('batchId', '==', batchId),
        where('active', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const themeDoc = snapshot.docs[0];
        return { themeId: themeDoc.id, ...themeDoc.data() } as DailyTheme;
      }
      return null;
    } catch (error) {
      console.error('Error fetching active theme:', error);
      throw new Error('Failed to fetch active theme');
    }
  }

  async createTheme(input: CreateDailyThemeInput): Promise<string> {
    try {
      const themeRef = doc(collection(db, this.collectionName));
      const newTheme: DailyTheme = {
        themeId: themeRef.id,
        batchId: input.batchId,
        title: input.title,
        description: input.description,
        createdBy: input.createdBy,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        active: true,
      };

      await setDoc(themeRef, newTheme);
      return themeRef.id;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw new Error('Failed to create theme');
    }
  }

  async updateTheme(themeId: string, input: UpdateDailyThemeInput): Promise<void> {
    try {
      const themeRef = doc(db, this.collectionName, themeId);
      await updateDoc(themeRef, {
        ...input,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      throw new Error('Failed to update theme');
    }
  }

  async deactivateTheme(themeId: string): Promise<void> {
    try {
      const themeRef = doc(db, this.collectionName, themeId);
      await updateDoc(themeRef, {
        active: false,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error deactivating theme:', error);
      throw new Error('Failed to deactivate theme');
    }
  }
}
