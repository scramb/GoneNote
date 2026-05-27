# GoneNote

Self-destructing notes. Create a note, share the link — it's gone after the first read.

## Features

- **One-time read** — notes are atomically destroyed on first access via Redis `GETDEL`
- **TTL expiry** — unread notes auto-expire (1 hour, 1 day, 7 days, 30 days)
- **Custom style templates** — optionally customize background, primary, and secondary colors per note
- **Zero retention** — no backups, no replication, no logs containing note content
- **AES-256-GCM encryption** — notes encrypted at rest with per-note keys
- **No accounts** — no authentication, no sessions, no history, no tracking
- **Minimal** — dark-first design system, system fonts, fast loads

## Quickstart

### Docker Compose

```bash
git clone https://github.com/<your-org>/gonenote.git
cd gonenote

# Generate an encryption key
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env

docker compose up --build
# Open http://localhost:3000
```

### Kubernetes (Helm)

```bash
helm upgrade --install gonenote charts/gonenote \
  --set secretKey="$(openssl rand -hex 32)" \
  --set ingress.enabled=true \
  --set ingress.host=notes.example.com
```

### Local development

```bash
npm install
cp .env.example .env
# Edit .env and set SECRET_KEY (generate: openssl rand -hex 32)
npm run dev
# Open http://localhost:5173
```

## Usage

1. Open the app — you'll see a text area and TTL selector
2. Type your note, pick an expiry, optionally expand **Customize Style** to pick custom colors
3. Click **Create Note**
4. Copy the link and share it with the recipient
5. The recipient opens the link — the note is displayed once in your chosen colors and permanently destroyed
6. Any subsequent access shows "Note not found"

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | SvelteKit (TypeScript) |
| Storage | Redis 7 (ephemeral, no persistence) |
| Validation | Zod |
| Styling | Tailwind CSS 4 (dark-first design system) |
| Testing | Vitest (48 unit + integration tests), Playwright (45 e2e tests across Chromium, Firefox, WebKit) |
| Deployment | Docker, Helm, GitHub Actions |

## Testing

```bash
# Unit and integration tests
npm test

# End-to-end tests (requires Redis)
npx playwright test --project=chromium
```

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Constitution](.specify/memory/constitution.md)
- [E2e test suite](specs/004-e2e-test-suite/quickstart.md)
- [Custom style templates](specs/005-custom-style-templates/quickstart.md)
- [Design tokens](specs/002-gonenote-redesign/design-tokens.md)

## License

[Apache 2.0](LICENSE) © 2026 Carsten Meininger
