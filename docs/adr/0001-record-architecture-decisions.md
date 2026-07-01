# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-06-30

## Context

This project starts as a prototype that an external developer is expected to
take to production (see `HANDOFF.md`). Decisions made early — how data is
stored, where the backend seam is, how isolation works — have outsized
downstream impact. Whoever picks this up needs to know not just *what* the code
does but *why* it's shaped this way.

## Decision

We keep lightweight **Architecture Decision Records** in `docs/adr/`, one file
per significant decision, using the format: Context → Decision → Consequences.
ADRs are immutable once accepted; a later decision that reverses an earlier one
is a new ADR that supersedes it.

## Consequences

- The reasoning behind non-obvious choices (localStorage, the repository seam,
  per-project namespacing, Supabase) is captured next to the code.
- Reviewers can challenge a decision by reading one short file.
- Superseded ADRs stay in history as a record of what was tried.
