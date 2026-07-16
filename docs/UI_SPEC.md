# UI Specification: Notion-Like PDF Viewer (Tauri App)

---

## 1. Overall Layout Architecture

The app uses a **three-panel layout** similar to Notion:

```
┌──────────────────────────────────────────────────────────┐
│  Title Bar (custom, frameless)                           │
├───────────┬──────────────────────────┬───────────────────┤
│           │     Top Toolbar          │                   │
│  Sidebar  ├──────────────────────────┤   Notes / Side    │
│  (Left)   │                          │   Panel (Right)   │
│           │    PDF Viewer (Center)   │                   │
└───────────┴──────────────────────────┴───────────────────┘
```

- **Left Sidebar**: ~240px wide, collapsible
- **Center Panel**: Flexible, takes remaining space
- **Right Panel**: ~320px wide, collapsible, shows notes/annotations

---

## 2. Custom Title Bar

Since it's a Tauri app with a frameless window:

- **Height**: 40px
- **Left side**: App logo icon (16px) + App name "PaperMind" (or your brand)
- **Center**: Current file breadcrumb — `Library > Folder Name > filename.pdf`
- **Right side**: Window controls — Minimize, Maximize, Close (custom styled, not OS native)
- **Drag region**: The entire title bar is draggable to move the window
- **Background**: Same color as sidebar (`#191919` in dark mode)

---

## 3. Left Sidebar

### 3a. Sidebar Header

- **Workspace switcher** at top: Shows workspace name + avatar/icon, clicking opens a dropdown to switch or create workspaces
- Below it: **Search button** (full width, like Notion) — shortcut `Cmd/Ctrl+K` — opens a command palette

### 3b. Sidebar Navigation Items (top section)

Vertical list of icon + label items:

| Icon | Label | Action |
|------|-------|--------|
| 🔍 | Search | Opens command palette |
| 🏠 | Home | Recently opened files |
| 📥 | Inbox | Annotations & comments |
| ⚙️ | Settings | App settings page |

### 3c. Library Section

- Section header: `LIBRARY` in small uppercase muted text, with a `+` icon on the right to add a new folder or import PDF
- **Tree view** of folders and PDF files
  - Folders are collapsible (triangle/chevron toggle on hover)
  - Each PDF item shows: PDF icon + filename (truncated with ellipsis)
  - Active/open file is highlighted with a soft background tint
  - Hover state: shows a `...` (three-dot menu) on the right for Rename, Move, Delete, Copy Link
- Drag-and-drop support to reorganize files/folders

### 3d. Sidebar Footer

- Small section at bottom with:
  - User avatar (circle) + display name
  - Clicking opens a mini-menu: Account Settings, Sign Out, Theme Toggle

### 3e. Sidebar Collapse

- A thin toggle button on the right edge of the sidebar (arrow icon)
- When collapsed, sidebar shrinks to **48px** showing only icons (tooltip on hover)
- Smooth CSS transition (200ms ease)

---

## 4. Top Toolbar (Center Panel Header)

Fixed bar above the PDF viewer, ~44px tall:

**Left group:**
- Sidebar toggle button (hamburger/panel icon)
- Breadcrumb: `Folder / filename.pdf` — folder part is clickable to navigate

**Center group:**
- Page input: `[ 4 ] / 128` — click the number to type a page number, press Enter to jump
- Prev/Next page arrows

**Right group:**
- Zoom controls: `−` | `75%` (dropdown with preset values: 50%, 75%, 100%, 125%, 150%, 200%, Fit Width, Fit Page) | `+`
- View mode toggle: Single Page / Double Page / Continuous Scroll (icon group, like a segmented control)
- Rotate button (clockwise)
- Fullscreen toggle
- Search in PDF button (magnifier icon) — opens a floating search bar below toolbar
- Annotation toolbar toggle (pencil icon) — expands annotation tools
- Share/Export button

---

## 5. PDF Viewer (Center Panel)

- **Background**: Dark gray `#1a1a1a` (dark mode) or light gray `#f5f5f5` (light mode) — the "canvas" behind the PDF pages
- **PDF pages** render as white/cream rectangles centered in the canvas with a soft drop shadow
- **Scrollbar**: Custom thin scrollbar on the right edge, auto-hides
- **Page gap**: ~16px spacing between pages in continuous scroll mode

### 5a. Text Selection

- When user selects text, a **floating tooltip** appears above the selection with actions:
  - 🖍 Highlight (yellow by default)
  - 💬 Comment
  - 📋 Copy
  - 🔗 Copy Link to selection
  - Color swatches: Yellow, Green, Blue, Pink, Purple

### 5b. Annotation Toolbar (expands below top toolbar)

When annotation mode is active, shows a secondary bar:

- Draw / Pen tool
- Highlighter tool
- Shapes: Rectangle, Circle, Arrow, Line
- Text box
- Sticky note / comment pin
- Eraser
- Color picker
- Stroke width selector
- Undo / Redo

### 5c. Annotation Overlays

- Highlights render as translucent colored overlays on text
- Comments show as small colored pins in the margin; hovering shows a preview bubble; clicking opens the comment in the right panel
- Drawing strokes render as SVG overlays on the page

---

## 6. Right Panel (Notes & Annotations)

This is the **Notion-like** feature — a block-based notes panel tied to the open PDF.

### 6a. Panel Header

- Title: "Notes" with an editable page title below (click to edit, like Notion)
- Tabs: `Annotations` | `Notes` | `Outline`

### 6b. Annotations Tab

- List of all highlights and comments, grouped by page
- Each item shows:
  - Page number badge (e.g., `p.12`)
  - Highlight color dot
  - Quoted text snippet (truncated)
  - Comment text below (if any)
  - Timestamp (relative: "2 hours ago")
- Clicking an annotation scrolls the PDF to that location

### 6c. Notes Tab (Notion-like Block Editor)

- A **block-based rich text editor** (like Notion's editor) where users can write notes alongside the PDF
- Supported block types:
  - Paragraph
  - Heading 1, 2, 3
  - Bullet list
  - Numbered list
  - Toggle/collapsible block
  - Quote block
  - Divider
  - Code block
  - Callout block (with emoji icon)
  - **PDF Reference block** — drag a page or selection from the PDF to embed a mini thumbnail + link to that page
- Typing `/` opens a **slash command menu** to insert block types (exactly like Notion)
- Each block shows a drag handle (`⠿`) and `+` button on hover (left side)

### 6d. Outline Tab

- Auto-generated from PDF bookmarks/headings
- Nested tree view of the PDF's table of contents
- Clicking an entry navigates to that page
- If PDF has no bookmarks, shows "No outline available"

---

## 7. Command Palette (`Cmd/Ctrl+K`)

Full-screen dimmed overlay with a centered search input:

- Placeholder: "Search files, jump to page, run a command..."
- Results grouped into sections: `Recent Files`, `Commands`, `Annotations`
- Keyboard navigable (arrow keys + Enter)
- Commands include: Open File, New Note, Toggle Dark Mode, Export PDF, Go to Page, etc.

---

## 8. Settings Page

Opens as a full panel replacing the center content (like Notion settings modal):

**Left nav categories:**
- General
- Appearance
- PDF Viewer
- Annotations
- Keyboard Shortcuts
- About

**General**: Default folder, Auto-open last file, Language

**Appearance**:
- Theme: Light / Dark / System (three cards with previews)
- Font size for notes editor
- Sidebar width default
- Accent color picker (6 preset colors)

**PDF Viewer**:
- Default zoom level
- Default view mode
- Scroll direction
- Show/hide page numbers overlay
- Enable smooth scrolling

---

## 9. Design Tokens (Dark Mode as Default)

```
Background base:       #191919  (sidebar, title bar)
Background elevated:   #212121  (right panel, modals)
PDF canvas bg:         #161616
Surface:               #2a2a2a  (cards, hover states)
Border:                #333333
Text primary:          #E8E8E6
Text secondary:        #9B9A97
Text muted:            #6B6B6B
Accent:                #4A9EFF  (active states, links)
Highlight yellow:      rgba(255, 212, 0, 0.35)
Highlight green:       rgba(79, 198, 100, 0.35)
Highlight blue:        rgba(74, 158, 255, 0.35)
Highlight pink:        rgba(255, 101, 149, 0.35)
Danger:                #FF4C4C
Font (UI):             'Geist' or 'DM Sans'
Font (Notes editor):   'Lora' or 'Georgia' (serif, readable)
Border radius:         6px (buttons, inputs), 8px (cards), 12px (modals)
Transition:            all 150ms ease
```

---

## 10. Micro-interactions & Behavior Notes

- **Sidebar items**: 150ms background fade on hover; active item has a `3px` left accent border
- **Toolbar buttons**: Subtle scale `0.96` on click
- **Panels**: Resize by dragging the divider between panels; cursor changes to `col-resize`; min widths enforced (sidebar min 180px, right panel min 260px)
- **Empty state**: When no PDF is open, center panel shows a large drop-zone with dashed border: "Drop a PDF here or click to open"
- **Loading state**: When PDF is loading, show skeleton shimmer placeholders for the page areas
- **Toast notifications**: Bottom-right corner, 300ms slide-up animation, auto-dismiss after 3s — for actions like "Annotation saved", "File renamed", "Copied to clipboard"
- **Context menus**: Right-clicking a file in sidebar or a page in the PDF shows a native-feeling context menu (dark, rounded, with keyboard shortcut hints on the right)

---

## 11. Responsive / Resizable Behavior

| Window Width | Behavior |
|---|---|
| < 900px | Right panel auto-hides; toggle button to open as overlay |
| < 700px | Sidebar auto-collapses to icon-only mode |
| Fullscreen | All panels visible, PDF takes maximum width |

---

This spec covers every panel, component, state, and token. Hand this to an AI and it has everything needed to build the full UI — layout, components, interactions, design system, and Tauri-specific considerations like the custom title bar and frameless window.

Tabs weren't mentioned above — here's the full spec for it to append to your document:

---

# Addendum: Multi-PDF Tab Bar

---

## Placement

The tab bar sits **between the custom title bar and the top toolbar**, making it the second row of the app chrome:

```
┌──────────────────────────────────────────────────────────┐
│  Title Bar (frameless, draggable)                        │
├──────────────────────────────────────────────────────────┤
│  [ doc1.pdf ×]  [ research.pdf ×]  [ + ]                 │  ← Tab Bar
├───────────┬──────────────────────────┬───────────────────┤
│           │  Top Toolbar             │                   │
│  Sidebar  ├──────────────────────────┤   Right Panel     │
│           │  PDF Viewer              │                   │
└───────────┴──────────────────────────┴───────────────────┘
```

---

## Tab Bar Anatomy

- **Height**: 36px
- **Background**: Same as title bar (`#191919` dark / `#f0f0f0` light) — feels like one unified chrome strip
- **Left edge**: Aligns with where the sidebar ends (tabs only span the center + right panel width), OR spans full width — both work, full width is simpler

### Individual Tab

Each tab is ~180px wide (max), shrinks as more tabs are added, minimum ~80px:

```
┌─────────────────────────────┐
│  🔴  filename.pdf        ×  │
└─────────────────────────────┘
```

- **PDF icon** (small, 12px) on the left — colored red to mimic a real PDF file feel
- **Filename** — truncated with ellipsis if too long, full name shown in tooltip on hover
- **Close button** (`×`) — only visible on hover of that tab, or always visible on active tab
- **Active tab**: Slightly lighter background (`#2a2a2a`), top border accent line `2px` in accent color (`#4A9EFF`), text is full white
- **Inactive tab**: Muted text color (`#9B9A97`), no top border, subtle separator line between tabs
- **Unsaved/modified indicator**: A small filled dot (`●`) replaces the close button when the notes for that PDF have unsaved changes — clicking it still closes, but triggers a "Save changes?" confirmation

### New Tab Button

- `+` icon button at the end of the tab list
- Clicking opens the **file picker** (native Tauri dialog) or shows a mini dropdown: `Open File…` / `Open Recent ▶`
- Hover state: subtle background fill

---

## Tab Overflow Behavior

When tabs exceed the available width:

- Tabs don't wrap to a new line
- They shrink proportionally down to the minimum width (80px, showing only truncated name + close)
- Once all are at minimum, a **scroll arrow** `‹` appears on the left and `›` on the right of the tab bar
- Alternatively (simpler): an **overflow menu button** `⋯` appears at the right end — clicking shows a dropdown list of all open tabs with their full names

---

## Tab Interactions

| Action | Behavior |
|---|---|
| Click tab | Switch to that PDF; right panel updates to that PDF's notes |
| Middle-click tab | Close that tab |
| `×` button click | Close tab; if it was active, focus moves to the tab to the left |
| Drag tab | Reorder tabs by dragging left/right (ghost preview while dragging) |
| Right-click tab | Context menu (see below) |
| `Cmd/Ctrl+T` | Open new tab (file picker) |
| `Cmd/Ctrl+W` | Close active tab |
| `Cmd/Ctrl+Tab` | Cycle to next tab |
| `Cmd/Ctrl+Shift+Tab` | Cycle to previous tab |
| `Cmd/Ctrl+1–9` | Jump to tab by position |

---

## Tab Right-Click Context Menu

```
  Close Tab
  Close Other Tabs
  Close Tabs to the Right
  ─────────────────────
  Duplicate Tab
  Pin Tab
  ─────────────────────
  Copy File Path
  Reveal in Sidebar
  Open in New Window
```

- **Pin Tab**: Pinned tabs shrink to icon-only width (~32px), show just the PDF icon, and are locked to the left side of the tab bar — they can't be reordered past other pinned tabs

---

## Per-Tab State (what gets remembered per tab)

Each open tab independently remembers:

- Current page number
- Zoom level
- View mode (single/double/continuous)
- Scroll position
- Which right panel tab was active (Annotations / Notes / Outline)
- Any active text selection or annotation in progress

Switching tabs instantly restores all of this — feels like each tab is its own "session".

---

## Closing the Last Tab

When the user closes the final tab:

- The center panel shows the **empty state** drop zone: *"Drop a PDF here, press Cmd+T, or pick a recent file"*
- The top toolbar and right panel both go into a disabled/empty state
- The tab bar still shows the `+` button so the user can open a new file

---

## Integration with the Sidebar

- Clicking a file in the sidebar **opens it in a new tab** if it isn't already open; if it is open, it **switches to that tab**
- The currently active tab's file is **highlighted in the sidebar** so users always know where the file lives
- Opening a file that's already open in another tab shows a subtle indicator (bold text or a small dot) next to it in the sidebar rather than opening a duplicate

---

Append this section to the previous spec and the AI builder will have a complete, unambiguous picture of the entire UI including multi-tab support.
