# Tasks: API Create Note

**Input**: Design documents from `specs/008-api-create-note/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Integration and e2e test tasks included.

**Organization**: Tasks grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: US1 & US2 — API Endpoint + Error Handling (Priority: P1)

**Goal**: `POST /api/note` accepts JSON with `secret` and optional `ttl`, creates a note, returns the URL. Errors return proper HTTP status codes with JSON bodies.

**Independent Test**: `curl -X POST -H "Content-Type: application/json" -d '{"secret":"test","ttl":"3600"}' http://localhost:3000/api/note` returns 201 with note URL. Opening the URL shows the note content after reveal. Empty body returns 400.

**Test Cases**: US1 scenarios 1-3, US2 scenarios 1-4

- [x] T001 [US1] Create `src/routes/api/note/+server.ts` with POST handler: check Content-Type, parse JSON, map `secret`→`content`, validate via `createNoteSchema`, generate ID, encrypt, store in Redis, return 201 with `{ noteUrl }` per `contracts/api-route.md`
- [x] T002 [P] [US1] Create `tests/integration/api-create-note.test.ts`: test successful creation, default TTL, missing secret (400), invalid TTL (400), malformed JSON (400), oversized content (413), wrong Content-Type (415), Redis failure (500)
- [x] T003 [P] [US1] Create `e2e/tests/api-create-note.spec.ts`: create note via `page.request.post`, verify the URL works and content matches after reveal

**Checkpoint**: API endpoint fully functional with error handling. Core feature complete.

---

## Phase 2: US3 — API Key Protection (Priority: P2)

**Goal**: When `API_KEY` env var is set, requests without a valid `Authorization: Bearer` header are rejected with 401.

**Independent Test**: Set `API_KEY=test`. Request without header → 401. Request with wrong key → 401. Request with correct key → 201. Unset `API_KEY` → request without header succeeds.

- [x] T004 [US3] Add API key check to `src/routes/api/note/+server.ts`: if `API_KEY` env var is set, require `Authorization: Bearer <key>` header, return 401 on mismatch
- [x] T005 [US3] Add API key tests to `tests/integration/api-create-note.test.ts`: 401 without header when key set, 401 with wrong key, 201 with correct key, success when key not configured

**Checkpoint**: API key protection working. Production-safe.

---

## Phase 3: Polish & Verification

**Purpose**: Build, test, validate

- [x] T006 Run `npm run build` to verify compilation
- [x] T007 Run `npm test` to verify all tests pass
- [x] T008 Run `npx playwright test --project=chromium` to verify e2e suite passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1+US2 (Phase 1)**: No dependencies
- **US3 (Phase 2)**: Depends on Phase 1 (adds auth to existing handler)
- **Polish (Phase 3)**: Depends on all phases

### Parallel Opportunities

- T002 and T003: integration tests and e2e tests (different files)

---

## Implementation Strategy

### MVP (US1+US2)

1. Complete Phase 1: API endpoint + error handling + tests
2. **STOP and VALIDATE**: `curl` creates note, URL works
3. MVP achieved: programmatic note creation works

### Incremental Delivery

1. Phase 1 → API works → **MVP**
2. Phase 2 → API key protection → Production-ready
3. Phase 3 → Build verified → Ready to merge

---

## Notes

- [P] tasks = different files, no dependencies
- One new source file (`+server.ts`), zero existing files modified
- Zero new npm dependencies
- Field mapping: API uses `secret`, internal validation uses `content`
