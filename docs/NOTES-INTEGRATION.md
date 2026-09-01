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

v9.10 established `data/field-notes.js` as the stable public owner for normalized field-note records. It is a presentation/integration boundary, not a copy of the private note ledger.

A public field-note record must be rewritten as Obol-owned guidance and may contain only the normalized fields needed for contextual delivery, including:

- a stable Obol record ID;
- a short title and derived guidance body;
- a normalized kind such as lesson, tool guidance, path guidance, troubleshooting, Evidence, report, or cleanup;
- explicit card, tool, Path, or tag bindings;
- optional opaque source references used for private-ledger traceability.

Public source references must not contain raw ENEX paths, course text, flags, screenshots, lab targets, or proprietary notebook content. The public app must be able to render a Field Note without reading the private repository.

`assets/field-notes.js` selects only records relevant to the active card/tool/Path context and renders them through collapsed progressive disclosure. An empty relevant set renders nothing. This prevents the public app from becoming a notebook dump while giving reviewed source lessons a stable destination.

## Review-packet boundary

The private repository owns bounded review packets generated from the Git LFS ENEX sources. Review packets include opaque note IDs plus enough private note substance for a real review decision. They are review inputs only.

Never publish packet `review_text`, code blocks, course flags, lab targets, copied walkthrough prose, screenshots, or raw source paths in public Obol. Public Obol stores only terminal disposition metadata, rationale, opaque lineage, and rewritten product guidance.

## v9.25 Notes Integration Foundation

`data/note-integration.js` became the stable public-safe ingestion and ledger owner in v9.25. It mirrors only source-level counts and hashes required to prove source identity, defines normalized atom kinds and dispositions, accepts sanitized private metadata records, and owns opaque lineage from reviewed private notes to rewritten public outputs.

The public projection deliberately does not carry raw ENEX paths or note bodies. `atomizeMetadata(...)` retains only the note/source IDs, a short title hint, tags, resource count, and content digest needed for review bookkeeping.

v9.25 modeled four reviewed seed notes into rewritten guidance covering credential-dump proof boundaries, pass-the-hash material routing, response-driven content discovery, and path-traversal proof sequencing.

```text
v9.25 milestone
reviewed: 4
modeled: 4
private-reference-only: 0
pending-review: 552
total: 556
```

## v9.26 disposition review wave 1

v9.26 advanced the note-integration owner to schema 1.1.0 and began substantive `notes-disposition-burn-down` review work.

Every reviewed row records an opaque source ID, terminal disposition, review wave, substantive rationale, and derived output IDs where appropriate. Modeled notes must link to at least one rewritten public output. `superseded`, `rejected`, and `private-reference-only` rows must not publish output merely to increase coverage numbers.

```text
v9.26 wave 1
reviewed: 15
modeled: 11
private-reference-only: 4
superseded: 0
rejected: 0
pending-review: 541
total: 556
```

The wave added durable lessons around client-side trust boundaries, transformed-value fuzzing order, file-inclusion proof sequencing, path-filter troubleshooting, HTTP method consistency, and command-injection remediation.

## v9.27 disposition review wave 2

v9.27 advances the stable owner to schema 1.2.0 and reviews another 26 private source notes. The cumulative ledger becomes:

```text
v9.27 wave 2
reviewed: 41
modeled: 32
private-reference-only: 9
superseded: 0
rejected: 0
pending-review: 515
total: 556
```

The Product Hardening item `notes-disposition-burn-down` remains queued. A review wave is measurable progress, not an excuse to mark the one atomic 556-note item complete before every source note is terminal.

Wave 2 finishes the remaining unreviewed records in the first HTB packet and reviews the complete second HTB packet. The public projection grows from ten to eighteen Field Notes while consolidating related source notes into a smaller number of product-owned lessons.

New durable guidance covers four areas.

### Object authorization and enumeration

Direct object references are treated as discovery clues, not vulnerabilities by themselves. Obol now reinforces that backend authorization is the actual boundary and that one unauthorized differential read or action should be proven before broad enumeration is widened. Encoded, hashed, predictable, or client-discovered identifiers do not establish impact on their own.

### Command-injection reasoning

Recipe-heavy command-obfuscation and bypass sheets remain private. Public guidance instead teaches the reusable reasoning model: reduce a blocked request to a known-good baseline, vary one parser or filter assumption at a time, distinguish front-end validation from backend enforcement, and separate command-sink suspicion from reviewed execution proof.

### File-upload validation and proof

Obol now treats upload handling as several independent layers: extension, browser-declared content type, file signature, server classification, stored filename, storage location, serving behavior, downstream parser/consumer behavior, and executable interpretation. An accepted upload is not code-execution proof.

The Path guidance also branches on downstream consumers such as browser rendering, document/XML parsing, media processing, archive handling, storage naming, and other observed processors without copying source-specific attack recipes into the product.

### File-upload remediation

Report guidance now emphasizes positive server-side validation, non-executable controlled storage, server-owned randomized naming, authorized download mediation, parser isolation, least-privilege processing, resource limits, safe errors, and malware inspection where appropriate. Client-side checks and extension blacklists remain defense-in-depth rather than the primary security boundary.

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
- contextual Field Note content.

A modeled source note is product-development lineage only. It does not establish any fact, access, exploitation success, Manual Outcome success, or report proof in an operator workspace.

`private-reference-only` is a real terminal disposition for material that remains useful for private lookup but should not be frozen into the public product, including navigation indexes, volatile catalogs, lab-specific outcome records, or recipe-heavy cheat sheets whose durable lessons are already normalized elsewhere.

## Permanent validation

`tools/validate-note-integration.js` verifies:

- exact 556-note / 1,326-resource source accounting;
- explicit terminal rows and rationale for every reviewed note;
- current disposition reconciliation;
- immutable historical v9.25 and v9.26 milestones;
- reciprocal modeled-source-to-public-output lineage;
- no output from non-modeled dispositions;
- contextual Tool and Path bindings;
- public-safe metadata atomization;
- exclusion of raw source paths, ENEX markup, flags, lab targets, and copied private content;
- the no-execution boundary.

## Rule against raw course dumping

Do not copy course text, walkthrough text, screenshots, flags, lab targets, proprietary notebook content, or review-packet bodies into the public Obol repo. Extract lessons and rewrite them as Obol-owned guidance.
