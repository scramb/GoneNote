# Implementation Plan: End-to-End Test Suite

**Branch**: `004-e2e-test-suite` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-e2e-test-suite/spec.md`

## Summary

Add a comprehensive end-to-end test suite using Playwright that covers all user-facing flows of the GoneNote application: note creation, note viewing with self-destruction, error handling, copy-to-clipboard, and TTL selection. Tests run against a containerized app instance with a real Redis backend, produce CI-ready output with failure screenshots, and clean up test data between runs.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Playwright 1.x, @playwright/test (dev dependency), existing Docker Compose setup

**Storage**: Redis 7.x (real instance via Docker Compose, not mocked)

**Testing**: Playwright (e2e), Vitest (existing unit + integration unchanged)

**Target Platform**: Linux CI runner (ubuntu-latest), macOS for local dev

**Project Type**: Web application e2e test suite (SvelteKit app)

**Performance Goals**: Full suite completes in under 5 minutes on CI; no test depends on `sleep()` or fixed waits — all waits are assertion-driven or network-idle based

**Constraints**: No new runtime dependencies; Playwright is a dev dependency only; tests must run against a production-like build (`npm run build && node build`), not the Vite dev server; single command execution (`npx playwright test`)

**Scale/Scope**: ~15-20 test cases covering 3 routes, 7 components, 4 browsers (Chrome, Firefox, Safari, Edge on CI — Chrome only for local dev default)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | E2e tests operate as external clients; no access to internals, keys, or logs. Test content uses dummy data only. |
| II. Data Minimization & Ephemeral Storage | PASS | Tests verify data destruction paths. Test notes are short-lived and cleaned up. No test data persists between runs. |
| III. Simplicity & Minimal Dependencies | PASS | One new dev dependency (Playwright). No new runtime deps. Playwright is standard, well-audited, and SvelteKit-compatible. |
| IV. Test-First Development | PASS | This feature IS test development. Tests will be written to verify existing behavior and catch regressions. |
| V. Input Validation & Safe Defaults | PASS | No changes to validation layer. Tests exercise existing validation and verify rejection behavior. |

## Project Structure

### Documentation (this feature)

```text
specs/004-e2e-test-suite/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (test architecture)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (test case contracts)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
e2e/
├── playwright.config.ts        # Playwright config: browsers, baseURL, CI settings
├── fixtures/
│   └── app.fixture.ts          # Shared test state: app URL, Redis helpers, cleanup hooks
├── pages/
│   ├── home.page.ts            # Landing page object: textarea, TTL selector, submit button
│   └── note.page.ts            # Note view page object: content, destroyed state, error state
├── tests/
│   ├── create-note.spec.ts     # P1: Note creation happy path
│   ├── view-note.spec.ts       # P1: Note viewing and self-destruction
│   ├── error-handling.spec.ts  # P2: Error states and edge cases
│   ├── copy-link.spec.ts       # P3: Copy to clipboard
│   ├── ttl-selection.spec.ts   # P3: TTL selection behavior
│   └── accessibility.spec.ts   # P4: Cross-browser baseline checks
└── utils/
    └── redis-client.ts         # Direct Redis access for test data setup/teardown

docker-compose.e2e.yml          # CI-optimized override: exposed Redis port, health checks
```

**Structure Decision**: Page Object Model pattern for maintainability. Tests live in `e2e/tests/` separate from existing Vitest suites in `tests/`. Direct Redis access from test utils enables reliable setup/teardown without going through the UI (e.g., pre-creating a note for the view test). A CI-specific compose override ensures the app and Redis are wired correctly for the test runner.

## Complexity Tracking

> No violations to justify.
