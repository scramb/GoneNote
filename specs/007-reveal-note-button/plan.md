# Implementation Plan: Reveal Note Button

**Branch**: `007-reveal-note-button` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-reveal-note-button/spec.md`

## Summary

Replace the immediate read-and-destroy on note page load with a two-step flow: the page loads with a "Reveal Note" button that verifies the note exists but does not read it; clicking the button triggers a form action that calls GETDEL, decrypts, and displays the content. This prevents link preview bots and chat expanders from accidentally consuming notes.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: SvelteKit 2.x — form actions, server load functions

**Storage**: Redis 7.x — `EXISTS` for page load check, `GETDEL` for reveal action

**Testing**: Vitest (unit + integration), Playwright (e2e)

**Target Platform**: Linux server (Node.js 22+), modern browsers

**Project Type**: SvelteKit web application — route-level architecture change

**Performance Goals**: Page load (existence check) under 200ms; reveal action under 1s

**Constraints**: Zero new dependencies; same URL structure (`/note/<id>`); noscript fallback required; branded colors respected

**Scale/Scope**: Modify 1 server route + 1 page component; add 1 form action; update e2e tests; update unit/integration tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | Page load does not access note content — EXISTS only. Content decryption only on explicit user action. No plaintext in GET responses. |
| II. Data Minimization & Ephemeral Storage | PASS | Note destroyed on reveal same as before. No additional data stored. Existence check reveals only boolean (note exists yes/no). |
| III. Simplicity & Minimal Dependencies | PASS | Zero new dependencies. Existing SvelteKit form actions handle the reveal. |
| IV. Test-First Development | PASS | Tests updated before implementation. New test: page load does not consume note. Existing tests adapted for two-step flow. |
| V. Input Validation & Safe Defaults | PASS | Note ID validated same as before. Reveal action only processes valid, existing notes. |

## Project Structure

### Documentation (this feature)

```text
specs/007-reveal-note-button/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/routes/note/[id]/
├── +page.svelte          # Modified: unrevealed state with button, revealed state with content
└── +page.server.ts       # Modified: load checks existence only; new form action does GETDEL

e2e/tests/
└── view-note.spec.ts     # Modified: click "Reveal Note" before asserting content

tests/integration/
└── read-note.test.ts     # Modified: test existence check separately from reveal action
```

**Structure Decision**: No new files. The note route gains a form action for the reveal while the load function becomes an existence check. The page component gains two states: unrevealed (button) and revealed (content + destroyed indicator). The same URL handles both states — SvelteKit form actions post to the same route.

## Complexity Tracking

> No violations to justify.
