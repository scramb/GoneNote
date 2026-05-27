# Data Model: End-to-End Test Suite

**Phase**: 1 | **Date**: 2026-05-27

## Overview

This feature is a test suite, not a data-driven application. The "data model" describes the test architecture entities: test cases, page objects, fixtures, and the Redis data format used for test setup.

## Test Architecture Entities

### TestSuite

The top-level collection of all e2e test cases, configured via `playwright.config.ts`.

| Field | Type | Description |
|-------|------|-------------|
| projects | ProjectConfig[] | Browser targets (chromium, firefox, webkit, edge channel) |
| webServer | WebServerConfig | Command to start the app (`npm run build && node build`) |
| testDir | string | Path to test files (`e2e/tests/`) |
| timeout | number | Global test timeout (30s default) |
| retries | number | CI retry count (2 for CI, 0 for local) |
| use.baseURL | string | App URL (`http://localhost:3000`) |
| use.screenshot | string | Screenshot mode (`only-on-failure`) |
| use.trace | string | Trace mode (`retain-on-failure`) |

### PageObject

Encapsulates selectors and actions for a single route/page.

**HomePage** (`e2e/pages/home.page.ts`):
| Element | Selector Strategy | Action |
|---------|-------------------|--------|
| textarea | `textarea` or `[data-testid="note-content"]` | Type content |
| TTL selector | `[data-testid="ttl-selector"]` radio group | Click TTL option |
| submit button | `button[type="submit"]` or `[data-testid="submit-note"]` | Click |
| result link | `[data-testid="note-link"]` input | Read value, click |
| copy button | `[data-testid="copy-button"]` | Click, verify clipboard |
| validation error | `[data-testid="validation-error"]` | Assert visibility |

**NotePage** (`e2e/pages/note.page.ts`):
| Element | Selector Strategy | Action |
|---------|-------------------|--------|
| note content | `[data-testid="note-content"]` pre element | Assert text content |
| destroyed state | `[data-testid="note-destroyed"]` | Assert visibility |
| error state | `[data-testid="error-state"]` | Assert visibility, text |
| lock icon | `[data-testid="lock-icon"]` | Assert visibility |

### TestFixture

Shared state provided to each test via Playwright's fixture system.

| Fixture | Type | Description |
|---------|------|-------------|
| page | Page | Playwright page instance (built-in) |
| context | BrowserContext | Playwright browser context (built-in) |
| app | AppFixture | Custom: base URL, Redis client |
| app.baseURL | string | `http://localhost:3000` |
| app.redisClient | Redis | Direct Redis connection for setup/teardown |
| app.createTestNote | (content, ttl) => id | Helper to pre-create a note via Redis for view tests |

### TestCase

Individual test specifications. See `contracts/` for detailed contracts.

| Test File | Priority | Count | Covers |
|-----------|----------|-------|--------|
| create-note.spec.ts | P1 | 4 | FR-001: landing page, type, TTL, submit, link |
| view-note.spec.ts | P1 | 4 | FR-002, FR-003: first view, re-view, expired, destroyed |
| error-handling.spec.ts | P2 | 4 | FR-004, FR-007: empty submit, invalid ID, server down, malformed ID |
| copy-link.spec.ts | P3 | 2 | FR-005: copy URL, confirmation feedback |
| ttl-selection.spec.ts | P3 | 3 | FR-006: each option available, default selected, TTL respected |
| accessibility.spec.ts | P4 | 3 | FR-008, FR-010: Chrome, Firefox, Safari smoke tests |

## Redis Data Format (Test Setup)

When pre-creating a note for view tests:

```
Key:   e2e:note:{id}
Value: JSON {
  "content": "<encrypted ciphertext>",
  "iv": "<initialization vector>",
  "authTag": "<GCM auth tag>"
}
TTL:   <configured TTL in seconds>

Key:   e2e:note:{id}:meta
Value: JSON {
  "createdAt": "<ISO timestamp>",
  "ttl": <seconds>
}
```

Test utility `createTestNote()` handles encryption using the test `SECRET_KEY`, mirroring the app's crypto module. The returned `id` forms the URL path for the view test.
