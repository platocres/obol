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
- a normalized kind such as lesson, tool guidance, path guidance, troubleshooting, Evidence, report, cleanup, or script (a reusable one-liner or script derived from a note, tracked as a first-class output rather than folded into tool guidance);
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

## v9.28 disposition review wave 3

v9.28 layers `data/note-integration-reviews.js` over the stable base owner, advances the current public-safe projection to schema 1.3.0, and reviews another fourteen HTB notes. The cumulative ledger becomes:

```text
v9.28 wave 3
reviewed: 55
modeled: 43
private-reference-only: 12
superseded: 0
rejected: 0
pending-review: 501
total: 556
```

The burn-down item remains queued. Wave 3 adds eleven modeled decisions and three private-reference-only decisions while the public projection grows from eighteen to twenty-four Field Notes.

### Upload acceptance versus demonstrated impact

Obol now makes the upload proof boundary explicit even when validation is absent. File acceptance, stored filename and location, reachability, server serving or processing behavior, executable interpretation, and downstream effect are separate states. An accepted upload alone is not evidence of execution or meaningful impact.

### File-inclusion scanning and interpretation

File-inclusion automation begins from one reproducible file-read response and widens parameters, traversal depth, encoding, wrappers, and wordlists one dimension at a time. A controllable include target can yield a plain file read, transformed source disclosure, failed resolution, remote retrieval, or executable interpretation; the workspace records the behavior actually observed rather than assuming all inclusion primitives imply execution.

### Cross-source inclusion chains

Upload-assisted and remote-file inclusion are modeled as multi-boundary chains. Attacker control of a source, source location or URL, target-side retrieval/inclusion, runtime interpretation, and command effect all require their own reviewed Evidence. Operator-hosted content or successful storage does not prove the later stages.

### File-inclusion and XSS remediation

File-inclusion remediation favors fixed server-side mappings or strict allowlists, canonicalization before authorization, constrained readable paths, and least-privilege processes rather than string-filter-only controls. XSS remediation emphasizes context-aware output encoding, safe DOM APIs, Content Security Policy as defense in depth, and hardened session cookies.

### Current progress projection

`data/product-hardening/note-progress-current.js` now derives the live Notes Integration completion count from the current note ledger. README generation and both Product Hardening Dashboard entrypoints therefore consume actual reviewed-note progress rather than a hard-coded release threshold.

## v9.30 themed packet burn-down

v9.30 moves substantive review from anonymous waves to explicit subject packets under the 556-note umbrella. The first packet is **web upload and file inclusion**. Its private shortlist contains 47 candidates. Thirty-five were already terminal from earlier review waves, eleven more reached terminal dispositions in v9.30, and one cross-theme Linux credential-hunting source remains pending for the Linux privilege-escalation packet.

The cumulative ledger is:

```text
v9.30 web upload / inclusion packet
reviewed: 76
modeled: 53
private-reference-only: 19
superseded: 4
rejected: 0
pending-review: 480
total: 556
```

`data/note-integration-packets.js` is the current public-safe packet-accounting layer. It records packet candidate accounting, terminal/deferred state, normalized outputs, and closed product-mechanics gaps without copying private packet bodies into Obol. The web upload/inclusion packet is complete, while the umbrella and the XSS/session, credentials/authentication, Windows privilege escalation, Linux privilege escalation, and AD/pivoting packets remain live.

The packet advances the public projection to 32 normalized Field Notes and records the first explicitly declared note-driven code change. The curl Tool Builder gains an opt-in **Preserve URL path (`--path-as-is`)** control when exact dot-segment transport matters to a path-resolution hypothesis. Other modeled sources explicitly record `guidanceOnlyReason` when contextual guidance is sufficient rather than inflating the product-mechanics count.

Contextual Field Notes on Tool and Path routes now lazy-load the packet layer as well as the base and historical review layers. Dashboard, README generation, validators, and workflow-route guidance therefore consume the same current Notes Integration state instead of stopping at different review schemas.

## Current themed packet state

The current public-safe ledger has **127/556** notes reviewed: **95 modeled**, **27 private-reference-only**, **5 superseded**, **0 rejected**, and **429 pending**. Completed subject packets are web upload/file inclusion, XSS/session behavior, credentials/authentication, and Windows privilege escalation. Linux privilege escalation and AD/pivoting remain the next named subject packets beneath the 556-note umbrella.

The Windows privilege-escalation packet was selected after substantive review of the private title/tag shortlist (**32 candidates**) and private full-text sweep (**95 candidates**), then curated to **16** reusable subject sources. One source was already terminal from the credentials work and fifteen reached new terminal dispositions. Public guidance now covers Windows privilege-enumeration triage, access-token/integrity proof, privileged service/task/DLL execution preconditions, secret-hunting boundaries, and local-exploit risk/proof without publishing private course recipes.

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
- current disposition reconciliation and the 76-reviewed v9.30 packet baseline;
- immutable historical milestones, including the frozen v9.28 55-note state and the first v9.30 65-note wave;
- complete accounting of the 47-source web upload/inclusion packet, including its one explicit cross-theme deferral;
- reciprocal modeled-source-to-public-output lineage;
- explicit v9.29+ guidance-only versus code-level product-change decisions;
- no output from non-modeled dispositions;
- contextual Tool and Path bindings, including packet-derived Field Notes on workflow routes;
- public-safe metadata atomization;
- exclusion of raw source paths, ENEX markup, flags, lab targets, copied private content, and packet review bodies;
- the no-execution boundary.

## Rule against raw course dumping

Do not copy course text, walkthrough text, screenshots, flags, lab targets, proprietary notebook content, or review-packet bodies into the public Obol repo. Extract lessons and rewrite them as Obol-owned guidance.
