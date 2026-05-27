# Test Case Contracts

Each test case contract specifies the user flow, setup, execution steps, and assertions. Every contract MUST be independently executable and produce a clear pass/fail result.

---

## TC-001: Create Note — Valid Content (P1)

**Source**: FR-001, User Story 1
**File**: `e2e/tests/create-note.spec.ts`

**Setup**: App running with Redis. Browser navigates to landing page.

**Steps**:
1. Type "Hello, this is a test note" into the textarea
2. Select TTL "1 hour" from the radio group
3. Click submit button

**Assertions**:
- A link element appears with a URL matching `/note/` pattern
- The link input is not empty
- No error message is displayed

---

## TC-002: Create Note — Click Link Opens Note (P1)

**Source**: FR-001, User Story 1
**File**: `e2e/tests/create-note.spec.ts`

**Setup**: A note is created via the UI (TC-001 flow).

**Steps**:
1. After note creation, capture the generated link URL
2. Navigate to that URL

**Assertions**:
- The page displays "Your note has been destroyed" or equivalent destruction indicator
- The note content text is visible on the page

---

## TC-003: View Note — First Read Shows Content (P1)

**Source**: FR-002, User Story 2
**File**: `e2e/tests/view-note.spec.ts`

**Setup**: A note is pre-created via Redis with content "Secret message for testing".

**Steps**:
1. Navigate to the note URL
2. Wait for page load

**Assertions**:
- Note content "Secret message for testing" is displayed
- A destruction indicator (e.g., "destroyed" or lock icon) is visible

---

## TC-004: View Note — Second Read Shows Gone (P1)

**Source**: FR-002, FR-003, User Story 2
**File**: `e2e/tests/view-note.spec.ts`

**Setup**: A note is pre-created and read once (TC-003 completes).

**Steps**:
1. Navigate to the same note URL again

**Assertions**:
- An error or "not found" message is displayed
- The original note content is NOT visible

---

## TC-005: Expired Note — TTL Elapsed (P1)

**Source**: FR-003, User Story 2
**File**: `e2e/tests/view-note.spec.ts`

**Setup**: A note is pre-created with TTL of 2 seconds.

**Steps**:
1. Wait 3 seconds for TTL to expire
2. Navigate to the note URL

**Assertions**:
- An error or "not found" message is displayed
- Note content is NOT visible

---

## TC-006: Empty Form Validation (P2)

**Source**: FR-004, User Story 3
**File**: `e2e/tests/error-handling.spec.ts`

**Setup**: Browser navigates to landing page.

**Steps**:
1. Leave the textarea empty
2. Click submit button

**Assertions**:
- Form is not submitted (no navigation, no link appears)
- A validation error message is displayed near the textarea or submit button

---

## TC-007: Whitespace-Only Content (P2)

**Source**: FR-004, Edge Cases
**File**: `e2e/tests/error-handling.spec.ts`

**Setup**: Browser navigates to landing page.

**Steps**:
1. Type "     " (spaces only) into the textarea
2. Click submit button

**Assertions**:
- Form is not submitted OR whitespace is trimmed and treated as empty
- Validation feedback is shown (if rejected) or a link is generated (if trimmed and valid minimum content exists)

---

## TC-008: Invalid Note ID (P2)

**Source**: FR-007, User Story 3
**File**: `e2e/tests/error-handling.spec.ts`

**Setup**: App running.

**Steps**:
1. Navigate to `/note/nonexistent12345`

**Assertions**:
- An error page or error message is displayed
- Message indicates the note was not found or has expired
- No blank page or unhandled error

---

## TC-009: Malformed Note ID (P2)

**Source**: FR-007, Edge Cases
**File**: `e2e/tests/error-handling.spec.ts`

**Setup**: App running.

**Steps**:
1. Navigate to `/note/<script>alert(1)</script>`
2. Navigate to `/note/../../../etc/passwd`

**Assertions**:
- Application returns an error response (not found or validation error)
- No content from the malicious path is executed or rendered

---

## TC-010: Copy Link to Clipboard (P3)

**Source**: FR-005, User Story 4
**File**: `e2e/tests/copy-link.spec.ts`

**Setup**: A note is created via the UI. Browser context has clipboard permissions granted.

**Steps**:
1. Click the copy button next to the generated link

**Assertions**:
- Clipboard contains the full note URL
- The copy button shows a "Copied" state or icon change

---

## TC-011: Copy Button Visual Feedback (P3)

**Source**: FR-005, User Story 4
**File**: `e2e/tests/copy-link.spec.ts`

**Setup**: A note is created via the UI.

**Steps**:
1. Observe the copy button state before clicking
2. Click the copy button
3. Observe the copy button state after clicking

**Assertions**:
- Button state changes from "copy" icon to "check" icon or "Copied" text
- The change is visible within 500ms of clicking

---

## TC-012: TTL Options Visible and Selectable (P3)

**Source**: FR-006, User Story 5
**File**: `e2e/tests/ttl-selection.spec.ts`

**Setup**: Browser navigates to landing page.

**Steps**:
1. Locate the TTL radio group

**Assertions**:
- At least 3 TTL options are visible
- One option is pre-selected (default)

---

## TC-013: TTL Selection Respected (P3)

**Source**: FR-006, User Story 5
**File**: `e2e/tests/ttl-selection.spec.ts`

**Setup**: Browser navigates to landing page.

**Steps**:
1. Select the shortest TTL option
2. Type content and submit
3. Immediately open the generated link

**Assertions**:
- Note is accessible immediately after creation (TTL hasn't expired during creation+view)
- Note content matches what was typed

---

## TC-014: Rapid Double Submit (P3)

**Source**: Edge Cases
**File**: `e2e/tests/error-handling.spec.ts`

**Setup**: Browser navigates to landing page.

**Steps**:
1. Type content into textarea
2. Click submit button twice rapidly (programmatic double-click)

**Assertions**:
- Only one note is created (no duplicate links or conflicting state)
- Application does not crash or show an unhandled error

---

## TC-015: Cross-Browser Smoke Test (P4)

**Source**: FR-008, User Story 6
**File**: `e2e/tests/accessibility.spec.ts`

**Parameters**: Runs per browser project (chromium, firefox, webkit).

**Steps**:
1. Navigate to landing page
2. Verify textarea, TTL selector, and submit button are visible
3. Type content and submit
4. Verify a link is generated

**Assertions**:
- All steps complete without error in each browser
- Core flow works end-to-end in Chrome, Firefox, Safari
