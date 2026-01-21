# AGENT.md - AI Agent Development Guide

This document is specifically for AI coding agents (GitHub Copilot, Cursor, Aider, etc.) working on this project. It contains technical context, architecture decisions, and development patterns.

## 🎯 Project Context

**Project Goal:** Build a production-ready, AI-powered PDF viewer that can replace Adobe Acrobat/Edge PDF as the default PDF application on desktop operating systems.

**Killer Feature:** Synchronized reading with pronunciation checking - the app tracks user speech in real-time, highlights words as they speak, and provides instant corrections with pronunciation, meaning, and translation when errors are detected.

**Timeline:** 6-month development cycle with incremental releases (v0.0.1 → v1.0.0)

**Target Users:** Anyone who reads PDFs - students, researchers, professionals, language learners

## 🏗️ Technical Architecture

### Core Stack
```
Frontend:  React 18 + TypeScript + Vite
Backend:   Rust + Tauri 2.0
UI:        shadcn/ui + Tailwind CSS
State:     Zustand (with persistence)
PDF:       PDF.js (custom integration, NOT react-pdf)
Database:  SQLite (local) + Supabase (cloud sync)
```

### Critical Performance Requirements
- **PDF Load Time:** < 1s for 10MB files
- **Page Render:** < 50ms per page
- **Scroll Performance:** 60fps (16.67ms/frame)
- **Memory Usage:** < 150MB for 100-page PDF, < 300MB for 1000-page PDF
- **Search Speed:** < 2s for 1000 pages

## 🔑 Critical Implementation Rules

### 1. NO CODE COMMENTS
Code must be self-documenting. Use descriptive names instead of comments.

### 2. Use Custom PDF.js Integration
```typescript
import * as pdfjsLib from 'pdfjs-dist';

export class PDFService {
  private document: pdfjsLib.PDFDocumentProxy | null = null;
  
  async loadDocument(data: Uint8Array) {
    const loadingTask = pdfjsLib.getDocument({ data });
    this.document = await loadingTask.promise;
    return { numPages: this.document.numPages };
  }
}
```

### 3. Virtual Scrolling is MANDATORY
```typescript
export function useVirtualScroll(config: VirtualScrollConfig) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 });
  
  const handleScroll = () => {
    const scrollTop = container.scrollTop;
    const start = Math.floor(scrollTop / config.pageHeight) - config.overscan;
    const end = Math.ceil((scrollTop + viewportHeight) / config.pageHeight) + config.overscan;
    setVisibleRange({ start: Math.max(0, start), end: Math.min(config.totalPages, end) });
  };
  
  return { visibleRange, containerRef };
}
```

### 4. Zustand State Pattern
```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const usePDFStore = create<PDFState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        currentPage: 1,
        setCurrentPage: (page: number) => {
          set((state) => { state.currentPage = page; });
        },
      }))
    )
  )
);
```

### 5. Tauri Command Pattern
```rust
#[tauri::command]
pub async fn load_pdf(
    file_path: String,
    db: State<'_, Mutex<Database>>,
) -> Result<DocumentMetadata, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    let doc_id = db.get_or_create_document(&file_path)?;
    Ok(DocumentMetadata { id: doc_id, pages: 0 })
}
```

## 🚨 Common Pitfalls to Avoid

### ❌ DON'T: Bundle AI models in installer
Models should be downloaded on-demand.

### ❌ DON'T: Render all pages at once
Use virtual scrolling to render only visible pages.

### ❌ DON'T: Store API keys in localStorage
Use OS keychain via Tauri's keyring.

### ❌ DON'T: Add code comments
Write self-documenting code with descriptive names.

### ❌ DON'T: Use react-pdf wrapper
Use PDF.js directly for full control.

## 📝 Code Style Rules

1. **No code comments** - Self-documenting only
2. **TypeScript strict mode** - All types explicit
3. **Functional components** - No class components
4. **Zustand for state** - No Redux
5. **Async/await** - No raw promises
6. **Error boundaries** - Wrap major features

## 🎯 Success Metrics

- Load Time: < 1s for 10MB PDF
- FPS: 60fps scrolling
- Memory: < 300MB for 1000 pages
- Bundle: < 2MB gzipped

---

**Remember:** This is a desktop app. Leverage Rust backend for heavy operations. Keep React frontend lightweight.
