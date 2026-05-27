import { describe, it, expect } from 'vitest';
import Redis from 'ioredis-mock';
import { load } from '../../src/routes/note/[id]/+page.server';
import { encrypt, generateNoteId } from '../../src/lib/crypto';
import type { ServerLoadEvent } from '@sveltejs/kit';

function mockLoadEvent(noteId: string, reveal = false): ServerLoadEvent {
  const redis = new Redis() as unknown as import('ioredis').Redis;
  const url = new URL(`http://localhost/note/${noteId}`);
  if (reveal) url.searchParams.set('reveal', '1');
  return {
    params: { id: noteId },
    url,
    locals: { redis },
  } as unknown as ServerLoadEvent;
}

describe('GET /note/[id] (existence check)', () => {
  it('returns noteExists without consuming the note', async () => {
    const noteId = generateNoteId();
    const ct = encrypt('This is a secret note.', noteId);
    const event = mockLoadEvent(noteId);
    await event.locals.redis.setex(`note:${noteId}`, 3600, ct);

    const result = await load(event as unknown as Parameters<typeof load>[0]);
    expect(result).toEqual({ noteExists: true });

    // Note still exists
    const stillExists = await event.locals.redis.exists(`note:${noteId}`);
    expect(stillExists).toBe(1);
  });

  it('throws 404 when note never existed', async () => {
    const event = mockLoadEvent(generateNoteId());
    await expect(
      load(event as unknown as Parameters<typeof load>[0]),
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('GET /note/[id]?reveal=1 (reveal and destroy)', () => {
  it('reveals and destroys the note', async () => {
    const noteId = generateNoteId();
    const plaintext = 'This is a secret note.';
    const ct = encrypt(plaintext, noteId);
    const event = mockLoadEvent(noteId, true);
    await event.locals.redis.setex(`note:${noteId}`, 3600, ct);

    const result = await load(event as unknown as Parameters<typeof load>[0]);
    expect(result).toEqual({ revealed: true, content: plaintext });

    // Note is gone
    const exists = await event.locals.redis.exists(`note:${noteId}`);
    expect(exists).toBe(0);
  });

  it('throws 404 when note already consumed', async () => {
    const event = mockLoadEvent(generateNoteId(), true);
    await expect(
      load(event as unknown as Parameters<typeof load>[0]),
    ).rejects.toMatchObject({ status: 404, body: { message: 'Note no longer available.' } });
  });
});
