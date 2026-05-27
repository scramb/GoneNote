# Research: Whitelabel Branding

**Phase**: 0 | **Date**: 2026-05-27

## Decision 1: Configuration Mechanism

**Decision**: Environment variables read at server startup via a dedicated `lib/branding.ts` module

**Rationale**:
- Consistent with existing pattern (`SECRET_KEY`, `REDIS_URL`, `MAX_NOTE_LENGTH`, `DEFAULT_TTL`)
- Works identically in Docker, Helm, and local `node build` runs
- No file I/O, no config file parsing — environment is the universal interface
- Same container image, different env vars = different brands (SC-005)
- Values frozen at startup — no runtime mutation, no race conditions

**Alternatives considered**:
- **Config file (YAML/JSON)**: Requires mounting a volume or baking into image — breaks "same image" requirement
- **Database-driven**: Adds storage dependency for static config, over-engineered for 10 values
- **Runtime API endpoint**: Adds attack surface, requires auth, breaks "no accounts" model

## Decision 2: Env Var Naming Convention

**Decision**: Flat `APP_*` and `APP_COLOR_*` naming with explicit semantic names

**Variables**:
| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_NAME` | `GoneNote` | Application display name |
| `APP_LOGO_URL` | (empty) | Logo image URL |
| `APP_COLOR_ROOT` | `#0a0a0f` | Page background |
| `APP_COLOR_SURFACE` | `#16161d` | Card/surface background |
| `APP_COLOR_ELEVATED` | `#1c1c24` | Elevated element background |
| `APP_COLOR_BORDER` | `rgba(255,255,255,0.06)` | Border color |
| `APP_COLOR_PRIMARY` | `#e4e4ec` | Primary text |
| `APP_COLOR_SECONDARY` | `#9494a4` | Secondary text |
| `APP_COLOR_MUTED` | `#5c5c6e` | Muted/placeholder text |
| `APP_COLOR_ACCENT` | `#3dd6c8` | Accent/highlight |
| `APP_COLOR_ACCENT_HOVER` | `#5cdfd4` | Accent hover state |
| `APP_COLOR_SUCCESS` | `#4ade80` | Success state |
| `APP_COLOR_ERROR` | `#fbbf24` | Error/warning state |

**Rationale**:
- Flat naming avoids nesting complexity, easy to document and set in docker-compose/Helm
- `APP_COLOR_*` prefix groups color variables logically
- Semantic names (ROOT, SURFACE, PRIMARY) map directly to existing design tokens

**Alternatives considered**:
- **JSON env var** (`APP_COLORS='{"root":"#000"}'`): Harder to set in docker-compose, harder to validate individual values
- **`BRAND_*` prefix**: `APP_*` is more discoverable and shorter

## Decision 3: CSS Custom Properties Approach

**Decision**: Set CSS custom properties on `:root` via a `<style>` block in the layout or app.html, populated from BrandingConfig

**Rationale**:
- Existing `app.css` already uses CSS custom properties (`--color-root`, `--color-primary`, etc.)
- Branding module exports values that get injected as CSS variables — existing Tailwind `@theme` references just work
- No Tailwind config changes needed — the same token names are used, just with different values
- Falls back gracefully to hardcoded defaults when branding is absent

**Alternatives considered**:
- **Tailwind `@theme` manipulation at build time**: Requires rebuild — violates SC-005
- **Per-element inline styles**: Messy, doesn't scale to all components

## Decision 4: Logo Implementation

**Decision**: `<img>` tag with `onerror` handler that replaces it with styled app-name text

**Rationale**:
- `<img>` loads any common format (SVG, PNG, JPEG) and respects CSP
- `onerror` fallback handles broken/missing images client-side with zero server logic
- Sanitize URL at startup (validate it's a URL, not script)
- SVG security: modern browsers don't execute scripts in `<img>`-loaded SVGs (unlike inline `<svg>`)

**Alternatives considered**:
- **Inline SVG**: Security risk (script execution possible), requires proxy/sanitization
- **CSS background-image**: No `onerror` fallback possible, worse accessibility
- **Server-side image proxy**: Over-engineered, adds latency and complexity
