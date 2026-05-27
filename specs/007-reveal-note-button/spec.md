# Feature Specification: Reveal Note Button

**Feature Branch**: `007-reveal-note-button`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "I would like to make sure any preview of the note page does not trigger the read of the link. Therefore we need to build a 'Reveal Note' button on the note page that actually triggers the read of the note."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Two-Step Note Access (Priority: P1)

A recipient opens a note link. The page loads and shows that a note is available, but does NOT reveal its content. The recipient must click a "Reveal Note" button to read the note, at which point the note is permanently destroyed.

**Why this priority**: This is the core protection mechanism. Without it, any link preview (chat app, social media, email client) that fetches the URL will silently destroy the note before the intended recipient ever sees it.

**Independent Test**: Create a note. Open the link in a browser. Verify the page shows a "Reveal Note" button and no note content is visible. Click the button. Verify the note content appears and the destruction message is shown.

**Acceptance Scenarios**:

1. **Given** a note exists, **When** a recipient opens the note link, **Then** the page loads without revealing the note content and displays a "Reveal Note" button.
2. **Given** a recipient is on the note page with the "Reveal Note" button visible, **When** they click the button, **Then** the note content is displayed and the destruction indicator is shown.
3. **Given** a note has been revealed, **When** anyone opens the same link again, **Then** an error message is displayed indicating the note is gone (same as current behavior).

---

### User Story 2 - Preview-Safe Page Load (Priority: P1)

Link preview bots, chat expanders, and other automated URL fetchers that load the note page do NOT trigger the note read. The note remains available for the human recipient.

**Why this priority**: This is the reason the feature exists. Automated fetchers must not consume notes.

**Independent Test**: Use `curl` to fetch a note URL (simulating a link preview bot). Verify the response does not contain the note content. Verify the note is still accessible afterward.

**Acceptance Scenarios**:

1. **Given** a note exists, **When** an HTTP GET request is made to the note URL (without the reveal action), **Then** the server responds with the note-available page but does NOT return the note content and does NOT delete the note from storage.
2. **Given** a note exists and its URL has been fetched by a preview bot, **When** a human opens the link and clicks "Reveal Note", **Then** the note content is still available and displays correctly.

---

### User Story 3 - Reveal Failure Handling (Priority: P2)

If the reveal action fails — because the note expired between page load and button click, or someone else already revealed it — the user sees a clear error message.

**Why this priority**: Edge case handling. Most reveals will succeed, but when they don't, the experience must be clear.

**Independent Test**: Create a note. Open the link (do not click reveal). Use a script to delete the note from Redis. Click "Reveal Note". Verify a clear error message is shown.

**Acceptance Scenarios**:

1. **Given** a note expired between page load and the "Reveal Note" click, **When** the recipient clicks the button, **Then** an error message is displayed indicating the note is no longer available.
2. **Given** another recipient already revealed and destroyed the note, **When** a second recipient clicks "Reveal Note", **Then** an error message is displayed indicating the note has already been read.

---

### Edge Cases

- What happens when a user opens the note link and waits a long time before clicking "Reveal Note" (TTL expiry during the gap)?
- What happens when a user rapidly clicks "Reveal Note" multiple times?
- What happens when a user navigates back after revealing the note, then forward again?
- What happens when JavaScript is disabled — can the note still be read?
- What happens when the reveal action is called directly (e.g., via `curl -X POST`) without loading the page first?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Loading the note page MUST NOT trigger the note read or deletion. The server MUST only verify the note exists and is valid, returning a page with a "Reveal Note" button.
- **FR-002**: The note page MUST display a clear indication that a note is waiting, without showing any note content.
- **FR-003**: Clicking the "Reveal Note" button MUST trigger the actual note read-and-destroy operation, after which the note content is displayed with the destruction indicator.
- **FR-004**: The reveal action MUST be an explicit user-initiated request (form POST or fetch) that the server treats as the read-and-destroy trigger.
- **FR-005**: If the note no longer exists when the reveal action is triggered (expired or already read), the system MUST display a clear error message.
- **FR-006**: Automated HTTP GET requests (link previews, crawlers) MUST NOT trigger the note read. The note page response without reveal MUST NOT contain the note plaintext.
- **FR-007**: The system MUST provide a noscript fallback so recipients without JavaScript can still read the note (e.g., the initial page contains a form that submits to trigger the reveal).
- **FR-008**: After reveal, the page MUST show the note content and the destruction/expired indicator, matching the current post-read behavior.

### Key Entities

- **Note Page State**: The note page has two states:
  - **Unrevealed**: Page shows a note-is-available message and a "Reveal Note" button. Note content is NOT in the page. The note still exists in storage.
  - **Revealed**: User clicked the button. Note content is displayed along with the destruction indicator. The note no longer exists in storage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A `curl` or `wget` fetch of a note URL does not cause the note to be deleted — verified by the note still being accessible afterward.
- **SC-002**: 100% of note reads require an explicit user action (button click or form submit) beyond simply opening the URL.
- **SC-003**: The time between clicking "Reveal Note" and seeing the content is under 2 seconds on a typical connection.
- **SC-004**: The reveal flow works with JavaScript disabled (noscript fallback functional).

## Assumptions

- The note existence check on page load verifies the note key exists in Redis and has not expired, but does NOT call GETDEL.
- The reveal action is a server-side form action (POST) or API endpoint that calls GETDEL, decrypts, and returns the content.
- The existing note URL structure (`/note/<id>`) remains unchanged. The two-step flow is handled by the same route with a state distinction (initial load vs. reveal action).
- Link preview bots typically send GET requests and do not execute JavaScript. They will see the unrevealed page only.
- The "Reveal Note" button is styled consistently with the existing design system and branded color scheme.
