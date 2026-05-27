# Quickstart: Reveal Note Button

## Prerequisites

Same as the base application — Node.js 22+, Redis, npm.

## Development

```bash
npm run dev
# Open http://localhost:5173
```

1. Create a note on the landing page
2. Open the generated link — you'll see a "Reveal Note" button instead of the note content
3. Click "Reveal Note" — the content appears with the "Note destroyed" indicator
4. Reload the page — you'll see "Note not found" (it was already read)

## Testing the Preview Protection

```bash
# Create a note and get its URL
# Then use curl to simulate a link preview bot:
curl http://localhost:5173/note/<note-id>

# The response HTML should contain "Reveal Note" button, NOT the note content
# The note should still be accessible afterward
```

## Running Tests

```bash
npm test                              # Unit + integration
npx playwright test --project=chromium # E2e
```

## Key Files

| File | Purpose |
|------|---------|
| `src/routes/note/[id]/+page.server.ts` | Load checks EXISTS; form action does GETDEL |
| `src/routes/note/[id]/+page.svelte` | Two-state UI: unrevealed button / revealed content |
