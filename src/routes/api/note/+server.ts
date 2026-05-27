import { json } from '@sveltejs/kit';
import { createNoteSchema } from '$lib/validation';
import { generateNoteId, encrypt } from '$lib/crypto';
import { log } from '$lib/logger';
import type { RequestHandler } from './$types';

const API_KEY = process.env.API_KEY;

export const POST: RequestHandler = async ({ request, locals }) => {
  const start = Date.now();

  // Content-Type check
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return json({ error: 'Content-Type must be application/json.' }, { status: 415 });
  }

  // API key check
  if (API_KEY) {
    const auth = request.headers.get('authorization');
    if (!auth || auth !== `Bearer ${API_KEY}`) {
      log({ op: 'api.create', outcome: 'failure', duration: Date.now() - start });
      return json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  // Parse JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { secret, ttl } = body as Record<string, unknown>;

  // Validate
  const parsed = createNoteSchema.safeParse({
    content: typeof secret === 'string' ? secret : '',
    ttl: typeof ttl === 'string' ? ttl : undefined,
  });

  if (!parsed.success) {
    log({ op: 'api.create', outcome: 'failure', duration: Date.now() - start });
    const issue = parsed.error.issues[0];
    return json({ error: issue?.message || 'Validation failed.' }, { status: 400 });
  }

  const { content: validatedContent, ttl: validatedTtl } = parsed.data;

  try {
    const noteId = generateNoteId();
    const ciphertext = encrypt(validatedContent, noteId);
    await locals.redis.setex(`note:${noteId}`, Number(validatedTtl), ciphertext);
    log({ op: 'api.create', outcome: 'success', ttl: Number(validatedTtl), duration: Date.now() - start });
    return json({ noteUrl: `/note/${noteId}` }, { status: 201 });
  } catch (err) {
    log({ op: 'api.create', outcome: 'failure', duration: Date.now() - start });
    console.error('API create note error:', err instanceof Error ? err.message : String(err));
    return json({ error: 'Unable to create note.' }, { status: 500 });
  }
};
