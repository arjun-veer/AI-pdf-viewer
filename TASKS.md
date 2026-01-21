# GitHub Project Tasks - AI PDF Viewer

This document outlines all development tasks organized by version milestones for the GitHub Project board.

## Task Organization Structure

- **Epic:** Major version milestone (e.g., v0.0.1, v0.1.0)
- **Feature:** Significant functionality within an epic
- **Task:** Individual implementable work item
- **Bug:** Issue fixes
- **Chore:** Maintenance, tooling, configuration

## Labels System

- `priority:critical` - Must be completed for milestone
- `priority:high` - Important for quality
- `priority:medium` - Nice to have
- `priority:low` - Future consideration
- `complexity:xs` - 1-2 hours
- `complexity:s` - 2-4 hours
- `complexity:m` - 4-8 hours
- `complexity:l` - 1-2 days
- `complexity:xl` - 2-5 days

---

## v0.0.1 - Core PDF Viewer Foundation (Weeks 1-2)

**Milestone Goal:** Fast, robust PDF viewer with virtual scrolling, modern UI, and basic navigation.

### Epic 1: Project Setup & Configuration
- [x] **TASK-001:** Initialize Tauri + React + TypeScript + Bun
  - Complexity: XS
  - Priority: Critical
  - Branch: `main`
  - Commit: Initial setup

- [ ] **TASK-002:** Update package.json metadata
  - Complexity: XS
  - Priority: Critical
  - Branch: `chore/update-package-metadata`
  - Details: Update name, version (0.0.1), description, repository, license

- [ ] **TASK-003:** Install and configure Tailwind CSS
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/setup-tailwind`
  - Dependencies: TASK-002
  - Install: `tailwindcss`, `autoprefixer`, `postcss`
  - Configure: tailwind.config.js, postcss.config.js

- [ ] **TASK-004:** Install and configure shadcn/ui
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/setup-shadcn-ui`
  - Dependencies: TASK-003
  - Run: `bunx shadcn-ui@latest init`
  - Install components: button, dropdown-menu, tabs, tooltip

- [ ] **TASK-005:** Install Zustand and middleware
  - Complexity: XS
  - Priority: Critical
  - Branch: `feat/setup-zustand`
  - Install: `zustand`, `immer`

- [ ] **TASK-006:** Configure ESLint and Prettier
  - Complexity: S
  - Priority: High
  - Branch: `chore/setup-linters`
  - Install ESLint plugins, Prettier config
  - Add pre-commit hooks (husky)

- [ ] **TASK-007:** Setup TypeScript strict mode
  - Complexity: S
  - Priority: Critical
  - Branch: `chore/typescript-strict`
  - Update tsconfig.json with strict rules

### Epic 2: Core Folder Structure
- [ ] **TASK-008:** Create frontend folder structure
  - Complexity: XS
  - Priority: Critical
  - Branch: `chore/create-folder-structure`
  - Create: src/components/, src/stores/, src/services/, src/hooks/, src/types/

- [ ] **TASK-009:** Create Rust backend folder structure
  - Complexity: XS
  - Priority: Critical
  - Branch: `chore/create-rust-structure`
  - Create: src-tauri/src/commands/, services/, database/, utils/

### Epic 3: PDF.js Integration
- [ ] **TASK-010:** Install PDF.js dependencies
  - Complexity: XS
  - Priority: Critical
  - Branch: `feat/install-pdfjs`
  - Install: `pdfjs-dist@3.11.174`

- [ ] **TASK-011:** Create PDFService class
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/pdf-service`
  - Dependencies: TASK-010
  - File: `src/services/pdfService.ts`
  - Methods: loadDocument, getPage, renderPage

- [ ] **TASK-012:** Configure PDF.js worker
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/pdfjs-worker-config`
  - Dependencies: TASK-011
  - Configure worker path for Tauri environment

- [ ] **TASK-013:** Create PDF types definitions
  - Complexity: S
  - Priority: High
  - Branch: `feat/pdf-types`
  - File: `src/types/pdf.ts`
  - Define interfaces for PDF document, page, metadata

### Epic 4: Virtual Scrolling System
- [ ] **TASK-014:** Create useVirtualScroll hook
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/virtual-scrolling`
  - File: `src/hooks/useVirtualScroll.ts`
  - Implement: viewport calculation, overscan, scroll handling

- [ ] **TASK-015:** Implement canvas pooling
  - Complexity: M
  - Priority: High
  - Branch: `feat/canvas-pooling`
  - File: `src/services/canvasPool.ts`
  - Reuse canvas elements to reduce memory

- [ ] **TASK-016:** Create page cache management
  - Complexity: M
  - Priority: High
  - Branch: `feat/page-cache`
  - Dependencies: TASK-011
  - Max 20 pages in memory, LRU eviction

### Epic 5: State Management
- [ ] **TASK-017:** Create pdfStore (Zustand)
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/pdf-store`
  - File: `src/stores/pdfStore.ts`
  - State: documentId, currentPage, scale, totalPages, annotations

- [ ] **TASK-018:** Create settingsStore (Zustand)
  - Complexity: S
  - Priority: High
  - Branch: `feat/settings-store`
  - File: `src/stores/settingsStore.ts`
  - State: theme, language, keyboardShortcuts

- [ ] **TASK-019:** Implement Zustand persistence
  - Complexity: S
  - Priority: Medium
  - Branch: `feat/zustand-persistence`
  - Dependencies: TASK-017, TASK-018
  - Persist settings and reading progress

### Epic 6: UI Components
- [ ] **TASK-020:** Create AppLayout component
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/app-layout`
  - File: `src/components/layout/AppLayout.tsx`
  - Notion-style: sidebar + canvas + top tabs

- [ ] **TASK-021:** Create PDFViewer component
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/pdf-viewer`
  - Dependencies: TASK-011, TASK-014, TASK-017
  - File: `src/components/pdf/PDFViewer.tsx`
  - Render pages using virtual scrolling

- [ ] **TASK-022:** Create PDFCanvas component
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/pdf-canvas`
  - Dependencies: TASK-015
  - File: `src/components/pdf/PDFCanvas.tsx`
  - Render individual PDF pages

- [ ] **TASK-023:** Create PDFToolbar component
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/pdf-toolbar`
  - File: `src/components/pdf/PDFToolbar.tsx`
  - Features: zoom in/out, navigation, page counter

- [ ] **TASK-024:** Create PDFSidebar component
  - Complexity: M
  - Priority: High
  - Branch: `feat/pdf-sidebar`
  - File: `src/components/pdf/PDFSidebar.tsx`
  - Features: thumbnails, bookmarks placeholder

### Epic 7: Core Features
- [ ] **TASK-025:** Implement zoom functionality
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/zoom-controls`
  - Dependencies: TASK-017, TASK-021
  - Zoom levels: 50%, 75%, 100%, 125%, 150%, 200%

- [ ] **TASK-026:** Implement page navigation
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/page-navigation`
  - Dependencies: TASK-017, TASK-021
  - Next/previous page, jump to page

- [ ] **TASK-027:** Implement PDF search
  - Complexity: M
  - Priority: High
  - Branch: `feat/pdf-search`
  - Dependencies: TASK-011
  - Text search across all pages

- [ ] **TASK-028:** Implement file open dialog
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/file-open`
  - Use Tauri dialog API

### Epic 8: Rust Backend - Basic Commands
- [ ] **TASK-029:** Create load_pdf Tauri command
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/tauri-load-pdf`
  - File: `src-tauri/src/commands/pdf.rs`
  - Open file, return metadata

- [ ] **TASK-030:** Add Cargo dependencies
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/rust-dependencies`
  - Add: serde, tokio, anyhow

### Epic 9: Performance & Polish
- [ ] **TASK-031:** Implement loading indicators
  - Complexity: S
  - Priority: High
  - Branch: `feat/loading-indicators`
  - Show progress for PDF loading

- [ ] **TASK-032:** Add error boundaries
  - Complexity: M
  - Priority: High
  - Branch: `feat/error-boundaries`
  - Graceful error handling for PDF loading failures

- [ ] **TASK-033:** Performance optimization - render timing
  - Complexity: M
  - Priority: High
  - Branch: `perf/render-timing`
  - Target: < 50ms per page render

- [ ] **TASK-034:** Memory optimization
  - Complexity: M
  - Priority: High
  - Branch: `perf/memory-optimization`
  - Target: < 150MB for 100-page PDF

### Epic 10: Testing & Release
- [ ] **TASK-035:** Write unit tests for PDFService
  - Complexity: M
  - Priority: High
  - Branch: `test/pdf-service`

- [ ] **TASK-036:** Write tests for virtual scrolling
  - Complexity: M
  - Priority: High
  - Branch: `test/virtual-scroll`

- [ ] **TASK-037:** Test with large PDFs (1000+ pages)
  - Complexity: L
  - Priority: Critical
  - Branch: `test/large-pdf-performance`

- [ ] **TASK-038:** Create v0.0.1 release
  - Complexity: S
  - Priority: Critical
  - Create GitHub release, tag v0.0.1

---

## v0.0.2 - Text-to-Speech & Synchronized Reading (Weeks 3-4)

**Milestone Goal:** Add TTS with synchronized word-level highlighting that tracks user's reading pace.

### Epic 11: TTS Foundation
- [ ] **TASK-039:** Create TTSService class
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/tts-service`
  - File: `src/services/ttsService.ts`
  - Use Web Speech API

- [ ] **TASK-040:** Create aiStore (Zustand)
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/ai-store`
  - File: `src/stores/aiStore.ts`
  - State: isSpeaking, currentWordIndex, ttsVoice, ttsSpeed

- [ ] **TASK-041:** Implement voice selection
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/voice-selection`
  - Support 20+ languages, country-specific accents

### Epic 12: Synchronized Highlighting
- [ ] **TASK-042:** Create TTSHighlight component
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/tts-highlight`
  - File: `src/components/ai/TTSHighlight.tsx`
  - Dual-mode: sentence + word highlighting

- [ ] **TASK-043:** Implement word-boundary tracking
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/word-boundary`
  - Use SpeechSynthesisUtterance.onboundary

- [ ] **TASK-044:** Sync with user reading pace
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/reading-sync`
  - Pause when user pauses, advance on speech

### Epic 13: TTS Controls
- [ ] **TASK-045:** Create TTSControl component
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/tts-controls`
  - Play/pause, stop, speed control

- [ ] **TASK-046:** Implement variable speed (0.5x-2x)
  - Complexity: S
  - Priority: High
  - Branch: `feat/tts-speed`

- [ ] **TASK-047:** Add reading progress tracking
  - Complexity: M
  - Priority: Medium
  - Branch: `feat/reading-progress`

### Epic 14: Testing & Release
- [ ] **TASK-048:** Test TTS with various languages
  - Complexity: M
  - Priority: High

- [ ] **TASK-049:** Create v0.0.2 release
  - Complexity: S
  - Priority: Critical

---

## v0.1.0 - Pronunciation Checker & Practice Mode (Weeks 5-8)

**Milestone Goal:** Real-time pronunciation checking with Whisper model integration.

### Epic 15: Model Management System
- [ ] **TASK-050:** Create ModelManager in Rust
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/model-manager`
  - File: `src-tauri/src/services/model_manager.rs`
  - Download models with progress tracking

- [ ] **TASK-051:** Implement model storage
  - Complexity: M
  - Priority: Critical
  - Windows: %APPDATA%, macOS: ~/Library, Linux: ~/.local/share

- [ ] **TASK-052:** Create download UI
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/model-downloader-ui`
  - File: `src/components/ai/ModelDownloader.tsx`

### Epic 16: Whisper Integration
- [ ] **TASK-053:** Add whisper-rs dependency
  - Complexity: S
  - Priority: Critical
  - Branch: `feat/whisper-dependency`

- [ ] **TASK-054:** Create WhisperService
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/whisper-service`
  - File: `src-tauri/src/services/whisper_service.rs`

- [ ] **TASK-055:** Implement audio recording
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/audio-recording`
  - Use MediaRecorder API

### Epic 17: Pronunciation Checking
- [ ] **TASK-056:** Create PronunciationChecker component
  - Complexity: L
  - Priority: Critical
  - Branch: `feat/pronunciation-checker`
  - File: `src/components/ai/PronunciationChecker.tsx`

- [ ] **TASK-057:** Implement correction popup
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/correction-popup`
  - Show: pronunciation (3x), meaning (1x), translation

- [ ] **TASK-058:** Add pronunciation comparison
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/pronunciation-comparison`
  - Levenshtein distance algorithm

### Epic 18: Practice Mode
- [ ] **TASK-059:** Create practice mode UI
  - Complexity: M
  - Priority: High
  - Branch: `feat/practice-mode`

- [ ] **TASK-060:** Implement word marking
  - Complexity: S
  - Priority: High
  - Branch: `feat/word-marking`

- [ ] **TASK-061:** Create SQLite schema
  - Complexity: M
  - Priority: Critical
  - Branch: `feat/sqlite-schema`
  - Tables: documents, reading_progress, annotations, practice_words

### Epic 19: Testing & Release
- [ ] **TASK-062:** Test Whisper accuracy
  - Complexity: L
  - Priority: Critical

- [ ] **TASK-063:** Create v0.1.0 release
  - Complexity: S
  - Priority: Critical

---

## v0.2.0 - Translation, OCR & Chat (Weeks 9-14)

### Epic 20: Translation System
- [ ] **TASK-064:** Install translation model (NLLB-200)
- [ ] **TASK-065:** Create TranslationService (Rust)
- [ ] **TASK-066:** Implement inline translation
- [ ] **TASK-067:** Implement page-by-page translation
- [ ] **TASK-068:** Add full document translation

### Epic 21: OCR Integration
- [ ] **TASK-069:** Add PaddleOCR dependency
- [ ] **TASK-070:** Create OCRService (Rust)
- [ ] **TASK-071:** Implement scanned PDF detection
- [ ] **TASK-072:** Create OCR progress UI

### Epic 22: RAG-Based Chat
- [ ] **TASK-073:** Implement text chunking
- [ ] **TASK-074:** Create vector embeddings
- [ ] **TASK-075:** Build ChatPanel component
- [ ] **TASK-076:** Add citation support
- [ ] **TASK-077:** Implement conversation history

### Epic 23: Cloud Sync
- [ ] **TASK-078:** Setup Supabase integration
- [ ] **TASK-079:** Create syncStore
- [ ] **TASK-080:** Implement offline-first sync
- [ ] **TASK-081:** Add API key management (OS keychain)

### Epic 24: Testing & Release
- [ ] **TASK-082:** Test translation accuracy
- [ ] **TASK-083:** Test OCR on scanned PDFs
- [ ] **TASK-084:** Test chat responses
- [ ] **TASK-085:** Create v0.2.0 release

---

## v0.3.0 - Editing, Mind Maps & NotebookLM (Weeks 15-20)

### Epic 25: Annotation System
- [ ] **TASK-086:** Implement highlighting tool
- [ ] **TASK-087:** Add sticky notes
- [ ] **TASK-088:** Create drawing tools
- [ ] **TASK-089:** Implement bookmarks

### Epic 26: PDF Editing
- [ ] **TASK-090:** Text editing capability
- [ ] **TASK-091:** Page add/remove
- [ ] **TASK-092:** Image insertion
- [ ] **TASK-093:** Form filling
- [ ] **TASK-094:** PDF merge/split

### Epic 27: Mind Map Generator
- [ ] **TASK-095:** Create MindMapGenerator component
- [ ] **TASK-096:** Implement hierarchy extraction
- [ ] **TASK-097:** Add interactive navigation
- [ ] **TASK-098:** Export to PNG/SVG/PDF/Markdown

### Epic 28: NotebookLM Features
- [ ] **TASK-099:** Generate audio summary (2 AI hosts)
- [ ] **TASK-100:** Create animated presentation
- [ ] **TASK-101:** Implement on-demand generation
- [ ] **TASK-102:** Add caching system

### Epic 29: Testing & Release
- [ ] **TASK-103:** Test editing features
- [ ] **TASK-104:** Test mind map generation
- [ ] **TASK-105:** Test NotebookLM features
- [ ] **TASK-106:** Create v0.3.0 release

---

## v1.0.0 - Stable Release (Weeks 21-24)

### Epic 30: Windows Installer
- [ ] **TASK-107:** Create NSIS script
- [ ] **TASK-108:** Implement file association
- [ ] **TASK-109:** Test default PDF app setup

### Epic 31: Cross-Platform Installers
- [ ] **TASK-110:** Create macOS installer
- [ ] **TASK-111:** Create Linux Snap package
- [ ] **TASK-112:** Setup GitHub Actions CI/CD

### Epic 32: Performance Optimization
- [ ] **TASK-113:** Profile and optimize rendering
- [ ] **TASK-114:** Reduce memory footprint
- [ ] **TASK-115:** Optimize bundle size

### Epic 33: Documentation & Marketing
- [ ] **TASK-116:** Create user documentation
- [ ] **TASK-117:** Record demo videos
- [ ] **TASK-118:** Prepare launch materials

### Epic 34: Final Testing & Release
- [ ] **TASK-119:** Comprehensive testing on Windows/macOS/Linux
- [ ] **TASK-120:** Fix critical bugs
- [ ] **TASK-121:** Create v1.0.0 release
- [ ] **TASK-122:** Publish to package managers

---

## Branch Naming Convention

- `feat/<feature-name>` - New features
- `fix/<bug-description>` - Bug fixes
- `perf/<optimization-name>` - Performance improvements
- `refactor/<refactor-name>` - Code refactoring
- `test/<test-name>` - Adding tests
- `chore/<task-name>` - Tooling, configuration
- `docs/<doc-update>` - Documentation (only for README/AGENT/CONTRIBUTION)

## Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:
```
feat(pdf): implement virtual scrolling with canvas pooling

Add useVirtualScroll hook that renders only visible pages plus overscan.
Implement canvas pooling to reuse canvas elements and reduce memory usage.

Closes #14
```

## Pull Request Workflow

1. Create feature branch from `main`
2. Implement task (NO CODE COMMENTS)
3. Write tests
4. Run linters: `bun run lint && cd src-tauri && cargo clippy`
5. Commit with conventional message
6. Push to origin
7. Create PR with detailed description
8. Link related tasks/issues
9. Wait for CI checks
10. Request review
11. Address feedback
12. Merge to `main`
13. Delete feature branch

## Version Tagging

After completing a milestone:
```bash
git tag -a v0.0.1 -m "Release v0.0.1 - Core PDF Viewer"
git push origin v0.0.1
```

Create GitHub Release with changelog.

---

**Note:** This task list is comprehensive and will be refined as development progresses. Tasks may be added, removed, or reprioritized based on learnings and user feedback.
