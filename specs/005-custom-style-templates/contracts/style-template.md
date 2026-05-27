# Style Template Contract

## Component: StyleCustomizer

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string \| null` | `null` | Current background color value (hex) |
| `primaryColor` | `string \| null` | `null` | Current primary text color value (hex) |
| `secondaryColor` | `string \| null` | `null` | Current secondary text color value (hex) |
| `onchange` | `(colors: { backgroundColor: string \| null; primaryColor: string \| null; secondaryColor: string \| null }) => void` | — | Called when any color changes |

### Behavior

- Renders a collapsible section with a toggle button ("Customize Style" / "Hide")
- Default state: collapsed
- When expanded, shows three `<input type="color">` elements labeled "Background", "Primary Text", "Secondary Text"
- Each input's current value is reflected in a `ColorPreview` component
- Calls `onchange` with all three current values whenever any color changes

### DOM Structure

```
<div data-testid="style-customizer">
  <button data-testid="style-toggle">Customize Style</button>
  <div data-testid="style-fields">
    <label>Background <input type="color" data-testid="color-bg" ...></label>
    <label>Primary Text <input type="color" data-testid="color-primary" ...></label>
    <label>Secondary Text <input type="color" data-testid="color-secondary" ...></label>
    <ColorPreview ... />
  </div>
</div>
```

## Component: ColorPreview

### Props

| Prop | Type | Description |
|------|------|-------------|
| `backgroundColor` | `string \| null` | Background hex |
| `primaryColor` | `string \| null` | Primary text hex |
| `secondaryColor` | `string \| null` | Secondary text hex |

### Behavior

- Displays a small preview card with the selected background, sample primary text, and sample secondary text
- When any color is `null`, uses the default theme color for that slot
- When all colors are `null`, preview shows the default dark theme
- Shows contrast warning text when background/primary contrast ratio < 3:1

### DOM Structure

```
<div data-testid="color-preview" style="background: <bg>">
  <p data-testid="preview-primary" style="color: <primary>">Primary text preview</p>
  <p data-testid="preview-secondary" style="color: <secondary>">Secondary text preview</p>
  <p data-testid="contrast-warning" class="hidden|visible">Low contrast warning</p>
</div>
```

## Server API: Form Action Extension

### POST / (create note)

**Additional form fields**:

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `bgColor` | `string` | No | Hex regex or empty |
| `primaryColor` | `string` | No | Hex regex or empty |
| `secondaryColor` | `string` | No | Hex regex or empty |

**Success response addition**: When style fields are provided, response includes `style: { backgroundColor, primaryColor, secondaryColor }`.

**Failure response**: Invalid hex values return 400 with `error: "Invalid color format."`.

## Note View Page: Custom Style Application

### Page Data

`+page.server.ts` `load` function returns an optional `style` object:

```typescript
interface PageData {
  content: string;
  style: StyleTemplate | null;
}
```

### Rendering

When `data.style` is present and non-null:
1. A wrapper `<div>` receives inline CSS custom properties:
   ```
   style="--custom-bg: #1a1a2e; --custom-primary: #e4e4ec; --custom-secondary: #a0a0b0"
   ```
2. The `<main>` element uses these variables:
   - `background-color: var(--custom-bg, var(--color-root))`
   - `.text-primary` overridden to `color: var(--custom-primary, var(--color-primary))`
   - `.text-secondary` overridden to `color: var(--custom-secondary, var(--color-secondary))`

When `data.style` is `null` or absent: default theme applies (no inline styles).
