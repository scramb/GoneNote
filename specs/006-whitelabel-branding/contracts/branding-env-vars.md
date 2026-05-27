# Branding Environment Variables Contract

All branding variables are optional. Unset variables fall back to GoneNote defaults.

## Application Identity

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `GoneNote` | Display name shown in header, page titles, browser tab. HTML-stripped. Max 100 chars. |
| `APP_LOGO_URL` | (empty) | URL to logo image. Rendered via `<img>` tag. Must be a valid URL if set. On load failure, app name text is shown instead. |

## Color Scheme

Each `APP_COLOR_*` variable accepts a CSS color value (6-digit hex recommended). Invalid values are replaced with the default and a warning is logged.

| Variable | Default | Token |
|----------|---------|-------|
| `APP_COLOR_ROOT` | `#0a0a0f` | Page background |
| `APP_COLOR_SURFACE` | `#16161d` | Card, input backgrounds |
| `APP_COLOR_ELEVATED` | `#1c1c24` | Elevated surfaces |
| `APP_COLOR_BORDER` | `rgba(255,255,255,0.06)` | Borders, dividers |
| `APP_COLOR_PRIMARY` | `#e4e4ec` | Primary text, headings |
| `APP_COLOR_SECONDARY` | `#9494a4` | Secondary text, descriptions |
| `APP_COLOR_MUTED` | `#5c5c6e` | Muted text, placeholders |
| `APP_COLOR_ACCENT` | `#3dd6c8` | Accent color, links, focus rings |
| `APP_COLOR_ACCENT_HOVER` | `#5cdfd4` | Accent hover state |
| `APP_COLOR_SUCCESS` | `#4ade80` | Success indicators |
| `APP_COLOR_ERROR` | `#fbbf24` | Error/warning indicators |

## Example: Full Custom Brand

```bash
APP_NAME=SecureDrop
APP_LOGO_URL=https://cdn.example.com/logo.svg
APP_COLOR_ROOT=#0d1117
APP_COLOR_SURFACE=#161b22
APP_COLOR_ELEVATED=#21262d
APP_COLOR_PRIMARY=#c9d1d9
APP_COLOR_SECONDARY=#8b949e
APP_COLOR_ACCENT=#58a6ff
```

## Docker Compose Example

```yaml
services:
  app:
    environment:
      APP_NAME: MyBrand
      APP_COLOR_ROOT: "#1a1a2e"
      APP_COLOR_ACCENT: "#e94560"
```

## Helm values.yaml Example

```yaml
branding:
  name: MyBrand
  logoUrl: https://cdn.example.com/logo.svg
  colors:
    root: "#1a1a2e"
    accent: "#e94560"
```

## Validation Rules

1. `APP_NAME`: 1-100 characters, HTML tags stripped, trimmed
2. `APP_LOGO_URL`: If set, must be a valid http/https URL, max 2048 chars
3. `APP_COLOR_ROOT` through `APP_COLOR_ERROR`: Must match `/^#[0-9a-fA-F]{6}$/` (hex) or a valid CSS color function. Invalid → default + warning log

## Runtime Behavior

- Config read once at server startup (`lib/branding.ts` module load)
- Immutable for the lifetime of the process
- Injected into SvelteKit `locals.branding` via `hooks.server.ts`
- CSS custom properties set on `:root` in `app.css` or layout, populated from config
- App name rendered in `<title>`, header, and relevant UI text
