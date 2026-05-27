# Data Model: Reveal Note Button

**Phase**: 1 | **Date**: 2026-05-27

## Page States

The note page has two distinct server-controlled states:

### Unrevealed (Initial Load)

Entered when the page first loads via GET. The server checks note existence but does not read content.

| Field | Source | Description |
|-------|--------|-------------|
| `noteExists` | `load` function return | `true` if note key exists in Redis |
| `error` | `load` function return | Error message if note doesn't exist or ID is invalid |

**Redis operation**: `EXISTS note:{id}` (returns 0 or 1)

### Revealed (After Button Click)

Entered when the user clicks "Reveal Note". The server reads and destroys the note.

| Field | Source | Description |
|-------|--------|-------------|
| `content` | Form action return | Decrypted note plaintext |
| `success` | Form action return | `true` if reveal succeeded |

**Redis operation**: `GETDEL note:{id}` (returns ciphertext or null)

## Error States

| Condition | Redis Result | User Sees |
|-----------|-------------|-----------|
| Note never existed | `EXISTS` returns 0 | "Note not found" on page load |
| Note expired | `EXISTS` returns 0 | "Note not found" on page load |
| Note already read | `GETDEL` returns null | "Note has already been read" on reveal click |
| Invalid note ID | Validation failure | 404 error page |
| Note expired between load and click | `GETDEL` returns null | "Note no longer available" on reveal click |

## Server Load Function (GET)

```typescript
// Simplified contract
load({ params, locals }) → {
  noteExists: boolean
}
// or throws 404
```

## Form Action (POST)

```typescript
// Simplified contract
actions: {
  reveal: ({ params, locals }) → {
    success: true,
    content: string
  } | fail(404, { success: false, error: string })
}
```

## Storage

No changes to Redis storage format. Note data remains as plain ciphertext string per feature 006.
