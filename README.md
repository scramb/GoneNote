# GoneNote

Self-destructing notes. Create a note, share the link — it's gone after the first read.

## Features

### Ephemeral Notes

Notes are encrypted and stored with a configurable TTL. On first read, the note is atomically destroyed via Redis `GETDEL` — the content is decrypted, sent to the reader, and permanently deleted from storage in a single operation.

### Reveal-Before-Read

Link previews (chat apps, social media, email clients) won't accidentally consume your note. Opening a note link shows a "Reveal Note" button — the note content is only read and destroyed when the recipient explicitly clicks it.

### API for Programmatic Use

Create notes from scripts, CI/CD pipelines, or any automated workflow:

```bash
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -d '{"secret": "production db password", "ttl": "3600"}'

# Response: {"noteUrl":"/note/550e8400-e29b-41d4-a716-446655440000"}
```

### Time-to-Live (TTL)

| Value | Duration |
|-------|----------|
| `3600` | 1 hour |
| `86400` | 1 day |
| `604800` | 7 days (default) |
| `2592000` | 30 days |

Unread notes auto-expire when the TTL elapses.

### Whitelabel Branding

Deploy GoneNote under your own brand — no code changes needed. Set environment variables at deploy time:

```bash
APP_NAME=SecureDrop \
APP_LOGO_URL=https://cdn.example.com/logo.svg \
APP_COLOR_ROOT="#0d1117" \
APP_COLOR_ACCENT="#58a6ff" \
npm run dev
```

The same container image serves unlimited branded instances — each deployment is independent.

### AES-256-GCM Encryption

Every note is encrypted with a unique per-note key derived from a server-side secret and the note's random identifier. Content is never stored in plaintext, never appears in logs, and is cryptographically unrecoverable after destruction.

### No Accounts, No Tracking

No authentication, no sessions, no user history, no analytics. The only stored data is the encrypted note content, which is destroyed on read or expiry.

---

## Quickstart

### Docker Compose

```bash
git clone https://github.com/<your-org>/gonenote.git
cd gonenote
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env
docker compose up --build
# Open http://localhost:3000
```

### Kubernetes (Helm)

```bash
helm upgrade --install gonenote oci://ghcr.io/<your-org>/gonenote/charts/gonenote \
  --set secretKey="$(openssl rand -hex 32)" \
  --set ingress.enabled=true \
  --set ingress.host=notes.example.com
```

### Local Development

```bash
npm install
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env
echo "REDIS_URL=redis://localhost:6379" >> .env
npm run dev
# Open http://localhost:5173
```

---

## Usage

### Web Interface

1. Open the app — you'll see a text area and TTL selector
2. Type your note, pick an expiry, click **Create Note**
3. Copy the generated link and share it
4. The recipient opens the link, clicks **Reveal Note**, and sees the content once
5. Any subsequent access shows "Note not found"

### API

```bash
# Create a note (default 7-day TTL)
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -d '{"secret": "my secret message"}'

# With explicit TTL
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -d '{"secret": "temporary token", "ttl": "3600"}'

# With API key authentication
curl -X POST http://localhost:3000/api/note \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-api-key" \
  -d '{"secret": "production secret"}'
```

**API Response (201)**:
```json
{"noteUrl": "/note/550e8400-e29b-41d4-a716-446655440000"}
```

---

## Configuration

### Required

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | 64-char hex string for AES-256-GCM key derivation. Generate: `openssl rand -hex 32` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `MAX_NOTE_LENGTH` | `102400` | Max note content in bytes (100 KB) |
| `DEFAULT_TTL` | `604800` | Default TTL in seconds (7 days) |
| `API_KEY` | (none) | Bearer token required for API access. Unset = open endpoint |

### Branding (all optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `GoneNote` | Application display name |
| `APP_LOGO_URL` | (none) | Logo image URL |
| `APP_COLOR_ROOT` | `#0a0a0f` | Page background |
| `APP_COLOR_SURFACE` | `#16161d` | Card/surface background |
| `APP_COLOR_ELEVATED` | `#1c1c24` | Elevated elements |
| `APP_COLOR_BORDER` | `rgba(255,255,255,0.06)` | Borders |
| `APP_COLOR_PRIMARY` | `#e4e4ec` | Primary text |
| `APP_COLOR_SECONDARY` | `#9494a4` | Secondary text |
| `APP_COLOR_MUTED` | `#5c5c6e` | Muted/placeholder text |
| `APP_COLOR_ACCENT` | `#3dd6c8` | Accent/highlight |
| `APP_COLOR_ACCENT_HOVER` | `#5cdfd4` | Accent hover |
| `APP_COLOR_SUCCESS` | `#4ade80` | Success indicators |
| `APP_COLOR_ERROR` | `#fbbf24` | Error/warning indicators |

---

## Testing

```bash
npm test                               # Unit + integration (46 tests)
npx playwright test --project=chromium # E2e (18 tests, Chromium)
npx playwright test                    # E2e (54 tests, all browsers)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | SvelteKit 2 (TypeScript) |
| Storage | Redis 7 (ephemeral, no persistence) |
| Validation | Zod |
| Styling | Tailwind CSS 4 (dark-first design system) |
| Encryption | AES-256-GCM, HKDF key derivation |
| Testing | Vitest (46 unit + integration), Playwright (54 e2e across Chromium, Firefox, WebKit) |
| Deployment | Docker, Helm, GitHub Actions |

---

## License

[Apache 2.0](LICENSE) © 2026 Carsten Meininger
