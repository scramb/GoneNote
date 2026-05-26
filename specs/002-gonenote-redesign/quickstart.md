# Quickstart: GoneNote Visual Redesign

## Prerequisites

Same as the base application:
- Node.js 22+
- Redis 7.x (for the app to function; not needed for visual-only development)
- npm

## Setup for Design Development

```bash
# 1. Install dependencies (adds Tailwind CSS + PostCSS)
npm install

# 2. Start dev server with HMR for instant design feedback
npm run dev

# 3. View at http://localhost:5173
```

All existing functionality works identically — only the visual layer has changed.

## Key Files for Design Work

| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Theme: colors, fonts, spacing, shadows, blur, animations |
| `postcss.config.js` | Tailwind + autoprefixer build pipeline |
| `src/app.css` | Tailwind directives + design token CSS custom properties |
| `src/design/tokens.css` | All `--color-*`, `--text-*`, `--space-*`, `--shadow-*` CSS variables |
| `src/design/base.css` | Global resets, scrollbar styling, selection colors, focus rings |
| `src/components/` | Reusable component library (7 components + icons) |
| `src/routes/+layout.svelte` | Root layout: dark background, font cascade |

## Running Tests

```bash
# Existing 38 tests should continue to pass
npm test
```

## Visual Audit

To manually verify design consistency across screens:

1. Landing page: `http://localhost:5173/`
2. Create note + view result: Submit a note on the landing page
3. Note view: Open the generated link
4. Error: Navigate to `http://localhost:5173/note/invalid`
5. 500: Stop Redis and try to create a note

Check each screen for:
- Consistent dark background (`#0a0a0f`)
- Consistent typography (UI in sans-serif, content in monospace)
- Glassmorphism on result card (blur visible when content is behind)
- Smooth transitions on focus, hover, submit
- `prefers-reduced-motion: reduce` — animations stop
