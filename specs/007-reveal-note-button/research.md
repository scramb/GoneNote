# Research: Reveal Note Button

**Phase**: 0 | **Date**: 2026-05-27

## Decision 1: Existence Check Mechanism

**Decision**: Use Redis `EXISTS` command on page load instead of `GETDEL`

**Rationale**:
- `EXISTS` returns 1/0 without reading or modifying the value — perfect for preview-safe checks
- Atomic, single round-trip, no data transfer
- Note remains untouched in Redis after the check
- `GETDEL` moves to the reveal form action

**Alternatives considered**:
- **`TTL` + `GET` (two commands)**: Two round-trips, unnecessary complexity when `EXISTS` suffices
- **`GET` without delete**: Exposes ciphertext in server memory on every page load, even for preview bots. Violates data minimization.

## Decision 2: Reveal Action Implementation

**Decision**: SvelteKit form action (POST to same route) with progressive enhancement via `use:enhance`

**Rationale**:
- Form actions are SvelteKit's built-in mechanism for mutations
- `use:enhance` provides JavaScript-enhanced submission (no page reload) while the plain `<form>` provides noscript fallback
- Same URL pattern — no new routes, no API refactoring
- The load function handles the unrevealed state; the form action handles the reveal

**Alternatives considered**:
- **Separate API endpoint (`+server.ts`)**: Adds a new route file, splits logic across two modules, complicates the noscript fallback
- **Client-side fetch with `?reveal` query param**: No noscript fallback, URL pollution, less secure (GET request could be cached/previewed)

## Decision 3: Page State Management

**Decision**: Two distinct states managed server-side — unrevealed (from load) and revealed (from form action result)

**Rationale**:
- Server controls note lifecycle — client never holds unrevealed content
- After reveal, the form action returns the content + destroyed state
- SvelteKit's `form` prop carries the action result; the page checks `form?.content` to determine which state to render
- No client-side state machine needed — the server is authoritative

**Alternatives considered**:
- **Client-side state toggle + fetch API**: More complex, no noscript support, splits authority between client and server
- **Two separate pages**: URL change after reveal, back-button issues, unnecessary complexity

## Decision 4: Noscript Fallback

**Decision**: Standard HTML `<form method="POST">` wrapping the "Reveal Note" button, enhanced with `use:enhance` for JavaScript users

**Rationale**:
- Without JS: form submits normally, full page reload with revealed content
- With JS: `use:enhance` intercepts, fetches, updates page without reload
- Same server code handles both paths — no duplication
- Satisfies FR-007 with zero additional work
