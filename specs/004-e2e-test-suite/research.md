# Research: End-to-End Test Suite

**Phase**: 0 | **Date**: 2026-05-27

## Decision 1: Test Framework

**Decision**: Playwright (@playwright/test)

**Rationale**:
- Playwright has first-class SvelteKit support via `@sveltejs/kit` test integration patterns
- Multi-browser support (Chromium, Firefox, WebKit) out of the box — matches the P4 cross-browser requirement
- Built-in auto-waiting, trace viewer, screenshot-on-failure, and CI reporter
- Faster and more reliable than Cypress for modern web apps (no iframe isolation, native browser automation)
- Already the assumption in the spec and confirmed by user preference

**Alternatives considered**:
- **Cypress**: Strong DX but no Safari/WebKit support, slower execution model, iframe-based isolation causes issues with clipboard APIs
- **Selenium WebDriver**: Too low-level, requires separate test runner and assertion library, more configuration burden
- **Vitest browser mode**: Still experimental for e2e, better suited for component testing

## Decision 2: Test Architecture Pattern

**Decision**: Page Object Model (POM) with fixture-based setup

**Rationale**:
- POM encapsulates selectors and actions, making tests readable and resilient to UI refactors
- Playwright fixtures provide typed dependency injection for shared state (base URL, Redis client)
- Separation between page selectors (`pages/`) and test logic (`tests/`) follows existing project structure conventions

**Alternatives considered**:
- **Inline selectors**: Faster to write but fragile; selectors scattered across tests
- **Screenplay pattern**: Over-engineered for an app with 3 routes

## Decision 3: Backend for Tests

**Decision**: Real Redis via Docker Compose, not mocked

**Rationale**:
- E2e tests must validate the full stack: Node.js server, Redis storage, encryption, and network
- Docker Compose already defined in project; adding a CI override is minimal
- Mocking Redis for e2e would miss real-world issues (connection pooling, serialization, TTL timing)

**Alternatives considered**:
- **ioredis-mock**: Already used in unit tests, but doesn't replicate TTL behavior accurately enough for e2e
- **Embedded Redis**: Adds complexity (platform-specific binaries) without benefit over Docker

## Decision 4: Test Data Management

**Decision**: Direct Redis manipulation via a test utility + test-specific key prefixes

**Rationale**:
- Pre-creating notes via Redis (instead of through the UI) makes the view/destroy tests independent of the creation flow
- Key prefix `e2e:` ensures test data is isolated from any development data
- `FLUSHDB` or prefix-based cleanup in `afterAll` hooks guarantees repeatability
- Avoids the need for a dedicated Redis instance

**Alternatives considered**:
- **API-only setup**: Would require exposing internal endpoints for test setup, breaking security boundaries
- **Separate Redis instance**: CI overhead without benefit when prefix isolation is sufficient

## Decision 5: CI Integration

**Decision**: GitHub Actions job added to existing `build.yml` workflow

**Rationale**:
- Reuses existing Docker Compose infrastructure
- Playwright provides a GitHub Actions reporter and artifact upload for screenshots/traces
- Single workflow file keeps CI config minimal

**Alternatives considered**:
- **Separate workflow file**: Would duplicate Docker build steps; harder to coordinate on push triggers
- **Third-party CI service**: Unnecessary for this project's scale

## Decision 6: Clipboard Testing

**Decision**: Grant clipboard permissions in browser context and use Playwright's `grantPermissions`

**Rationale**:
- Playwright supports clipboard read/write in headed and headless Chromium/Firefox/WebKit
- Granting `clipboard-read` and `clipboard-write` permissions in the test browser context avoids the insecure-context edge case
- Tests verify the correct URL is written to the clipboard

**Alternatives considered**:
- **Mocking navigator.clipboard**: Wouldn't actually verify the UI interaction; defeats e2e purpose
- **Skipping clipboard tests**: Leaves a user-facing feature untested
