import { describe, it, expect, beforeEach } from 'vitest';
import Redis from 'ioredis-mock';
import { load } from '../../src/routes/note/[id]/+page.server';
import { encrypt, generateNoteId } from '../../src/lib/crypto';
import type { ServerLoadEvent } from '@sveltejs/kit';

function mockEvent(noteId: string): ServerLoadEvent {
  const redis = new Redis() as unknown as import('ioredis').Redis;
  return {
    params: { id: noteId },
    locals: { redis },
  } as unknown as ServerLoadEvent;
}

describe('GET /note/[id] (view note)', () => {
  const noteId = generateNoteId();
  const plaintext = 'This is a secret note.';

  beforeEach(async () => {
    // Each test gets a fresh Redis and fresh note
  });

  it('retrieves and decrypts a note, returning the plaintext', async () => {
    const ct = encrypt(plaintext, noteId);
    const event = mockEvent(noteId);
    await event.locals.redis.setex(`note:${noteId}`, 3600, ct);

    const result = await load(event as unknown as Parameters<typeof load>[0]);
    expect(result).toEqual({ content: plaintext });
  });

  it('returns 404 when note has already been read (GETDEL returns nil)', async () => {
    const event = mockEvent(noteId);
    // Note was not inserted, so GETDEL returns nil

    await expect(
      load(event as unknown as Parameters<typeof load>[0]),
    ).rejects.toMatchObject({ status: 404, body: { message: 'Note not found.' } });
  });

  it('returns 404 when note never existed', async () => {
    const nonexistentId = generateNoteId();
    const event = mockEvent(nonexistentId);

    await expect(
      load(event as unknown as Parameters<typeof load>[0]),
    ).rejects.toMatchObject({ status: 404, body: { message: 'Note not found.' } });
  });

  it('destroys the note on read (second GETDEL returns nil)', async () => {
    const id = generateNoteId();
    const ct = encrypt(plaintext, id);
    const redis = new Redis() as unknown as import('ioredis').Redis;
    await redis.setex(`note:${id}`, 3600, ct);

    // First read
    const event1 = { params: { id }, locals: { redis } } as unknown as ServerLoadEvent;
    const result1 = await load(event1 as unknown as Parameters<typeof load>[0]);
    expect(result1).toEqual({ content: plaintext });

    // Second read — should 404
    const event2 = { params: { id }, locals: { redis } } as unknown as ServerLoadEvent;
    await expect(
      load(event2 as unknown as Parameters<typeof load>[0]),
    ).rejects.toMatchObject({ status: 404 });
  });
});
