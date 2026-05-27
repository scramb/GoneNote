# Feature Specification: End-to-End Test Suite

**Feature Branch**: `004-e2e-test-suite`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "I want to have a full e2e test suite"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Note Creation Happy Path (Priority: P1)

A user visits the landing page, types a note, selects a TTL, submits the form, and receives a shareable link to their encrypted note.

**Why this priority**: Note creation is the core value proposition of the application. Without it working end-to-end, the app serves no purpose.

**Independent Test**: Can be fully tested by opening the app in a browser, typing a message, selecting a TTL, clicking submit, and verifying a link is displayed that leads to the created note.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they type a message and select a TTL and click submit, **Then** a unique shareable link is displayed on the page.
2. **Given** a user has created a note, **When** they click the generated link, **Then** the full note content is displayed on the note view page.
3. **Given** a user creates a note with the shortest TTL option, **When** they visit the note link, **Then** the note content is visible (it hasn't expired yet).

---

### User Story 2 - Note Viewing and Self-Destruction (Priority: P1)

A recipient opens a note link, views the encrypted content once, and the note is permanently destroyed after viewing.

**Why this priority**: The one-time read-and-destroy mechanic is what makes the app "ephemeral." This is the second half of the core flow.

**Independent Test**: Can be tested by creating a note, opening the link, confirming the content is displayed, then reloading the page and confirming the note is gone.

**Acceptance Scenarios**:

1. **Given** a note exists, **When** a recipient opens the note link for the first time, **Then** the full note content is displayed with a clear indication that the note has been destroyed.
2. **Given** a note has been viewed once, **When** anyone opens the same note link again, **Then** a message is shown indicating the note no longer exists or has already been read.
3. **Given** a note was created with a specific TTL, **When** the TTL expires before anyone views it, **Then** the note is no longer accessible.

---

### User Story 3 - Error Handling and Edge Cases (Priority: P2)

The application handles invalid inputs, missing notes, and server unavailability gracefully with clear user feedback.

**Why this priority**: Users will encounter error states (expired links, mistyped URLs, server issues). Graceful handling builds trust and prevents confusion.

**Independent Test**: Can be tested by navigating to invalid note IDs, submitting empty forms, and simulating server unavailability.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they submit the form without typing any content, **Then** the form is not submitted and validation feedback is shown.
2. **Given** a user navigates to a non-existent or malformed note ID, **When** the page loads, **Then** an error message is displayed indicating the note was not found.
3. **Given** the backend is unavailable, **When** a user attempts to create or view a note, **Then** an error message is displayed informing the user the service is temporarily unavailable.

---

### User Story 4 - Link Copy Functionality (Priority: P3)

A user who creates a note can copy the shareable link to their clipboard with a single click.

**Why this priority**: This is a convenience feature that improves sharing UX but doesn't block the core create-and-view flow.

**Independent Test**: Can be tested by creating a note, clicking the copy button, and verifying the clipboard contains the correct URL.

**Acceptance Scenarios**:

1. **Given** a note has been created and a link is displayed, **When** the user clicks the copy button, **Then** the full note URL is copied to the system clipboard.
2. **Given** a user has clicked copy, **When** the copy completes, **Then** the button shows a visual confirmation (e.g., icon change or "Copied" text).

---

### User Story 5 - TTL Selection (Priority: P3)

A user can choose from multiple TTL options when creating a note to control how long the note remains available before auto-expiry.

**Why this priority**: TTL selection is present in the UI but verifying it works end-to-end across all options is a completeness concern rather than a core flow blocker.

**Independent Test**: Can be tested by creating notes with each TTL option and verifying the expiry behavior.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they view the TTL selector, **Then** multiple duration options are available and a default is pre-selected.
2. **Given** a user selects a specific TTL, **When** they submit the note, **Then** the note respects that TTL setting.

---

### User Story 6 - Cross-Browser Compatibility (Priority: P4)

The full e2e test suite runs successfully across all supported browsers.

**Why this priority**: Validates the app works for all users regardless of browser choice, but is secondary to having the tests themselves.

**Independent Test**: Can be tested by running the e2e suite in each target browser (Chrome, Firefox, Safari, Edge).

**Acceptance Scenarios**:

1. **Given** the e2e test suite, **When** it runs in Chrome (latest), **Then** all tests pass.
2. **Given** the e2e test suite, **When** it runs in Firefox (latest), **Then** all tests pass.
3. **Given** the e2e test suite, **When** it runs in Safari (latest), **Then** all tests pass.

---

### Edge Cases

- What happens when a user creates a note with only whitespace characters?
- What happens when a note URL is accessed with an ID that has invalid characters?
- What happens when the Redis connection pool is exhausted during note creation?
- What happens when a note's TTL is exactly at the boundary (expired mid-request)?
- What happens when a user rapidly double-clicks the submit button?
- What happens when the clipboard API is unavailable (e.g., insecure context or permission denied)?
- What happens when a note exceeds the maximum content length?
- What happens when a user navigates directly to a note URL that was never created?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The test suite MUST cover the full note creation flow: visit landing page, type content, select TTL, submit, verify link generation.
- **FR-002**: The test suite MUST cover the full note viewing flow: open note link, verify content is displayed, verify note is destroyed after reading.
- **FR-003**: The test suite MUST verify that expired or already-read notes show an appropriate "not found" or "already viewed" state.
- **FR-004**: The test suite MUST verify form validation prevents submission of empty content.
- **FR-005**: The test suite MUST verify the copy-to-clipboard button copies the correct URL and shows confirmation feedback.
- **FR-006**: The test suite MUST verify all available TTL options are selectable and the selection is respected.
- **FR-007**: The test suite MUST verify the application handles backend unavailability with user-facing error messages (not blank pages or crashes).
- **FR-008**: The test suite MUST produce clear pass/fail output suitable for CI/CD integration.
- **FR-009**: The test suite MUST run against a real or containerized application instance with a real Redis backend.
- **FR-010**: The test suite MUST be designed to run in CI/CD pipelines without interactive input.
- **FR-011**: The test suite MUST clean up test data so test runs are independent and repeatable.
- **FR-012**: The test suite MUST provide screenshots or traces on failure to aid debugging.

### Key Entities

- **Test Run**: Represents a single execution of the e2e suite, containing results for each test case (pass/fail), duration, and failure artifacts (screenshots, logs).
- **Test Case**: An individual e2e scenario covering one specific user flow, with defined setup, execution steps, and assertions.
- **Test Fixture**: Pre-configured test data and application state needed for a test case to execute (e.g., a pre-created note with known content).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The full e2e suite completes in under 5 minutes on a standard CI runner.
- **SC-002**: Every user-facing route and component interaction is covered by at least one e2e test.
- **SC-003**: Test failures include sufficient context (screenshot, page state, server logs) for a developer to diagnose the issue without reproducing the failure locally.
- **SC-004**: The test suite runs reliably — no more than 1 flaky failure per 20 CI runs.
- **SC-005**: The test suite can be executed with a single command from the project root.
- **SC-006**: 100% of critical user flows (create note, view note, handle expired note) are covered by e2e tests.

## Assumptions

- The application runs in a containerized environment for CI testing (Docker Compose with the app and Redis).
- The existing unit test suite (Vitest, 38 tests) remains unchanged and separate from e2e tests.
- Supported browsers are the latest 2 versions of Chrome, Firefox, Safari, and Edge, consistent with the project's existing browser targets.
- The test framework will be selected during planning based on the SvelteKit ecosystem (Playwright or Cypress are the reasonable defaults — Playwright is assumed given its SvelteKit integration).
- E2e tests run against a production-like build, not the dev server, to accurately reflect user experience.
- Test data isolation is achieved by using Redis database numbering or key prefixes rather than requiring a dedicated Redis instance.
