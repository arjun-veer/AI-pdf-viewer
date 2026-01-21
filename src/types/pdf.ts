export interface PDFDocumentMetadata {
  id: string;
  numPages: number;
  fingerprint: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface PDFPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PDFRenderOptions {
  scale: number;
  rotation?: number;
  background?: string;
}

export interface PDFViewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

export interface PDFTextContent {
  items: PDFTextItem[];
  styles: Record<string, PDFTextStyle>;
}

export interface PDFTextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

export interface PDFTextStyle {
  fontFamily: string;
  ascent: number;
  descent: number;
  vertical: boolean;
}

export interface PDFSearchResult {
  pageNumber: number;
  text: string;
  matchIndex: number;
  matchLength: number;
}

export interface PDFAnnotation {
  id: string;
  pageNumber: number;
  type: 'highlight' | 'note' | 'bookmark' | 'drawing';
  content?: string;
  color: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}
