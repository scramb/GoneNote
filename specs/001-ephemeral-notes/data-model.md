# Data Model: Ephemeral Notes

## Entity: Note

Stored in Redis as a single key-value pair. The key is the note UUID. The value is the AES-256-GCM encrypted ciphertext (Base64-encoded). TTL is enforced via Redis `EXPIRE`. Read status is implicit: the key exists = unread; the key is absent = already read, expired, or never existed.

### Storage Schema (Redis)

```
Key:   note:<uuid>
Type:  string (binary-safe)
Value: <iv>:<authTag>:<ciphertext>   (all Base64-encoded, colon-delimited)
TTL:   <seconds>                     (set via SETEX or EXPIRE)

Example:
  SETEX note:550e8400-e29b-41d4-a716-446655440000 604800 "<iv>:<tag>:<ct>"
```

### Logical Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| id | UUID v4 (string, 36 chars) | Primary key; 128 bits random entropy |
| content | string (plain text) | Note body; never persisted in plaintext |
| encryptedContent | string (Base64) | AES-256-GCM(iv || ciphertext || authTag) |
| createdAt | ISO 8601 timestamp | Set at creation time (server-side) |
| ttlSeconds | integer | TTL in seconds; one of {3600, 86400, 604800, 2592000} |
| expiresAt | derived (createdAt + ttlSeconds) | Enforced by Redis EXPIRE |

### TTL Enumeration

| Label | Value (seconds) | Redis mapping |
|-------|----------------|---------------|
| 1 hour | 3600 | `EXPIRE 3600` |
| 1 day | 86400 | `EXPIRE 86400` |
| 7 days (default) | 604800 | `EXPIRE 604800` |
| 30 days | 2592000 | `EXPIRE 2592000` |

### State Transitions

```
                  create
    (none) ──────────────────► exists (unread)
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                GETDEL           EXPIRE            EXPIRE
             (first read)    (before read)     (after read)
                    │               │                │
                    ▼               ▼                ▼
               destroyed       destroyed         destroyed
              (irrecoverable) (irrecoverable)  (already gone)

Once "destroyed", all states are indistinguishable from the outside:
GET returns nil → generic "note not found" error.
```

### Validation Rules

| Rule | Enforcement |
|------|-------------|
| Content length: 1..102400 bytes (non-empty, ≤100 KB) | Zod on server; HTML `maxlength` on client |
| TTL: must be one of {3600, 86400, 604800, 2592000} | Zod enum |
| Note ID: must match UUID v4 regex | Zod on server; SvelteKit route param |
| Content type: plain text only (no HTML/markup) | Rendered as `<pre>` or `white-space: pre-wrap` |

### Encryption Details

- Algorithm: AES-256-GCM
- Key derivation: HKDF-SHA256(IKM=SERVER_SECRET, salt=noteUUID, info="note-encryption", length=32)
- IV: 12 random bytes per note (via `crypto.randomBytes(12)`)
- Auth tag: 16 bytes (appended by GCM, extracted and stored alongside ciphertext)
- Encoding: All binary values Base64-encoded for safe storage in Redis strings
- Format: `base64(iv):base64(authTag):base64(ciphertext)` — colon-delimited
