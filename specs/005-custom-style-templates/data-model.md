# Data Model: Custom Style Templates

**Phase**: 1 | **Date**: 2026-05-27

## Entities

### StyleTemplate

Attached to a note at creation time. Stored alongside note content in Redis with the same TTL. Destroyed when the note is read or expires.

| Field | Type | Validation | Description |
|-------|------|-----------|-------------|
| `backgroundColor` | `string` | 6-digit hex regex `/^#[0-9a-fA-F]{6}$/`, default `null` | Note page background color |
| `primaryColor` | `string` | 6-digit hex regex `/^#[0-9a-fA-F]{6}$/`, default `null` | Primary text color |
| `secondaryColor` | `string` | 6-digit hex regex `/^#[0-9a-fA-F]{6}$/`, default `null` | Secondary/muted text color |

**Nullability**: All three fields are nullable. When all are `null` (or absent), the default dark theme is used — no custom colors are applied.

**Partial templates**: A template with some fields set and others `null` is valid. Only the non-null colors override defaults. This allows, for example, changing only the background while keeping default text colors.

### Storage Format

Stored as a JSON sub-object within the note's Redis value:

```json
{
  "content": "<encrypted note content>",
  "style": {
    "backgroundColor": "#1a1a2e",
    "primaryColor": "#e4e4ec",
    "secondaryColor": "#a0a0b0"
  }
}
```

Or, when no customization:

```json
{
  "content": "<encrypted note content>"
}
```

### TypeScript Types

```typescript
interface StyleTemplate {
  backgroundColor: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

// Zod schema for the style sub-object
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable();
const styleTemplateSchema = z.object({
  backgroundColor: hexColor,
  primaryColor: hexColor,
  secondaryColor: hexColor,
}).partial().refine(
  (s) => s.backgroundColor || s.primaryColor || s.secondaryColor,
  { message: 'At least one color must be specified for a custom template.' }
).nullable();
```

### State Transitions

```
[Default (no style)] ──user fills colors──→ [Custom style selected]
                                                    │
                                          user submits form
                                                    │
                                          server validates hex
                                                    │
                                    ┌───────────────┴───────────────┐
                                    │                               │
                              valid hex ✓                     invalid ✗
                                    │                               │
                          stored in Redis                   form re-rendered
                          with note content                  with error
                                    │
                          recipient opens link
                                    │
                    custom colors applied via
                    CSS custom properties on
                    wrapper div element
                                    │
                          note destroyed/expired
                                    │
                    style data deleted with note
```
