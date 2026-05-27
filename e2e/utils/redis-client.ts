import Redis from 'ioredis';
import crypto from 'node:crypto';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SECRET_KEY = process.env.SECRET_KEY || '';

function deriveKey(secretKey: string, noteId: string): Buffer {
  return crypto.hkdfSync(
    'sha256',
    Buffer.from(secretKey, 'hex'),
    noteId,
    Buffer.from('note-encryption'),
    32,
  );
}

export function encrypt(plaintext: string, noteId: string, secretKey: string): string {
  const key = deriveKey(secretKey, noteId);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export interface TestRedisClient {
  createTestNote(content: string, ttlSeconds: number): Promise<string>;
  deleteTestNote(noteId: string): Promise<void>;
  flushTestKeys(): Promise<void>;
  quit(): Promise<void>;
}

const KEY_PREFIX = 'note:';
const testNoteIds: string[] = [];

export function createTestRedisClient(redisUrl?: string): TestRedisClient {
  const redis = new Redis(redisUrl || REDIS_URL);

  return {
    async createTestNote(content: string, ttlSeconds: number): Promise<string> {
      const noteId = crypto.randomUUID();
      const ciphertext = encrypt(content, noteId, SECRET_KEY);
      await redis.setex(`${KEY_PREFIX}${noteId}`, ttlSeconds, ciphertext);
      testNoteIds.push(noteId);
      return noteId;
    },

    async deleteTestNote(noteId: string): Promise<void> {
      await redis.del(`${KEY_PREFIX}${noteId}`);
    },

    async flushTestKeys(): Promise<void> {
      for (const id of testNoteIds) {
        await redis.del(`${KEY_PREFIX}${id}`);
      }
    },

    async quit(): Promise<void> {
      await redis.quit();
    },
  };
}
