# Contributing to GoneNote

## Setup

```bash
git clone https://github.com/<your-org>/gonenote.git
cd gonenote
npm install
cp .env.example .env
# Edit .env: generate a SECRET_KEY with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development

```bash
npm run dev        # Start dev server at http://localhost:5173
npm test           # Run all tests (unit + integration)
npm run build      # Production build
npm run check      # Type-check
```

Tests require no external services — unit tests use a mock Redis, integration tests use an in-memory Redis.

## Before submitting a PR

- [ ] `npm test` passes (38 tests)
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run check` passes with no type errors
- [ ] No new dependencies added without justification (see Constitution, Principle III)
- [ ] PR description explains *why*, not just *what*
- [ ] Security-sensitive paths (crypto, note read/delete, logging) have explicit approval

## Project structure

```
src/
├── lib/           # Utilities: redis, crypto, validation, logger, cleanup
├── design/        # CSS tokens and base styles
├── components/    # Reusable Svelte components + icons
└── routes/        # SvelteKit file-based routes
tests/
├── unit/          # Pure logic tests (crypto, validation)
└── integration/   # Request/response tests (create, read, errors)
```

## Constitution

All contributions must align with the [project constitution](.specify/memory/constitution.md). The five principles are:

1. **Security-First Design** — no content/secrets in logs, encryption at rest, TLS in transit
2. **Data Minimization & Ephemeral Storage** — notes are destroyed after read or TTL expiry
3. **Simplicity & Minimal Dependencies** — stdlib-first, YAGNI, auditable dependency tree
4. **Test-First Development** — tests before code, automated verification of destruction paths
5. **Input Validation & Safe Defaults** — allowlist validation, secure-by-default config

## License

Apache 2.0. See [LICENSE](LICENSE).
