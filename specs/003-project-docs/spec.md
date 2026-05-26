# Feature Specification: Project Documentation

**Feature Branch**: `003-project-docs`
**Created**: 2026-05-26
**Status**: Draft

## User Scenarios

### User Story 1 - New User Onboarding (P1)
A developer discovers GoneNote on GitHub and can understand what it does, how to run it, and how to contribute within 2 minutes of reading the README.

### User Story 2 - Production Deployment (P1)
An operator follows the quickstart to deploy GoneNote on Kubernetes using the Helm chart.

### User Story 3 - Contributor Setup (P2)
A developer clones the repo and follows CONTRIBUTING.md to set up a local dev environment and run tests.

## Requirements

- FR-001: README.md with project description, features, quickstart, and links to further docs
- FR-002: CONTRIBUTING.md with local dev setup, test commands, and PR workflow
- FR-003: Apache 2.0 LICENSE file
- FR-004: Quickstart covering Docker Compose, Kubernetes/Helm, and local dev

## Success Criteria

- SC-001: A new user can go from discovery to a running local instance in under 5 minutes
- SC-002: All commands documented in README and CONTRIBUTING.md work as copy-paste

## Assumptions

- Documentation is written in Markdown and lives in the repo root
- No documentation website or static site generator is needed for v1
