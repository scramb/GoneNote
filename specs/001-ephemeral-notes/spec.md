# Feature Specification: Ephemeral Notes

**Feature Branch**: `001-ephemeral-notes`

**Created**: 2026-05-26

**Status**: Draft

**Input**: User description: "Create an internal Privnote-like web app using SvelteKit where users can create a text note, optionally select a TTL, receive a unique link, and allow the note to be viewed exactly once before permanent deletion. Expired, invalid, or already-read notes must display appropriate error states. No authentication, user accounts, admin panel, email features, or note history."

## Clarifications

### Session 2026-05-26

- Q: Should notes support plain text only or formatted content (Markdown, limited HTML)? → A: Plain text only — rendered as preformatted text, no formatting or links.
- Q: Should the creator see a preview of the note content after creation, or only the shareable link? → A: Link only — after creation, the creator sees only the shareable link with no content preview.
- Q: If the server retrieves a note but the connection drops before the client receives it, is the note consumed or still available? → A: Destroy on retrieval — the note is deleted from storage the moment the server reads it, regardless of whether the client receives the full response.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Share a Note (Priority: P1)

A user visits the application, types a plain text note, optionally selects how long the
link should remain valid (TTL), and clicks a button to create the note. The application
generates a unique, unguessable link that the user can copy and share. The creator sees
only the link — no preview of the note content is displayed. If the creator opens the link
themselves, it consumes the one-time read just like any other access.

**Why this priority**: This is the core value proposition — without note creation, the
application serves no purpose. It is the entry point for all other flows.

**Independent Test**: Create a note with sample text, verify a unique link is returned,
confirm the link format is non-sequential and unguessable. This can be tested entirely
through the UI with no other features required.

**Acceptance Scenarios**:

1. **Given** a user is on the note creation page, **When** they enter text and click
   "Create Note" without selecting a TTL, **Then** a unique link is displayed and the
   default TTL is applied.

2. **Given** a user is on the note creation page, **When** they enter text, select a
   TTL of 1 hour, and click "Create Note", **Then** a unique link is displayed and the
   note will expire in 1 hour if not read.

3. **Given** a user is on the note creation page, **When** they click "Create Note"
   with an empty text field, **Then** a validation error is shown and no note is created.

4. **Given** a user is on the note creation page, **When** they enter text exceeding
   the maximum allowed length, **Then** a validation error is shown and the input is
   rejected before submission.

---

### User Story 2 - View a Note Once (Priority: P1)

A recipient opens the unique link and sees the note content. After viewing, the note is
permanently and irrecoverably deleted. Any subsequent attempt to access the same link
shows an "already read" error.

**Why this priority**: Together with note creation, one-time viewing is the defining
behavior of the application.

**Independent Test**: Create a note, open the generated link, verify the content is
displayed, then reload the same link and verify an "already read" error is shown.

**Acceptance Scenarios**:

1. **Given** an unread note exists, **When** a recipient opens the note link, **Then**
   the full note content is displayed exactly once.

2. **Given** a note has already been read, **When** anyone opens the note link again,
   **Then** a message is displayed indicating the note has already been read and the
   content is not shown.

3. **Given** a note exists, **When** the recipient views it, **Then** the note content
   is irrecoverably deleted from storage after display.

---

### User Story 3 - Expired Note Handling (Priority: P2)

A recipient attempts to open a note link after its TTL has elapsed. The application
displays an appropriate error indicating the note has expired.

**Why this priority**: TTL enforcement is a core security property, but the happy path
(creating and reading notes) is more critical to validate first.

**Independent Test**: Create a note with a very short TTL (e.g., 5 minutes), wait for
it to expire, then attempt to access the link and verify the expiry message.

**Acceptance Scenarios**:

1. **Given** a note exists with a TTL that has elapsed, **When** a recipient opens the
   note link, **Then** an "expired" error message is displayed and the note content is
   not shown.

2. **Given** a note exists with a TTL that has elapsed, **When** the system processes
   the expiry, **Then** the note content is irrecoverably deleted from storage.

---

### User Story 4 - Invalid Link Handling (Priority: P3)

A user navigates to a malformed, tampered, or non-existent note link. The application
displays an appropriate error without revealing internal system details.

**Why this priority**: Error handling for edge cases is important for a polished user
experience but does not block the core create-and-read flow.

**Independent Test**: Navigate to a deliberately malformed URL path, verify a generic
error message is displayed without stack traces or internal identifiers.

**Acceptance Scenarios**:

1. **Given** a user navigates to a URL that does not match any known note identifier
   format, **When** the page loads, **Then** a generic "note not found" error is
   displayed.

2. **Given** a user navigates to a URL with a properly formatted but non-existent
   note identifier, **When** the page loads, **Then** a "note not found" error is
   displayed without revealing whether the identifier was ever valid.

---

### Edge Cases

- What happens when two recipients open the same note link simultaneously? The first
  request to retrieve the note from storage wins; the note is deleted at that moment.
  The second receives an "already read" error. No coordination protocol is needed —
  the atomic delete-or-read operation enforces single access.
- What happens if the connection drops while viewing a note? The note is destroyed from
  storage the moment the server retrieves it for the response. If the client does not
  receive the full content, the note cannot be retried — it is already consumed.
- What happens when a note's TTL expires during an active viewing session? The note
  remains viewable for the duration of that request; the expiry check happens at
  request start.
- What happens if the storage backend is unavailable during note creation? The user
  receives a generic error message; no partial note is persisted.
- What happens with extremely long note content? Content length is capped; input
  exceeding the cap is rejected at the client and server.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a page where users can enter and submit plain text
  note content. Notes MUST be rendered as preformatted plain text with no formatting,
  linkification, or HTML interpretation.

- **FR-002**: The system MUST allow users to optionally select a TTL from a predefined
  set of durations (e.g., 1 hour, 1 day, 7 days, 30 days) with a secure default applied
  when no selection is made.

- **FR-003**: The system MUST generate a unique, cryptographically random identifier for
  each note with at least 128 bits of entropy.

- **FR-004**: The system MUST return a complete, shareable URL containing the note
  identifier after note creation.

- **FR-005**: The system MUST display note content exactly once. After the first
  successful retrieval, the note content and metadata MUST be irrecoverably deleted.

- **FR-006**: The system MUST enforce TTL expiration: notes not retrieved before their
  TTL elapses MUST be irrecoverably deleted and display an "expired" error on access
  attempts.

- **FR-007**: The system MUST display distinct, user-friendly error pages for:
  already-read notes, expired notes, and invalid/non-existent notes.

- **FR-008**: The system MUST validate note content length and reject input exceeding
  the maximum allowed size before processing.

- **FR-009**: The system MUST NOT require authentication, user registration, or session
  management for any operation.

- **FR-010**: The system MUST NOT log note content, note identifiers, or any
  content-derived data in any log output.

- **FR-011**: The system MUST encrypt note content at rest using authenticated
  encryption.

- **FR-012**: The system MUST NOT expose internal error details (stack traces, database
  errors, file paths) in error responses to clients.

- **FR-013**: The system MUST run cleanup of expired but unread notes within a bounded
  time window after TTL elapses, without requiring manual intervention.

### Key Entities

- **Note**: Represents a single ephemeral message. Key attributes: unique identifier
  (128+ bits of entropy), encrypted plain text content, creation timestamp, TTL duration,
  read status (boolean). Lifecycle: created → (read | expired) → irrecoverably deleted.

- **Note Identifier**: A cryptographically random token that serves as the lookup key.
  Must be unguessable and reveal no information about other notes (non-sequential).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a note and receive a shareable link in under 3 seconds.

- **SC-002**: A recipient can open a note link and view the content in under 2 seconds.

- **SC-003**: After a note is read, any subsequent access attempt within 1 second
  correctly returns an "already read" state with zero chance of content re-display.

- **SC-004**: Expired notes are cleaned up within 15 minutes of TTL elapsing.

- **SC-005**: 100% of note identifiers generated are unique and non-sequential (verified
  through statistical testing of a 10,000-note sample).

- **SC-006**: No note content or identifiers appear in application logs (verified by
  log audit after running the full acceptance test suite).

## Assumptions

- The application is for internal use within a trusted network; DDoS protection and
  rate limiting are handled at the infrastructure level, not the application level.
- The default TTL is 7 days unless the user selects otherwise. The shortest available
  TTL is 1 hour; the longest is 30 days.
- Maximum note content length is 100 KB.
- The application is served over HTTPS; TLS termination happens at a reverse proxy or
  load balancer.
- No database replication, backups, or WAL archiving are configured for the note
  storage — the storage layer must not retain copies after the application deletes a row.
- The application targets modern browsers (latest 2 versions of Chrome, Firefox, Safari,
  Edge). No IE11 or legacy browser support.
- The note link is the only mechanism for accessing note content. There is no search,
  index, or directory of notes.
