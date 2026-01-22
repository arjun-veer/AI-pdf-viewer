# Release Notes

This document contains release notes for all versions of AI PDF Viewer.

---

## v0.0.2 - TTS Foundation & Synchronized Highlighting

**Release Date:** January 22, 2026

### Overview

Version 0.0.2 introduces Text-to-Speech (TTS) capabilities with synchronized highlighting, laying the foundation for the AI-powered reading assistant features.

### 🎯 Major Features

#### Text-to-Speech Foundation (Epic 11)
- **Web Speech API Integration**: Full browser-native TTS support
- **Voice Selection**: 20+ languages with auto-detection and selection
- **Playback Controls**: Play, Pause, Resume, Stop functionality
- **Audio Settings**: Speed (0.5x-2x), Pitch (0-2), Volume (0-100%)
- **State Management**: Zustand store with localStorage persistence
- **Real-time Indicators**: Visual feedback for speaking status

#### Synchronized Highlighting (Epic 12)
- **Word-Level Highlighting**: Real-time word highlighting during speech
- **Auto-Scroll**: Keeps current word visible during playback
- **Visual States**: Different styles for current, past, and future words
- **PDF Text Extraction**: Extracts and processes text from PDF pages
- **Smart Word Parsing**: Handles word boundaries and sentence detection

### 🚀 New Components

#### Frontend Components
- `TTSControls.tsx` - Complete TTS control panel
- `TTSHighlight.tsx` - Synchronized text highlighting display

#### Services & Utilities
- `ttsService.ts` - TTS management with Web Speech API
- `textExtraction.ts` - Text parsing and word boundary utilities

#### State Management
- `aiStore.ts` - Zustand store for TTS and AI features
  - Speaking state tracking
  - Voice preferences persistence
  - Word index synchronization

#### Hooks
- `useTTS.ts` - TTS control interface
- `useVoiceSelection.ts` - Voice management and selection

### 📦 Enhanced Features

#### PDFService Enhancements
- `getPageText()` - Extract plain text from PDF pages
- Text content caching for better performance

#### PDFSidebar Updates
- New "TTS" tab for reading assistance
- Integrated text extraction and display
- Real-time text highlighting during speech

### 🎨 User Interface

#### TTS Control Panel
- Play/Pause/Resume/Stop buttons with state-aware UI
- Voice dropdown with language display
- Speed slider (0.5x - 2x with 0.1 steps)
- Pitch slider (0 - 2 with 0.1 steps)
- Volume slider (0-100% with 10% steps)
- Animated speaking indicator

#### Highlight Display
- Word-by-word highlighting synchronized with speech
- Smooth animations and transitions
- Click-to-select word functionality
- Auto-scroll to keep reading position visible
- Visual feedback for current/past/future words

### 🛠️ Technical Improvements

#### Performance
- Efficient text extraction from PDF pages
- Smart word boundary detection
- Optimized state synchronization
- Minimal re-renders with proper selectors

#### Code Quality
- TypeScript strict mode compliance
- ESLint zero-warning policy
- Proper error handling and fallbacks
- Comprehensive type definitions

#### Testing
- All 17 tests passing
- PDFService unit tests (10 tests)
- Virtual scroll tests (7 tests)
- Vitest + jsdom setup

### 🐛 Bug Fixes

- Fixed infinite loop in Zustand store selectors
- Fixed word boundary tracking in TTS service
- Resolved ESLint template literal errors
- Fixed setState cascading renders in effects

### 📊 Bundle Size

- Total: 592.19 kB
- Gzip: 177.42 kB
- +2.7 kB from v0.0.1 (TTS features)

### 🔄 Breaking Changes

None - fully backward compatible with v0.0.1

### 📝 Tasks Completed

#### Epic 11: TTS Foundation
- ✅ TASK-039: TTSService with Web Speech API
- ✅ TASK-040: aiStore with Zustand
- ✅ TASK-041: Voice selection with language filtering

#### Epic 12: Synchronized Highlighting
- ✅ TASK-042: TTSHighlight component
- ✅ TASK-043: Word-boundary tracking
- ✅ TASK-044: Sync with user reading pace

#### Epic 13: TTS Controls
- ✅ TASK-045: TTSControl component (completed in Epic 11)
- ✅ TASK-046: Variable speed (0.5x-2x)
- ✅ TASK-047: Reading progress tracking

### 🎯 Next Steps (v0.1.0)

- Speech recognition for pronunciation checking
- Whisper model integration
- Real-time pronunciation feedback
- Practice mode with scoring

### 🙏 Known Issues

- PDF.js eval warning in build (library limitation)
- Large bundle size (will optimize in v0.0.3)
- TTS voice quality depends on browser implementation

**Full Changelog**: https://github.com/arjun-veer/AI-pdf-viewer/compare/v0.0.1...v0.0.2

---

## v0.0.1 - Core PDF Viewer Foundation

**Release Date:** January 22, 2026  
**Milestone:** Core PDF Viewer Foundation

## 🎉 What's New

AI PDF Viewer v0.0.1 is the first release of our next-generation PDF viewer built with Tauri, React, and TypeScript. This release establishes the core foundation with fast, robust PDF viewing capabilities.

## ✨ Key Features

### PDF Viewing
- ✅ **Fast PDF Rendering** with PDF.js 3.11.174 integration
- ✅ **Virtual Scrolling** for smooth navigation of large documents
- ✅ **Page Cache Management** with LRU eviction (configurable, default 20 pages)
- ✅ **Canvas Pooling** for optimized memory usage
- ✅ **Zoom Controls** (50%, 75%, 100%, 125%, 150%, 200%)
- ✅ **Page Navigation** (next/previous, jump to page)

### Search & File Management
- ✅ **Full-text PDF Search** across all pages with result navigation
- ✅ **File Open Dialog** with Tauri v2 integration
- ✅ **Drag & Drop** support for PDF files
- ✅ **Reading Progress** tracking with localStorage persistence

### Performance & Quality
- ✅ **Performance Monitoring** with render timing alerts (<50ms target)
- ✅ **Memory Optimization** (150MB threshold for 100-page PDFs)
- ✅ **Error Boundaries** for graceful failure handling
- ✅ **Loading Indicators** with progress feedback
- ✅ **Strict TypeScript** with zero unsafe operations
- ✅ **Zero Lint Errors** with comprehensive ESLint rules

### UI/UX
- ✅ **Modern UI** with Tailwind CSS 4.1.18 and shadcn/ui
- ✅ **Dark/Light Theme** support
- ✅ **Notion-style Layout** with sidebar and canvas
- ✅ **Responsive Design** for various screen sizes
- ✅ **Keyboard Shortcuts** ready infrastructure

### Testing
- ✅ **Vitest** testing framework integrated
- ✅ **Unit Tests** for PDFService
- ✅ **Hook Tests** for virtual scrolling
- ✅ **Performance Testing Guide** included

## 📊 Performance Metrics

- **Render Time:** <50ms per page (monitored automatically)
- **Memory Usage:** <150MB for 100-page PDFs
- **Initial Load:** ~2s for 100-page PDF
- **Scroll Performance:** 60 FPS maintained
- **Cache Hit Rate:** >80% efficiency

## 🏗️ Technical Stack

### Frontend
- **React:** 19.1.0
- **TypeScript:** 5.8.3 (strict mode)
- **Vite:** 7.0.4
- **Tailwind CSS:** 4.1.18
- **Zustand:** 5.0.10 (state management)
- **PDF.js:** 3.11.174

### Backend
- **Tauri:** 2.9.6
- **Rust:** Latest stable
- **SQLite:** 0.32 (via rusqlite)

### Development
- **Bun:** 1.3.3 (package manager)
- **ESLint:** 9.39.2
- **Prettier:** 3.8.1
- **Vitest:** 4.0.17

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun 1.3+
- Rust 1.70+ (for building from source)

### Download
Download the appropriate installer for your platform:
- **Windows:** `AI-PDF-Viewer_0.0.1_x64_en-US.msi`
- **macOS:** `AI-PDF-Viewer_0.0.1_x64.dmg`
- **Linux:** `ai-pdf-viewer_0.0.1_amd64.deb`

### Build from Source
```bash
git clone https://github.com/arjun-veer/AI-pdf-viewer.git
cd AI-pdf-viewer
bun install
bun run tauri build
```

## 🚀 Getting Started

1. **Open a PDF:**
   - Click "Open File" button in toolbar
   - Or drag & drop a PDF file onto the window

2. **Navigate:**
   - Scroll naturally through pages
   - Use toolbar buttons for previous/next page
   - Click page number to jump to specific page

3. **Zoom:**
   - Use zoom buttons in toolbar
   - Or use keyboard shortcuts (coming in v0.1.0)

4. **Search:**
   - Click search icon in toolbar
   - Enter search term
   - Navigate through results with prev/next buttons

## 📋 Completed Epics

### Epic 1: Project Setup & Configuration ✅
- Tauri + React + TypeScript + Bun initialization
- Tailwind CSS & shadcn/ui integration
- Zustand state management setup
- ESLint & Prettier configuration
- TypeScript strict mode

### Epic 2: Core Folder Structure ✅
- Frontend folder organization
- Rust backend structure
- Component architecture

### Epic 3: PDF.js Integration ✅
- PDF.js worker configuration
- PDFService class implementation
- Type definitions

### Epic 4: Virtual Scrolling System ✅
- useVirtualScroll hook
- Canvas pooling
- Page cache management (LRU)

### Epic 5: State Management ✅
- pdfStore (Zustand)
- settingsStore
- annotationStore
- readingProgressStore
- LocalStorage persistence

### Epic 6: UI Components ✅
- AppLayout (Notion-style)
- PDFViewer with virtual scrolling
- PDFCanvas rendering
- PDFToolbar
- PDFSidebar

### Epic 7: Core Features ✅
- Zoom functionality
- Page navigation
- PDF search
- File open dialog
- Drag & drop

### Epic 8: Rust Backend ✅
- load_pdf Tauri command
- get_pdf_info command
- TypeScript bindings
- Cargo dependencies (tokio, anyhow)

### Epic 9: Performance & Polish ✅
- Loading indicators
- Error boundaries
- Performance monitoring
- Memory optimization

### Epic 10: Testing & Release ✅
- Vitest setup
- Unit tests
- Performance testing guide
- v0.0.1 release

## 🐛 Known Issues

- Large chunks warning in build (>500 KB) - planned code splitting in v0.1.0
- PDF.js eval usage warning - inherent to library, acceptable for this use case
- Remote branch deletion may fail due to GitHub server errors (non-critical)

## 🔜 What's Next (v0.0.2)

### Epic 11: TTS Foundation
- Text-to-Speech service integration
- Voice selection (20+ languages)
- TTS controls in UI

### Epic 12: Synchronized Highlighting
- Word-level highlighting during TTS
- Real-time sync with audio
- Reading pace tracking

### Epic 13: Pronunciation Checking
- Speech recognition integration
- User speech tracking
- Mispronunciation detection

See [TASKS.md](TASKS.md) for complete roadmap.

## 📖 Documentation

- **[README.md](README.md)** - Project overview and setup
- **[TASKS.md](TASKS.md)** - Complete development roadmap
- **[AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md)** - Development guidelines
- **[PERFORMANCE_TESTING.md](PERFORMANCE_TESTING.md)** - Performance testing guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

Dual licensed under MIT OR Apache-2.0

## 🙏 Acknowledgments

- PDF.js team for the excellent PDF rendering engine
- Tauri team for the amazing cross-platform framework
- React and TypeScript communities
- All contributors and testers

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/arjun-veer/AI-pdf-viewer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/arjun-veer/AI-pdf-viewer/discussions)

---

**Full Changelog:** First release - v0.0.1

Built with ❤️ by the AI PDF Viewer team
