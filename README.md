# GoneNote

Self-destructing notes. Create a note, share the link — it's gone after the first read.

## Features

- **One-time read** — notes are atomically destroyed on first access via Redis `GETDEL`
- **TTL expiry** — unread notes auto-expire (1 hour, 1 day, 7 days, 30 days)
- **Zero retention** — no backups, no replication, no logs containing note content
- **AES-256-GCM encryption** — notes encrypted at rest with per-note keys
- **No accounts** — no authentication, no sessions, no history, no tracking
- **Minimal** — dark theme, system fonts, fast loads

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
2. Type your note, pick an expiry, click **Create Note**
3. Copy the link and share it with the recipient
4. The recipient opens the link — the note is displayed once and permanently destroyed
5. Any subsequent access shows "Note not found"

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | SvelteKit (TypeScript) |
| Storage | Redis 7 (ephemeral, no persistence) |
| Validation | Zod |
| Styling | Tailwind CSS 4 (dark-first design system) |
| Testing | Vitest (38 tests, unit + integration) |
| Deployment | Docker, Helm, GitHub Actions |

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Constitution](.specify/memory/constitution.md)
- [Quickstart](specs/001-ephemeral-notes/quickstart.md)
- [Design tokens](specs/002-gonenote-redesign/design-tokens.md)
- [API contracts](specs/001-ephemeral-notes/contracts/routes.md)

## License

[Apache 2.0](LICENSE) © 2026 Carsten Meininger
