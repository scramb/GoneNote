# Implementation Plan: API Create Note

**Branch**: `008-api-create-note` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-api-create-note/spec.md`

## Summary

Add a `POST /api/note` endpoint that accepts JSON with `secret` (note content) and optional `ttl`, creates an encrypted note via the existing logic, and returns the note URL. Supports optional `API_KEY` bearer token auth. Zero changes to existing routes or components — purely additive.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: SvelteKit 2.x — `+server.ts` route handler, Zod (validation)

**Storage**: Redis 7.x — same `setex` storage as the web form

**Testing**: Vitest (integration), Playwright (e2e via API calls)

**Target Platform**: Linux server (Node.js 22+), Docker, Helm

**Project Type**: SvelteKit web application — new API route (server-only)

**Performance Goals**: API response under 500ms p95 (single Redis round-trip + encryption)

**Constraints**: Zero new dependencies; reuses existing `createNoteSchema` and `encrypt`/`generateNoteId`; JSON-only; no file uploads

**Scale/Scope**: 1 new file (`+server.ts`); 0 existing files modified; ~60 lines of code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | Optional API key via env var. Note content never returned in API response — only URL. JSON body size limited. |
| II. Data Minimization & Ephemeral Storage | PASS | Same storage model — note encrypted and destroyed on read. No additional data retained. |
| III. Simplicity & Minimal Dependencies | PASS | Zero new dependencies. Reuses existing validation, encryption, and storage modules. |
| IV. Test-First Development | PASS | Integration tests for API endpoint written alongside implementation. |
| V. Input Validation & Safe Defaults | PASS | Reuses Zod `createNoteSchema` — identical validation to the web form. Unknown fields ignored. |

## Project Structure

### Documentation (this feature)

```text
specs/008-api-create-note/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/routes/api/note/
└── +server.ts           # NEW: POST handler — validates, encrypts, stores, returns URL

tests/integration/
└── api-create-note.test.ts  # NEW: API endpoint integration tests

e2e/tests/
└── api-create-note.spec.ts  # NEW: e2e test via fetch
```

**Structure Decision**: Single new SvelteKit API route at `src/routes/api/note/+server.ts`. The `+server.ts` pattern is SvelteKit's standard for REST endpoints — it exports HTTP method handlers (GET, POST, etc.). No existing files modified. The route reuses `createNoteSchema`, `encrypt`, `generateNoteId`, and `getRedis` from `$lib`.

## Complexity Tracking

> No violations to justify.
