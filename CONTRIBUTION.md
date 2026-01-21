# Contributing to AI PDF Viewer

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.0+
- **Rust** 1.70+ with Cargo
- **Git** for version control
- Platform-specific dependencies:
  - **Windows:** Visual Studio Build Tools 2019+
  - **macOS:** Xcode Command Line Tools
  - **Linux:** `libwebkit2gtk-4.0-dev`, `build-essential`, `libssl-dev`, `libgtk-3-dev`

### Installation

```bash
git clone https://github.com/yourusername/ai-pdf-viewer.git
cd ai-pdf-viewer
bun install
bun tauri dev
```

## 🛠️ Development Setup

### IDE Recommendations

- **VS Code** with extensions:
  - Rust Analyzer
  - Tauri
  - ESLint
  - Prettier

## 🔄 Development Workflow

### 1. Pick an Issue

- Browse [open issues](https://github.com/yourusername/ai-pdf-viewer/issues)
- Comment to claim it
- Wait for maintainer approval

### 2. Create a Branch

```bash
git checkout -b feature/add-mind-map-generator
git checkout -b fix/pdf-rendering-memory-leak
```

### 3. Make Changes

- Follow coding standards
- Write self-documenting code (NO COMMENTS)
- Add tests for new features
- Ensure all tests pass

### 4. Test Locally

```bash
bun test
cd src-tauri && cargo test
bun run lint
cd src-tauri && cargo clippy
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add mind map generator"
git push origin feature/add-mind-map-generator
```

### 6. Create Pull Request

- Fill out PR template
- Link related issues
- Wait for review

## 📝 Coding Standards

### General Principles

1. **Performance First** - Optimize for speed and memory
2. **Type Safety** - TypeScript strict mode, no `any`
3. **Error Handling** - Always handle errors gracefully
4. **Immutability** - Use immer for state updates
5. **Separation of Concerns** - Logic in services, not components
6. **DRY Principle** - Extract common logic
7. **NO CODE COMMENTS** - Self-documenting code only

## 💬 Commit Guidelines

### Format

```
<type>(<scope>): <subject>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `perf`: Performance improvement
- `refactor`: Code refactoring
- `test`: Adding tests
- `build`: Build system updates
- `ci`: CI/CD changes
- `chore`: Other changes

### Examples

```bash
feat(pdf): add virtual scrolling for large documents
fix(tts): correct word boundary detection
perf(renderer): implement canvas pooling
refactor(stores): migrate from Redux to Zustand
```

### Rules

- Use present tense
- Use imperative mood
- Keep subject under 50 characters
- No period at end
- Explain *what* and *why*, not *how*

## 🔍 Pull Request Process

### PR Checklist

- [ ] Code follows coding standards
- [ ] All tests pass
- [ ] Linters pass
- [ ] Code is formatted
- [ ] No console.log statements
- [ ] Performance maintained
- [ ] NO CODE COMMENTS ADDED

## 🚫 What NOT to Do

1. ❌ Add code comments (except README, AGENT.md, CONTRIBUTION.md)
2. ❌ Use `any` type in TypeScript
3. ❌ Bundle AI models in installer
4. ❌ Render all pages simultaneously
5. ❌ Store secrets in localStorage
6. ❌ Use react-pdf wrapper
7. ❌ Create additional documentation files

## ✅ Best Practices

1. ✅ Write self-documenting code
2. ✅ Use descriptive variable/function names
3. ✅ Implement virtual scrolling for large PDFs
4. ✅ Store secrets in OS keychain
5. ✅ Use Zustand for state management
6. ✅ Custom PDF.js integration
7. ✅ Test on all target platforms

## 📄 License

By contributing, you agree that your contributions will be licensed under MIT and Apache 2.0.

---

Thank you for contributing to AI PDF Viewer!
