import { error } from '@sveltejs/kit';
import { noteIdSchema } from '$lib/validation';
import { decrypt } from '$lib/crypto';
import { log } from '$lib/logger';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const start = Date.now();
  const idResult = noteIdSchema.safeParse(params.id);

  if (!idResult.success) {
    log({ op: 'note.read', outcome: 'failure', duration: Date.now() - start });
    throw error(404, 'Note not found.');
  }

  const noteId = idResult.data;

  try {
    const raw = await locals.redis.getdel(`note:${noteId}`);

    if (raw === null) {
      log({ op: 'note.read', outcome: 'failure', duration: Date.now() - start });
      throw error(404, 'Note not found.');
    }

    // Parse JSON wrapper (backward-compatible: plain ciphertext treated as content-only)
    let ciphertext: string;
    let style = null;
    try {
      const parsed = JSON.parse(raw);
      ciphertext = parsed.content;
      style = parsed.style ?? null;
    } catch {
      ciphertext = raw;
    }

    const plaintext = decrypt(ciphertext, noteId);
    log({ op: 'note.read', outcome: 'success', duration: Date.now() - start });
    return { content: plaintext, style };
  } catch (err) {
    if ((err as { status?: number }).status === 404) throw err;
    log({ op: 'note.read', outcome: 'failure', duration: Date.now() - start });
    console.error('Error reading note:', err instanceof Error ? err.message : String(err));
    throw error(500, 'Unable to read note. Please try again later.');
  }
};
