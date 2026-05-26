import { getRedis } from '$lib/redis';
import { log } from '$lib/logger';

/**
 * Scans for note keys that may have been missed by Redis TTL expiry
 * and deletes them. Intended to run on a schedule. Redis native
 * TTL expiry handles the normal case; this is a safety net.
 */
export async function cleanupExpiredNotes(): Promise<void> {
  const redis = getRedis();
  let cursor = '0';
  let deleted = 0;

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        'note:*',
        'COUNT',
        100,
      );
      cursor = nextCursor;

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        // ttl === -2 means key has no TTL and doesn't exist (already expired but not cleaned up from keyspace)
        // ttl === -1 means key has no TTL set (shouldn't happen, but clean it up)
        if (ttl === -2 || ttl === -1) {
          await redis.del(key);
          deleted++;
        }
      }
    } while (cursor !== '0');

    if (deleted > 0) {
      log({ op: 'cleanup', outcome: 'success' });
      console.log(`Cleanup: removed ${deleted} stale note keys`);
    }
  } catch (err) {
    log({ op: 'cleanup', outcome: 'failure' });
    console.error('Cleanup error:', err instanceof Error ? err.message : String(err));
  }
}
