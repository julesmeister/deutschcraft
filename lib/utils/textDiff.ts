/**
 * Text Diff Utility
 * Compares two texts and generates a diff showing additions, deletions, and unchanged parts
 * Uses Myers diff algorithm (similar to git diff)
 */

export type DiffPart = {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
};

/**
 * Longest Common Subsequence (LCS) based diff algorithm
 * More accurate than simple string matching
 */
function computeLCS(arr1: string[], arr2: string[]): number[][] {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Backtrack through LCS matrix to generate diff
 */
function backtrackLCS(arr1: string[], arr2: string[], dp: number[][]): DiffPart[] {
  const diff: DiffPart[] = [];
  let i = arr1.length;
  let j = arr2.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && arr1[i - 1] === arr2[j - 1]) {
      // Characters match - unchanged
      diff.unshift({ type: 'unchanged', value: arr1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Added in corrected version
      diff.unshift({ type: 'added', value: arr2[j - 1] });
      j--;
    } else if (i > 0) {
      // Removed from original
      diff.unshift({ type: 'removed', value: arr1[i - 1] });
      i--;
    }
  }

  return diff;
}

/**
 * Word-level diff using LCS algorithm
 * Compares two texts word by word and returns parts with their types
 */
export function generateWordDiff(originalText: string, correctedText: string): DiffPart[] {
  // Split by words but keep whitespace
  const originalWords = originalText.split(/(\s+)/);
  const correctedWords = correctedText.split(/(\s+)/);

  // Compute LCS
  const dp = computeLCS(originalWords, correctedWords);

  // Generate diff by backtracking
  return backtrackLCS(originalWords, correctedWords, dp);
}

/**
 * Merge consecutive parts of the same type for cleaner display
 * Also marks whitespace-only parts as unchanged
 */
export function mergeDiffParts(parts: DiffPart[]): DiffPart[] {
  if (parts.length === 0) return [];

  const merged: DiffPart[] = [];
  let current = parts[0];

  // Mark whitespace as unchanged
  if (current.value.trim() === '') {
    current.type = 'unchanged';
  }

  for (let i = 1; i < parts.length; i++) {
    let part = parts[i];

    // Mark whitespace as unchanged
    if (part.value.trim() === '') {
      part = { ...part, type: 'unchanged' };
    }

    if (part.type === current.type) {
      current.value += part.value;
    } else {
      merged.push(current);
      current = part;
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Generate diff and return merged parts
 */
export function getDiff(originalText: string, correctedText: string): DiffPart[] {
  const diff = generateWordDiff(originalText, correctedText);
  return mergeDiffParts(diff);
}
