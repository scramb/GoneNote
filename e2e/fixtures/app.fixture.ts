import { test as base, expect } from '@playwright/test';
import { createTestRedisClient, type TestRedisClient } from '../utils/redis-client';

export interface AppFixtures {
  redis: TestRedisClient;
  createTestNote: (content: string, ttlSeconds?: number) => Promise<string>;
}

export const test = base.extend<AppFixtures>({
  redis: async ({}, use) => {
    const client = createTestRedisClient();
    await client.flushTestKeys();
    await use(client);
    await client.flushTestKeys();
    await client.quit();
  },

  createTestNote: async ({ redis }, use) => {
    await use((content: string, ttlSeconds = 600) => redis.createTestNote(content, ttlSeconds));
  },
});

export { expect };
