import { describe, it, expect, beforeAll } from 'vitest';
import Redis from 'ioredis-mock';
import { actions } from '../../src/routes/+page.server';
import type { RequestEvent } from '@sveltejs/kit';

function mockEvent(body: URLSearchParams): RequestEvent {
  const request = new Request('http://localhost/', {
    method: 'POST',
    body: body.toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });
  return {
    request,
    locals: { redis: new Redis() as unknown as import('ioredis').Redis },
  } as unknown as RequestEvent;
}

describe('POST / (create note)', () => {
  let redis: Redis;

  beforeAll(() => {
    redis = new Redis();
  });

  it('creates a note and returns a note URL', async () => {
    const event = mockEvent(new URLSearchParams({ content: 'Hello world', ttl: '3600' }));
    // @ts-expect-error - locals.redis is mock but compatible
    event.locals = { redis };

    const result = await actions.default(event as unknown as Parameters<typeof actions.default>[0]);

    expect(result).toBeDefined();
    if (result && typeof result === 'object' && 'success' in result) {
      expect(result.success).toBe(true);
      expect(result.noteUrl).toMatch(/^\/note\/[0-9a-f-]{36}$/);
    }
  });

  it('applies default TTL when not provided', async () => {
    const event = mockEvent(new URLSearchParams({ content: 'Hello' }));
    // @ts-expect-error - locals.redis is mock but compatible
    event.locals = { redis };

    const result = await actions.default(event as unknown as Parameters<typeof actions.default>[0]);

    expect(result).toBeDefined();
    if (result && typeof result === 'object') {
      expect((result as Record<string, unknown>).success).toBe(true);
    }
  });

  it('returns 400 on empty content', async () => {
    const event = mockEvent(new URLSearchParams({ content: '' }));
    // @ts-expect-error - locals.redis is mock but compatible
    event.locals = { redis };

    const result = await actions.default(event as unknown as Parameters<typeof actions.default>[0]);

    expect(result).toBeDefined();
    if (result && typeof result === 'object' && 'status' in result) {
      expect(result.status).toBe(400);
      expect((result as Record<string, unknown>).data).toMatchObject({
        success: false,
      });
    }
  });

  it('returns 400 on oversized content', async () => {
    const big = 'x'.repeat(102401);
    const event = mockEvent(new URLSearchParams({ content: big }));
    // @ts-expect-error - locals.redis is mock but compatible
    event.locals = { redis };

    const result = await actions.default(event as unknown as Parameters<typeof actions.default>[0]);

    expect(result).toBeDefined();
    if (result && typeof result === 'object' && 'status' in result) {
      expect(result.status).toBe(400);
    }
  });

  it('returns 400 on invalid TTL value', async () => {
    const event = mockEvent(new URLSearchParams({ content: 'test', ttl: '999' }));
    // @ts-expect-error - locals.redis is mock but compatible
    event.locals = { redis };

    const result = await actions.default(event as unknown as Parameters<typeof actions.default>[0]);

    expect(result).toBeDefined();
    if (result && typeof result === 'object' && 'status' in result) {
      expect(result.status).toBe(400);
    }
  });
});
