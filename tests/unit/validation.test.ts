import { describe, it, expect } from 'vitest';
import { createNoteSchema, noteIdSchema, TTL_VALUES } from '../../src/lib/validation';

describe('createNoteSchema', () => {
  it('accepts valid input with explicit TTL', () => {
    const result = createNoteSchema.safeParse({ content: 'Hello world', ttl: '3600' });
    expect(result.success).toBe(true);
  });

  it('applies default TTL when not provided', () => {
    const result = createNoteSchema.safeParse({ content: 'Hello world' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(TTL_VALUES).toContain(result.data.ttl);
    }
  });

  it('rejects empty content', () => {
    const result = createNoteSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('cannot be empty');
    }
  });

  it('rejects content exceeding 100 KB (102400 bytes) default limit', () => {
    const result = createNoteSchema.safeParse({ content: 'x'.repeat(102401) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('maximum length');
    }
  });

  it('accepts content at exactly the limit', () => {
    const result = createNoteSchema.safeParse({ content: 'x'.repeat(102400) });
    expect(result.success).toBe(true);
  });

  it('rejects invalid TTL value', () => {
    const result = createNoteSchema.safeParse({ content: 'test', ttl: '999' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid TTL enum values', () => {
    for (const ttl of TTL_VALUES) {
      const result = createNoteSchema.safeParse({ content: 'test', ttl });
      expect(result.success).toBe(true);
    }
  });

  it('rejects non-string content', () => {
    const result = createNoteSchema.safeParse({ content: 12345 });
    expect(result.success).toBe(false);
  });
});

describe('noteIdSchema', () => {
  it('accepts a valid UUID v4', () => {
    const result = noteIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('rejects a non-UUID string', () => {
    const result = noteIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });

  it('rejects a UUID v1 (version nibble is 1, not 4)', () => {
    const result = noteIdSchema.safeParse('550e8400-e29b-11d4-a716-446655440000');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = noteIdSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects strings with extra characters', () => {
    const result = noteIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000-extra');
    expect(result.success).toBe(false);
  });
});
