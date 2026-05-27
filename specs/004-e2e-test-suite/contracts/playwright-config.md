# Playwright Configuration Contract

## File: `e2e/playwright.config.ts`

### Web Server

```text
command: npm run build && node build
port: 3000
timeout: 30s
reuseExistingServer: !process.env.CI
```

### Projects (Browser Targets)

| Name | Channel | Use Case |
|------|---------|----------|
| chromium | (default) | Local dev, CI primary |
| firefox | (default) | CI matrix |
| webkit | (default) | CI matrix (Safari equivalent) |
| chromium-edge | `msedge` | CI matrix (optional, if Edge is required by spec) |

### Global Config

| Setting | Local | CI |
|---------|-------|-----|
| retries | 0 | 2 |
| workers | 1 | 2 |
| timeout | 30_000 | 30_000 |
| expect.timeout | 5_000 | 5_000 |

### CI Output

| Setting | Value |
|---------|-------|
| reporter | `[['html'], ['github'], ['json', { outputFile: 'test-results.json' }]]` |
| screenshot | `only-on-failure` |
| trace | `retain-on-failure` |
| video | `retain-on-failure` |

### use Block

```typescript
use: {
  baseURL: 'http://localhost:3000',
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
}
```

### Test Match Pattern

```text
e2e/tests/**/*.spec.ts
```
