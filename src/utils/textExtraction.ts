import type { PDFTextContent } from '@/types/pdf';

export interface TextWord {
  text: string;
  index: number;
  startOffset: number;
  endOffset: number;
}

export interface TextSentence {
  text: string;
  words: TextWord[];
  startIndex: number;
  endIndex: number;
}

/**
 * Extract plain text from PDF text content
 */
export function extractPlainText(textContent: PDFTextContent): string {
  return textContent.items
    .map((item) => item.str)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into words with position tracking
 */
export function extractWords(text: string): TextWord[] {
  const words: TextWord[] = [];
  const wordRegex = /\S+/g;
  let match;
  let wordIndex = 0;

  while ((match = wordRegex.exec(text)) !== null) {
    words.push({
      text: match[0],
      index: wordIndex,
      startOffset: match.index,
      endOffset: match.index + match[0].length,
    });
    wordIndex++;
  }

  return words;
}

/**
 * Split text into sentences
 */
export function extractSentences(text: string): TextSentence[] {
  const sentences: TextSentence[] = [];
  
  // Split by common sentence endings, but preserve them
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const matches = text.match(sentenceRegex);
  
  if (!matches) {
    // If no sentence endings found, treat entire text as one sentence
    const words = extractWords(text);
    return [{
      text: text.trim(),
      words,
      startIndex: 0,
      endIndex: words.length - 1,
    }];
  }

  let currentWordIndex = 0;
  
  for (const sentenceText of matches) {
    const trimmed = sentenceText.trim();
    if (!trimmed) continue;

    const words = extractWords(trimmed);
    
    // Update word indices to be global across all sentences
    const adjustedWords = words.map((word) => ({
      ...word,
      index: word.index + currentWordIndex,
    }));

    sentences.push({
      text: trimmed,
      words: adjustedWords,
      startIndex: currentWordIndex,
      endIndex: currentWordIndex + words.length - 1,
    });

    currentWordIndex += words.length;
  }

  return sentences;
}

/**
 * Get word at specific character offset
 */
export function getWordAtOffset(words: TextWord[], offset: number): TextWord | null {
  return words.find(
    (word) => offset >= word.startOffset && offset < word.endOffset
  ) ?? null;
}

/**
 * Get sentence containing specific word index
 */
export function getSentenceForWord(
  sentences: TextSentence[],
  wordIndex: number
): TextSentence | null {
  return sentences.find(
    (sentence) => wordIndex >= sentence.startIndex && wordIndex <= sentence.endIndex
  ) ?? null;
}
