/**
 * Dictionary Service
 * Service layer for German-English dictionary lookups using local SQLite
 */

import { db } from '../db/dictionary';

export interface DictionaryEntry {
  id: number;
  german: string;
  english: string;
  created_at: number;
}

/**
 * Look up German word and get English translation(s)
 * @param germanWord - German word to look up
 * @param exact - If true, exact match only. If false, case-insensitive partial match
 * @returns Array of matching dictionary entries
 */
export function lookupGermanWord(germanWord: string, exact = true): DictionaryEntry[] {
  if (exact) {
    const stmt = db.prepare(`
      SELECT * FROM dictionary
      WHERE german = ?
      ORDER BY english
    `);
    return stmt.all(germanWord) as DictionaryEntry[];
  } else {
    const stmt = db.prepare(`
      SELECT * FROM dictionary
      WHERE LOWER(german) LIKE LOWER(?)
      ORDER BY german, english
      LIMIT 50
    `);
    return stmt.all(`%${germanWord}%`) as DictionaryEntry[];
  }
}

/**
 * Look up English word and get German translation(s)
 * @param englishWord - English word to look up
 * @param exact - If true, exact match only. If false, case-insensitive partial match
 * @returns Array of matching dictionary entries
 */
export function lookupEnglishWord(englishWord: string, exact = true): DictionaryEntry[] {
  if (exact) {
    const stmt = db.prepare(`
      SELECT * FROM dictionary
      WHERE english = ?
      ORDER BY german
    `);
    return stmt.all(englishWord) as DictionaryEntry[];
  } else {
    const stmt = db.prepare(`
      SELECT * FROM dictionary
      WHERE LOWER(english) LIKE LOWER(?)
      ORDER BY english, german
      LIMIT 50
    `);
    return stmt.all(`%${englishWord}%`) as DictionaryEntry[];
  }
}

/**
 * Search dictionary (searches both German and English)
 * @param searchTerm - Term to search for
 * @param limit - Maximum number of results to return
 * @returns Array of matching dictionary entries
 */
export function searchDictionary(searchTerm: string, limit = 50): DictionaryEntry[] {
  const stmt = db.prepare(`
    SELECT * FROM dictionary
    WHERE LOWER(german) LIKE LOWER(?) OR LOWER(english) LIKE LOWER(?)
    ORDER BY
      CASE
        WHEN german = ? THEN 1
        WHEN english = ? THEN 2
        WHEN LOWER(german) LIKE LOWER(?) THEN 3
        WHEN LOWER(english) LIKE LOWER(?) THEN 4
        ELSE 5
      END,
      LENGTH(german),
      german
    LIMIT ?
  `);

  const pattern = `%${searchTerm}%`;
  return stmt.all(pattern, pattern, searchTerm, searchTerm, `${searchTerm}%`, `${searchTerm}%`, limit) as DictionaryEntry[];
}

/**
 * Get random dictionary entries (for learning/practice)
 * @param count - Number of random entries to return
 * @returns Array of random dictionary entries
 */
export function getRandomEntries(count = 10): DictionaryEntry[] {
  const stmt = db.prepare(`
    SELECT * FROM dictionary
    ORDER BY RANDOM()
    LIMIT ?
  `);
  return stmt.all(count) as DictionaryEntry[];
}

/**
 * Get dictionary statistics
 * @returns Object with dictionary stats
 */
export function getDictionaryStats(): {
  totalEntries: number;
  uniqueGermanWords: number;
  uniqueEnglishWords: number;
} {
  const totalEntries = (db.prepare('SELECT COUNT(*) as count FROM dictionary').get() as { count: number }).count;
  const uniqueGerman = (db.prepare('SELECT COUNT(DISTINCT german) as count FROM dictionary').get() as { count: number }).count;
  const uniqueEnglish = (db.prepare('SELECT COUNT(DISTINCT english) as count FROM dictionary').get() as { count: number }).count;

  return {
    totalEntries,
    uniqueGermanWords: uniqueGerman,
    uniqueEnglishWords: uniqueEnglish,
  };
}
