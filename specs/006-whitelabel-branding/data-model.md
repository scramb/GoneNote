# Data Model: Whitelabel Branding

**Phase**: 1 | **Date**: 2026-05-27

## Entities

### BrandingConfig

Server-side configuration object, populated once at startup from environment variables. Frozen (immutable) after initialization.

| Field | Type | Default | Validation |
|-------|------|---------|-----------|
| `appName` | `string` | `"GoneNote"` | 1-100 chars, HTML tags stripped |
| `logoUrl` | `string \| null` | `null` | Valid URL if set, max 2048 chars |
| `colors` | `ColorScheme` | (see below) | Each color validated per its format |

### ColorScheme

| Field | Type | Default | Validation |
|-------|------|---------|-----------|
| `root` | `string` | `"#0a0a0f"` | 6-digit hex `#RRGGBB` |
| `surface` | `string` | `"#16161d"` | 6-digit hex |
| `elevated` | `string` | `"#1c1c24"` | 6-digit hex |
| `border` | `string` | `"rgba(255,255,255,0.06)"` | CSS color value |
| `primary` | `string` | `"#e4e4ec"` | 6-digit hex |
| `secondary` | `string` | `"#9494a4"` | 6-digit hex |
| `muted` | `string` | `"#5c5c6e"` | 6-digit hex |
| `accent` | `string` | `"#3dd6c8"` | 6-digit hex |
| `accentHover` | `string` | `"#5cdfd4"` | 6-digit hex |
| `success` | `string` | `"#4ade80"` | 6-digit hex |
| `error` | `string` | `"#fbbf24"` | 6-digit hex |

### TypeScript Types

```typescript
interface ColorScheme {
  root: string;
  surface: string;
  elevated: string;
  border: string;
  primary: string;
  secondary: string;
  muted: string;
  accent: string;
  accentHover: string;
  success: string;
  error: string;
}

interface BrandingConfig {
  appName: string;
  logoUrl: string | null;
  colors: ColorScheme;
}
```

### Removed Entities (from feature 005)

- **StyleTemplate**: Removed. Per-note style data is no longer stored or read.
- **styleTemplateSchema** (Zod): Removed. No per-note color validation needed.
- **hexColor** (Zod): Removed. Color validation moves to the branding config module.

### Note Storage Format

**New format** (after this feature):
```
Redis key: note:{id}
Value: <ciphertext string>
```

**Old format** (from feature 005, still readable for backward compatibility):
```
Redis key: note:{id}
Value: {"content": "<ciphertext>", "style": {...}}
```

The read path attempts `JSON.parse`; if it succeeds, extracts `.content` and discards `.style`. If it fails, treats the raw value as ciphertext.
