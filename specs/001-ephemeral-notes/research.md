# Research: Ephemeral Notes

## 1. Redis as Ephemeral Store

**Decision**: Use Redis 7.x with `GETDEL` and `SETEX` commands for atomic read-delete and TTL enforcement.

**Rationale**:
- `GETDEL` atomically retrieves and deletes a key in a single command, eliminating race conditions between read and delete operations. This is the simplest way to guarantee one-time access.
- `SETEX` sets a value with an expiration time in one atomic operation, ensuring TTL is bound to the note from creation.
- Redis `EXPIRE` on existing keys covers any remaining TTL needs (e.g., extending or setting TTL after insert).
- Redis handles expired key cleanup natively via lazy expiration (on access) and periodic active expiration in the background, satisfying FR-013 (cleanup within a bounded window).
- No secondary indexes, no replication, no persistence (RDB/AOF disabled for the notes database) ensures data is truly ephemeral.

**Alternatives considered**:
- PostgreSQL with `SELECT ... FOR UPDATE` + `DELETE`: More complex transaction management, WAL retains data after deletion, vacuum is non-deterministic.
- SQLite with `PRAGMA secure_delete`: Single-file simplicity but not built for network access; WAL journal retains data.
- Filesystem with `shred`: Disk-level secure deletion is unreliable on SSDs and journaling filesystems.

## 2. Redis Client Library

**Decision**: Use `ioredis` (v5.x).

**Rationale**:
- Most mature Redis client for Node.js/TypeScript with full TypeScript types.
- Built-in cluster and sentinel support (not needed now but no cost to have).
- Automatic pipeline batching, Lua scripting support, and Promise-based API.
- Active maintenance and large community.

**Alternatives considered**:
- `node-redis` (v4.x): Official Redis client, similar feature set. ioredis chosen for wider adoption in the SvelteKit/Node ecosystem and slightly better TypeScript ergonomics.
- `redis-memory-server`: In-memory Redis for testing, useful as a dev dependency to avoid requiring a real Redis instance during test runs.

## 3. Note ID Generation

**Decision**: Use `crypto.randomUUID()` (Node.js built-in) for note identifiers.

**Rationale**:
- Generates 128-bit random UUIDs (v4), satisfying the spec requirement for ≥128 bits of entropy.
- Built into Node.js standard library — zero additional dependencies (aligns with Principle III).
- UUIDs are URL-safe and well-understood.
- Non-sequential by design (random), making enumeration infeasible.

**Alternatives considered**:
- `nanoid`: Slightly shorter IDs (21 chars vs 36), but requires an additional dependency. Not justified given UUIDs are perfectly adequate.
- `crypto.randomBytes(16).toString('hex')`: 32 hex chars, also zero-dependency. UUID chosen for standardized format.

## 4. Input Validation

**Decision**: Use Zod for schema-based input validation on both client and server.

**Rationale**:
- TypeScript-first schema validation with automatic type inference.
- Single source of truth for validation logic shared between client-side preview and server-side enforcement.
- Handles: content length (max 100 KB), TTL enum (1h, 24h, 168h, 720h), note ID format (UUID v4 regex).
- Lightweight (~12 KB gzipped) — minimal dependency cost.

**Alternatives considered**:
- Manual validation: More code, more bugs, no type inference. Rejected for violating "testable" principle since manual validation logic duplicates test surface.
- `valibot`: Newer, smaller. Zod chosen for maturity and ecosystem familiarity.

## 5. Encryption at Rest

**Decision**: Encrypt note content with AES-256-GCM using Node.js `crypto` module before storing in Redis.

**Rationale**:
- Redis does not natively encrypt values. Application-layer encryption is required to satisfy FR-011 and Constitution Principle I.
- AES-256-GCM provides authenticated encryption (confidentiality + integrity).
- Each note gets a unique random IV (12 bytes) and a key derived from a server secret + the note's UUID.
- Encryption is applied before the `SETEX` call and decryption happens after `GETDEL` returns the ciphertext.
- After `GETDEL`, the key is deleted — even if ciphertext lingers in Redis memory, it's cryptographically unrecoverable without the key (which only exists in the server process).

**Key derivation**: HKDF-SHA256 using a server-side secret (from `SECRET_KEY` env var) as IKM and the note UUID as salt. This ensures per-note keys without storing them.

**Alternatives considered**:
- No encryption (rely on Redis memory only): Violates Constitution Principle I (encryption at rest). Redis memory dumps, swap files, or compromised Redis access would expose plaintext.
- Redis transit encryption only (TLS): Protects data in flight but not at rest within Redis.

## 6. Testing Strategy

**Decision**: Vitest for unit and integration tests. `ioredis-mock` for unit tests, real Redis (via `redis-memory-server` or Docker) for integration tests.

**Rationale**:
- Vitest is the de facto test runner for SvelteKit/Vite projects; zero-config Jest compatibility.
- Unit tests for `crypto.ts` and `validation.ts` run without external services.
- Integration tests for create/read/error flows run against a real Redis instance to verify `GETDEL` atomicity and `EXPIRE` behavior.
- Test structure: unit tests in `tests/unit/`, integration tests in `tests/integration/`.

**Alternatives considered**:
- Jest: More configuration overhead with ESM/TypeScript. Vitest works natively with Vite.
- Playwright for all tests: Overkill for API-level testing. Playwright reserved for optional end-to-end browser tests.

## 7. SvelteKit Project Structure

**Decision**: Use SvelteKit's file-based routing with `+page.server.ts` loaders/actions for API logic.

**Rationale**:
- SvelteKit unifies frontend and backend — no separate Express/Fastify server needed.
- `+page.server.ts` files run only on the server and handle form submissions (actions) and data loading.
- Actions handle POST for note creation; loaders handle GET for note retrieval.
- No client-side JavaScript required for note viewing (progressive enhancement possible but not required).

**Routes**:
- `/` — Note creation page (form + optional TTL selector)
- `/note/[id]` — Note viewing page (retrieves, decrypts, displays, and destroys)
