# Research: Custom Style Templates

**Phase**: 0 | **Date**: 2026-05-27

## Decision 1: Color Input Method

**Decision**: Native HTML `<input type="color">` elements

**Rationale**:
- Zero dependencies — browser-native, works in all target browsers
- Built-in accessibility (keyboard navigation, screen reader support)
- Mobile-friendly (triggers OS color picker)
- Outputs hex format (`#rrggbb`) natively, matching the spec requirement
- No validation needed for the picker output itself (browser guarantees valid hex)

**Alternatives considered**:
- **Text input with hex validation**: More error-prone, requires regex validation UI, worse mobile UX
- **JS color picker library (e.g., pickr, vanilla-picker)**: Adds dependency, maintenance burden, potential accessibility issues. Violates simplicity principle.

## Decision 2: Color Storage Format

**Decision**: Store colors as three hex strings in a `style` sub-object within the existing note data structure. Represent inline as CSS custom properties at render time.

**Rationale**:
- Hex strings are compact (~21 bytes for all three colors), simple to validate/parse
- No separate Redis key needed — stored with note content sharing the same TTL
- CSS custom properties (`--custom-bg`, `--custom-primary`, `--custom-secondary`) applied via inline style tag on the note view page
- No new data format or serialization layer needed

**Alternatives considered**:
- **Separate Redis key**: Adds complexity without benefit; style data always shares note lifecycle
- **CSS class names per template**: Would require pre-generating CSS classes or a dynamic stylesheet, adding complexity

## Decision 3: Contrast Warning Approach

**Decision**: Client-side relative luminance calculation using WCAG formula, warning displayed as inline text near the preview. No server-side contrast enforcement.

**Rationale**:
- Per the spec clarification: warn, don't reject
- WCAG relative luminance formula is well-defined, lightweight (~20 lines of JS), no dependencies
- Client-side warning appears instantly as colors change — no server round-trip needed
- Threshold: warn when contrast ratio < 3:1 (minimum for large text per WCAG AA)

**Alternatives considered**:
- **Server-side contrast check**: Adds latency, complicates validation, requires duplicating color logic
- **No contrast check**: Misses the spec requirement for a warning

## Decision 4: Style Application on Note View

**Decision**: Set CSS custom properties (`--custom-bg`, `--custom-primary`, `--custom-secondary`) on a wrapper div via inline `style` attribute. Use these variables to override Tailwind classes where needed.

**Rationale**:
- Inline style on a scoped wrapper avoids affecting the global theme
- CSS custom properties cascade naturally to all child elements
- No Tailwind config changes needed — the variables are consumed by component styles
- Falls back gracefully to default theme when no custom colors are present
- Survives the note destruction flow (colors persist until page navigation)

**Alternatives considered**:
- **Dynamic Tailwind classes**: Tailwind 4's JIT doesn't support runtime-generated color classes — would require `safelist` or `@theme` manipulation
- **Separate CSS file per note**: No — colors must be ephemeral, not persisted to disk
