# Implementation Plan: Custom Style Templates

**Branch**: `005-custom-style-templates` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-custom-style-templates/spec.md`

## Summary

Add an optional style customization section to the note creation form with three native color pickers (background, primary text, secondary text). Custom colors are validated as hex values, stored alongside note content in Redis, and applied as CSS custom properties on the note view, destroyed, and error pages. A live preview swatch shows the selected color combination. Low-contrast combinations trigger a warning but do not block creation.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: SvelteKit 2.x, Tailwind CSS 4.x, Zod (validation), ioredis (storage)

**Storage**: Redis 7.x — color values stored in the same key as note content with the existing TTL

**Testing**: Vitest (unit + integration), Playwright (e2e from 004-e2e-test-suite)

**Target Platform**: Linux server (Node.js 22+), modern browsers (Chrome, Firefox, Safari, Edge latest 2)

**Project Type**: SvelteKit web application — frontend component + server-side validation

**Performance Goals**: Color customization UI adds ≤200ms to page load; no measurable impact on note creation latency

**Constraints**: No new runtime dependencies; hex-only color format; colors apply to note view pages only; section collapsed by default

**Scale/Scope**: 1 new Svelte component, 1 modified form page, 1 modified note view page, validation logic extension, existing e2e suite extended

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | Color values are validated server-side (hex regex, no CSS injection). Stored encrypted alongside note content. No new data paths. |
| II. Data Minimization & Ephemeral Storage | PASS | Color data shares note TTL — destroyed on read or expiry. No separate retention. |
| III. Simplicity & Minimal Dependencies | PASS | No new dependencies. Native `<input type="color">` avoids JS color picker libraries. Hex format requires only a regex validator. |
| IV. Test-First Development | PASS | Tests will be written for color validation, storage, and rendering. Existing 38 unit + 45 e2e tests continue to pass. |
| V. Input Validation & Safe Defaults | PASS | Hex colors validated via Zod regex. Unknown/invalid values rejected. Section defaults to collapsed (no colors = default theme). |

## Project Structure

### Documentation (this feature)

```text
specs/005-custom-style-templates/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── validation.ts         # Extended: hex color validation, style template schema
│   ├── crypto.ts             # Unchanged
│   ├── redis.ts              # Unchanged
│   └── logger.ts             # Unchanged
├── components/
│   ├── StyleCustomizer.svelte # NEW: collapsible section with 3 color inputs + preview swatch
│   ├── ColorPreview.svelte    # NEW: live preview card showing selected color combination
│   └── ... (existing components unchanged except note view)
├── routes/
│   ├── +page.svelte           # Modified: add StyleCustomizer above submit button
│   ├── +page.server.ts        # Modified: accept and validate style template in form action
│   └── note/[id]/
│       ├── +page.svelte       # Modified: apply custom CSS properties from style data
│       └── +page.server.ts    # Modified: pass style template to page data
```

**Structure Decision**: Two new components (`StyleCustomizer`, `ColorPreview`) extend the existing component library. Validation logic added to the existing Zod schemas in `validation.ts`. Server routes modified to handle the additional style fields. No new directories — the feature fits within the existing SvelteKit structure.

## Complexity Tracking

> No violations to justify.
