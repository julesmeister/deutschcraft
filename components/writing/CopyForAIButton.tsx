/**
 * CopyForAIButton Component
 * Copies student's writing with an AI prompt for external review
 */

'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

interface CopyForAIButtonProps {
  studentText: string;
  originalText?: string; // For translation exercises
  exerciseType: string;
  className?: string;
}

export function CopyForAIButton({
  studentText,
  originalText,
  exerciseType,
  className = ''
}: CopyForAIButtonProps) {
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    let prompt = '';

    if (exerciseType === 'translation' && originalText) {
      prompt = `I'm learning German. Please provide ONLY the corrected version of my translation with all grammar and spelling errors fixed. Do not include explanations, just the corrected German text.

**Original English Text:**
${originalText}

**My German Translation:**
${studentText}

**Corrected German Translation:**`;
    } else {
      prompt = `I'm learning German. Please provide ONLY the corrected version of my text with all grammar and spelling errors fixed. Do not include explanations, just the corrected German text.

**My German Text:**
${studentText}

**Corrected German Text:**`;
    }

    return prompt;
  };

  const handleCopy = async () => {
    try {
      const prompt = generatePrompt();
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 transition-colors ${className}`}
    >
      <Copy className="w-3.5 h-3.5" />
      <span>{copied ? 'Copied to clipboard!' : 'Copy for AI Review'}</span>
    </button>
  );
}
