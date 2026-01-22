/**
 * Practice Database Service
 * 
 * Manages SQLite database for storing:
 * - Practice sessions
 * - Word pronunciation history
 * - Difficult words tracking
 * - User progress metrics
 */

import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export interface PracticeSession {
  id?: number;
  documentHash: string;
  pageNumber: number;
  text: string;
  accuracy: number;
  duration: number;
  timestamp: number;
}

export interface WordPractice {
  id?: number;
  word: string;
  documentHash: string;
  pageNumber: number;
  attempts: number;
  successCount: number;
  lastAccuracy: number;
  averageAccuracy: number;
  marked: boolean;
  lastPracticed: number;
}

export interface DifficultyStats {
  word: string;
  attempts: number;
  successRate: number;
  averageAccuracy: number;
  needsPractice: boolean;
}

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<void> {
  if (db) return;

  try {
    db = await Database.load('sqlite:practice.db');
    await createTables();
  } catch (error) {
    console.error('Failed to initialize practice database:', error);
    throw error;
  }
}

/**
 * Create database tables
 */
async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // Practice sessions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS practice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_hash TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      accuracy REAL NOT NULL,
      duration INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      UNIQUE(document_hash, page_number, timestamp)
    )
  `);

  // Word practice history table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS word_practice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      document_hash TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      last_accuracy REAL NOT NULL,
      average_accuracy REAL NOT NULL,
      marked INTEGER NOT NULL DEFAULT 0,
      last_practiced INTEGER NOT NULL,
      UNIQUE(word, document_hash, page_number)
    )
  `);

  // Create indexes for faster queries
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_sessions_document 
    ON practice_sessions(document_hash, page_number)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_word_practice 
    ON word_practice(word, document_hash)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_marked_words 
    ON word_practice(marked, last_practiced)
  `);
}

/**
 * Save a practice session
 */
export async function savePracticeSession(session: PracticeSession): Promise<number> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  const result = await db.execute(
    `INSERT INTO practice_sessions 
     (document_hash, page_number, text, accuracy, duration, timestamp)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      session.documentHash,
      session.pageNumber,
      session.text,
      session.accuracy,
      session.duration,
      session.timestamp,
    ]
  );

  return result.lastInsertId ?? 0;
}

/**
 * Update or create word practice record
 */
export async function updateWordPractice(
  word: string,
  documentHash: string,
  pageNumber: number,
  accuracy: number,
  marked: boolean = false
): Promise<void> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  // Check if word exists
  const existing = await db.select<WordPractice[]>(
    `SELECT * FROM word_practice 
     WHERE word = ? AND document_hash = ? AND page_number = ?`,
    [word, documentHash, pageNumber]
  );

  if (existing.length > 0) {
    const record = existing[0];
    if (!record) return;
    
    const newAttempts = record.attempts + 1;
    const newSuccessCount = accuracy >= 70 ? record.successCount + 1 : record.successCount;
    const newAverageAccuracy =
      (record.averageAccuracy * record.attempts + accuracy) / newAttempts;

    await db.execute(
      `UPDATE word_practice 
       SET attempts = ?,
           success_count = ?,
           last_accuracy = ?,
           average_accuracy = ?,
           marked = ?,
           last_practiced = ?
       WHERE id = ?`,
      [
        newAttempts,
        newSuccessCount,
        accuracy,
        newAverageAccuracy,
        marked ? 1 : 0,
        Date.now(),
        record.id,
      ]
    );
  } else {
    await db.execute(
      `INSERT INTO word_practice 
       (word, document_hash, page_number, attempts, success_count, 
        last_accuracy, average_accuracy, marked, last_practiced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        word,
        documentHash,
        pageNumber,
        1,
        accuracy >= 70 ? 1 : 0,
        accuracy,
        accuracy,
        marked ? 1 : 0,
        Date.now(),
      ]
    );
  }
}

/**
 * Get practice sessions for a document page
 */
export async function getPracticeSessions(
  documentHash: string,
  pageNumber?: number
): Promise<PracticeSession[]> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  if (pageNumber !== undefined) {
    return await db.select<PracticeSession[]>(
      `SELECT * FROM practice_sessions 
       WHERE document_hash = ? AND page_number = ?
       ORDER BY timestamp DESC`,
      [documentHash, pageNumber]
    );
  }

  return await db.select<PracticeSession[]>(
    `SELECT * FROM practice_sessions 
     WHERE document_hash = ?
     ORDER BY timestamp DESC`,
    [documentHash]
  );
}

/**
 * Get word practice history
 */
export async function getWordPractice(
  documentHash: string,
  pageNumber?: number
): Promise<WordPractice[]> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  if (pageNumber !== undefined) {
    return await db.select<WordPractice[]>(
      `SELECT * FROM word_practice 
       WHERE document_hash = ? AND page_number = ?
       ORDER BY last_practiced DESC`,
      [documentHash, pageNumber]
    );
  }

  return await db.select<WordPractice[]>(
    `SELECT * FROM word_practice 
     WHERE document_hash = ?
     ORDER BY last_practiced DESC`,
    [documentHash]
  );
}

/**
 * Get marked words for practice
 */
export async function getMarkedWords(documentHash: string): Promise<WordPractice[]> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  return await db.select<WordPractice[]>(
    `SELECT * FROM word_practice 
     WHERE document_hash = ? AND marked = 1
     ORDER BY last_practiced ASC`,
    [documentHash]
  );
}

/**
 * Toggle word marked status
 */
export async function toggleWordMarked(
  word: string,
  documentHash: string,
  pageNumber: number
): Promise<void> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  await db.execute(
    `UPDATE word_practice 
     SET marked = CASE WHEN marked = 1 THEN 0 ELSE 1 END
     WHERE word = ? AND document_hash = ? AND page_number = ?`,
    [word, documentHash, pageNumber]
  );
}

/**
 * Get difficulty statistics
 */
export async function getDifficultyStats(documentHash: string): Promise<DifficultyStats[]> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  const words = await db.select<WordPractice[]>(
    `SELECT * FROM word_practice 
     WHERE document_hash = ?
     ORDER BY average_accuracy ASC, attempts DESC`,
    [documentHash]
  );

  return words.map((word) => ({
    word: word.word,
    attempts: word.attempts,
    successRate: word.attempts > 0 ? (word.successCount / word.attempts) * 100 : 0,
    averageAccuracy: word.averageAccuracy,
    needsPractice: word.averageAccuracy < 70 && word.attempts >= 2,
  }));
}

/**
 * Get overall progress stats
 */
export async function getProgressStats(documentHash: string): Promise<{
  totalSessions: number;
  totalWords: number;
  markedWords: number;
  averageAccuracy: number;
  difficultWords: number;
}> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  const sessions = await db.select<{ count: number; avg_accuracy: number }[]>(
    `SELECT COUNT(*) as count, AVG(accuracy) as avg_accuracy
     FROM practice_sessions 
     WHERE document_hash = ?`,
    [documentHash]
  );

  const words = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count
     FROM word_practice 
     WHERE document_hash = ?`,
    [documentHash]
  );

  const marked = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count
     FROM word_practice 
     WHERE document_hash = ? AND marked = 1`,
    [documentHash]
  );

  const difficult = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count
     FROM word_practice 
     WHERE document_hash = ? AND average_accuracy < 70 AND attempts >= 2`,
    [documentHash]
  );

  return {
    totalSessions: sessions[0]?.count ?? 0,
    totalWords: words[0]?.count ?? 0,
    markedWords: marked[0]?.count ?? 0,
    averageAccuracy: sessions[0]?.avg_accuracy ?? 0,
    difficultWords: difficult[0]?.count ?? 0,
  };
}

/**
 * Clear all practice data for a document
 */
export async function clearDocumentPractice(documentHash: string): Promise<void> {
  if (!db) await initDatabase();
  if (!db) throw new Error('Failed to initialize database');

  await db.execute(`DELETE FROM practice_sessions WHERE document_hash = ?`, [documentHash]);
  await db.execute(`DELETE FROM word_practice WHERE document_hash = ?`, [documentHash]);
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
