# Tasks: Reveal Note Button

**Input**: Design documents from `specs/007-reveal-note-button/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test updates included to cover the two-step flow and preview safety.

**Organization**: Tasks grouped by user story. US1 and US2 share the same server change — merged into one phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational — Server Split

**Purpose**: Replace immediate GETDEL on page load with EXISTS check + form action for reveal. This is the core architectural change that all user stories depend on.

**CRITICAL**: No page UI work can begin until the server is split.

- [x] T001 Split `src/routes/note/[id]/+page.server.ts`: `load` function uses Redis `EXISTS` to check note availability without reading content; add a `reveal` form action that calls `GETDEL`, decrypts, and returns content. Keep backward-compatible JSON parsing for old notes.

**Checkpoint**: GET /note/[id] no longer consumes notes. POST to same URL triggers the read.

---

## Phase 2: User Story 1 & 2 — Two-Step Access + Preview Safety (Priority: P1)

**Goal**: Page loads with "Reveal Note" button and note-waiting message, no content visible. Clicking reveals content. Automated GET requests don't consume notes.

**Independent Test**: Open a note link — "Reveal Note" button visible, no content. `curl` the URL — response contains button, not plaintext. Note still accessible afterward.

**Test Cases**: US1 scenarios 1-3, US2 scenarios 1-2

- [x] T002 [P] [US1] Update `src/routes/note/[id]/+page.svelte`: add unrevealed state with note-waiting message, "Reveal Note" button inside `<form method="POST" use:enhance>`, and revealed state with content + StatusAlert per `contracts/note-route.md`
- [x] T003 [P] [US1] Update `e2e/tests/view-note.spec.ts`: click "Reveal Note" button before asserting note content visibility; add test verifying `curl`-style GET doesn't consume the note

**Checkpoint**: Two-step flow works — page loads safe, click reveals, note destroyed after read.

---

## Phase 3: User Story 3 — Reveal Failure Handling (Priority: P2)

**Goal**: If note expired between load and click, or was already read, show clear error message.

**Independent Test**: Open note link, delete note from Redis via script, click "Reveal Note" — error message shown.

**Test Cases**: US3 scenarios 1-2

- [x] T004 [US3] Add POST handler response for null GETDEL result in `src/routes/note/[id]/+page.server.ts` — return `fail(404, { success: false, error: 'Note no longer available.' })`; update page to show error state when form action fails

**Checkpoint**: Expired and already-read notes handled gracefully on reveal click.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Tests, build verification

- [x] T005 [P] Update integration tests in `tests/integration/read-note.test.ts`: split into existence-check tests (load doesn't consume) and reveal-action tests (POST triggers GETDEL)
- [x] T006 Run `npm run build` to verify compilation
- [x] T007 Run `npm test` to verify all tests pass
- [x] T008 Run `npx playwright test --project=chromium` to verify e2e suite passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1+US2 (Phase 2)**: Depends on Phase 1 (server split must exist before page can use it)
- **US3 (Phase 3)**: Depends on Phase 2 (needs the page structure to add error handling)
- **Polish (Phase 4)**: Depends on all phases

### Parallel Opportunities

- T002 and T003: Page component and e2e tests are different files

---

## Implementation Strategy

### MVP (US1+US2)

1. Complete Phase 1: Server split — EXISTS on load, GETDEL on action
2. Complete Phase 2: Page UI + e2e tests
3. **STOP and VALIDATE**: Create note, open link, verify button appears, click, verify content
4. MVP achieved: two-step flow protects against preview bots

### Incremental Delivery

1. Phase 1 → Server architecture ready
2. Phase 2 → Two-step flow → **MVP**
3. Phase 3 → Error handling → Production-ready
4. Phase 4 → Tests updated → Ready to merge

---

## Notes

- [P] tasks = different files, no dependencies
- Zero new files — only existing route files modified
- Zero new dependencies
- The `<form method="POST">` wrapping the button provides noscript fallback automatically
- `use:enhance` provides JavaScript-enhanced submission without page reload
- Existing `data-testid` attributes on note-content and note-destroyed remain unchanged
