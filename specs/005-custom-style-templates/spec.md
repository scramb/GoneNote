# Feature Specification: Custom Style Templates

**Feature Branch**: `005-custom-style-templates`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "I want to be able to overwrite custom style templates. This basically sets the background color, the primary color and secondary color."

## Clarifications

### Session 2026-05-27

- Q: Should the system reject poor-contrast color combinations outright, or only warn while still allowing creation? → A: Warn only. Show a warning that contrast is low, but allow the user to proceed and create the note anyway.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Apply Custom Colors at Note Creation (Priority: P1)

A note creator picks a background color, primary text color, and secondary text color from the creation form. When the recipient opens the note link, the note page renders with those custom colors instead of the default dark theme.

**Why this priority**: This is the core value — without it, the feature doesn't exist. The creator's color choices must transfer to the recipient's view.

**Independent Test**: Create a note with custom red background, white primary text, and yellow secondary text. Open the note link. Verify the note page background is red, the main text is white, and the secondary text is yellow.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they open the style customization section and select a background color, primary color, and secondary color, then create a note, **Then** the generated note link leads to a page where those exact colors are applied.
2. **Given** a note was created with custom colors, **When** a recipient views the note, **Then** the background, primary text, and secondary text match the selected colors.
3. **Given** a note was created without custom colors, **When** the recipient views the note, **Then** the default dark theme is displayed (backward compatibility).

---

### User Story 2 - Color Selection Interface (Priority: P1)

The note creation form provides color inputs for background, primary, and secondary colors. Users can see a live preview of their color choices before submitting.

**Why this priority**: Without a usable color input, the feature can't be accessed. The preview reduces errors — users see what they're creating.

**Independent Test**: Open the landing page, toggle the style customization section, change each color input, and verify a preview reflects the current selections.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they click to expand the style customization section, **Then** three color controls are visible: one for background color, one for primary color, and one for secondary color.
2. **Given** the style customization section is open, **When** the user changes any color value, **Then** a preview area updates immediately to show the selected colors together.
3. **Given** the style customization section is collapsed, **When** the user creates a note, **Then** the default theme colors are applied (no custom template).

---

### User Story 3 - Color Validation and Safe Defaults (Priority: P2)

Invalid or inaccessible color values are rejected, and the system always falls back to readable defaults. The note remains readable even if custom colors have poor contrast.

**Why this priority**: Safety net. Without validation, users could create unreadable notes (white text on white background) or break the page with invalid color values.

**Independent Test**: Attempt to create a note with invalid hex codes, CSS injection strings, and identical foreground/background colors. Verify each is handled gracefully.

**Acceptance Scenarios**:

1. **Given** a user enters an invalid hex color value (e.g., `#GGGGGG`), **When** they submit the form, **Then** the invalid field is rejected with a clear validation message.
2. **Given** a user enters a CSS injection attempt (e.g., `red; background-image: url(...)`) as a color value, **When** they submit the form, **Then** the value is rejected as invalid.
3. **Given** a user selects colors with poor contrast between background and primary text, **When** they submit, **Then** the system warns that the note may be hard to read but allows creation to proceed.

---

### User Story 4 - Custom Colors on Error and Destroyed States (Priority: P3)

The custom colors extend to the post-read "note destroyed" state and the error page for expired notes, maintaining visual consistency.

**Why this priority**: Polish. The core read flow works without this, but inconsistent styling after destruction feels broken.

**Independent Test**: Create a note with custom colors, read it once, and verify the "note destroyed" message uses the custom secondary color.

**Acceptance Scenarios**:

1. **Given** a note with custom colors has been destroyed after reading, **When** the page shows the destruction message, **Then** the message uses the custom primary and secondary colors against the custom background.
2. **Given** a note with custom colors has expired, **When** someone tries to view it, **Then** the error page uses the custom color scheme.

---

### Edge Cases

- What happens when a user selects a very dark background with a very dark primary color (low contrast)?
- What happens when a user provides a color value containing special characters or escape sequences?
- What happens when the custom colors are identical to the default theme colors?
- What happens when a user rapidly switches between many color values before submitting?
- What happens when a note with custom colors is viewed in a browser that doesn't support the CSS features used?
- What happens when the color customization section is opened on a mobile device with limited screen space?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The note creation form MUST include an expandable section for customizing a style template with three color fields: background color, primary color, and secondary color.
- **FR-002**: The system MUST validate color inputs as valid 6-digit hex color codes (e.g., `#FF5733`) and reject any non-hex or malformed values.
- **FR-003**: The system MUST store the selected color values alongside the note content during creation.
- **FR-004**: The note view page MUST render with the stored custom colors when a note has a custom style template.
- **FR-005**: Notes created without custom colors MUST render with the existing default dark theme (unchanged behavior).
- **FR-006**: The creation form MUST provide a live preview of the selected colors before submission.
- **FR-007**: The system MUST reject color values containing non-color content (CSS injection, scripts, URLs).
- **FR-008**: The system MUST apply custom colors to the post-read "note destroyed" state and the expired-note error page.
- **FR-009**: The style customization section MUST default to collapsed/hidden to keep the creation form simple for users who don't need it.
- **FR-010**: Custom color data MUST be treated with the same security and storage rules as note content (encrypted at rest, destroyed after reading).
- **FR-011**: The system MUST warn the user when selected color combinations have low contrast (e.g., similar background and text colors), but MUST still allow note creation to proceed.

### Key Entities

- **Style Template**: A set of three color values (background, primary, secondary) attached to a note. Stored alongside the note in Redis with the same TTL. Contains:
  - `backgroundColor`: A validated hex color string
  - `primaryColor`: A validated hex color string
  - `secondaryColor`: A validated hex color string

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can customize colors and create a note in under 1 additional minute compared to creating a note without customization.
- **SC-002**: 100% of notes with custom templates render with the correct colors in all supported browsers.
- **SC-003**: Invalid color inputs are rejected before the note is created — no note with broken colors is ever stored.
- **SC-004**: Notes with custom templates have the same read-and-destroy reliability as default notes.
- **SC-005**: The color customization UI does not increase the landing page load time by more than 200ms.

## Assumptions

- Color values are stored as hex strings (e.g., `#1a1a2e`). This is the simplest, safest format.
- The style customization section defaults to collapsed — the creator must explicitly expand it. This keeps the default creation flow unchanged for users who don't need customization.
- Custom colors apply to the note view page only, not the landing page or other shared UI.
- Color preview is a rendered swatch or mini-card, not a full-page preview.
- The feature works within the existing ephemeral storage model — style data is deleted along with note content after reading or expiry.
- The existing dark-first design system remains the default and is not replaced.
