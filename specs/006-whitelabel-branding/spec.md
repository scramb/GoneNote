# Feature Specification: Whitelabel Branding

**Feature Branch**: `006-whitelabel-branding`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "I want to remove the runtime style selector. I want to be able to deliver this product as whitelabel. I want to be able to set the logo, the name and the full color scheme."

## Clarifications

### Session 2026-05-27

- Q: What should render when the logo image fails to load? → A: App name as text. Render the configured app name in styled text as the fallback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy with Custom Branding (Priority: P1)

An operator deploys GoneNote with environment variables specifying a custom app name, logo URL, and color scheme. The deployed instance renders with the operator's branding on every page — landing, note view, and error pages — without any per-note style options visible to end users.

**Why this priority**: This is the core whitelabel value proposition. Without it, the feature doesn't exist.

**Independent Test**: Deploy the app with `APP_NAME=SecureDrop`, `APP_LOGO_URL=https://example.com/logo.svg`, and a custom color scheme. Visit the landing page. Verify the header shows "SecureDrop" with the custom logo, and all pages use the custom colors. Verify the runtime style selector is not present.

**Acceptance Scenarios**:

1. **Given** the app is deployed with `APP_NAME="SecureDrop"`, **When** a user visits the landing page, **Then** the page title, header, and browser tab show "SecureDrop" instead of "GoneNote".
2. **Given** the app is deployed with `APP_LOGO_URL=https://cdn.example.com/logo.svg`, **When** a user visits any page, **Then** the custom logo is displayed in the header.
3. **Given** the app is deployed with custom color values for background, primary text, secondary text, and accent, **When** a user visits any page, **Then** the entire UI renders with the custom color scheme.
4. **Given** the app is deployed without any custom branding variables, **When** a user visits any page, **Then** the default GoneNote branding (name, logo, colors) is used.

---

### User Story 2 - Remove Runtime Style Selector (Priority: P1)

The per-note "Customize Style" section (StyleCustomizer component) is removed from the note creation form. Notes are created with the instance's branded look applied automatically — there is no per-note color customization.

**Why this priority**: The user explicitly requested removal. Keeping both systems would conflict and confuse users.

**Independent Test**: Visit the landing page. Verify the "Customize Style" toggle is absent. Create a note — verify it renders with the instance's brand colors.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they view the creation form, **Then** the "Customize Style" section is not present.
2. **Given** a note is created, **When** the recipient views it, **Then** the note page renders with the instance-level brand colors (no per-note customization).

---

### User Story 3 - Branded Error and Destroyed States (Priority: P2)

The branded logo, name, and colors are consistently applied to the note destroyed page and error pages.

**Why this priority**: Branding must be consistent everywhere. A default-branded error page after a branded note experience breaks trust.

**Independent Test**: Create and read a note on a branded instance. Verify the "Note destroyed" page uses the custom logo, name, and colors. Navigate to an invalid note URL — verify the error page uses the same branding.

**Acceptance Scenarios**:

1. **Given** a branded instance, **When** a note is destroyed after reading, **Then** the destroyed state page shows the custom logo, app name, and branded colors.
2. **Given** a branded instance, **When** a user navigates to an invalid or expired note URL, **Then** the error page shows the custom logo, app name, and branded colors.

---

### User Story 4 - Legacy Note Compatibility (Priority: P3)

Notes created before the whitelabel migration — including those with per-note custom styles from feature 005 — still render correctly. Per-note custom style data embedded in existing notes is ignored in favor of the instance brand colors.

**Why this priority**: Backward compatibility for existing notes. Low urgency since notes are ephemeral, but important during transition.

**Independent Test**: Create a note with the old per-note style data in Redis. View the note on a branded instance — it renders with instance brand colors, not the old per-note colors.

**Acceptance Scenarios**:

1. **Given** an existing note with per-note style data, **When** viewed on a branded instance, **Then** the instance brand colors are applied and the per-note style data is ignored.
2. **Given** an existing note without any style data, **When** viewed on a branded instance, **Then** the instance brand colors are applied.

---

### Edge Cases

- What happens when `APP_LOGO_URL` points to an inaccessible or broken image? (Resolved: renders the app name as styled text in place of the logo.)
- What happens when `APP_NAME` exceeds a reasonable length (e.g., 100 characters)?
- What happens when a color value is invalid (malformed hex)?
- What happens when only a subset of branding variables is provided (e.g., only logo but no colors)?
- What happens when the logo URL is an SVG that contains script or malicious content?
- What happens on very small screens with a long app name and a logo?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept an application name via deployment configuration that replaces "GoneNote" throughout the UI (page titles, headings, browser tab titles).
- **FR-002**: The system MUST accept a logo image URL via deployment configuration and render it in the page header on all routes.
- **FR-003**: The system MUST accept a full color scheme via deployment configuration: background color, primary text color, secondary text color, accent color, and surface/elevated colors.
- **FR-004**: The system MUST remove the runtime StyleCustomizer component and its associated hidden form fields, server-side style validation, and per-note style storage from feature 005.
- **FR-005**: The system MUST apply the configured brand colors globally — to the landing page, note view page, destroyed state, and error pages — without per-note variation.
- **FR-006**: The system MUST fall back to the default GoneNote branding (name, placeholder logo, default dark theme) when no custom branding variables are set.
- **FR-007**: The system MUST render the configured app name as styled text in place of the logo when a logo URL is configured but the image fails to load (broken link, network error, or invalid image).
- **FR-008**: The system MUST validate color values at startup and fall back to defaults for any invalid color, logging a warning.
- **FR-009**: The system MUST sanitize the app name to prevent HTML injection when rendering it in the UI.
- **FR-010**: The system MUST ignore per-note style data in existing notes and apply instance brand colors instead.

### Key Entities

- **Branding Config**: Instance-level configuration set at deployment time. Contains:
  - `appName`: A plain-text string displayed as the application name
  - `logoUrl`: A URL string pointing to the logo image
  - `colors`: A set of hex color values for background, surface, elevated, border, primary text, secondary text, muted text, accent, accent hover, success, and error

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The runtime style selector is completely absent from the UI — no references to StyleCustomizer, color pickers, or per-note style remain in the codebase or rendered output.
- **SC-002**: An operator can configure a fully branded instance by setting 3-5 environment variables or config values before deployment.
- **SC-003**: All four routes (landing, note view, destroyed state, error page) display the custom logo, app name, and color scheme without exception.
- **SC-004**: A deployment with no custom branding variables is visually identical to the current default GoneNote instance.
- **SC-005**: The branding configuration does not require a rebuild — the same container image can produce differently branded instances via environment variables.

## Assumptions

- Branding is configured via environment variables (e.g., `APP_NAME`, `APP_LOGO_URL`, `APP_COLOR_BG`, etc.) — consistent with the existing configuration pattern for `SECRET_KEY`, `REDIS_URL`, etc.
- The logo is a URL, not a file upload. This works with the existing Docker/Helm deployment model.
- The full color scheme covers all semantic color tokens in the existing design system: root/background, surface, elevated, border, primary text, secondary text, muted text, accent, accent-hover, success, and error.
- Partial branding is supported — any unset variable falls back to the default GoneNote value.
- The StyleCustomizer, ColorPreview components, and their associated code are removed. The `styleTemplateSchema` in validation.ts is removed. The per-note style storage logic in the server routes is removed. The `StatusAlert` color props added for feature 005 are removed.
- The note data storage format reverts to storing ciphertext directly (no JSON wrapper). Backward compatibility with existing JSON-wrapped notes is maintained during reads.
