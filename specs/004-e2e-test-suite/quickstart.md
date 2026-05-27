# Quickstart: End-to-End Test Suite

## Prerequisites

- Node.js 22+
- Docker (for Redis + app container in CI; local dev can use just Redis)
- npm

## One-Time Setup

```bash
# Install Playwright (adds browsers: Chromium, Firefox, WebKit)
npx playwright install

# Or install only Chromium for local dev
npx playwright install chromium
```

## Running Tests Locally

```bash
# Start Redis (required)
docker compose up -d redis

# Build the app
npm run build

# Start the app in the background
node build &
APP_PID=$!

# Run e2e tests (Chromium only for speed)
npx playwright test --project=chromium

# Stop the app
kill $APP_PID

# Show HTML report
npx playwright show-report
```

## Running in CI (Docker Compose)

```bash
# Start full stack
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d

# Wait for app to be ready
npx wait-on http://localhost:3000

# Run all tests
npx playwright test

# Show report
npx playwright show-report
```

## Test Commands

| Command | Description |
|---------|-------------|
| `npx playwright test` | Run all e2e tests (all configured browser projects) |
| `npx playwright test --project=chromium` | Run in Chromium only |
| `npx playwright test create-note` | Run tests matching "create-note" |
| `npx playwright test --ui` | Interactive UI mode for debugging |
| `npx playwright test --debug` | Step-through debugging |
| `npx playwright show-report` | Open HTML test report |
| `npx playwright codegen http://localhost:3000` | Record new tests by clicking through the app |

## Project Structure

```text
e2e/
├── playwright.config.ts        # Browser projects, webServer, reporters
├── fixtures/
│   └── app.fixture.ts          # baseURL, Redis client, createTestNote helper
├── pages/
│   ├── home.page.ts            # Landing page selectors and actions
│   └── note.page.ts            # Note view page selectors and actions
├── tests/
│   ├── create-note.spec.ts     # P1: Note creation
│   ├── view-note.spec.ts       # P1: Note viewing + destruction
│   ├── error-handling.spec.ts  # P2: Error states
│   ├── copy-link.spec.ts       # P3: Copy to clipboard
│   ├── ttl-selection.spec.ts   # P3: TTL selection
│   └── accessibility.spec.ts   # P4: Cross-browser smoke tests
└── utils/
    └── redis-client.ts         # Redis connection for test data setup/teardown
```
