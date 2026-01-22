# AI PDF Viewer - User Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [AI Features](#ai-features)
4. [Annotation & Editing](#annotation--editing)
5. [Settings & Configuration](#settings--configuration)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

**Windows:**
1. Download `AI-PDF-Viewer-Setup.exe`
2. Run the installer
3. Choose whether to set as default PDF viewer
4. Launch from Start Menu or Desktop

**macOS:**
1. Download `AI-PDF-Viewer.dmg`
2. Open the DMG file
3. Drag AI PDF Viewer to Applications
4. Launch from Applications folder

**Linux:**
```bash
# Ubuntu/Debian
sudo snap install ai-pdf-viewer

# Or download .deb
sudo dpkg -i ai-pdf-viewer_1.0.0_amd64.deb
```

### First Time Setup

1. Open AI PDF Viewer
2. Click "Open PDF" or drag-and-drop a PDF file
3. (Optional) Configure AI features in Settings

---

## Core Features

### PDF Viewing
- **Virtual Scrolling**: Smooth navigation through large documents
- **Zoom Controls**: Fit to width, fit to page, custom zoom
- **Page Navigation**: Jump to page, thumbnails, bookmarks
- **Search**: Find text within the document
- **Dark Mode**: Eye-friendly reading at night

### File Management
- Open local PDF files
- Recent files history
- Document information display
- Print support

---

## AI Features

### Translation (v0.2.0+)
Translate PDF text into 20+ languages:

1. **Inline Translation**
   - Select text with your mouse
   - Click "Translate" in the toolbar
   - Choose target language
   - View translation in popup

2. **Page Translation**
   - Click "Translate Page" button
   - Select target language
   - View side-by-side translation

3. **Document Translation**
   - Go to Translation panel
   - Click "Translate Document"
   - Export translated version

**Supported Languages:**
English, Spanish, French, German, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Portuguese, Italian, Dutch, Polish, Turkish, Ukrainian, Vietnamese, Thai, Hebrew, Indonesian

### OCR (Optical Character Recognition)
Extract text from scanned PDFs:

1. Open a scanned PDF
2. System auto-detects scanned pages
3. Click "Extract Text" to perform OCR
4. Copy or save extracted text

**Features:**
- 80+ language support
- Automatic orientation detection
- Layout preservation
- Confidence scoring

### RAG-Based Chat
Chat with your PDF using AI:

1. Open Chat panel (sidebar)
2. Type your question about the document
3. AI provides context-aware answers
4. Click citations to jump to source pages

**Example Questions:**
- "Summarize the main points"
- "What does section 3 discuss?"
- "Find information about [topic]"

### Text-to-Speech (TTS)
Listen to your PDF:

1. Click the speaker icon
2. Adjust speed and voice
3. Follow along with synchronized highlighting
4. Use pause/resume controls

**Features:**
- Multiple voices
- Speed control (0.5x - 2x)
- Synchronized word highlighting
- Auto-scroll following

### Pronunciation Checking (v0.1.0+)
Practice pronunciation:

1. Select text to practice
2. Click "Check Pronunciation"
3. Record yourself reading
4. View feedback and score
5. Practice difficult words

### Practice Mode
Improve reading fluency:

1. Enable Practice Mode
2. Read highlighted sentences
3. System tracks progress
4. View statistics and history

---

## Annotation & Editing

### Annotations (v0.3.0+)

**Highlighting:**
1. Select text
2. Choose highlight color
3. Add optional notes

**Sticky Notes:**
1. Click Note tool
2. Click on page
3. Type your note

**Drawing:**
1. Select Draw tool
2. Draw on the page
3. Adjust stroke color/width

**Bookmarks:**
1. Click Bookmark tool
2. Name your bookmark
3. Quick navigation from sidebar

### PDF Editing (v0.3.0+)

**Text Editing:**
- Add text boxes to pages
- Edit existing text (limited)
- Change font, size, color

**Page Management:**
- Add blank pages
- Remove pages
- Reorder pages
- Rotate pages

**Image Insertion:**
- Insert images into PDF
- Resize and position
- Maintain quality

**Form Filling:**
- Fill text fields
- Check checkboxes
- Select dropdown options
- Sign documents

**Merge/Split:**
- Combine multiple PDFs
- Split PDF at specific pages
- Export individual pages

### Mind Map Generation (v0.3.0+)
Visualize document structure:

1. Click "Generate Mind Map"
2. AI extracts hierarchy
3. Explore interactive map
4. Export as PNG/SVG/Markdown

**Use Cases:**
- Quick document overview
- Study aid for textbooks
- Research paper navigation
- Meeting notes organization

### NotebookLM Features (v0.3.0+)

**Audio Summary:**
1. Click "Generate Audio"
2. AI creates 2-host conversation
3. Listen to document summary
4. Download MP3 file

**Animated Presentation:**
1. Click "Generate Presentation"
2. AI creates slide deck
3. Review and customize
4. Export or present

---

## Settings & Configuration

### General Settings
- Default zoom level
- Page layout (single/continuous)
- Scroll direction
- Theme (light/dark/auto)

### AI Settings
- Translation: Source/target languages
- TTS: Voice selection, speed
- OCR: Language preference
- Chat: Model selection

### Cloud Sync (v0.2.0+)
- Connect Supabase account
- Sync annotations across devices
- Offline-first architecture
- Conflict resolution

### Privacy
- All processing is local by default
- Cloud features are optional
- API keys stored in OS keychain
- Data never shared without consent

---

## Troubleshooting

### PDF Won't Open
- Ensure file is a valid PDF
- Check file permissions
- Try re-downloading if from web
- Check for PDF encryption

### OCR Not Working
- Verify page is actually scanned
- Check language settings
- Ensure sufficient image quality
- Try manual OCR trigger

### Translation Errors
- Check internet connection (if using cloud API)
- Verify target language is supported
- Try shorter text selections
- Clear translation cache in settings

### Performance Issues
- Close unused panels
- Reduce page overscan in settings
- Clear annotation history
- Restart application

### Cloud Sync Issues
- Verify internet connection
- Check Supabase credentials
- Review sync status in settings
- Try manual sync trigger

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| Open File | Ctrl+O | Cmd+O |
| Close File | Ctrl+W | Cmd+W |
| Print | Ctrl+P | Cmd+P |
| Zoom In | Ctrl++ | Cmd++ |
| Zoom Out | Ctrl+- | Cmd+- |
| Fit to Width | Ctrl+0 | Cmd+0 |
| Next Page | Page Down | Page Down |
| Previous Page | Page Up | Page Up |
| Find | Ctrl+F | Cmd+F |
| TTS Play/Pause | Ctrl+Shift+S | Cmd+Shift+S |

---

## Support

- GitHub Issues: https://github.com/arjun-veer/AI-pdf-viewer/issues
- Documentation: https://aipdfviewer.com/docs
- Email: support@aipdfviewer.com

---

## Changelog

See [RELEASE_NOTES.md](RELEASE_NOTES.md) for version history.
