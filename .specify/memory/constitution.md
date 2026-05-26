<!--
  Sync Impact Report
  ==================
  Version change: [unset] → 1.0.0 (initial ratification)
  Modified principles: N/A (first fill of template)
  Added sections:
    - Core Principles (5 principles)
    - Security Requirements
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ (Constitution Check gates align)
    - .specify/templates/spec-template.md ✅ (Security/data minimization constraints reflected)
    - .specify/templates/tasks-template.md ✅ (Test-first + validation tasks align)
  Follow-up TODOs: None
-->

# Bauhaus Note Constitution

## Core Principles

### I. Security-First Design

Security is the foundational concern of every component. Note contents, secrets, API keys,
and authentication tokens MUST never be written to log output, error messages, or any
persistent store outside the designated encrypted storage layer. All data in transit MUST
use TLS. All persisted note data MUST be encrypted at rest with a unique per-note key
derived from a server-side secret and the note's random identifier.

Rationale: A Privnote-style application that leaks secrets through logs or exposes
plaintext at rest undermines its sole reason to exist. Security is not a feature — it
is the product.

### II. Data Minimization & Ephemeral Storage

Notes MUST be accessible exactly once (burn-after-reading) or expire automatically via a
configurable TTL. After destruction (read or expiry), note content and metadata MUST be
irrecoverably deleted from all storage layers within a bounded cleanup window. The system
MUST NOT retain copies, backups, or logs of destroyed note content. Telemetry and metrics
MUST be limited to aggregate counts (notes created, notes read, notes expired) and MUST NOT
include any content-derived data.

Rationale: The value proposition is that data disappears. Retaining content after
expiry — even inadvertently through WAL files, replication logs, or backups — breaks
the core promise to users.

### III. Simplicity & Minimal Dependencies

Every dependency added MUST carry its weight. Prefer the standard library over third-party
packages. Any third-party dependency MUST be actively maintained, have a narrow API surface,
and serve a single well-defined purpose. The codebase MUST favor small, focused modules over
large frameworks. YAGNI principles apply: do not build abstraction layers for hypothetical
future requirements.

Rationale: Each dependency is a supply-chain risk and an ongoing maintenance burden.
A security-sensitive application must minimize its attack surface and keep the
dependency tree auditable by a single developer.

### IV. Test-First Development

Tests MUST be written before implementation and MUST fail before the corresponding code
exists. Every data-destruction path (read-once, TTL expiry, manual purge) MUST have an
automated test proving irrecoverable deletion. Security properties (no content in logs,
encryption at rest, TLS in transit) MUST be verified by automated tests. Tests MUST be
runnable with a single command and require no external services for the fast test suite.

Rationale: In a system whose correctness depends on data *disappearing*, tests are the
only practical way to prove that destruction paths work and continue to work through
refactors.

### V. Input Validation & Safe Defaults

All input — HTTP headers, query parameters, request bodies, form fields — MUST be
validated against a strict allowlist before any processing occurs. Note content size
MUST be capped. TTL values MUST be constrained to a permitted range. Link identifiers
MUST be validated for format and length. Reject invalid input early with clear,
non-revealing error messages. Default configurations MUST be the most secure option
(e.g., shortest TTL, strictest size limit).

Rationale: The application accepts arbitrary user content and must resist malicious
payloads. Allowlist validation prevents injection attacks, and secure defaults
protect users who do not customize settings.

## Security Requirements

### Data Protection

- Note content MUST be encrypted at rest using AES-256-GCM or equivalent authenticated
  encryption.
- Decryption keys MUST be derived per-note and MUST NOT be stored alongside ciphertext.
- After a note is destroyed (read or expired), its decryption key MUST be deleted first,
  rendering remaining ciphertext cryptographically unrecoverable even before filesystem
  cleanup runs.
- Memory holding plaintext note content MUST be zeroed or allowed to be garbage-collected
  immediately after the response is sent; plaintext MUST NOT be cached across requests.

### Logging & Observability

- Logging MUST be structured (JSON) and MUST exclude note content, note identifiers,
  decryption keys, request tokens, and any PII.
- Logged fields are limited to: operation type, outcome (success/failure), duration,
  and aggregate-level identifiers.
- Error responses to clients MUST NOT disclose internal state (stack traces, DB errors,
  file paths). Internal error detail MUST be logged only to the server-side log.

### Cryptography

- Cryptographic random number generators (CSPRNG) MUST be used for all token/key generation.
- Note access links MUST contain sufficient entropy (≥128 bits) to resist enumeration.
- The application MUST NOT implement custom cryptographic primitives — use only well-audited
  standard-library or platform-provided crypto.

## Development Workflow

### Code Quality Gates

- All changes MUST pass the full test suite before merge.
- The test suite MUST pass with a single command (e.g., `make test` or language-equivalent).
- Static analysis and linting MUST be configured and MUST pass in CI.
- Dependencies MUST be pinned with checksums/hashes in a lockfile.

### Review Requirements

- Every change touching cryptography, data destruction, logging, or input validation
  MUST be reviewed by at least one other developer.
- Security-sensitive paths (note creation, note reading, TTL enforcement) MUST have
  explicit approval before merge.
- Complexity in a PR MUST be justified in the description if it exceeds what a
  straightforward implementation would require.

### Environment & Configuration

- All configuration MUST be read from environment variables; no hardcoded secrets or URLs.
- Production configuration MUST default to the most secure setting for every toggle
  (shortest TTL, strictest CSP, encryption enabled).
- A `.env.example` file MUST document every required variable without containing real secrets.

## Governance

This constitution supersedes all other project practices and conventions. When a
decision conflicts with a principle stated here, the principle wins.

### Amendment Procedure

1. Propose the change with rationale in a pull request.
2. Discuss with at least one other project maintainer.
3. Update `.specify/memory/constitution.md` with the amended text.
4. Increment the version according to semantic versioning rules.
5. Update all dependent templates and documentation to reflect the change.

### Versioning Policy

- **MAJOR**: Removal or redefinition of a core principle that invalidates existing
  design decisions or requires rework of implemented features.
- **MINOR**: Addition of a new principle or section that adds constraints without
  invalidating existing work.
- **PATCH**: Clarifications, wording improvements, typo corrections.

### Compliance Review

- Every feature specification (`spec.md`) MUST include a section verifying alignment
  with each core principle.
- Every implementation plan (`plan.md`) MUST pass the Constitution Check gate before
  Phase 0 research begins.
- Amendments take effect immediately upon merge and apply to all in-flight feature
  branches; the author of each in-flight branch is responsible for assessing impact.

**Version**: 1.0.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
