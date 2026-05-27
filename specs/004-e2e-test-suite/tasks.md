# Tasks: End-to-End Test Suite

**Input**: Design documents from `specs/004-e2e-test-suite/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: This feature IS a test suite. All implementation tasks produce test files. No separate test tasks needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install tooling and create project structure for the e2e test suite

- [x] T001 Install Playwright as dev dependency via `npm install -D @playwright/test && npx playwright install chromium`
- [x] T002 [P] Create `e2e/` directory structure with subdirectories: `fixtures/`, `pages/`, `tests/`, `utils/`
- [x] T003 [P] Create `docker-compose.e2e.yml` with Redis + app service definitions per `contracts/docker-compose-e2e.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core test infrastructure that MUST be complete before ANY user story tests can run

**CRITICAL**: No user story test file can execute until this phase is complete

- [x] T004 Create `e2e/playwright.config.ts` with browser projects, webServer config, CI reporters, and timeouts per `contracts/playwright-config.md`
- [x] T005 [P] Create `e2e/utils/redis-client.ts` with `createTestNote()` helper that encrypts content and stores in Redis using `e2e:note:` key prefix per `data-model.md`
- [x] T006 Create `e2e/fixtures/app.fixture.ts` with custom Playwright fixtures: `baseURL`, `redisClient`, and `createTestNote` helper (depends on T005)
- [x] T007 [P] Add `data-testid` attributes to `src/components/Textarea.svelte` (`data-testid="note-content"`)
- [x] T008 [P] Add `data-testid` attributes to `src/components/Button.svelte` (`data-testid="submit-note"`)
- [x] T009 [P] Add `data-testid` attributes to `src/components/RadioGroup.svelte` (`data-testid="ttl-selector"` on container, `data-testid="ttl-option-{value}"` on each option)
- [x] T010 [P] Add `data-testid` attributes to `src/components/LinkDisplay.svelte` (`data-testid="note-link"`)
- [x] T011 [P] Add `data-testid` attributes to `src/components/CopyButton.svelte` (`data-testid="copy-button"`)
- [x] T012 [P] Add `data-testid` attributes to `src/components/StatusAlert.svelte` (`data-testid="error-state"`, `data-testid="note-destroyed"`)
- [x] T013 [P] Add `data-testid` attributes to route pages: `src/routes/+page.svelte` (`data-testid="validation-error"`), `src/routes/note/[id]/+page.svelte` (`data-testid="note-content"`, `data-testid="lock-icon"`)
- [x] T014 Add e2e scripts to `package.json`: `"test:e2e": "npx playwright test"`, `"test:e2e:ui": "npx playwright test --ui"`

**Checkpoint**: Foundation ready — all test infrastructure in place. User story test files can now be written and executed.

---

## Phase 3: User Story 1 - Note Creation Happy Path (Priority: P1)

**Goal**: Verify the full note creation flow: visit landing page, type content, select TTL, submit, and receive a shareable link.

**Independent Test**: Run `npx playwright test --grep "create-note"` — tests pass when a user can create a note and click through to view it.

**Test Cases**: TC-001, TC-002

- [x] T015 [P] [US1] Create `e2e/pages/home.page.ts` PageObject with locators for textarea, TTL selector, submit button, result link, and validation error per `data-model.md`
- [x] T016 [US1] Create `e2e/tests/create-note.spec.ts` with TC-001 (valid content submission generates link) and TC-002 (click generated link opens note page)

**Checkpoint**: Note creation flow covered end-to-end. Can run independently as MVP test suite.

---

## Phase 4: User Story 2 - Note Viewing and Self-Destruction (Priority: P1)

**Goal**: Verify the one-time read-and-destroy mechanic: first view shows content, second view shows "gone", TTL expiry works.

**Independent Test**: Run `npx playwright test --grep "view-note"` — tests pass when note destruction behavior is verified.

**Test Cases**: TC-003, TC-004, TC-005

- [x] T017 [P] [US2] Create `e2e/pages/note.page.ts` PageObject with locators for note content, destroyed state, error state, and lock icon per `data-model.md`
- [x] T018 [US2] Create `e2e/tests/view-note.spec.ts` with TC-003 (first read shows content), TC-004 (second read shows gone), and TC-005 (TTL expiry)

**Checkpoint**: Note viewing and destruction covered. US1 + US2 together cover the core ephemeral note lifecycle.

---

## Phase 5: User Story 3 - Error Handling and Edge Cases (Priority: P2)

**Goal**: Verify graceful handling of invalid inputs, missing notes, and edge cases.

**Independent Test**: Run `npx playwright test --grep "error-handling"` — tests pass when all error states show user-friendly messages.

**Test Cases**: TC-006, TC-007, TC-008, TC-009, TC-014

- [x] T019 [US3] Create `e2e/tests/error-handling.spec.ts` with TC-006 (empty form validation), TC-007 (whitespace-only rejection), TC-008 (invalid note ID), TC-009 (malformed note ID), and TC-014 (rapid double-submit)

**Checkpoint**: Error paths covered. Users can trust the app won't crash or show blank pages on failures.

---

## Phase 6: User Story 4 - Link Copy Functionality (Priority: P3)

**Goal**: Verify copy-to-clipboard works and shows visual confirmation.

**Independent Test**: Run `npx playwright test --grep "copy-link"` — tests pass when clipboard contains correct URL and button shows "Copied" state.

**Test Cases**: TC-010, TC-011

- [x] T020 [US4] Create `e2e/tests/copy-link.spec.ts` with TC-010 (clipboard contents correct) and TC-011 (visual feedback on copy). Grant clipboard permissions in browser context.

**Checkpoint**: Copy functionality verified.

---

## Phase 7: User Story 5 - TTL Selection (Priority: P3)

**Goal**: Verify TTL options are displayed, selectable, and respected.

**Independent Test**: Run `npx playwright test --grep "ttl-selection"` — tests pass when all TTL options are visible and selected TTL is applied.

**Test Cases**: TC-012, TC-013

- [x] T021 [US5] Create `e2e/tests/ttl-selection.spec.ts` with TC-012 (options visible and default selected) and TC-013 (shortest TTL note is accessible immediately after creation)

**Checkpoint**: TTL selection verified.

---

## Phase 8: User Story 6 - Cross-Browser Compatibility (Priority: P4)

**Goal**: Core creation flow works across all supported browsers (Chrome, Firefox, Safari).

**Independent Test**: Run `npx playwright test --grep "accessibility"` across all browser projects — tests pass in chromium, firefox, and webkit.

**Test Cases**: TC-015

- [x] T022 [US6] Create `e2e/tests/accessibility.spec.ts` with TC-015 (cross-browser smoke test: land on page, type, submit, verify link generated)

**Checkpoint**: Multi-browser validation in place.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: CI integration, validation, and documentation

- [x] T023 [P] Update `.github/workflows/build.yml` to add an `e2e` job that runs Playwright tests with Docker Compose
- [x] T024 [P] Add `.gitignore` entries for `e2e/test-results/` and `e2e/playwright-report/`
- [x] T025 Validate full test suite by running `npx playwright test` and verify all 15 test cases pass
- [x] T026 Run quickstart.md instructions end-to-end to verify they work for a new developer

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user story test files
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 are independent (US2 uses `note.page.ts`, US1 uses `home.page.ts`)
  - US3, US4, US5, US6 each add test files — all independent of each other
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational — Independent of US1 (uses pre-created Redis notes, not UI)
- **User Story 3 (P2)**: Can start after Foundational — Independent
- **User Story 4 (P3)**: Can start after Foundational — Requires US1's `home.page.ts` PageObject for note creation setup via UI
- **User Story 5 (P3)**: Can start after Foundational — Requires US1's `home.page.ts` PageObject for TTL interaction
- **User Story 6 (P4)**: Can start after Foundational — Requires US1's `home.page.ts` PageObject for the smoke test flow

### Within Each User Story

- PageObject (if needed) before test file
- Test file implements all test cases from contracts

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003)
- All Foundational [P] tasks can run in parallel: T005, T007-T013 (8 tasks, 8 different files)
- Once Foundational completes, US1 and US2 can start in parallel (both P1, independent)
- After US1 PageObject exists, US3, US4, US5, US6 can all start in parallel
- Polish tasks T023 and T024 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all data-testid tasks + redis utility together (different files):
Task: "Create e2e/utils/redis-client.ts (T005)"
Task: "Add data-testid to Textarea.svelte (T007)"
Task: "Add data-testid to Button.svelte (T008)"
Task: "Add data-testid to RadioGroup.svelte (T009)"
Task: "Add data-testid to LinkDisplay.svelte (T010)"
Task: "Add data-testid to CopyButton.svelte (T011)"
Task: "Add data-testid to StatusAlert.svelte (T012)"
Task: "Add data-testid to route pages (T013)"
```

## Parallel Example: User Stories After Foundation

```bash
# Once Foundational phase + US1 PageObject complete:
Task: "US2: Create note.page.ts + view-note.spec.ts (T017, T018)"
Task: "US3: Create error-handling.spec.ts (T019)"
Task: "US4: Create copy-link.spec.ts (T020)"
Task: "US5: Create ttl-selection.spec.ts (T021)"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup — install Playwright, create directories
2. Complete Phase 2: Foundational — config, fixtures, data-testid attributes
3. Complete Phase 3: User Story 1 — home.page.ts + create-note.spec.ts
4. **STOP and VALIDATE**: Run `npx playwright test --project=chromium` — TC-001 and TC-002 pass
5. MVP achieved: core creation flow is tested

### Incremental Delivery

1. Setup + Foundational → Test infrastructure ready
2. Add US1 → Creation flow tested → **MVP**
3. Add US2 → View + destruction tested → Core lifecycle complete
4. Add US3 → Error handling tested → Robustness validated
5. Add US4 + US5 → Copy + TTL tested → Feature-complete coverage
6. Add US6 → Cross-browser tested → Production readiness
7. Add Polish → CI integration → Automated regression prevention

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (home.page.ts + create-note.spec.ts)
   - Developer B: US2 (note.page.ts + view-note.spec.ts)
3. After T015 (home.page.ts) lands:
   - Developer A: US3 (error-handling.spec.ts)
   - Developer B: US4 (copy-link.spec.ts)
   - Developer C: US5 (ttl-selection.spec.ts)
   - Developer D: US6 (accessibility.spec.ts)
4. All stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story's test file(s) should be independently executable
- Use `test.describe()` blocks to group related test cases within a spec file
- All tests use `e2e:` key prefix for Redis data — cleanup via `afterAll` hook
- No `sleep()` calls — use `waitForSelector`, `waitForResponse`, or `expect().toBeVisible()` instead
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently by running `npx playwright test --grep "<story-file-name>"`
