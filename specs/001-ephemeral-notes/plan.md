# Implementation Plan: Ephemeral Notes

**Branch**: `001-ephemeral-notes` | **Date**: 2026-05-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ephemeral-notes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A SvelteKit web application that implements Privnote-style ephemeral messaging. Users create plain text notes with an optional TTL and receive a unique, unguessable link. Notes are stored encrypted in Redis and destroyed atomically on first read via `GETDEL`, or automatically expired via Redis TTL. No authentication, no history, no logs containing note content or identifiers.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: SvelteKit 2.x, ioredis, Zod (input validation)

**Storage**: Redis 7.x (GETDEL for atomic read-delete, EXPIRE for TTL)

**Testing**: Vitest (unit + integration), Playwright (optional end-to-end)

**Target Platform**: Linux server (Node.js 22+ runtime)

**Project Type**: Web application (SvelteKit unified frontend + API routes)

**Performance Goals**: Note creation <3s, note retrieval <2s (client-perceived, including network)

**Constraints**: Max note size 100 KB; no persistent sessions; no external service dependencies beyond Redis

**Scale/Scope**: Internal tool; single-digit concurrent users; no horizontal scaling needed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Security-First Design | PASS | No content/ID in logs; Redis `GETDEL` prevents content from persisting after read; TLS to Redis configured; no auth tokens to leak |
| II. Data Minimization & Ephemeral Storage | PASS | `GETDEL` destroys content on read; Redis `EXPIRE` handles TTL; no replication/backup configured for Redis store; metrics limited to aggregate counts |
| III. Simplicity & Minimal Dependencies | PASS | 3 runtime deps: SvelteKit, ioredis, Zod; no framework beyond SvelteKit; YAGNI -- no repository pattern, no ORM, no caching layer |
| IV. Test-First Development | PASS | Vitest configured for unit + integration; tests cover read-once, TTL expiry, cleanup, no-content-in-logs; fast suite runs without external services via Redis mock |
| V. Input Validation & Safe Defaults | PASS | Zod schemas validate all inputs (content length, TTL values, note ID format); default TTL = 7 days; max content = 100 KB; shortest TTL = 1 hour |

## Project Structure

### Documentation (this feature)

```text
specs/001-ephemeral-notes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── redis.ts         # Redis client singleton
│   ├── crypto.ts        # Note ID generation, encryption helpers
│   └── validation.ts    # Zod schemas for note creation and retrieval
├── routes/
│   ├── +page.svelte     # Note creation page (homepage)
│   ├── +page.server.ts  # Note creation action (POST handler)
│   └── note/
│       └── [id]/
│           ├── +page.svelte     # Note viewing page
│           └── +page.server.ts  # Note retrieval loader (GETDEL + decrypt)
└── app.d.ts

tests/
├── unit/
│   ├── crypto.test.ts
│   └── validation.test.ts
└── integration/
    ├── create-note.test.ts
    ├── read-note.test.ts
    └── error-states.test.ts
```

**Structure Decision**: SvelteKit's default file-based routing covers both frontend pages and API logic. The single `src/` tree avoids unnecessary separation since SvelteKit unifies frontend and backend. `src/lib/` holds shared utilities (Redis client, crypto, validation). `tests/unit/` covers pure logic; `tests/integration/` covers request/response flows against a test Redis instance.

## Complexity Tracking

> No violations to justify.
