# Tasks: GoneNote Visual Redesign

**Input**: Design documents from `/specs/002-gonenote-redesign/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, design-tokens.md, contracts/

**Tests**: Visual audit via manual walkthrough; existing 38 functional tests must continue to pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- `src/design/` — CSS tokens and global styles
- `src/components/` — Reusable Svelte components
- `src/components/icons/` — Inline SVG icon components
- `src/routes/` — Page-level Svelte files (restyled with components)
- Existing `src/lib/` files (`redis.ts`, `crypto.ts`, `validation.ts`, `logger.ts`, `cleanup.ts`) are UNCHANGED

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install Tailwind CSS and create the build pipeline

- [x] T001 Install Tailwind CSS 4.x, `@tailwindcss/vite`, `tailwind-merge`, and `clsx` in `package.json`
- [x] T002 [P] Create `postcss.config.js` with `@tailwindcss/postcss` and `autoprefixer` plugins
- [x] T003 [P] Create `tailwind.config.ts` with dark-first theme: colors, font families, spacing, blur, shadows, animation keyframes per design-tokens.md
- [x] T004 [P] Add Tailwind directives (`@import "tailwindcss"`) and token imports to `src/app.css`
- [x] T005 [P] Create `src/lib/utils.ts` with `cn()` helper using `tailwind-merge` + `clsx` for class conflict resolution
- [x] T006 Verify existing 38 tests still pass after Tailwind integration (`npm test`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design tokens, base styles, icon library — EVERY user story depends on these

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `src/design/tokens.css` with all CSS custom properties: colors (dark + light), typography scale, spacing scale, shadows, blur, border radii, animation easings per design-tokens.md
- [x] T008 [P] Create `src/design/base.css` with global resets, dark background, custom scrollbar styling, `::selection` colors, focus-ring defaults
- [x] T009 [P] Create `src/components/icons/CopyIcon.svelte` — inline SVG clipboard icon, sized via Tailwind classes
- [x] T010 [P] Create `src/components/icons/CheckIcon.svelte` — inline SVG checkmark icon
- [x] T011 [P] Create `src/components/icons/ShieldIcon.svelte` — inline SVG shield/privacy icon for hero
- [x] T012 [P] Create `src/components/icons/AlertIcon.svelte` — inline SVG info/alert icon
- [x] T013 [P] Create `src/components/icons/LockIcon.svelte` — inline SVG lock icon for destroyed notice
- [x] T014 [P] Create `src/components/Container.svelte` — max-width centered wrapper, responsive padding, `maxWidth` prop (sm/md/lg)
- [x] T015 [P] Create `src/components/Button.svelte` — variants (primary/ghost), sizes (sm/md), states (idle/hover/focus/active/loading/disabled), `class` prop merging via `cn()`
- [x] T016 [P] Create `src/components/Card.svelte` — glassmorphism and solid modes, optional hover lift, padding scale, `class` prop
- [x] T017 Create `src/routes/+layout.svelte` — root layout with dark background (`bg-[--color-bg-root]`), font cascade, imports `src/app.css`

**Checkpoint**: Foundation ready — all tokens, icons, base components available for page-level work

---

## Phase 3: User Story 1 - Landing Page First Impression (Priority: P1) 🎯 MVP

**Goal**: A visitor sees a premium dark-themed landing page with the GoneNote brand, tagline, and note creation form as the dominant element. Renders instantly with no layout shift.

**Independent Test**: Open `http://localhost:5173/` — verify dark background, "GoneNote" heading in correct type scale, tagline visible but secondary, textarea as the visual focal point, all within the Container component.

### Implementation for User Story 1

- [x] T018 [US1] Create `src/components/Textarea.svelte` — dark-themed textarea with focus glow ring, character count display, validation error state, `maxlength` enforcement
- [x] T019 [P] [US1] Create `src/components/RadioGroup.svelte` — TTL selector with animated selection indicator (teal background fill transition 250ms), horizontal layout
- [x] T020 [US1] Restyle `src/routes/+page.svelte` — replace inline `<style>` with component composition: Container + hero heading ("GoneNote") + tagline + Textarea + RadioGroup + Button
- [x] T021 [US1] Add landing page entrance animation: hero heading fades in + slides up on mount (respects `prefers-reduced-motion`)

**Checkpoint**: Landing page renders in dark theme with premium aesthetic

---

## Phase 4: User Story 2 - Note Creation Flow (Priority: P1) 🎯 MVP

**Goal**: User creates a note through a polished interface. The generated link appears in a glassmorphism card with smooth transition. Copy button provides instant feedback.

**Independent Test**: Submit a note — verify the form transitions smoothly to the result card, the glassmorphism effect is visible (blur behind card), and the Copy button shows "Copied!" with a pulse animation on click.

### Implementation for User Story 2

- [x] T022 [US2] Create `src/components/CopyButton.svelte` — clipboard API, idle/copying/copied states, text swap animation, teal pulse glow on copied state, reverts after 2s
- [x] T023 [US2] Create `src/components/LinkDisplay.svelte` — glassmorphism Card containing read-only input (absolute URL computed client-side via `browser` guard) + CopyButton, `animate-slide-up` entrance
- [x] T024 [US2] Update `src/routes/+page.svelte` result section to use LinkDisplay for the generated note URL — form → result transition via Svelte conditional rendering with fade
- [x] T025 [US2] Add form validation error display in Textarea component when server returns 400 (empty content, oversized, invalid TTL)

**Checkpoint**: Note creation flow complete — form submits, result card appears with glassmorphism, copy works with animation

---

## Phase 5: User Story 3 - Note Viewing Screen (Priority: P1) 🎯 MVP

**Goal**: Recipient views note content in a clean, reading-optimized dark layout. Content rendered in monospace within a Card. Destroyed notice is clear and calm.

**Independent Test**: Open a valid note link — content renders in monospace font within a Card, line height ≥1.6, "This note has been destroyed" notice visible below content, "Create your own note" link styled.

### Implementation for User Story 3

- [x] T026 [US3] Create `src/components/StatusAlert.svelte` — success/info/error variants with icon + title + message + optional action link, calm non-red styling
- [x] T027 [US3] Restyle `src/routes/note/[id]/+page.svelte` — Container + Card wrapping `<pre>` content with monospace font + StatusAlert (success type) for destroyed notice + ghost Button link to "/"
- [x] T028 [US3] Style the destroyed notice StatusAlert with LockIcon and teal "success" variant — communicates destruction calmly, not alarmingly

**Checkpoint**: Note viewing complete — content readable in dark theme, destruction clearly communicated

---

## Phase 6: User Story 4 - Error States (Priority: P2)

**Goal**: Error pages (404, 500) render in the same dark aesthetic with calm messaging, a subtle icon, and a path back to the creation flow. No red or alarming colors.

**Independent Test**: Navigate to `/note/invalid` and stop Redis then create a note — verify both error pages use StatusAlert with consistent dark background, info/error variants, no stack traces, visible link to "/".

### Implementation for User Story 4

- [x] T029 [US4] Restyle `src/routes/+error.svelte` — Container (centered) + StatusAlert (info type for 404, error/amber type for 500) + ghost Button link to "/"
- [x] T030 [US4] Verify all error states (malformed ID, nonexistent note, already-read, 500) use identical StatusAlert layout — distinguishable only by message text, never by color severity

**Checkpoint**: All error states polished — consistent, calm, non-leaking

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive behavior, accessibility, reduced motion, visual consistency audit

- [x] T031 [P] Add responsive breakpoints: single-column layout below 640px, adjusted type scale, full-width inputs on mobile, radio buttons wrap gracefully
- [x] T032 [P] Add `prefers-reduced-motion` handling: all animation durations set to `0ms`, keyframe animations to `none`, transitions to opacity-only in `src/design/base.css`
- [x] T033 [P] Add `@supports (backdrop-filter: blur(1px))` fallback in Card component — solid `bg-[--color-bg-elevated]` when blur unsupported
- [x] T034 [P] Audit focus states: verify every interactive element (textarea, radio, button, link, copy) has visible focus ring using teal glow
- [x] T035 [P] Add `sr-only` labels for icon-only buttons (copy button) and ensure form inputs have associated `<label>` elements
- [x] T036 Run visual audit against quickstart.md checklist: check all 4 screens + 5 error paths for token consistency, no style tag leftovers
- [x] T037 Verify existing 38 Vitest tests still pass and the production build (`npm run build`) succeeds with no CSS warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T006) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on US1 (Textarea, RadioGroup from T018-T019 reused in creation flow)
- **User Story 3 (Phase 5)**: Depends on Foundational — independent of US1/US2 (uses Card, Button, Container from Phase 2; adds StatusAlert)
- **User Story 4 (Phase 6)**: Depends on US3 (StatusAlert from T026)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — first because it creates Textarea and RadioGroup used by US2
- **User Story 2 (P1)**: Depends on US1 (reuses Textarea, RadioGroup in the same page)
- **User Story 3 (P1)**: Can start after Foundational independently (uses Card, Button, Container from Phase 2; creates own StatusAlert)
- **User Story 4 (P2)**: Depends on US3 for StatusAlert component

### Within Each User Story

- Components created first, then page assembly
- Components within a story marked [P] can be built in parallel
- Page assembly tasks depend on component creation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel within Phase 1
- All Foundational tasks T008-T016 can run in parallel after T007
- All icon tasks T009-T013 can run in parallel
- US1 components (T018, T019) can run in parallel
- US3 and US1 can run in parallel if different developers (they share only Phase 2 base components)
- Polish tasks T031-T035 can all run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all icons together:
Task: "Create CopyIcon.svelte"
Task: "Create CheckIcon.svelte"
Task: "Create ShieldIcon.svelte"
Task: "Create AlertIcon.svelte"
Task: "Create LockIcon.svelte"

# Launch base components together:
Task: "Create Container.svelte"
Task: "Create Button.svelte"
Task: "Create Card.svelte"
```

---

## Parallel Example: User Story 1

```bash
# Launch components in parallel:
Task: "Create Textarea.svelte"
Task: "Create RadioGroup.svelte"

# Then page assembly (depends on both):
Task: "Restyle +page.svelte landing page"
Task: "Add entrance animation"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T017)
3. Complete Phase 3: US1 (T018-T021) — landing page with form
4. Complete Phase 4: US2 (T022-T025) — creation flow with glassmorphism result
5. **STOP and VALIDATE**: Open landing page, create note, verify glassmorphism card appears, copy link
6. Deploy if ready — this is a complete creation flow

### Incremental Delivery

1. Setup + Foundational → Design system ready, components available
2. Add US1 → Landing page looks premium → Demo
3. Add US2 → Creation flow polished → Demo
4. Add US3 → Note viewing pristine → **MVP ready!**
5. Add US4 → Error states calm → Deploy
6. Polish → Responsive, accessible, motion-safe → Ship

### Parallel Team Strategy

With multiple developers after Foundational:

1. Developer A: User Story 1 + 2 (landing page + creation flow — sequential via shared page)
2. Developer B: User Story 3 (note viewing — independent files)
3. Developer C: User Story 4 (error states — small, can start once T026 StatusAlert is done)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- `src/lib/` files (redis.ts, crypto.ts, validation.ts, logger.ts, cleanup.ts) are UNCHANGED
- Existing 38 Vitest tests must continue to pass — do not modify test files or lib files
- Run `npm test` after each phase to catch regressions
- Run `npm run build` at each checkpoint to verify CSS compiles cleanly
- All animations must respect `prefers-reduced-motion: reduce` — verified in Polish phase
- Glassmorphism must fall back to solid colors in browsers without `backdrop-filter` support
