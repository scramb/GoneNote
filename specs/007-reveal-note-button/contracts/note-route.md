# Note Route Contract

## GET /note/[id] (Page Load)

**Purpose**: Verify note exists without reading content. Renders the note page in unrevealed state.

**Server behavior**:
1. Validate `id` with `noteIdSchema`
2. Call `EXISTS note:{id}`
3. If 0: throw 404
4. If 1: return `{ noteExists: true }`

**Page behavior**:
- Shows a card with "A note is waiting for you" or similar message
- Shows a "Reveal Note" button inside a `<form method="POST">`
- Does NOT show any note content

## POST /note/[id] (Reveal Action)

**Purpose**: Read and destroy the note. Triggered by "Reveal Note" button click.

**Server behavior**:
1. Validate `id` with `noteIdSchema`
2. Call `GETDEL note:{id}`
3. If null: return `fail(404, { success: false, error: 'Note no longer available.' })`
4. Decrypt ciphertext with note ID
5. Return `{ success: true, content: plaintext }`

**Page behavior**:
- Shows the decrypted note content
- Shows the "Note destroyed" StatusAlert
- The "Reveal Note" button is no longer visible

## Noscript Fallback

The `<form method="POST">` wrapping the button provides the noscript fallback:
- Without JS: form submits via browser POST, full page reload, server returns revealed state
- With JS: `use:enhance` intercepts, fetches via JavaScript, updates page without reload

Both paths hit the same form action. No separate endpoint needed.

## Data Test IDs

| Element | `data-testid` | State |
|---------|--------------|-------|
| Reveal button | `reveal-note-button` | Unrevealed only |
| Note content | `note-content` | Revealed only |
| Note destroyed | `note-destroyed` | Revealed only |
| Note waiting message | `note-waiting` | Unrevealed only |
| Error message | `error-state` | Error states |
