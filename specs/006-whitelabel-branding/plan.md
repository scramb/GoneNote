# Implementation Plan: Whitelabel Branding

**Branch**: `006-whitelabel-branding` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-whitelabel-branding/spec.md`

## Summary

Replace the runtime per-note style selector (feature 005) with instance-level whitelabel branding configured via optional environment variables. Operators set `APP_NAME`, `APP_LOGO_URL`, and a full color scheme (`APP_COLOR_*`) at deploy time. The same container image produces differently branded instances without rebuilding. The StyleCustomizer component, per-note style storage, and `styleTemplateSchema` are removed. Backward compatibility with existing JSON-wrapped notes is maintained during reads.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: SvelteKit 2.x, Tailwind CSS 4.x (theme tokens via CSS custom properties)

**Storage**: Redis 7.x — storage format simplified (revert to plain ciphertext, backward-compatible reads for JSON-wrapped notes)

**Testing**: Vitest (unit + integration), Playwright (e2e)

**Target Platform**: Linux server (Node.js 22+), Docker, Helm; modern browsers

**Project Type**: SvelteKit web application — server-side config injection, global UI theming

**Performance Goals**: No performance regression — branding config read once at startup, cached for all requests

**Constraints**: Zero new dependencies; all branding is optional with GoneNote defaults as fallback; same image must serve multiple brands via env vars only; no rebuild required

**Scale/Scope**: Remove 2 components + 1 Zod schema + per-note style logic; add 1 config module + 2 components; modify 4 routes + layout; update .env.example, Dockerfile, Helm chart

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | App name sanitized against HTML injection. Logo URL validated. Colors validated at startup. No new data paths — branding is read-only server config. |
| II. Data Minimization & Ephemeral Storage | PASS | Per-note style data removed — less stored per note. Branding config is server-side only, never sent to clients except as rendered CSS. |
| III. Simplicity & Minimal Dependencies | PASS | Removes more code than it adds (StyleCustomizer, ColorPreview, styleTemplateSchema, per-note style storage all removed). Zero new dependencies. |
| IV. Test-First Development | PASS | Tests updated to reflect removed components and new branding behavior. Existing e2e suite covers branded rendering. |
| V. Input Validation & Safe Defaults | PASS | All branding env vars validated at startup with safe fallbacks to GoneNote defaults. Invalid colors logged and replaced with defaults. |

## Project Structure

### Documentation (this feature)

```text
specs/006-whitelabel-branding/
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
│   ├── branding.ts           # NEW: read env vars, validate, provide BrandingConfig
│   ├── validation.ts         # Modified: remove styleTemplateSchema, hexColor
│   ├── crypto.ts             # Unchanged
│   ├── redis.ts              # Unchanged
│   └── logger.ts             # Unchanged
├── components/
│   ├── BrandLogo.svelte       # NEW: renders logo img or app-name text fallback
│   ├── ColorPreview.svelte    # REMOVED
│   ├── StyleCustomizer.svelte # REMOVED
│   └── StatusAlert.svelte     # Modified: remove primaryColor/secondaryColor props
├── hooks.server.ts            # Modified: inject BrandingConfig into locals
├── app.css                    # Modified: consume CSS custom properties from branding
├── app.html                   # Modified: dynamic page title from branding
├── routes/
│   ├── +layout.svelte         # Modified: global color scheme via CSS custom properties
│   ├── +page.svelte           # Modified: remove StyleCustomizer, hidden inputs; add BrandLogo
│   ├── +page.server.ts        # Modified: remove style parsing/storage, store plain ciphertext
│   ├── +error.svelte          # Modified: use branded colors
│   └── note/[id]/
│       ├── +page.svelte       # Modified: remove per-note inline styles
│       └── +page.server.ts    # Modified: remove style extraction, backward-compat JSON read

.env.example                   # Modified: add branding variables
docker-compose.yml             # Modified: add branding env vars (commented)
charts/gonenote/values.yaml    # Modified: add branding values
```

**Structure Decision**: Branding config is a server-side module (`lib/branding.ts`) that reads env vars once at import time, validates them, and exports a frozen `BrandingConfig`. This is injected into SvelteKit `locals` via hooks for server-side access. CSS custom properties for colors are set on `:root` via `app.css` using the config values. BrandLogo handles logo rendering with app-name text fallback on error. Note storage simplifies back to plain ciphertext with backward-compatible JSON reads.

## Complexity Tracking

> No violations to justify.
