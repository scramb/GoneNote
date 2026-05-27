# Data Model: API Create Note

**Phase**: 1 | **Date**: 2026-05-27

## API Contract

### Request

```
POST /api/note
Content-Type: application/json
Authorization: Bearer <key>  (optional, if API_KEY env var is set)

{
  "secret": "my password or secret text",
  "ttl": "3600"              (optional, defaults to DEFAULT_TTL)
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `secret` | `string` | Yes | 1-102400 chars (MAX_NOTE_LENGTH) |
| `ttl` | `string` | No | One of: `"3600"`, `"86400"`, `"604800"`, `"2592000"` |

### Response (Success)

```
HTTP 201 Created
Content-Type: application/json

{
  "noteUrl": "/note/550e8400-e29b-41d4-a716-446655440000"
}
```

### Response (Errors)

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing `secret` | `{ "error": "Note content cannot be empty." }` |
| 400 | Invalid `ttl` | `{ "error": "Invalid expiration period selected." }` |
| 400 | Invalid JSON | `{ "error": "Invalid JSON." }` |
| 401 | Missing/wrong API key | `{ "error": "Unauthorized." }` |
| 413 | Content too large | `{ "error": "Note content exceeds the maximum length..." }` |
| 415 | Wrong Content-Type | `{ "error": "Content-Type must be application/json." }` |
| 500 | Redis/encryption failure | `{ "error": "Unable to create note." }` |

## Mapping to Internal Schema

The `secret` field is mapped to `content` for the existing `createNoteSchema`:

```typescript
// Internal mapping in POST handler
const input = { content: body.secret, ttl: body.ttl };
const parsed = createNoteSchema.safeParse(input);
```

## Storage

No changes to Redis storage format. Notes created via API are stored identically to web-created notes — plain ciphertext string at `note:{id}` with the specified TTL.
