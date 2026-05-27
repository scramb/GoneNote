# Docker Compose E2E Override Contract

## File: `docker-compose.e2e.yml`

Extends the base `docker-compose.yml` for e2e testing in CI.

### Override

```yaml
services:
  redis:
    # Inherits from base docker-compose.yml
    # Ensures port 6379 is exposed for test fixture access
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 1s
      timeout: 3s
      retries: 5
      start_period: 2s

  app:
    # Inherits from base docker-compose.yml
    ports:
      - "3000:3000"
    environment:
      SECRET_KEY: "e2e-test-key-128bits"
      REDIS_URL: "redis://redis:6379/0"
      MAX_NOTE_LENGTH: "102400"
      DEFAULT_TTL: "600"
    depends_on:
      redis:
        condition: service_healthy
```

### Redis Database Isolation

Tests use Redis DB 0 with key prefix `e2e:` for isolation. Alternatively, tests can use `SELECT 1` to switch to a dedicated database. The contract uses DB 0 with prefix to keep config minimal.

### Health Check Timing

| Service | Interval | Timeout | Retries | Start Period |
|---------|----------|---------|---------|-------------|
| redis | 1s | 3s | 5 | 2s |
| app | (no healthcheck) | - | - | - |

The app does not define a healthcheck. The Playwright webServer config handles waiting for port 3000 to be available.
