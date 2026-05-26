# Implementation Plan: GoneNote Visual Redesign

**Branch**: `002-gonenote-redesign` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-gonenote-redesign/spec.md`

## Summary

Replace the current bare CSS styling with a comprehensive design system built on Tailwind CSS. Define a token-based design language (colors, typography, spacing, shadows, blur) implemented as Tailwind theme extensions and extracted into reusable Svelte components. The existing 4 routes are restyled using the component library. Dark-first with light mode tokens defined but not exposed in v1 UI per spec.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: SvelteKit 2.x, Tailwind CSS 4.x, tailwind-merge, clsx

**Storage**: N/A — this feature touches presentation layer only; Redis and crypto are unchanged

**Testing**: Vitest (existing 38 tests unchanged); manual component audit; optional visual regression via screenshot comparison

**Target Platform**: Linux server (Node.js 22+), modern browsers (Chrome, Firefox, Safari, Edge latest 2)

**Project Type**: Design system + component library applied to existing SvelteKit web application

**Performance Goals**: Lighthouse ≥90, CLS ≤0.05, FCP ≤1.0s, zero JS animation libraries (CSS-only transitions)

**Constraints**: No new runtime deps beyond Tailwind; no external font CDNs (system fonts only); no new routes

**Scale/Scope**: 4 existing routes restyled; ~8 reusable components; 1 design token file; 1 tailwind config

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | System fonts only (no CDN tracking); no new data paths; CSP unchanged; glassmorphism is pure CSS |
| II. Data Minimization & Ephemeral Storage | PASS | No changes to data layer; note lifecycle unmodified |
| III. Simplicity & Minimal Dependencies | PASS | One new dev dependency (Tailwind CSS); no JS animation libs; components are Svelte-native |
| IV. Test-First Development | PASS | Existing 38 tests continue to pass; visual regression added for component states |
| V. Input Validation & Safe Defaults | PASS | No changes to validation; form components preserve Zod schemas; dark mode is default |

## Project Structure

### Documentation (this feature)

```text
specs/002-gonenote-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── design-tokens.md     # Phase 1 output (design token catalog)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component API contracts)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── redis.ts         # Unchanged
│   ├── crypto.ts        # Unchanged
│   ├── validation.ts    # Unchanged
│   ├── logger.ts        # Unchanged
│   └── cleanup.ts       # Unchanged
├── design/
│   ├── tokens.css        # CSS custom properties and Tailwind @theme
│   └── base.css          # Reset, scrollbar, selection, focus-ring globals
├── components/
│   ├── Button.svelte     # Variants: primary/ghost; sizes: sm/md; states: loading/disabled
│   ├── Textarea.svelte   # Focus glow, character count, validation error state
│   ├── Card.svelte       # Glassmorphism surface: backdrop-blur, border, shadow, optional hover
│   ├── RadioGroup.svelte # TTL selector with animated selection indicator
│   ├── LinkDisplay.svelte# Read-only input + copy button + copied feedback
│   ├── StatusAlert.svelte# Success/info/error, icon + message, calm styling
│   └── Container.svelte  # Max-width centered wrapper, responsive padding
├── routes/
│   ├── +layout.svelte    # Root: dark bg, font cascade, theme provider
│   ├── +page.svelte      # Restyled: hero + creation form using components
│   ├── +page.server.ts   # Unchanged
│   ├── +error.svelte     # Restyled: centered StatusAlert, dark theme
│   └── note/[id]/
│       ├── +page.svelte     # Restyled: Card + pre content + destroyed StatusAlert
│       └── +page.server.ts  # Unchanged
└── app.css               # Tailwind directives + token imports

tailwind.config.ts         # Theme: colors, fonts, spacing, blur, animation, screens
postcss.config.js          # Tailwind + autoprefixer
```

**Structure Decision**: `src/design/` is the CSS token layer; `src/components/` is the reusable library; `src/routes/` composes components. `src/lib/` is untouched — this feature is presentation-only. No Option 2/3 splits needed — the existing single-tree SvelteKit structure is preserved.

## Complexity Tracking

> No violations to justify.
