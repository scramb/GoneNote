import crypto from 'node:crypto';

const SECRET_KEY = process.env.SECRET_KEY || '';

function getSecretKey(): Buffer {
  if (!SECRET_KEY) {
    throw new Error('SECRET_KEY environment variable is not set');
  }
  return Buffer.from(SECRET_KEY, 'hex');
}

const ENCRYPTION_INFO = Buffer.from('note-encryption');
const KEY_LENGTH = 32; // AES-256
const IV_LENGTH = 12; // GCM recommended

function deriveKey(noteId: string): Buffer {
  return crypto.hkdfSync(
    'sha256',
    getSecretKey(),
    noteId,
    ENCRYPTION_INFO,
    KEY_LENGTH,
  );
}

export function generateNoteId(): string {
  return crypto.randomUUID();
}

export function encrypt(plaintext: string, noteId: string): string {
  const key = deriveKey(noteId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(ciphertext: string, noteId: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }
  const [ivB64, tagB64, ctB64] = parts as [string, string, string];
  const key = deriveKey(noteId);
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(ctB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
