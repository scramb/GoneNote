import { error } from '@sveltejs/kit';
import { noteIdSchema } from '$lib/validation';
import { decrypt } from '$lib/crypto';
import { log } from '$lib/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const start = Date.now();
  const idResult = noteIdSchema.safeParse(params.id);

  if (!idResult.success) {
    log({ op: 'note.read', outcome: 'failure', duration: Date.now() - start });
    throw error(404, 'Note not found.');
  }

  const noteId = idResult.data;
  const shouldReveal = url.searchParams.has('reveal');

  if (!shouldReveal) {
    // Check existence only — don't read the note
    try {
      const exists = await locals.redis.exists(`note:${noteId}`);

      if (!exists) {
        log({ op: 'note.read', outcome: 'failure', duration: Date.now() - start });
        throw error(404, 'Note not found.');
      }

      log({ op: 'note.check', outcome: 'success', duration: Date.now() - start });
      return { noteExists: true as const };
    } catch (err) {
      if ((err as { status?: number }).status === 404) throw err;
      log({ op: 'note.read', outcome: 'failure', duration: Date.now() - start });
      throw error(500, 'Unable to access note.');
    }
  }

  // Reveal: read and destroy the note
  try {
    const raw = await locals.redis.getdel(`note:${noteId}`);

    if (raw === null) {
      log({ op: 'note.reveal', outcome: 'failure', duration: Date.now() - start });
      throw error(404, 'Note no longer available.');
    }

    let ciphertext: string;
    try {
      const parsed = JSON.parse(raw);
      ciphertext = parsed.content;
    } catch {
      ciphertext = raw;
    }

    const plaintext = decrypt(ciphertext, noteId);
    log({ op: 'note.reveal', outcome: 'success', duration: Date.now() - start });
    return { revealed: true as const, content: plaintext };
  } catch (err) {
    if ((err as { status?: number }).status === 404) throw err;
    log({ op: 'note.reveal', outcome: 'failure', duration: Date.now() - start });
    throw error(500, 'Unable to read note.');
  }
};
