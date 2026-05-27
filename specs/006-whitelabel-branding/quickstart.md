# Quickstart: Whitelabel Branding

## Prerequisites

Same as the base application:
- Node.js 22+
- Redis 7.x
- npm

## Local Development with Custom Branding

```bash
# Set branding env vars and start dev server
APP_NAME=SecureDrop \
APP_COLOR_ROOT="#0d1117" \
APP_COLOR_ACCENT="#58a6ff" \
npm run dev
```

Or use a `.env` file:
```bash
# .env
APP_NAME=SecureDrop
APP_COLOR_ROOT=#0d1117
APP_COLOR_ACCENT=#58a6ff
```

```bash
npm run dev
```

## Docker with Custom Branding

```bash
docker compose up -d redis

# Build and run with custom brand
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d --build \
  -e APP_NAME=SecureDrop \
  -e APP_COLOR_ROOT="#0d1117"
```

## No Branding (Default GoneNote)

When no branding env vars are set, the app runs with the default GoneNote identity:
- Name: "GoneNote"
- Logo: (none, shows "GoneNote" text)
- Colors: default dark theme

## Running Tests

```bash
# Unit + integration tests
npm test

# E2e tests (requires Redis)
npx playwright test --project=chromium

# Test with custom branding
APP_NAME=TestBrand npm test
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/branding.ts` | Read and validate branding env vars, export BrandingConfig |
| `src/components/BrandLogo.svelte` | Logo image with app-name text fallback |
| `src/hooks.server.ts` | Inject BrandingConfig into SvelteKit locals |
| `src/app.css` | CSS custom properties populated from branding config |
| `src/app.html` | Dynamic page title from branding |
| `src/routes/+layout.svelte` | Apply global color scheme |
| `src/routes/+page.svelte` | BrandLogo in header (StyleCustomizer removed) |
| `.env.example` | Documented branding variables |
