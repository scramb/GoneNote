# Tasks: Whitelabel Branding

**Input**: Design documents from `specs/006-whitelabel-branding/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks included where they validate spec requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify current state before changes

- [x] T001 Audit current files to be removed: `src/components/StyleCustomizer.svelte`, `src/components/ColorPreview.svelte`, `styleTemplateSchema`/`hexColor` in `src/lib/validation.ts`, per-note style fields in server routes, `primaryColor`/`secondaryColor` props in `src/components/StatusAlert.svelte`

---

## Phase 2: Foundational — Branding Config Module

**Purpose**: Core branding infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until the config module is in place

- [x] T002 Create `src/lib/branding.ts` — read env vars (`APP_NAME`, `APP_LOGO_URL`, all `APP_COLOR_*`), validate each, export frozen `BrandingConfig` with GoneNote defaults per `contracts/branding-env-vars.md`

**Checkpoint**: BrandingConfig available for import by any module. All values validated, defaults applied.

---

## Phase 3: User Story 2 — Remove Runtime Style Selector (Priority: P1)

**Goal**: The StyleCustomizer and all per-note style code are completely removed. The note creation form shows only content and TTL. Notes are stored as plain ciphertext.

**Independent Test**: Visit landing page — no "Customize Style" toggle. Create a note — stored as plain ciphertext string in Redis.

**Implementation**

- [x] T003 [P] [US2] Delete `src/components/StyleCustomizer.svelte`
- [x] T004 [P] [US2] Delete `src/components/ColorPreview.svelte`
- [x] T005 [US2] Remove `styleTemplateSchema` and `hexColor` from `src/lib/validation.ts`
- [x] T006 [US2] Remove StyleCustomizer import, color state (`bgColor`, `primaryColor`, `secondaryColor`), hidden color inputs, and StyleCustomizer mounting from `src/routes/+page.svelte`
- [x] T007 [US2] Remove style field parsing, `styleTemplateSchema` import, JSON wrapper storage from `src/routes/+page.server.ts` — revert to storing plain ciphertext via `setex`
- [x] T008 [US2] Remove `primaryColor`/`secondaryColor` props from `src/components/StatusAlert.svelte` and their inline style applications on title/message

**Checkpoint**: Zero references to StyleCustomizer, ColorPreview, styleTemplateSchema, or per-note styles remain.

---

## Phase 4: User Story 1 — Deploy with Custom Branding (Priority: P1)

**Goal**: Deploy with `APP_NAME`, `APP_LOGO_URL`, and color env vars. The instance renders with the operator's branding on the landing and note view pages.

**Independent Test**: Set `APP_NAME=SecureDrop`, `APP_COLOR_ROOT=#0d1117`, `APP_COLOR_ACCENT=#58a6ff`. Start app. Verify header shows "SecureDrop", page background is `#0d1117`.

**Implementation**

- [x] T009 [P] [US1] Create `src/components/BrandLogo.svelte` — renders `<img>` with `APP_LOGO_URL` when set, falls back to styled app name text on error; data-testid attrs
- [x] T010 [US1] Inject BrandingConfig into SvelteKit `locals.branding` in `src/hooks.server.ts` via `handle` hook
- [x] T011 [US1] Add CSS custom properties for all 11 color tokens to `:root` in `src/app.css` using values from BrandingConfig, falling back to existing hardcoded defaults
- [x] T012 [US1] Set dynamic page title (`<title>`) from branding in `src/app.html`
- [x] T013 [US1] Update `src/routes/+layout.svelte`: add BrandLogo to header, replace hardcoded "GoneNote" text with branded app name
- [x] T014 [US1] Add branding env vars (commented) to `.env.example` per `contracts/branding-env-vars.md`
- [x] T015 [P] [US1] Add branding env vars (commented) to `docker-compose.yml` app service
- [x] T016 [P] [US1] Add branding values to `charts/gonenote/values.yaml` under `branding:` key

**Checkpoint**: App renders fully branded with env vars. Same image, different env = different brand.

---

## Phase 5: User Story 3 — Branded Error & Destroyed States (Priority: P2)

**Goal**: The error page and note destroyed state use the branded logo, name, and colors.

**Independent Test**: Navigate to `/note/nonexistent` on a branded instance — error page shows custom logo, app name, and branded colors. View a note — destroyed state uses branded colors.

**Implementation**

- [x] T017 [US3] Update `src/routes/+error.svelte` to use branded app name and CSS custom properties (already inherited from `:root`)
- [x] T018 [US3] Verify `src/routes/note/[id]/+page.svelte` destroyed state area uses branded colors (inherited from layout CSS custom properties — no per-note overrides)

**Checkpoint**: All 4 routes (landing, note view, destroyed, error) consistently branded.

---

## Phase 6: User Story 4 — Legacy Note Compatibility (Priority: P3)

**Goal**: Existing notes with JSON-wrapped per-note style data from feature 005 still render correctly, ignoring the old style data.

**Independent Test**: Pre-populate Redis with a JSON-wrapped note `{"content":"<enc>","style":{...}}`. View the note — content renders with instance brand colors.

**Implementation**

- [x] T019 [US4] Verify backward-compatible JSON parsing in `src/routes/note/[id]/+page.server.ts` — attempt `JSON.parse`, extract `.content` if successful, discard `.style`, fall back to raw string if parse fails

**Checkpoint**: Old notes readable. New notes stored without JSON wrapper.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Tests, CI, docs, verification

- [x] T020 [P] Update unit tests in `tests/unit/validation.test.ts` — remove `styleTemplateSchema` test block (10 tests), verify remaining tests pass
- [x] T021 [P] Update integration tests in `tests/integration/read-note.test.ts` — remove `style: null` from expected return shapes
- [x] T022 [P] Update e2e tests — remove `custom-style.spec.ts`, verify remaining e2e tests pass
- [x] T023 Run `npm run build` to verify zero compilation errors and no dead imports
- [x] T024 Run `npm test` to verify all tests pass
- [x] T025 Run `npx playwright test --project=chromium` to verify e2e suite passes
- [x] T026 Manual smoke test: start app with `APP_NAME=TestBrand APP_COLOR_ROOT=#111 npm run build && node build`, verify branding renders

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No dependencies — can run in parallel with Phase 1
- **US2 (Phase 3)**: Depends on Foundational (needs branding.ts to exist before removing old code references)
- **US1 (Phase 4)**: Depends on US2 (removal clears the way for new components)
- **US3 (Phase 5)**: Depends on US1 (needs branding in layout)
- **US4 (Phase 6)**: Depends on US2 (storage format changed in Phase 3)
- **Polish (Phase 7)**: Depends on all user stories

### Within Each Phase

- Phase 3: T003, T004 in parallel (different files). T005-T008 sequential (same files may conflict).
- Phase 4: T009 first (BrandLogo component). T010-T013 sequential. T015, T016 in parallel (different config files).
- Phase 7: T020, T021, T022 in parallel (different test files).

### Parallel Opportunities

- T003 and T004: Delete two components simultaneously
- T015 and T016: Docker compose and Helm values (different files)
- T020, T021, T022: All three test update tasks (different test suites)

---

## Parallel Example: Phase 7 Testing

```bash
Task: "Update unit tests (T020)"
Task: "Update integration tests (T021)"
Task: "Update e2e tests (T022)"
# All three run in parallel — different files, no shared state
```

---

## Implementation Strategy

### MVP First (US2 + US1)

1. Complete Phase 2: Foundational — branding.ts module
2. Complete Phase 3: US2 — remove all runtime style selector code
3. Complete Phase 4: US1 — add BrandLogo, CSS properties, layout updates
4. **STOP and VALIDATE**: Deploy with custom env vars, verify full branding
5. MVP achieved: whitelabel branding works, runtime selector gone

### Incremental Delivery

1. Foundational → Branding config ready
2. Add US2 → Runtime selector removed, clean slate
3. Add US1 → Branding renders → **MVP**
4. Add US3 → Error/destroyed states branded → Consistent
5. Add US4 → Legacy notes work → Backward-compatible
6. Add Polish → Tests updated, build verified → Ready to merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Zero new npm dependencies
- Net deletion: more code removed than added
- All branding env vars optional — unset = GoneNote default
- Commit after each phase checkpoint
