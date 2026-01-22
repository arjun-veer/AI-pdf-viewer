/**
 * Pronunciation Service
 * 
 * Compares user pronunciation with expected text using:
 * - Phonetic similarity (Levenshtein distance)
 * - Word-level accuracy tracking
 * - Real-time feedback generation
 */

export interface PronunciationResult {
  text: string;
  expected: string;
  similarity: number; // 0-100
  wordResults: WordPronunciationResult[];
  overallAccuracy: number; // 0-100
  feedback: string[];
}

export interface WordPronunciationResult {
  word: string;
  expectedWord: string;
  correct: boolean;
  similarity: number; // 0-100
  feedback?: string | undefined;
}

export interface PronunciationComparison {
  isCorrect: boolean;
  accuracy: number;
  corrections: string[];
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PronunciationService {
  /**
   * Compare user pronunciation with expected text
   * 
   * @param transcribedText - Text from speech recognition
   * @param expectedText - Expected text to pronounce
   * @param threshold - Minimum similarity threshold (default: 70%)
   * @returns Pronunciation result with detailed feedback
   */
  static comparePronunciation(
    transcribedText: string,
    expectedText: string,
    threshold: number = 70
  ): PronunciationResult {
    // Normalize texts
    const normalizedTranscribed = this.normalizeText(transcribedText);
    const normalizedExpected = this.normalizeText(expectedText);

    // Split into words
    const transcribedWords = normalizedTranscribed.split(/\s+/);
    const expectedWords = normalizedExpected.split(/\s+/);

    // Compare word by word
    const wordResults: WordPronunciationResult[] = [];
    const maxLength = Math.max(transcribedWords.length, expectedWords.length);

    for (let i = 0; i < maxLength; i++) {
      const transcribedWord = transcribedWords[i] || '';
      const expectedWord = expectedWords[i] || '';

      const similarity = this.calculateSimilarity(transcribedWord, expectedWord);
      const correct = similarity >= threshold;

      wordResults.push({
        word: transcribedWord,
        expectedWord,
        correct,
        similarity,
        feedback: !correct ? this.generateWordFeedback(transcribedWord, expectedWord) : undefined,
      });
    }

    // Calculate overall metrics
    const correctWords = wordResults.filter((r) => r.correct).length;
    const overallAccuracy = (correctWords / maxLength) * 100;
    const avgSimilarity = wordResults.reduce((sum, r) => sum + r.similarity, 0) / maxLength;

    // Generate feedback
    const feedback = this.generateFeedback(wordResults, overallAccuracy);

    return {
      text: transcribedText,
      expected: expectedText,
      similarity: avgSimilarity,
      wordResults,
      overallAccuracy,
      feedback,
    };
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Returns similarity percentage (0-100)
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 100;

    const similarity = ((maxLength - distance) / maxLength) * 100;
    return Math.max(0, Math.min(100, similarity));
  }

  /**
   * Levenshtein distance algorithm
   * Measures the minimum number of single-character edits required
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create a matrix
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0) as number[]);

    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      const row = dp[i];
      if (row) row[0] = i;
    }
    for (let j = 0; j <= n; j++) {
      const firstRow = dp[0];
      if (firstRow) firstRow[j] = j;
    }

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const row = dp[i];
        const prevRow = dp[i - 1];
        
        if (!row || !prevRow) continue;
        
        if (str1[i - 1] === str2[j - 1]) {
          row[j] = prevRow[j - 1] ?? 0;
        } else {
          row[j] = Math.min(
            (prevRow[j] ?? 0) + 1, // deletion
            (row[j - 1] ?? 0) + 1, // insertion
            (prevRow[j - 1] ?? 0) + 1 // substitution
          );
        }
      }
    }

    return dp[m]?.[n] ?? 0;
  }

  /**
   * Normalize text for comparison
   * - Convert to lowercase
   * - Remove punctuation
   * - Normalize whitespace
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[.,!?;:"""''()[\]{}]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Generate feedback for a single word
   */
  private static generateWordFeedback(transcribed: string, expected: string): string {
    if (transcribed === '') {
      return `Missing word: "${expected}"`;
    }

    if (expected === '') {
      return `Extra word: "${transcribed}"`;
    }

    // Check for common pronunciation errors
    const similarity = this.calculateSimilarity(transcribed, expected);

    if (similarity >= 50) {
      return `Close! Try: "${expected}" (you said: "${transcribed}")`;
    }

    return `Incorrect: "${transcribed}" → should be: "${expected}"`;
  }

  /**
   * Generate overall feedback
   */
  private static generateFeedback(
    wordResults: WordPronunciationResult[],
    overallAccuracy: number
  ): string[] {
    const feedback: string[] = [];

    if (overallAccuracy === 100) {
      feedback.push('Perfect pronunciation! 🎉');
      return feedback;
    }

    if (overallAccuracy >= 90) {
      feedback.push('Excellent! Minor improvements needed.');
    } else if (overallAccuracy >= 70) {
      feedback.push('Good effort! Some words need practice.');
    } else if (overallAccuracy >= 50) {
      feedback.push('Keep practicing. Focus on clarity.');
    } else {
      feedback.push('Needs more practice. Try again slowly.');
    }

    // Add specific word feedback
    const incorrectWords = wordResults.filter((r) => !r.correct);
    if (incorrectWords.length > 0) {
      feedback.push(`Words to improve: ${String(incorrectWords.length)}`);

      // Show first 3 incorrect words
      incorrectWords.slice(0, 3).forEach((result) => {
        if (result.feedback) {
          feedback.push(result.feedback);
        }
      });

      if (incorrectWords.length > 3) {
        feedback.push(`...and ${String(incorrectWords.length - 3)} more`);
      }
    }

    return feedback;
  }

  /**
   * Calculate phonetic similarity using metaphone approximation
   * (Simple implementation - can be enhanced with soundex/metaphone libraries)
   */
  static phoneticSimilarity(str1: string, str2: string): number {
    // Simple phonetic rules
    const phonetic1 = this.simplePhonetic(str1);
    const phonetic2 = this.simplePhonetic(str2);

    return this.calculateSimilarity(phonetic1, phonetic2);
  }

  /**
   * Simple phonetic normalization
   * Maps similar sounds to same representation
   */
  private static simplePhonetic(str: string): string {
    return str
      .toLowerCase()
      .replace(/ph/g, 'f')
      .replace(/[ck]/g, 'c')
      .replace(/sh|ch/g, 'x')
      .replace(/th/g, 't')
      .replace(/[aeiou]/g, 'a') // Vowels are often confused
      .replace(/[^a-z]/g, '');
  }

  /**
   * Get pronunciation difficulty level for a word
   */
  static getDifficulty(word: string): 'easy' | 'medium' | 'hard' {
    const length = word.length;
    const syllables = this.estimateSyllables(word);

    if (length <= 4 && syllables <= 2) {
      return 'easy';
    }

    if (length <= 8 && syllables <= 3) {
      return 'medium';
    }

    return 'hard';
  }

  /**
   * Estimate syllable count (simple heuristic)
   */
  private static estimateSyllables(word: string): number {
    word = word.toLowerCase();
    const vowels = word.match(/[aeiouy]+/g);
    return vowels ? vowels.length : 1;
  }

  /**
   * Check if word needs practice based on history
   */
  static needsPractice(
    word: string,
    history: Map<string, number[]>
  ): boolean {
    const scores = history.get(word.toLowerCase());

    if (!scores || scores.length === 0) {
      return false; // No history, no practice needed
    }

    // Calculate average of last 3 attempts
    const recentScores = scores.slice(-3);
    const avgScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

    return avgScore < 70; // Needs practice if average below 70%
  }

  /**
   * Update pronunciation history
   */
  static updateHistory(
    word: string,
    accuracy: number,
    history: Map<string, number[]>
  ): Map<string, number[]> {
    const normalizedWord = word.toLowerCase();
    const scores = history.get(normalizedWord) || [];

    // Keep last 10 attempts
    const updatedScores = [...scores, accuracy].slice(-10);

    const newHistory = new Map(history);
    newHistory.set(normalizedWord, updatedScores);

    return newHistory;
  }
}
