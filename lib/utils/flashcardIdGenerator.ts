/**
 * Flashcard ID Generator - Semantic ID Migration Utility
 * Generates human-readable deterministic IDs: {level}-{category}-{german}-{english}
 *
 * Example: a1-greetings-hallo-hello
 */

/**
 * Transliterate German special characters to ASCII
 */
function transliterateGerman(text: string): string {
  return text
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'Ae')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'Oe')
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');
}

/**
 * Normalize text to slug format
 * - Transliterate German characters
 * - Convert to lowercase
 * - Replace spaces with hyphens
 * - Remove all non-alphanumeric except hyphens
 * - Collapse multiple hyphens
 */
export function normalizeToSlug(text: string): string {
  return transliterateGerman(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/[^a-z0-9-]/g, '')     // remove non-alphanumeric
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}

/**
 * Truncate segment if too long and add hash for uniqueness
 */
const MAX_SEGMENT_LENGTH = {
  category: 30,
  german: 50,
  english: 50,
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function truncateSegment(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Truncate and add hash
  const truncated = text.substring(0, maxLength - 7);
  const hash = simpleHash(text).substring(0, 6);
  return `${truncated}-${hash}`;
}

/**
 * Generate semantic flashcard ID
 * Format: {level}-{category}-{german}-{english}
 *
 * @param level - CEFR level (A1, A2, B1, B2, C1, C2)
 * @param category - Category name (e.g., "Adjectives")
 * @param german - German word/phrase
 * @param english - English translation
 * @returns Semantic ID string
 */
export function generateFlashcardId(
  level: string,
  category: string,
  german: string,
  english: string
): string {
  const levelSlug = level.toLowerCase();
  const categorySlug = truncateSegment(normalizeToSlug(category), MAX_SEGMENT_LENGTH.category);
  const germanSlug = truncateSegment(normalizeToSlug(german), MAX_SEGMENT_LENGTH.german);
  const englishSlug = truncateSegment(normalizeToSlug(english), MAX_SEGMENT_LENGTH.english);

  return `${levelSlug}-${categorySlug}-${germanSlug}-${englishSlug}`;
}

/**
 * Detect and resolve duplicate IDs
 * When multiple flashcards generate the same ID, use English distinction
 *
 * @param flashcards - Array of flashcard objects
 * @returns Map of old ID -> new semantic ID
 */
export function generateIdMapping(
  flashcards: Array<{
    id: string;
    level: string;
    category: string;
    german: string;
    english: string;
  }>
): Map<string, string> {
  const mapping = new Map<string, string>();
  const idCounts = new Map<string, number>();

  // First pass: Generate base IDs and count duplicates
  const proposedIds = flashcards.map(card => {
    const newId = generateFlashcardId(
      card.level,
      card.category || 'uncategorized',
      card.german,
      card.english
    );

    idCounts.set(newId, (idCounts.get(newId) || 0) + 1);

    return { oldId: card.id, newId, card };
  });

  // Second pass: Resolve duplicates using English distinction
  const duplicateCounters = new Map<string, number>();

  for (const { oldId, newId, card } of proposedIds) {
    const count = idCounts.get(newId) || 1;

    if (count === 1) {
      // No duplicate, use as-is
      mapping.set(oldId, newId);
    } else {
      // Duplicate detected - use English to disambiguate
      const baseId = `${card.level.toLowerCase()}-${normalizeToSlug(card.category || 'uncategorized')}-${normalizeToSlug(card.german)}`;

      // Extract first word of English for distinction
      const englishWords = card.english.split(/[\/\s,]+/).filter(w => w.length > 0);
      const distinctiveWord = englishWords[duplicateCounters.get(baseId) || 0] || card.english;

      const uniqueId = `${baseId}-${normalizeToSlug(distinctiveWord)}`;

      duplicateCounters.set(baseId, (duplicateCounters.get(baseId) || 0) + 1);
      mapping.set(oldId, uniqueId);
    }
  }

  return mapping;
}

/**
 * Validate ID mapping for uniqueness
 * Returns true if all new IDs are unique
 */
export function validateIdMapping(mapping: Map<string, string>): {
  valid: boolean;
  duplicates: string[];
  stats: {
    totalOldIds: number;
    totalNewIds: number;
    uniqueNewIds: number;
  };
} {
  const newIds = new Set<string>();
  const duplicates: string[] = [];

  for (const [_, newId] of mapping) {
    if (newIds.has(newId)) {
      duplicates.push(newId);
    }
    newIds.add(newId);
  }

  return {
    valid: duplicates.length === 0,
    duplicates,
    stats: {
      totalOldIds: mapping.size,
      totalNewIds: Array.from(mapping.values()).length,
      uniqueNewIds: newIds.size,
    },
  };
}
