# Research: API Create Note

**Phase**: 0 | **Date**: 2026-05-27

## Decision 1: Route Architecture

**Decision**: SvelteKit `+server.ts` route at `src/routes/api/note/+server.ts`

**Rationale**:
- SvelteKit's standard pattern for REST endpoints — exports `POST` handler function
- No framework changes needed — `+server.ts` is a first-class SvelteKit concept
- Route path `/api/note` maps naturally from the file structure
- Access to `$lib` imports, `locals` (Redis, branding), and standard request/response APIs

**Alternatives considered**:
- **Separate Express/Fastify server**: Over-engineered, adds dependency, splits deployment
- **Form action on +page.server.ts**: Tied to the page, doesn't support JSON API semantics well

## Decision 2: Request Body Field Naming

**Decision**: `secret` for content, `ttl` for time-to-live

**Rationale**:
- User specified "secret" as the field name
- `ttl` is consistent with the existing web form field name
- Simple, flat JSON: `{ "secret": "my password", "ttl": "3600" }`
- Maps to existing `createNoteSchema` fields (`content` → renamed to `secret` for the API)

**Alternatives considered**:
- **`content`**: Web form uses this, but user explicitly chose "secret"
- **`message`**: Less specific, doesn't convey secrecy

## Decision 3: API Key Implementation

**Decision**: Check `API_KEY` env var at handler entry. If set, compare against `Authorization: Bearer <token>` header. If missing or mismatch, return 401.

**Rationale**:
- Simple, stateless check — no session, no database lookup
- Standard `Bearer` scheme — compatible with curl, HTTP libraries, CI/CD tools
- `API_KEY` unset = open endpoint (dev-friendly default)
- `API_KEY` set = all requests must authenticate (production-safe)

**Alternatives considered**:
- **X-API-Key header**: Non-standard, less tooling support
- **Query parameter**: Exposes key in URLs, logs, referrer headers
- **HMAC signing**: Over-engineered for a single endpoint

## Decision 4: Response Format

**Decision**: `{ "noteUrl": "/note/<id>" }` with HTTP 201. Plain JSON, minimal.

**Rationale**:
- Single field response — easy to parse in any language
- Return just the URL path (not full URL) — simpler, no `PUBLIC_URL` config needed
- 201 Created is the standard REST status for resource creation
- Error responses: `{ "error": "message" }` with appropriate 4xx status
