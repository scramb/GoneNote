# Route Contracts: Ephemeral Notes

SvelteKit file-based routes. Each route combines frontend page rendering with server-side logic via `+page.server.ts` loaders and actions.

## Route: `GET /` — Note Creation Page

Renders the homepage with the note creation form.

**Response**: HTML page containing:
- Textarea for note content (max 100 KB)
- TTL selector (radio buttons or dropdown): 1 hour, 1 day, 7 days, 30 days
- Submit button ("Create Note")

**Default TTL**: 7 days (604800 seconds) pre-selected.

---

## Route: `POST /` — Create Note Action

SvelteKit form action. Accepts form data, validates, encrypts, stores in Redis, returns the note link.

### Request

```
POST /
Content-Type: application/x-www-form-urlencoded

content=<plain-text-note>&ttl=604800
```

### Validation (Zod Schema)

```typescript
{
  content: string.min(1).max(102400),
  ttl: z.enum(["3600", "86400", "604800", "2592000"]).default("604800")
}
```

### Processing

1. Validate `content` (1..102400 chars) and `ttl` (must be in enum).
2. Generate UUID v4 note ID via `crypto.randomUUID()`.
3. Derive encryption key: HKDF-SHA256(SECRET_KEY, salt=noteId, info="note-encryption", 32).
4. Generate random 12-byte IV via `crypto.randomBytes(12)`.
5. Encrypt content: AES-256-GCM(plaintext, key, iv) → ciphertext + authTag.
6. Store in Redis: `SETEX note:<uuid> <ttl> "<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>"`.
7. Log: `{ op: "note.create", outcome: "success", ttl: <ttl> }` — no content, no ID.
8. Return the note URL to the client.

### Success Response (200)

SvelteKit form action result rendered on the same page:

```typescript
// Returned via SvelteKit ActionResult
{
  success: true,
  noteUrl: "https://<host>/note/550e8400-e29b-41d4-a716-446655440000"
}
```

Page displays the link with a "Copy to clipboard" button. No content preview.

### Error Responses

| Scenario | Status | Message to user |
|----------|--------|-----------------|
| Empty content | 400 | "Note content cannot be empty." |
| Content too long | 400 | "Note content exceeds the maximum length of 100 KB." |
| Invalid TTL | 400 | "Invalid expiration period selected." |
| Redis unavailable | 500 | "Unable to create note. Please try again later." |

**Internal error details never returned to client.** Full error logged server-side only.

---

## Route: `GET /note/[id]` — View Note

SvelteKit page loader. Retrieves, decrypts, and destroys the note. Returns content or an error page.

### Request

```
GET /note/550e8400-e29b-41d4-a716-446655440000
```

### URL Parameter Validation

- `id`: UUID v4 regex — `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` (case-insensitive)
- Invalid format → 404 "Note not found" (indistinguishable from missing note)

### Processing

1. Validate `id` format against UUID v4 regex — reject malformed IDs with 404.
2. Execute `GETDEL note:<uuid>` on Redis.
3. If result is null: the key doesn't exist (already read, expired, or never existed).
   - Do NOT distinguish between these cases.
   - Return 404 with generic "Note not found."
4. Parse result: split on `:` → `[base64(iv), base64(authTag), base64(ciphertext)]`.
5. Derive decryption key: same HKDF-SHA256(SECRET_KEY, salt=noteId, info="note-encryption", 32).
6. Decrypt: AES-256-GCM decrypt(ciphertext, key, iv, authTag) → plaintext.
7. Log: `{ op: "note.read", outcome: "success" }` — no content, no ID.
8. Return plaintext to client for rendering.

### Success Response (200)

```typescript
// Returned via SvelteKit PageLoad
{
  content: string  // plain text note content
}
```

Page renders the content as preformatted plain text (`<pre>` with `white-space: pre-wrap`). No linkification, no HTML interpretation, no Markdown processing.

### Error Responses

| Scenario | HTTP Status | Message to user |
|----------|-------------|-----------------|
| Malformed ID | 404 | "Note not found." |
| Note not found (read/expired/invalid) | 404 | "Note not found." |
| Decryption failure | 500 | "Unable to read note. Please try again later." |
| Redis unavailable | 500 | "Unable to read note. Please try again later." |

**Critical security requirement**: The system MUST NOT reveal whether a note was already read, expired, or never existed. All three states return identical 404 responses with identical messages. Timing attacks are not a concern for internal use but the response body and status code must be identical.

---

## Contract Summary

| Route | Method | Purpose | Success | Error States |
|-------|--------|---------|---------|-------------|
| `/` | GET | Render creation form | HTML | — |
| `/` | POST | Create note | Redirect with note link | 400 (validation), 500 (Redis) |
| `/note/[id]` | GET | View/destroy note | Render plaintext content | 404 (not found), 500 (decrypt/Redis) |
