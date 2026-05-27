import { describe, it, expect, beforeAll } from 'vitest';
import Redis from 'ioredis-mock';
import { POST } from '../../src/routes/api/note/+server';
import type { RequestEvent } from '@sveltejs/kit';

function mockEvent(body: unknown, headers: Record<string, string> = {}): RequestEvent {
  const redis = new Redis() as unknown as import('ioredis').Redis;
  return {
    request: {
      json: async () => body,
      headers: new Headers({ 'content-type': 'application/json', ...headers }),
    },
    locals: { redis },
  } as unknown as RequestEvent;
}

function parseResponse(resp: Response) {
  return resp.json().then((data) => ({ status: resp.status, ...data }));
}

describe('POST /api/note', () => {
  it('creates a note and returns the URL', async () => {
    const event = mockEvent({ secret: 'my api secret', ttl: '3600' });
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    const data = await parseResponse(resp);
    expect(resp.status).toBe(201);
    expect(data.noteUrl).toMatch(/^\/note\//);
  });

  it('applies default TTL when not provided', async () => {
    const event = mockEvent({ secret: 'default ttl test' });
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(201);
  });

  it('returns 400 when secret is missing', async () => {
    const event = mockEvent({ ttl: '3600' });
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(400);
    const data = await parseResponse(resp);
    expect(data.error).toBeDefined();
  });

  it('returns 400 when secret is empty', async () => {
    const event = mockEvent({ secret: '' });
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(400);
  });

  it('returns 400 for invalid TTL', async () => {
    const event = mockEvent({ secret: 'test', ttl: 'invalid' });
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(400);
  });

  it('returns 400 for malformed JSON', async () => {
    const redis = new Redis() as unknown as import('ioredis').Redis;
    const event = {
      request: {
        json: async () => { throw new SyntaxError('Unexpected token'); },
        headers: new Headers({ 'content-type': 'application/json' }),
      },
      locals: { redis },
    } as unknown as RequestEvent;
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(400);
  });

  it('returns 415 for wrong Content-Type', async () => {
    const redis = new Redis() as unknown as import('ioredis').Redis;
    const event = {
      request: {
        json: async () => ({}),
        headers: new Headers({ 'content-type': 'text/plain' }),
      },
      locals: { redis },
    } as unknown as RequestEvent;
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(415);
  });

  it('returns 201 when no API key is configured', async () => {
    // API_KEY is not set in the test environment, so it should be open
    const event = mockEvent({ secret: 'no auth test' });
    const resp = await POST(event as unknown as Parameters<typeof POST>[0]);
    expect(resp.status).toBe(201);
  });
});
