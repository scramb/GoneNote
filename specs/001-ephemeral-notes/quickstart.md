# Quickstart: Ephemeral Notes

## Prerequisites

- Node.js 22+
- Redis 7.x (running on `localhost:6379` by default)
- pnpm (or npm)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env: set SECRET_KEY to a random 64-char hex string
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Start Redis (if not running)
redis-server

# 4. Run the dev server
pnpm dev
```

The app is available at `http://localhost:5173`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | 64-char hex string for AES-256-GCM key derivation |
| `REDIS_URL` | No | Redis connection URL (default: `redis://localhost:6379`) |
| `MAX_NOTE_LENGTH` | No | Max note content in bytes (default: `102400`) |
| `DEFAULT_TTL` | No | Default TTL in seconds (default: `604800` = 7 days) |

## Running Tests

```bash
# Unit tests (no Redis needed — uses ioredis-mock)
pnpm test:unit

# Integration tests (requires Redis on localhost:6379)
pnpm test:integration

# All tests
pnpm test
```

## Project Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start SvelteKit dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run all tests |
| `pnpm test:unit` | Run unit tests only |
| `pnpm test:integration` | Run integration tests (needs Redis) |
| `pnpm lint` | Run ESLint |
| `pnpm check` | Run TypeScript type checking |
