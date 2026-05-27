import { describe, it, expect } from 'vitest';
import Redis from 'ioredis-mock';
import { load } from '../../src/routes/note/[id]/+page.server';
import { encrypt, generateNoteId } from '../../src/lib/crypto';
import type { ServerLoadEvent } from '@sveltejs/kit';

function mockEvent(noteId: string): ServerLoadEvent {
  const redis = new Redis() as unknown as import('ioredis').Redis;
  return {
    params: { id: noteId },
    url: new URL(`http://localhost/note/${noteId}`),
    locals: { redis },
  } as unknown as ServerLoadEvent;
}

async function expect404(event: ServerLoadEvent) {
  await expect(
    load(event as unknown as Parameters<typeof load>[0]),
  ).rejects.toMatchObject({ status: 404, body: { message: 'Note not found.' } });
}

describe('Error state consistency', () => {
  it('returns 404 for malformed note ID (non-UUID)', async () => {
    const event = mockEvent('not-a-uuid');
    await expect404(event);
  });

  it('returns 404 for well-formed but non-existent note ID', async () => {
    const event = mockEvent(generateNoteId());
    await expect404(event);
  });

  it('returns 404 for already-read note', async () => {
    const id = generateNoteId();
    const ct = encrypt('test', id);
    const redis = new Redis() as unknown as import('ioredis').Redis;
    await redis.setex(`note:${id}`, 3600, ct);

    // Simulate note already consumed — delete it
    await redis.del(`note:${id}`);

    // Second read — 404
    const event = { params: { id }, url: new URL('http://localhost/note/' + id), locals: { redis } } as unknown as ServerLoadEvent;
    await expect404(event);
  });

  it('returns identical status and message for all error states', async () => {
    // Malformed ID
    const e1 = mockEvent('not-a-uuid');
    // Non-existent
    const e2 = mockEvent(generateNoteId());
    // Already read (deleted)
    const id = generateNoteId();
    const redis = new Redis() as unknown as import('ioredis').Redis;
    await redis.setex(`note:${id}`, 3600, encrypt('test', id));
    await redis.del(`note:${id}`);
    const e3 = { params: { id }, url: new URL('http://localhost/note/' + id), locals: { redis } } as unknown as ServerLoadEvent;

    // All three should produce identical 404 errors
    await expect404(e1);
    await expect404(e2);
    await expect404(e3);
  });

  it('return 404 for expired note (time-based)', async () => {
    const id = generateNoteId();
    const redis = new Redis() as unknown as import('ioredis').Redis;
    // Insert with very short TTL, then manually delete to simulate expiry
    await redis.setex(`note:${id}`, 1, encrypt('test', id));
    await redis.del(`note:${id}`);

    const event = { params: { id }, url: new URL('http://localhost/note/' + id), locals: { redis } } as unknown as ServerLoadEvent;
    await expect404(event);
  });
});
