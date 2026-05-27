import { getRedis } from '$lib/redis';
import { branding } from '$lib/branding';
import { cleanupExpiredNotes } from '$lib/cleanup';
import type { Handle } from '@sveltejs/kit';

const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes

let cleanupStarted = false;

function startCleanupScheduler() {
  if (cleanupStarted) return;
  cleanupStarted = true;
  setInterval(() => {
    cleanupExpiredNotes().catch((err) => {
      console.error('Scheduled cleanup failed:', err instanceof Error ? err.message : String(err));
    });
  }, CLEANUP_INTERVAL);
}

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.redis = getRedis();
  event.locals.branding = branding;
  startCleanupScheduler();

  const response = await resolve(event);

  const imgSrc = branding.logoUrl ? ` img-src 'self' ${new URL(branding.logoUrl).origin}` : '';
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; form-action 'self'${imgSrc}`,
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');

  return response;
};
