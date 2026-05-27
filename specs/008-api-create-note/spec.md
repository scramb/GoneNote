# Feature Specification: API Create Note

**Feature Branch**: `008-api-create-note`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "I want to have an api endpoint that is able to create a note with no interface interaction. This should be used to programmatically use this tool to create secrets and password to be shared."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Note via API (Priority: P1)

A developer or automated system sends a POST request with note content and optional TTL to the API endpoint. The server creates an encrypted note and returns the shareable URL.

**Why this priority**: This is the entire feature. Without it, programmatic note creation is impossible.

**Independent Test**: `curl -X POST -H "Content-Type: application/json" -d '{"content":"my secret","ttl":"3600"}' http://localhost:3000/api/note` returns JSON with a note URL. Opening the URL in a browser shows the note content after reveal.

**Acceptance Scenarios**:

1. **Given** the API endpoint is available, **When** a POST request is sent with valid JSON containing `content` and `ttl`, **Then** the server creates an encrypted note and returns `{ "noteUrl": "/note/<id>" }` with HTTP 201.
2. **Given** a note was created via the API, **When** the recipient opens the returned URL and clicks reveal, **Then** the note content matches what was sent via the API.
3. **Given** the API receives a request with only `content` (no TTL), **When** the note is created, **Then** the default TTL from server configuration is applied.

---

### User Story 2 - API Error Handling (Priority: P1)

Invalid requests receive clear error responses with appropriate HTTP status codes and human-readable messages.

**Why this priority**: Essential developer experience. Callers must know when and why a request failed.

**Independent Test**: Send requests with empty content, missing content, invalid TTL, and malformed JSON. Verify each returns a non-2xx status with a descriptive JSON error message.

**Acceptance Scenarios**:

1. **Given** a POST request is sent without a `content` field, **When** processed, **Then** the server returns HTTP 400 with `{ "error": "..." }`.
2. **Given** a POST request is sent with an invalid TTL value, **When** processed, **Then** the server returns HTTP 400 with `{ "error": "Invalid expiration period selected." }`.
3. **Given** a POST request has a malformed JSON body, **When** processed, **Then** the server returns HTTP 400 with `{ "error": "Invalid JSON." }`.
4. **Given** a POST request exceeds the maximum content length, **When** processed, **Then** the server returns HTTP 413 with an appropriate error message.

---

### User Story 3 - Optional API Key Protection (Priority: P2)

When an `API_KEY` environment variable is configured, the endpoint requires a matching key via the `Authorization` header. Without the key, requests are rejected. When `API_KEY` is not set, the endpoint is open.

**Why this priority**: Basic security for production deployments without introducing mandatory authentication. Operators opt in.

**Independent Test**: Set `API_KEY=secret123`. Send a request without the header — 401. Send with `Authorization: Bearer secret123` — 201. Unset `API_KEY` — request without header succeeds.

**Acceptance Scenarios**:

1. **Given** `API_KEY=mykey` is configured, **When** a request is sent without an `Authorization: Bearer mykey` header, **Then** the server returns HTTP 401.
2. **Given** `API_KEY=mykey` is configured, **When** a request is sent with the correct authorization header, **Then** the note is created normally.
3. **Given** `API_KEY` is not configured, **When** any request is sent, **Then** no authorization is required.

---

### Edge Cases

- What happens when a request body contains fields other than `content` and `ttl` (extra unknown fields)?
- What happens when `content` is an empty string or only whitespace?
- What happens when the Redis connection fails during API note creation?
- What happens when the request `Content-Type` is not `application/json`?
- What happens when the JSON body is extremely large (e.g., several megabytes)?
- What happens when the `ttl` value is negative or zero?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a REST endpoint at `POST /api/note` that accepts a JSON request body.
- **FR-002**: The endpoint MUST accept a `content` field (string, required) and a `ttl` field (string, optional) in the JSON body.
- **FR-003**: The endpoint MUST reuse the existing Zod `createNoteSchema` for input validation, ensuring identical behavior to the web form.
- **FR-004**: The endpoint MUST return HTTP 201 with a JSON body containing `noteUrl` on success.
- **FR-005**: The endpoint MUST return HTTP 400 with a JSON error body for invalid input.
- **FR-006**: The endpoint MUST support an optional `API_KEY` environment variable. When set, requests MUST include an `Authorization: Bearer <key>` header. Missing or incorrect keys receive HTTP 401.
- **FR-007**: When `API_KEY` is not configured, the endpoint MUST accept requests without authentication.
- **FR-008**: The endpoint MUST reject requests with `Content-Type` other than `application/json` with HTTP 415.
- **FR-009**: The API endpoint MUST never return note content in its response — only a URL reference to the note.
- **FR-010**: Extra unknown fields in the JSON body MUST be ignored (not cause an error).

### Key Entities

- **API Create Request**: `{ "content": string, "ttl"?: string }` — JSON body sent to the endpoint.
- **API Create Response (success)**: `{ "noteUrl": string }` — returned with HTTP 201 on success.
- **API Error Response**: `{ "error": string }` — returned on any failure with appropriate HTTP status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A note can be created with a single `curl` command in under 1 second from request to response.
- **SC-002**: 100% of invalid inputs return a non-2xx HTTP status with a JSON error body.
- **SC-003**: The API endpoint response never contains the note plaintext — only a URL reference.
- **SC-004**: API-created notes are indistinguishable from UI-created notes to the recipient — same reveal flow, same destruction behavior, same TTL options.

## Assumptions

- The API uses the same encryption, storage, and validation as the web form — ensuring identical note lifecycle.
- The API key is provided via the standard `Authorization: Bearer <token>` HTTP header.
- Extra unknown fields in the JSON body are silently ignored.
- The endpoint is implemented as a SvelteKit `+server.ts` route at `src/routes/api/note/+server.ts`.
- The API does not support file uploads, HTML form data, or multipart requests — JSON only.
- Rate limiting is not included in v1 but may be added later.
