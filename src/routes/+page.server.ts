import { fail } from '@sveltejs/kit';
import { createNoteSchema } from '$lib/validation';
import { generateNoteId, encrypt } from '$lib/crypto';
import { log } from '$lib/logger';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const start = Date.now();
    const formData = await request.formData();
    const content = formData.get('content');
    const ttl = formData.get('ttl');

    const parsed = createNoteSchema.safeParse({
      content: typeof content === 'string' ? content : '',
      ttl: typeof ttl === 'string' ? ttl : undefined,
    });

    if (!parsed.success) {
      log({ op: 'note.create', outcome: 'failure', duration: Date.now() - start });
      const issue = parsed.error.issues[0];
      return fail(400, { success: false, error: issue?.message || 'Validation failed.' });
    }

    const { content: validatedContent, ttl: validatedTtl } = parsed.data;

    try {
      const noteId = generateNoteId();
      const ciphertext = encrypt(validatedContent, noteId);
      await locals.redis.setex(`note:${noteId}`, Number(validatedTtl), ciphertext);
      log({ op: 'note.create', outcome: 'success', ttl: Number(validatedTtl), duration: Date.now() - start });
      return { success: true, noteUrl: `/note/${noteId}` };
    } catch (err) {
      log({ op: 'note.create', outcome: 'failure', duration: Date.now() - start });
      console.error('Redis error during note creation:', err instanceof Error ? err.message : String(err));
      return fail(500, { success: false, error: 'Unable to create note. Please try again later.' });
    }
  },
};
