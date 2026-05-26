# Feature Specification: GoneNote Visual Redesign

**Feature Branch**: `002-gonenote-redesign`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Design GoneNote as a modern privacy-focused product with a premium dark theme, soft gradients, glassmorphism accents, smooth micro-interactions, and strong typography. Create a landing page, note creation screen, note viewing screen, and error states. The experience should feel like a mix of Linear, Raycast, and modern security products while remaining minimal, fast, and distraction-free."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Landing Page First Impression (Priority: P1)

A first-time visitor opens GoneNote and is greeted by a premium, dark-themed landing page that immediately communicates privacy and simplicity. The page loads instantly with no visible layout shift, and the typography signals trust and quality.

**Why this priority**: The landing page is the first touchpoint — it must establish credibility and guide the user to the single action: creating a note. A poor first impression undermines trust in the privacy claims.

**Independent Test**: Open the landing page in a clean browser session. Verify it renders in under 1 second, the dark theme is consistent across all elements, typography is sharp and readable, and the "create note" call-to-action is visually dominant. No elements flash or shift during load.

**Acceptance Scenarios**:

1. **Given** a user visits the root URL, **When** the page loads, **Then** the interface is fully rendered in dark theme within 1 second with no layout shift.

2. **Given** a user is on the landing page, **When** they scan the page, **Then** the primary action (note creation textarea) is the most visually prominent element — all other elements are subordinate.

3. **Given** a user views the landing page on a mobile device, **When** the page renders, **Then** all elements are legible, properly spaced, and the layout adapts without horizontal scroll.

---

### User Story 2 - Note Creation Flow (Priority: P1)

A user creates a note through an interface that feels fast, focused, and responsive. The textarea, TTL selector, and submit button are styled with the premium dark aesthetic. After submission, the generated link is displayed with a satisfying transition.

**Why this priority**: Note creation is the core user action. The visual design must make this flow feel effortless and trustworthy — friction here causes abandonment.

**Independent Test**: Enter text in the creation textarea, select a TTL, submit. Verify the link appears with a smooth transition (no jarring jump), and the "Copy" button provides immediate visual feedback on click.

**Acceptance Scenarios**:

1. **Given** a user focuses the note creation textarea, **When** they begin typing, **Then** a subtle glow or border highlight indicates active state with a smooth CSS transition (no abrupt color change).

2. **Given** a user selects a TTL option, **When** they click a radio button, **Then** the selection change animates smoothly (e.g., background fill transition) without layout shift.

3. **Given** a user submits a valid note, **When** the response returns, **Then** the form transitions into the result state with a fade or slide animation, and the link is displayed in a glassmorphism-styled card.

4. **Given** a user clicks "Copy", **When** the clipboard operation succeeds, **Then** the button text changes to "Copied!" with a brief checkmark or color pulse, then reverts after 2 seconds.

---

### User Story 3 - Note Viewing Screen (Priority: P1)

A recipient opens a note link and sees the content displayed in a clean, reading-optimized layout with the premium dark theme. The page reinforces the ephemeral nature of the content — it's clear the note is now destroyed.

**Why this priority**: The viewing experience is half the product. If the reading screen looks untrustworthy, recipients won't feel safe that the content was truly destroyed.

**Independent Test**: Open a valid note link. Verify content renders in a readable dark-themed container, the "destroyed" notice is clear, and the "Create your own note" link is discoverable.

**Acceptance Scenarios**:

1. **Given** a recipient opens a valid note link, **When** the content loads, **Then** it appears in a glassmorphism-styled reading container with comfortable line height and font sizing.

2. **Given** a recipient views a note, **When** they finish reading, **Then** a visible notice communicates the note is destroyed, styled with appropriate gravity (e.g., subtle alert icon, muted text).

---

### User Story 4 - Error States (Priority: P2)

Users encountering invalid, expired, or already-read notes see error screens that match the premium dark aesthetic. Error states are calm, clear, and guide the user back to the creation flow without frustration.

**Why this priority**: Error states are part of the security model (indistinguishable externally) but their visual treatment is secondary to the happy path. They must not look broken or unpolished.

**Independent Test**: Navigate to `/note/not-a-uuid` and verify the error page renders in dark theme with consistent typography, a clear message, and a visible link to create a note.

**Acceptance Scenarios**:

1. **Given** a user navigates to an invalid or consumed note link, **When** the error page loads, **Then** it displays a calm, centered message in the dark theme with a subtle icon or illustration — no red error styling, no stack traces.

2. **Given** a 500 server error occurs, **When** the error page renders, **Then** it matches the same dark-themed layout as 404 errors but with a different, equally calm message — never exposes internal details.

---

### Edge Cases

- What happens when JavaScript is disabled? The core creation and viewing flows must remain functional (progressive enhancement). Animations and glassmorphism effects degrade gracefully to static dark styling.
- What happens on slow connections? The page skeleton renders immediately; any background gradient or blur effect appears as soon as the browser can composite it without blocking interaction.
- What happens with very long note content? The viewing container expands vertically; the dark background fills the viewport even if content is short.
- What happens when system prefers reduced motion? All animations are disabled or reduced to opacity-only transitions per `prefers-reduced-motion: reduce`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All screens MUST use a consistent dark color palette (background near-black, surface elevated gray, text high-contrast light) with no light-mode or mixed-mode renders.

- **FR-002**: The landing page MUST include a hero section with the product name "GoneNote", a brief tagline communicating ephemeral privacy, and the note creation form as the dominant interactive element.

- **FR-003**: Interactive elements (textarea, radio buttons, buttons) MUST provide visible focus indicators with smooth transition animations (≥150ms, ≤300ms) for state changes.

- **FR-004**: The note creation result (generated link) MUST render in a glassmorphism-styled card — a semi-transparent background with backdrop blur, subtle border, and soft shadow.

- **FR-005**: Typography MUST use a system font stack with a geometric or monospace primary font and a reading-optimized secondary font for note content display.

- **FR-006**: The "Copy" button on the generated link MUST provide immediate visual feedback (text change and brief color pulse, ≤300ms) confirming the clipboard operation.

- **FR-007**: The note viewing screen MUST render content in a reading-optimized container with generous line height (≥1.6), comfortable max-width (≤720px), and consistent dark surface styling.

- **FR-008**: All error screens (404, 500) MUST use the same dark theme as the main application with a centered layout, calm messaging, and no red or alarming colors — errors should feel informative, not punitive.

- **FR-009**: Animations and micro-interactions MUST respect the `prefers-reduced-motion` media query, falling back to opacity-only or zero-duration transitions when the user prefers reduced motion.

- **FR-010**: The application MUST render without visible layout shift (CLS ≤ 0.05) on initial load and during state transitions (form → result, page → error).

- **FR-011**: The design MUST adapt to viewport widths from 320px to 2560px without horizontal scroll, broken layouts, or overlapping elements.

- **FR-012**: Glassmorphism effects (backdrop blur, semi-transparent surfaces) MUST degrade gracefully in browsers that don't support `backdrop-filter` — surfaces fall back to solid dark colors.

### Key Entities

No new data entities are introduced by this feature. The design refresh applies to the existing Note entity's presentation layer only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: First-time visitors perceive the application as "premium" or "trustworthy" — measured by a user acceptance test with ≥80% positive rating across 10 participants shown the landing page for 5 seconds.

- **SC-002**: The landing page renders interactively within 1.5 seconds on a 3G connection (measured via Lighthouse performance score ≥90).

- **SC-003**: Cumulative Layout Shift (CLS) remains ≤0.05 across all page loads and state transitions (form submit, link display, error navigation).

- **SC-004**: All interactive elements respond to user input within 100ms (hover, focus, click) with visible feedback — measured by manual walkthrough of all interactive states.

- **SC-005**: The application maintains visual consistency — a designer audit of 4 screens (landing, creation result, note view, error) confirms consistent color values, spacing scale, and typography hierarchy with zero deviations.

- **SC-006**: Users with `prefers-reduced-motion` enabled experience no animations beyond opacity fades — verified by automated screenshot comparison of key frames with and without the preference.

## Assumptions

- The existing functional behavior (note creation, one-time viewing, TTL expiry, error handling) remains unchanged. This feature is purely a visual and UX layer.
- System font stack: `"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` for UI; `"JetBrains Mono", "SF Mono", "Fira Code", monospace` for note content display.
- The color palette is dark-only — no light mode toggle is required for v1.
- Glassmorphism effects use CSS `backdrop-filter: blur()` with a solid fallback for unsupported browsers (detected via `@supports`).
- Fonts are loaded from the system, not from Google Fonts or other external CDNs, to avoid privacy implications and extra requests.
- The landing page, creation screen, and note viewing screen share the same route structure as the current implementation (no new routes).
- Micro-interactions use CSS transitions and animations only — no JavaScript animation libraries are needed. This keeps the bundle small and performance high.
