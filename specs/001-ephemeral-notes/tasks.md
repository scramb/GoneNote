# Tasks: Ephemeral Notes

**Input**: Design documents from `/specs/001-ephemeral-notes/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included per spec's acceptance criteria and constitution's Test-First Development principle.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- SvelteKit unified structure: `src/` for app code, `tests/` for test code
- `src/lib/` for shared utilities (Redis, crypto, validation)
- `src/routes/` for pages and API logic (SvelteKit file-based routing)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic tooling configuration

- [x] T001 Initialize SvelteKit project with TypeScript in `src/` using `pnpm create svelte` (skeleton template, no demo app)
- [x] T002 [P] Install core dependencies: `ioredis`, `zod` in `package.json`
- [x] T003 [P] Install dev dependencies: `vitest`, `ioredis-mock`, `@sveltejs/kit`, `typescript`, `eslint` in `package.json`
- [x] T004 [P] Create `.env.example` with `SECRET_KEY`, `REDIS_URL`, `MAX_NOTE_LENGTH`, `DEFAULT_TTL` variables
- [x] T005 [P] Configure Vitest in `vitest.config.ts` with unit and integration test project settings
- [x] T006 [P] Configure TypeScript strict mode in `tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement Redis client singleton with connection management and health check in `src/lib/redis.ts`
- [x] T008 [P] Implement note ID generation using `crypto.randomUUID()` in `src/lib/crypto.ts`
- [x] T009 [P] Implement AES-256-GCM encrypt/decrypt functions with HKDF key derivation in `src/lib/crypto.ts` (depends on T008 for UUID salt)
- [x] T010 [P] Implement Zod validation schemas for note creation (content length 1..102400, TTL enum) and note ID (UUID v4 regex) in `src/lib/validation.ts`
- [x] T011 [P] Implement structured JSON logger that excludes note content, IDs, keys, and tokens in `src/lib/logger.ts`
- [x] T012 [P] Configure SvelteKit hooks to parse environment variables and inject Redis client in `src/hooks.server.ts`
- [x] T013 Create unit test for note ID generation and entropy in `tests/unit/crypto.test.ts`
- [x] T014 [P] Create unit test for encryption round-trip (encrypt then decrypt) in `tests/unit/crypto.test.ts`
- [x] T015 [P] Create unit test for validation schemas (valid/invalid content lengths, TTL values, UUID formats) in `tests/unit/validation.test.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Share a Note (Priority: P1) 🎯 MVP

**Goal**: User types a plain text note, optionally selects TTL, submits, and receives a unique shareable link. No content preview shown.

**Independent Test**: Open the app at `/`, enter text, submit the form, verify a valid UUID-based URL is returned and displayed. No content shown on the creation page.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [P] [US1] Integration test for note creation success path in `tests/integration/create-note.test.ts`
- [x] T017 [P] [US1] Integration test for note creation with empty content (400 error) in `tests/integration/create-note.test.ts`
- [x] T018 [P] [US1] Integration test for note creation with oversized content (400 error) in `tests/integration/create-note.test.ts`

### Implementation for User Story 1

- [x] T019 [US1] Implement POST form action: validate input, generate ID, encrypt, store in Redis via `SETEX`, log, return URL in `src/routes/+page.server.ts`
- [x] T020 [US1] Build note creation page UI: textarea with character count, TTL selector (radio buttons), submit button, link display area in `src/routes/+page.svelte`
- [x] T021 [US1] Add client-side validation (empty check, length limit) with Zod schemas mirrored from server in `src/routes/+page.svelte`
- [x] T022 [US1] Add "Copy to clipboard" button for the generated note link and visual feedback on copy in `src/routes/+page.svelte`

**Checkpoint**: Note creation fully functional — user can create notes and receive links

---

## Phase 4: User Story 2 - View a Note Once (Priority: P1) 🎯 MVP

**Goal**: Recipient opens the link, sees plaintext content rendered as preformatted text, and the note is irrecoverably destroyed on retrieval.

**Independent Test**: Insert a known note into Redis directly (bypass creation), open `/note/<id>`, verify content is displayed correctly, reload the same URL and verify 404 "Note not found." error.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T023 [P] [US2] Integration test for successful note retrieval (decrypt + display + destroy) in `tests/integration/read-note.test.ts`
- [x] T024 [P] [US2] Integration test for already-read note (GETDEL returns nil → 404) in `tests/integration/read-note.test.ts`
- [x] T025 [P] [US2] Integration test that note content does NOT appear in server logs after retrieval in `tests/integration/read-note.test.ts`

### Implementation for User Story 2

- [x] T026 [US2] Implement GET page loader: validate ID format, execute `GETDEL note:<id>`, parse ciphertext, decrypt, return plaintext in `src/routes/note/[id]/+page.server.ts`
- [x] T027 [US2] Implement `GETDEL` result handling: null → throw 404 "Note not found" with no distinction between read/expired/invalid in `src/routes/note/[id]/+page.server.ts`
- [x] T028 [US2] Build note viewing page: render decrypted content as `<pre>` with `white-space: pre-wrap`, no HTML interpretation, no linkification in `src/routes/note/[id]/+page.svelte`
- [x] T029 [US2] Add "Create your own note" link on the viewed/destroyed page to return to homepage in `src/routes/note/[id]/+page.svelte`

**Checkpoint**: Core read-once flow complete — notes can be created AND viewed exactly once

---

## Phase 5: User Story 3 - Expired Note Handling (Priority: P2)

**Goal**: Notes not retrieved before TTL elapses are automatically expired by Redis and display an appropriate error on access. The system also runs explicit cleanup for any stale keys.

**Independent Test**: Insert a note with TTL=1s into Redis, wait for Redis to expire it, attempt access and verify 404.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T030 [P] [US3] Integration test for TTL expiry: create note with 1s TTL, wait, verify 404 in `tests/integration/error-states.test.ts`
- [x] T031 [P] [US3] Integration test that expired note access returns identical response to already-read note in `tests/integration/error-states.test.ts`

### Implementation for User Story 3

- [x] T032 [US3] Verify `SETEX` in note creation action sets correct TTL for all four durations in `src/routes/+page.server.ts` (refine T019 if needed)
- [x] T033 [US3] Add optional explicit cleanup sweep via `SCAN` for any unexpired notes past their creation+TTL window in `src/lib/cleanup.ts`
- [x] T034 [US3] Register cleanup sweep as a scheduled task in SvelteKit hooks or server startup in `src/hooks.server.ts`

**Checkpoint**: TTL enforcement complete — expired notes indistinguishable from already-read notes

---

## Phase 6: User Story 4 - Invalid Link Handling (Priority: P3)

**Goal**: Malformed or tampered URLs display a generic error without revealing internal details. All three error states (already-read, expired, invalid) produce identical external responses.

**Independent Test**: Navigate to `/note/not-a-uuid`, `/note/00000000-0000-0000-0000-000000000000`, and verify both return identical 404 pages with no distinguishing information.

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T035 [P] [US4] Integration test for malformed note ID (non-UUID format) returns 404 in `tests/integration/error-states.test.ts`
- [x] T036 [P] [US4] Integration test for well-formed but non-existent note ID returns 404 in `tests/integration/error-states.test.ts`
- [x] T037 [P] [US4] Integration test confirming read, expired, and invalid all return identical response bodies and status codes in `tests/integration/error-states.test.ts`

### Implementation for User Story 4

- [x] T038 [US4] Add UUID v4 format validation guard at start of note loader, returning generic 404 for malformed IDs in `src/routes/note/[id]/+page.server.ts`
- [x] T039 [US4] Ensure all three error paths (malformed ID, non-existent note, GETDEL null) return identical status code, message, and response body in `src/routes/note/[id]/+page.server.ts`
- [x] T040 [US4] Build unified error page component for all "Note not found" states (no content, no stack traces, no hints) in `src/routes/note/[id]/+page.svelte`

**Checkpoint**: All four user stories independently functional with consistent error handling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T041 [P] Add global error page for unexpected server errors (500) without stack traces in `src/error.html` or `src/routes/+error.svelte`
- [x] T042 [P] Add content-length indicator and remaining character count to note creation textarea in `src/routes/+page.svelte`
- [x] T043 Verify log output contains no note content, IDs, or keys by running full integration suite and checking log files
- [x] T044 [P] Add `Content-Security-Policy` header restricting inline scripts and styles in `src/hooks.server.ts`
- [x] T045 [P] Add `.gitignore` entries for `.env`, `node_modules/`, build output
- [x] T046 Run through quickstart.md validation: clean checkout, `pnpm install`, `cp .env.example .env`, `pnpm test`, `pnpm dev`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T006) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion — independent of US1 (can seed Redis directly for tests)
- **User Story 3 (Phase 5)**: Depends on Foundational completion — builds on US1's SETEX (may refine T019)
- **User Story 4 (Phase 6)**: Depends on Foundational completion — builds on US2's loader (may refine T026)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — Independent of US1; tests seed Redis directly
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Independent of US2; tests use direct Redis inserts with short TTL
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) — Independent; tests call `/note/<id>` directly

### Within Each User Story

- Tests (T016-T018, T023-T025, T030-T031, T035-T037) MUST be written and FAIL before implementation
- Tests are parallelizable within each story (marked [P])
- Core implementation after tests
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel within Phase 1
- Foundational tasks T008-T012, T014, T015 can all run in parallel after T007
- Once Foundational phase completes, ALL FOUR user stories can start in parallel (if team capacity allows)
- All tests within a user story marked [P] can run in parallel
- Polish tasks T041, T042, T044, T045 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Integration test for note creation success path in tests/integration/create-note.test.ts"
Task: "Integration test for note creation with empty content in tests/integration/create-note.test.ts"
Task: "Integration test for note creation with oversized content in tests/integration/create-note.test.ts"

# After tests fail (red), implement:
Task: "Implement POST form action in src/routes/+page.server.ts"
Task: "Build note creation page UI in src/routes/+page.svelte"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Integration test for successful note retrieval in tests/integration/read-note.test.ts"
Task: "Integration test for already-read note in tests/integration/read-note.test.ts"
Task: "Integration test that note content does NOT appear in logs in tests/integration/read-note.test.ts"

# After tests fail (red), implement:
Task: "Implement GET page loader in src/routes/note/[id]/+page.server.ts"
Task: "Build note viewing page in src/routes/note/[id]/+page.svelte"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T015)
3. Complete Phase 3: User Story 1 — Create and Share (T016-T022)
4. Complete Phase 4: User Story 2 — View Once (T023-T029)
5. **STOP and VALIDATE**: Create a note, copy link, open in incognito, verify content, refresh to confirm "Note not found."
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Can create notes and get links → Demo
3. Add US2 → Can read notes once → **MVP ready!**
4. Add US3 → TTL expiry works → Deploy
5. Add US4 → All error states consistent → Deploy
6. Polish → Security headers, logging audit → Ship

### Parallel Team Strategy

With multiple developers after Foundational:

1. Developer A: User Story 1 (creation flow)
2. Developer B: User Story 2 (read flow)
3. Developer C: User Story 3 + 4 (error states)

Stories integrate at the route level since they share the same files:
- `src/routes/+page.server.ts` (US1 + US3 SETEX refinement)
- `src/routes/note/[id]/+page.server.ts` (US2 + US4 error handling)

Coordinate merges to avoid conflicts on shared route files.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Redis instance required for integration tests; `ioredis-mock` for unit tests
- All error states (read/expired/invalid) must be externally indistinguishable — verify in US4 tests
