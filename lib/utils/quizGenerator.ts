/**
 * Quiz Generator Utility
 * Generates fill-in-the-blank quizzes from text differences
 */

import { getDiff, DiffPart } from "./textDiff";
import { QuizBlank } from "../models/writing";

/**
 * Helper function to strip trailing punctuation from a word
 * Example: "denke," -> "denke"
 */
function stripPunctuation(word: string): string {
  return word.replace(/[^\w\s]+$/g, "");
}

/**
 * Common German pronouns that are too basic to use as blanks
 * These will be filtered out to ensure more meaningful practice
 */
const GERMAN_PRONOUNS = new Set([
  // Personal pronouns (nominative)
  "ich",
  "du",
  "er",
  "sie",
  "es",
  "wir",
  "ihr",
  // Personal pronouns (accusative)
  "mich",
  "dich",
  "ihn",
  "uns",
  "euch",
  // Personal pronouns (dative)
  "mir",
  "dir",
  "ihm",
  "ihr",
  "ihnen",
  // Possessive pronouns
  "mein",
  "dein",
  "sein",
  "unser",
  "euer",
  "meine",
  "deine",
  "seine",
  "unsere",
  "eure",
  "ihre",
  "meinen",
  "deinen",
  "seinen",
  "unseren",
  "euren",
  "ihren",
  "meinem",
  "deinem",
  "seinem",
  "unserem",
  "eurem",
  "ihrem",
  "meiner",
  "deiner",
  "seiner",
  "unserer",
  "eurer",
  "ihrer",
  "meines",
  "deines",
  "seines",
  "unseres",
  "eures",
  "ihres",
  // Demonstrative pronouns
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "dieser",
  "diese",
  "dieses",
  "diesen",
  "diesem",
  "dieser",
  "jener",
  "jene",
  "jenes",
  "jenen",
  "jenem",
  "jener",
  // Relative pronouns (already covered above)
  // Reflexive pronouns
  "sich",
  // Indefinite pronouns (very common ones)
  "man",
  "einer",
  "eine",
  "eines",
  "einen",
  "einem",
]);

/**
 * German verbs to exclude from blanks
 * Includes: linking verbs (sein, werden), modal verbs, and haben
 * These are too common/basic and don't make good practice blanks
 */
const EXCLUDED_VERBS = new Set([
  // Linking verb: sein (to be)
  "sein",
  "bin",
  "bist",
  "ist",
  "sind",
  "seid",
  "war",
  "warst",
  "waren",
  "wart",
  "gewesen",

  // Linking verb: werden (to become)
  "werden",
  "werde",
  "wirst",
  "wird",
  "werdet",
  "wurde",
  "wurdest",
  "wurden",
  "wurdet",
  "worden",
  "geworden",

  // Modal verb: können (can)
  "können",
  "kann",
  "kannst",
  "könnt",
  "konnte",
  "konntest",
  "konnten",
  "konntet",
  "gekonnt",

  // Modal verb: müssen (must)
  "müssen",
  "muss",
  "musst",
  "müsst",
  "musste",
  "musstest",
  "mussten",
  "musstet",
  "gemusst",

  // Modal verb: sollen (should)
  "sollen",
  "soll",
  "sollst",
  "sollt",
  "sollte",
  "solltest",
  "sollten",
  "solltet",
  "gesollt",

  // Modal verb: wollen (want to)
  "wollen",
  "will",
  "willst",
  "wollt",
  "wollte",
  "wolltest",
  "wollten",
  "wolltet",
  "gewollt",

  // Modal verb: dürfen (may)
  "dürfen",
  "darf",
  "darfst",
  "dürft",
  "durfte",
  "durftest",
  "durften",
  "durftet",
  "gedurft",

  // Modal verb: mögen (like)
  "mögen",
  "mag",
  "magst",
  "mögt",
  "mochte",
  "mochtest",
  "mochten",
  "mochtet",
  "gemocht",
  "möchte",
  "möchtest",
  "möchten",
  "möchtet", // würde-form

  // Haben (to have)
  "haben",
  "habe",
  "hast",
  "hat",
  "habt",
  "hatte",
  "hattest",
  "hatten",
  "hattet",
  "gehabt",
]);

/**
 * Generate quiz blanks from differences between original and corrected text
 * Uses word-level comparison to find complete word replacements only
 * CRITICAL: Never creates consecutive blanks - ensures at least one word of context between them
 * Filters out basic pronouns, linking verbs, modal verbs, and haben to ensure meaningful practice
 */
export function generateQuizBlanks(
  originalText: string,
  correctedText: string
): QuizBlank[] {
  // Split both texts into words (keeping punctuation attached)
  const originalWords = originalText.split(/\s+/).filter((w) => w.length > 0);
  const correctedWords = correctedText.split(/\s+/).filter((w) => w.length > 0);

  // Step 1: Identify ALL word differences (comparing words without trailing punctuation)
  const potentialBlanks: Array<{ answer: string; wordIndex: number }> = [];

  // Simple word-by-word comparison
  const maxLength = Math.max(originalWords.length, correctedWords.length);

  for (let i = 0; i < maxLength; i++) {
    const origWord = originalWords[i] || "";
    const corrWord = correctedWords[i] || "";

    // Compare words without trailing punctuation
    const origWordClean = stripPunctuation(origWord);
    const corrWordClean = stripPunctuation(corrWord);

    // If words are different (ignoring punctuation) and the corrected word exists
    if (origWordClean !== corrWordClean && corrWordClean.length > 0) {
      // Filter out basic pronouns and excluded verbs (case-insensitive)
      const wordLower = corrWordClean.toLowerCase();
      const isBasicPronoun = GERMAN_PRONOUNS.has(wordLower);
      const isExcludedVerb = EXCLUDED_VERBS.has(wordLower);

      // Only include complete words (at least 3 chars) and not basic pronouns or excluded verbs
      if (corrWordClean.length >= 3 && !isBasicPronoun && !isExcludedVerb) {
        potentialBlanks.push({
          answer: corrWordClean, // Store word WITHOUT punctuation
          wordIndex: i,
        });
      }
    }
  }

  // Step 2: Filter to prevent consecutive blanks
  // CRITICAL: Ensure at least 1 word of unchanged text between any two blanks
  const filteredBlanks: Array<{ answer: string; wordIndex: number }> = [];
  let lastIncludedWordIndex = -1;

  for (const blank of potentialBlanks) {
    const wordIndex = blank.wordIndex;

    // Skip blanks at the very end (need at least 2 words after)
    const wordsAfter = correctedWords.length - wordIndex - 1;
    if (wordsAfter < 2) {
      continue;
    }

    // First blank: always include it
    if (lastIncludedWordIndex === -1) {
      filteredBlanks.push(blank);
      lastIncludedWordIndex = wordIndex;
      continue;
    }

    // Check if there's at least 1 word between this blank and the last
    const wordGap = wordIndex - lastIncludedWordIndex;

    // wordGap = 1 means consecutive words (no gap)
    // wordGap = 2 means one word between them (acceptable)
    // CRITICAL FIX: Require wordGap >= 2 to ensure NO consecutive blanks
    if (wordGap >= 2) {
      filteredBlanks.push(blank);
      lastIncludedWordIndex = wordIndex;
    }
  }

  // Step 3: Calculate actual character positions in the corrected text
  // Build the position map by walking through the corrected text word by word
  const blanks: QuizBlank[] = [];
  let blankIndex = 0;
  let charPosition = 0;

  for (let i = 0; i < correctedWords.length; i++) {
    const word = correctedWords[i];
    const wordClean = stripPunctuation(word);

    // Check if this word is a blank
    const isBlank = filteredBlanks.some((b) => b.wordIndex === i);

    // Move position forward by the FULL word length (with punctuation) plus space
    // But we need to find the actual position in the text, not calculate it
    // Find where this word appears in the text starting from charPosition
    const foundPos = correctedText.indexOf(word, charPosition);

    if (isBlank) {
      // This word should be a blank
      // Use the clean word (without punctuation) as the answer
      blanks.push({
        index: blankIndex++,
        correctAnswer: wordClean,
        position: foundPos !== -1 ? foundPos : charPosition,
        hint: `${wordClean.length} ${
          wordClean.length === 1 ? "character" : "characters"
        }`,
      });
    }

    if (foundPos !== -1) {
      charPosition = foundPos + word.length;
      // Add 1 for the space after, unless it's the last word
      if (i < correctedWords.length - 1) {
        // Skip any whitespace characters
        while (
          charPosition < correctedText.length &&
          /\s/.test(correctedText[charPosition])
        ) {
          charPosition++;
        }
      }
    } else {
      // Fallback: just increment by word length + 1
      charPosition += word.length + 1;
    }
  }

  return blanks;
}

/**
 * Generate random blanks for a sentence
 * Used as a fallback when no corrections are found (perfect sentences)
 */
export function generateRandomBlanks(text: string): QuizBlank[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const blanks: QuizBlank[] = [];
  let charPosition = 0;

  // Identify candidate words
  const candidates: Array<{ word: string; index: number; position: number }> =
    [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordClean = stripPunctuation(word);

    // Find position
    const foundPos = text.indexOf(word, charPosition);
    const pos = foundPos !== -1 ? foundPos : charPosition;

    // Filter logic
    const wordLower = wordClean.toLowerCase();
    const isBasicPronoun = GERMAN_PRONOUNS.has(wordLower);
    const isExcludedVerb = EXCLUDED_VERBS.has(wordLower);

    if (wordClean.length >= 4 && !isBasicPronoun && !isExcludedVerb) {
      candidates.push({
        word: wordClean,
        index: i,
        position: pos,
      });
    }

    // Update charPosition
    if (foundPos !== -1) {
      charPosition = foundPos + word.length;
      if (i < words.length - 1) {
        while (charPosition < text.length && /\s/.test(text[charPosition])) {
          charPosition++;
        }
      }
    } else {
      charPosition += word.length + 1;
    }
  }

  // Pick one random candidate
  if (candidates.length > 0) {
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    blanks.push({
      index: 0,
      correctAnswer: selected.word,
      position: selected.position,
      hint: `${selected.word.length} ${
        selected.word.length === 1 ? "character" : "characters"
      }`,
    });
  }

  return blanks;
}

/**
 * Generate quiz text with blanks replaced by input placeholders
 * Returns the text with blanks marked
 */
export function generateQuizText(
  correctedText: string,
  blanks: QuizBlank[]
): DiffPart[] {
  const diffParts: DiffPart[] = [];
  let lastPosition = 0;

  // Sort blanks by position
  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

  for (const blank of sortedBlanks) {
    // Add text before the blank
    if (blank.position > lastPosition) {
      diffParts.push({
        type: "unchanged",
        value: correctedText.substring(lastPosition, blank.position),
      });
    }

    // Add the blank
    diffParts.push({
      type: "added", // Use 'added' type to mark it as a blank
      value: blank.correctAnswer,
    });

    lastPosition = blank.position + blank.correctAnswer.length;
  }

  // Add remaining text
  if (lastPosition < correctedText.length) {
    diffParts.push({
      type: "unchanged",
      value: correctedText.substring(lastPosition),
    });
  }

  return diffParts;
}

/**
 * Check if an answer is correct (fuzzy matching)
 * Allows for minor differences like capitalization and whitespace
 */
export function checkAnswer(
  studentAnswer: string,
  correctAnswer: string
): boolean {
  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, " ");

  return normalize(studentAnswer) === normalize(correctAnswer);
}

/**
 * Calculate quiz score
 */
export function calculateQuizScore(
  answers: Record<number, string>,
  blanks: QuizBlank[]
): { score: number; correctAnswers: number; totalBlanks: number } {
  const totalBlanks = blanks.length;
  let correctAnswers = 0;

  for (const blank of blanks) {
    const studentAnswer = answers[blank.index] || "";
    if (checkAnswer(studentAnswer, blank.correctAnswer)) {
      correctAnswers++;
    }
  }

  const score =
    totalBlanks > 0 ? Math.round((correctAnswers / totalBlanks) * 100) : 0;

  return { score, correctAnswers, totalBlanks };
}
