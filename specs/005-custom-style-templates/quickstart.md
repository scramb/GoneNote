# Quickstart: Custom Style Templates

## Prerequisites

Same as the base application:
- Node.js 22+
- Redis 7.x
- npm

## Setup

```bash
# Install dependencies (no new deps)
npm install

# Start dev server
npm run dev

# View at http://localhost:5173
```

## Feature Overview

The landing page has a new "Customize Style" toggle below the TTL selector and above the Submit button. Clicking it reveals three color pickers:

1. **Background** — the note page background color
2. **Primary Text** — the main text/heading color
3. **Secondary Text** — the muted/subtitle text color

A live preview swatch updates as you change colors. If the contrast between background and primary text is too low, a warning appears but doesn't block creation.

When no colors are selected (section collapsed or all pickers at default): notes use the existing dark theme.

## Running Tests

```bash
# Existing unit + integration tests
npm test

# E2e tests (requires Redis)
npx playwright test --project=chromium
```

## Key Files

| File | Purpose |
|------|---------|
| `src/components/StyleCustomizer.svelte` | Collapsible color picker section |
| `src/components/ColorPreview.svelte` | Live preview swatch with contrast warning |
| `src/lib/validation.ts` | Hex color validation + style template Zod schema |
| `src/routes/+page.svelte` | Landing page — includes StyleCustomizer |
| `src/routes/+page.server.ts` | Form action — validates and stores style data |
| `src/routes/note/[id]/+page.svelte` | Note view — applies custom CSS properties |
| `src/routes/note/[id]/+page.server.ts` | Note load — passes style data to client |
