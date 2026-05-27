# Tasks: Custom Style Templates

**Input**: Design documents from `specs/005-custom-style-templates/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks are included where they validate spec requirements. Existing e2e suite extended for new flows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify prerequisites — no new dependencies needed

- [x] T001 Verify `src/design/tokens.css` and `src/app.css` for default color token names to use as fallback values in CSS custom properties

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Validation schema that all user stories depend on

**CRITICAL**: No user story work can begin until validation schema is in place

- [x] T002 Add hex color validation regex and `styleTemplateSchema` (Zod object with optional nullable `backgroundColor`, `primaryColor`, `secondaryColor` fields) in `src/lib/validation.ts` per `data-model.md`

**Checkpoint**: Validation ready — color data can be parsed and validated server-side.

---

## Phase 3: User Story 1 & 2 — Color Selection UI + End-to-End Flow (Priority: P1)

**Goal**: User expands a "Customize Style" section on the landing page, picks colors with native color inputs, sees a live preview, submits, and the note page renders with custom colors.

**Independent Test**: Open landing page, expand style section, pick red background + white primary + yellow secondary, create note, open link — note page shows those exact colors.

**Test Cases**: US1 scenarios 1-3, US2 scenarios 1-3

### Implementation

- [x] T003 [P] [US1] Create `src/components/ColorPreview.svelte` — preview card showing selected background, primary text sample, and secondary text sample per `contracts/style-template.md`
- [x] T004 [P] [US1] Create `src/components/StyleCustomizer.svelte` — collapsible section with toggle button, three `<input type="color">` inputs, and ColorPreview integration per `contracts/style-template.md`
- [x] T005 [US1] Add StyleCustomizer to `src/routes/+page.svelte` between TTL selector and submit button, with state management for color values
- [x] T006 [US1] Extend form action in `src/routes/+page.server.ts` to accept `bgColor`, `primaryColor`, `secondaryColor` fields, validate via `styleTemplateSchema`, and store in Redis alongside note content per `data-model.md`
- [x] T007 [US1] Modify `src/routes/note/[id]/+page.server.ts` `load` function to extract and return `style` object from stored note data
- [x] T008 [US1] Apply custom CSS properties (`--custom-bg`, `--custom-primary`, `--custom-secondary`) in `src/routes/note/[id]/+page.svelte` via inline style on wrapper div, overriding default theme colors when `style` is present

**Checkpoint**: Full end-to-end flow works — pick colors, create note, view with custom colors. MVP achieved.

---

## Phase 4: User Story 3 — Color Validation & Safe Defaults (Priority: P2)

**Goal**: Invalid hex values are rejected server-side. Low-contrast combinations show a warning but don't block creation.

**Independent Test**: Submit a note with `#GGGGGG` as a color — rejected with validation error. Submit with black background + black text — warned but note is created.

**Test Cases**: US3 scenarios 1-3

### Implementation

- [x] T009 [US3] Add contrast ratio calculation (WCAG relative luminance) in `src/components/ColorPreview.svelte` and render warning text when background/primary contrast < 3:1 per `contracts/style-template.md`
- [x] T010 [US3] Add server-side validation error handling in `src/routes/+page.server.ts` for invalid hex codes — return 400 with clear error message displayed on the color field

**Checkpoint**: Invalid colors rejected, low contrast warned. Safety net in place.

---

## Phase 5: User Story 4 — Custom Colors on Error & Destroyed States (Priority: P3)

**Goal**: After a note is read (destroyed) or has expired, the status page uses the custom color scheme instead of reverting to default.

**Independent Test**: Create note with custom colors, view it once, verify "Note destroyed" status uses custom colors. Create note with 1s TTL, wait, open — error page uses custom colors.

**Test Cases**: US4 scenarios 1-2

### Implementation

- [x] T011 [US4] Pass custom style colors through to the destroyed state view in `src/routes/note/[id]/+page.svelte` — ensure the StatusAlert and its parent container inherit custom CSS properties
- [x] T012 [US4] Apply custom CSS properties on the error page `src/routes/+error.svelte` when custom style data is available (via page data or URL state)

**Checkpoint**: Custom colors persist through the full note lifecycle — view, destroy, expire.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Testing, CI, and validation

- [x] T013 [P] Add e2e tests for custom style flow in `e2e/tests/custom-style.spec.ts`: create note with custom colors, verify note page renders them, verify destroyed state uses them
- [x] T014 [P] Add unit tests for `styleTemplateSchema` validation in `tests/unit/validation.test.ts`: valid hex, invalid hex, null fields, CSS injection rejection
- [x] T015 Run `npm run build` to verify no compilation errors
- [x] T016 Run `npm test` to verify all existing tests still pass
- [x] T017 Run `npx playwright test --project=chromium` to verify e2e suite passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Foundational — core feature
- **US3 (Phase 4)**: Depends on US1+US2 (needs ColorPreview for contrast warning)
- **US4 (Phase 5)**: Depends on US1+US2 (needs note view rendering)
- **Polish (Phase 6)**: Depends on all user stories

### Within Phase 3 (US1+US2)

- T003 and T004 can run in parallel (ColorPreview and StyleCustomizer are different files, but StyleCustomizer imports ColorPreview — T003 should complete first, or be written together)
- T005 depends on T004 (uses StyleCustomizer)
- T006 can run in parallel with T005 (different files)
- T007 and T008 depend on T006 (need the stored format)

### Parallel Opportunities

- T003 and T004: ColorPreview and StyleCustomizer (write T003 first, then T004 can import it)
- T005 and T006: landing page UI and server action (different files)
- T013 and T014: e2e tests and unit tests (different test suites)

---

## Parallel Example: Phase 3 Core Implementation

```bash
# After T003 (ColorPreview) is done:
Task: "Create StyleCustomizer.svelte (T004)" — depends on T003

# Then in parallel:
Task: "Add StyleCustomizer to +page.svelte (T005)"
Task: "Extend form action in +page.server.ts (T006)"
```

## Parallel Example: Phase 6 Testing

```bash
Task: "Add e2e tests in custom-style.spec.ts (T013)"
Task: "Add unit tests for styleTemplateSchema (T014)"
```

---

## Implementation Strategy

### MVP First (US1+US2 Only)

1. Complete Phase 1: Setup — verify tokens
2. Complete Phase 2: Foundational — validation schema
3. Complete Phase 3: US1+US2 — ColorPreview, StyleCustomizer, form, note view
4. **STOP and VALIDATE**: Create a note with custom colors, verify the note page renders them
5. MVP achieved: custom style templates work end-to-end

### Incremental Delivery

1. Setup + Foundational → Validation ready
2. Add US1+US2 → Color pickers + end-to-end flow → **MVP**
3. Add US3 → Validation errors + contrast warning → Production-safe
4. Add US4 → Colors on destroyed/error states → Polished
5. Add Polish → Tests + build verification → Ready to merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new npm dependencies — all work uses existing stack
- Default color values for collapsed state: `null` (default theme)
- Contrast warning threshold: 3:1 ratio (WCAG AA for large text)
- CSS custom properties fallback syntax: `var(--custom-bg, var(--color-root))` ensures graceful degradation
- Commit after each phase checkpoint
