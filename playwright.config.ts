import { defineConfig, devices } from '@playwright/test';

// Set defaults for the test runner process (redis-client.ts reads these)
process.env.SECRET_KEY = process.env.SECRET_KEY || 'e2e000000000000000000000000000000000000000000000000000000000000';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['html'],
    ['github'],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run build && node build',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: true,
    env: {
      SECRET_KEY: process.env.SECRET_KEY || 'e2e000000000000000000000000000000000000000000000000000000000000',
      REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
      MAX_NOTE_LENGTH: '102400',
      DEFAULT_TTL: '600',
    },
  },
});
