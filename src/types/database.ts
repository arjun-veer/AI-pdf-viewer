export interface DocumentRecord {
  id: string;
  filePath: string;
  fileHash: string;
  title: string;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
}

export interface ReadingProgress {
  id: string;
  documentId: string;
  currentPage: number;
  totalTimeSeconds: number;
  updatedAt: string;
}

export interface AnnotationRecord {
  id: string;
  documentId: string;
  pageNumber: number;
  type: string;
  content?: string;
  color: string;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeWord {
  id: string;
  documentId: string;
  word: string;
  language: string;
  pageNumber: number;
  attempts: number;
  lastPracticed?: string;
  createdAt: string;
}
