# Notes Integration

The notes-integration queue uses Brandon's private HTB and OffSec Evernote exports as source material for normalized Obol improvements.

## Private source repo

Raw source material lives in the private repository:

```text
platocres/obol-source-notes
```

Public Obol must not commit the raw ENEX files. Public Obol receives only normalized, derived guidance, schema updates, tool-builder improvements, path changes, Evidence expectations, troubleshooting notes, and report guidance.

## Current source inventory

The private source repo currently stages:

```text
HTB - Penetration Tester.enex
  notes: 352
  embedded resources: 859
  sha256: ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f

OffSec PEN-200.enex
  notes: 204
  embedded resources: 467
  sha256: c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1

Combined: 556 notes, 1,326 embedded resources
```

## Public field-note contract

v9.10 establishes `data/field-notes.js` as the stable public owner for normalized field-note records. It is a presentation/integration boundary, not a copy of the private note ledger.

A public field-note record must be rewritten as Obol-owned guidance and may contain only the normalized fields needed for contextual delivery, including:

- a stable Obol record ID;
- a short title and derived guidance body;
- a normalized kind such as lesson, tool guidance, path guidance, troubleshooting, Evidence, report, or cleanup;
- explicit card, tool, Path, or tag bindings;
- optional opaque source references used for private-ledger traceability.

Public source references must not contain raw ENEX paths, course text, flags, screenshots, lab targets, or proprietary notebook content. The public app should be able to render a field note without reading the private repository.

`assets/field-notes.js` selects only records relevant to the active card/tool/Path context and renders them through collapsed progressive disclosure. An empty relevant set renders nothing. This prevents the public app from becoming a notebook dump while giving reviewed source lessons a stable destination.

The v9.10 public field-note ledger was intentionally empty. v9.25 was the first release to populate that presentation contract from reviewed private-source derivation.

## v9.25 Notes Integration Foundation

`data/note-integration.js` became the stable public-safe ingestion and ledger owner in v9.25. It mirrors only source-level counts and hashes required to prove source identity, defines normalized atom kinds and dispositions, accepts sanitized private metadata records, and owns opaque lineage from reviewed private notes to rewritten public outputs.

The public projection deliberately does not carry raw ENEX paths or note bodies. `atomizeMetadata(...)` retains only the note/source IDs, a short title hint, tags, resource count, and content digest needed for review bookkeeping.

v9.25 modeled four reviewed seed notes into rewritten guidance covering credential-dump proof boundaries, pass-the-hash material routing, response-driven content discovery, and path-traversal proof sequencing. The stable owner preserves this four-note milestone explicitly even as later review waves advance the current ledger.

The v9.25 historical milestone is:

```text
reviewed: 4
modeled: 4
private-reference-only: 0
pending-review: 552
total: 556
```

## v9.26 disposition review waves

v9.26 advances the note-integration owner to schema 1.1.0 and begins the substantive `notes-disposition-burn-down` review work.

The private source repository now supports bounded review packets generated from the Git LFS ENEX sources. Those private packets expose enough note substance for agents to review lessons instead of deciding from titles alone. They remain private source material and must never be copied into public Obol.

Public Obol stores only explicit `reviewedDispositions` rows. Every reviewed row contains:

- an opaque private-source note ID;
- a terminal disposition;
- the review wave that made the decision;
- a substantive rationale;
- derived public output IDs when the note is modeled.

Modeled notes must link to at least one rewritten public output. Notes marked `superseded`, `rejected`, or `private-reference-only` must not publish derived output merely to increase coverage numbers. Public Field Notes may cite only source rows that are explicitly modeled, and validation enforces the lineage in both directions.

The v9.26 first review wave advances the ledger to:

```text
reviewed: 15
modeled: 11
private-reference-only: 4
superseded: 0
rejected: 0
pending-review: 541
total: 556
```

The `notes-disposition-burn-down` Product Hardening item remains queued. Partial review progress is shown through the 15/556 Notes Integration denominator; the atomic queue item does not become complete until all 556 source notes have terminal dispositions.

The new modeled guidance adds durable lessons for:

- treating client-side controls as behavior rather than authorization proof;
- preserving decode/mutate/re-encode order when fuzzing transformed web values;
- separating persisted input, readable inclusion, executable interpretation, and command-execution proof in file-inclusion chains;
- testing path-normalization and filter assumptions incrementally while treating legacy bypasses as runtime-dependent hypotheses;
- comparing authorization and security-filter behavior across HTTP methods without treating a method change alone as proof;
- reporting command-injection remediation as a design, allowlisting, least-privilege, and constrained-scope problem rather than blacklist tuning.

Reviewed records that are primarily navigation indexes, volatile extension catalogs, lab-specific outcome records without a distinct new lesson, or opaque command-obfuscation catalogs may remain `private-reference-only` with rationale. Private-reference-only is a real terminal review decision, not a hidden backlog bucket.

`tools/validate-note-integration.js` permanently verifies source totals, explicit disposition reconciliation, terminal rationale, modeled-output lineage, historical v9.25 milestone preservation, public-safe atomization, contextual tool/Path bindings, raw-source exclusion, and the no-execution boundary.

## Dispositions

Each note must eventually end in one of these terminal states:

- modeled
- superseded
- rejected
- private-reference-only

Before terminal review, a note remains `pending-review` in the public-safe ledger projection.

Modeled notes should produce one or more normalized Obol artifacts when the reviewed source genuinely adds product value:

- path/action improvement;
- tool-builder toggle or mode;
- credential-mode handling;
- Evidence parser expectation;
- troubleshooting hint;
- cleanup/restoration hint;
- report guidance;
- contextual field-note panel content.

A modeled source note is product-development lineage only. It does not establish any fact, access, exploitation success, or report proof in an operator workspace.

## Rule against raw course dumping

Do not copy course text, walkthrough text, screenshots, flags, lab targets, or proprietary notebook content into the public Obol repo. Extract lessons and rewrite them as Obol-owned guidance.
