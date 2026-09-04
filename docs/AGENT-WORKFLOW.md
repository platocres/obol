# Obol agent build loop

This is the detailed, do-this-now workflow for an agent told to "read the README and keep developing." The README keeps a short **Continue developing (start here)** summary; this document holds the full mechanics so the README can stay lean. Read [`BUILDING.md`](../BUILDING.md) for the release contract and [`docs/PRODUCT-HARDENING.md`](PRODUCT-HARDENING.md) for the engineering contract.

## 1. Orient

1. Read `README.md`, this file, and [`BUILDING.md`](../BUILDING.md).
2. Confirm there is no open release/product-hardening PR. If one exists, continue it instead of opening another. There must be only one open release/product-hardening PR at a time.
3. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/source-review-packets-current.js`, `data/product-hardening/note-progress-current.js`, and `data/product-hardening/work-packages.js` to see Product Build Next, complete packet metrics, and the recommended coherent work package.

## 2. Pick the work

- Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, not a one-item limit.
- Burn down as many items as safely fit the **same ownership area**, architectural context, and test surface. Stop expanding when the next item changes ownership area, migration risk, or test strategy.
- Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests in `data/product-hardening/item-test-contracts.js`.

## 3. Notes work is source re-mining from complete material

The active notes work is **source re-mining**, not reading the public Field Note, prior rationale, prior disposition, old themed packet artifact, or output IDs. Re-mine from one of the complete private sources below.

### Preferred route: raw ENEX through Git LFS

1. The private source repo is [`platocres/obol-source-notes`](https://github.com/platocres/obol-source-notes). The raw ENEX exports live at [`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw). Start there instead of stopping at the public Obol README, the source repo root, or old packet shortlists.
2. The ENEX exports are Git LFS objects. Pull the real bodies and prove the HTB file materialized:
   ```bash
   git lfs install
   git lfs pull --include="sources/raw/HTB - Penetration Tester.enex,sources/raw/OffSec PEN-200.enex"
   python scripts/verify_sources.py
   ```
   The HTB proof line must show `bytes=194191214` and `sha256=ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f`. A 134-byte file beginning with `version https://git-lfs.github.com/spec/v1` is only the pointer and is not source access.
3. Extract the full body of a note by `note_id` (`<source_id>-<sha256(content)[:16]}`) from the ENEX and read it end to end. The source repo extractor `scripts/extract_enex_review_packets.py` shows the ENML-cleaning and note-id derivation.

### Connector fallback: complete sequential packets

If the agent runtime cannot clone GitHub, resolve GitHub DNS, run Git LFS, or read large ENEX binaries directly, use the complete sequential packets committed in the private source repo:

```text
platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json
```

Before using this fallback, verify the manifest says:

```text
schema_version=2
review_text_policy=complete_cleaned_text
truncation_policy=none
note_count=556
unique_note_count=556
truncated_note_count=0
window_marker_count=0
packet_count=29
review_text_chars=8725188
```

Then read the packet files listed in `manifest.packets[*].file`. They are sequential all-note packets generated from verified raw ENEX, not themed search packets. They cover 556/556 notes, preserve complete cleaned note text, and are acceptable for text-based source re-mining when direct raw ENEX access is impossible in the current runtime.

Do **not** use the older themed `review-packets-fulltext` workflow artifact to close review/re-mining work. It can help with theme discovery, but it omits unmatched notes and can truncate text.

Full mechanics and proof rules: [`docs/RAW-NOTES-LFS.md`](RAW-NOTES-LFS.md).

### Mine the complete source material

For each already-reviewed note, re-mine against every extraction dimension: path bindings, tool cards, GUI switches, scripts/one-liners, command templates, terminal-output analyzers, Evidence expectations, path movement, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, product gaps, and additive Orange baseline.

Check the live tracking source before choosing or closing a re-mining packet. `CHANGELOG.md` is release narrative only. Current re-mining status lives in `data/product-hardening/note-progress-current.js`, Product Build Next, and the Product Hardening Dashboard. Current packet metrics live in `data/product-hardening/source-review-packets-current.js`.

## 4. Mine, then use it in the same pass

Source re-mining is a product-development loop, not a backlog-writing exercise. When the README says "continue development," an agent must mine useful source value and then incorporate that value into Obol before the pass is considered complete.

A **public-safe useful finding** is any durable lesson, workflow, proof boundary, command pattern, analyzer rule, tool option, GUI switch, path branch, troubleshooting step, cleanup step, report expectation, or product capability that can be rewritten into original Obol-owned guidance without exposing private/course expression, lab targets, flags, credentials, screenshots, or exact solution chains.

The required loop is:

1. Mine the source note or complete packet.
2. Decide which public-safe findings are useful to operators.
3. Build those findings into the actual site in the same pass: path logic, Field Notes, tool cards, builders, GUI controls, terminal-output analyzers, report guidance, or dashboard-visible product mechanics.
4. Record the tangible additions in the Product Hardening Dashboard and the live re-mining projection with `added` outcomes that cite actual owners, proof refs, and Next Steps path integration.
5. Leave `queued` only for a clearly named blocker or genuinely larger capability that cannot safely fit the same coherent ownership area.

Queued is not a successful resting state for a useful mined finding. A pass that only adds product-gap IDs, prose summaries, or dashboard counters has not finished the source-mining assignment unless every deferred item names a blocker, blast-radius reason, missing source proof, or private-only constraint. The default expectation is: **we mine, then we take what we mined and use it.**

## 5. Derive the value, do not copy the expression

Use the private notes as source knowledge, not public text. The goal is to extract the educational and product value fully while writing new Obol-owned material.

Agents should actively look for:

- reusable methodology and decision logic;
- proof boundaries and Evidence expectations;
- tool-card improvements, GUI switches, modes, warnings, and presets;
- generalized command templates, scripts, and one-liners with variables;
- terminal-output analyzer opportunities;
- path branches, child steps, blockers, unlocks, and next-step rules;
- lesson boxes, mental models, synthetic examples, and common mistakes;
- troubleshooting, cleanup, rollback, and report guidance;
- product gaps that Obol cannot yet model or display.

Do **not** publish raw source expression: course prose, copied walkthrough paragraphs, screenshots, diagrams, flags, credentials, lab targets, raw ENEX paths, exact solution chains, or barely paraphrased command recipes. When something useful is private-heavy, preserve the value by re-authoring the concept into a generalized public-safe Obol output. Mark an item `private-only` only for the raw/private substance that cannot be safely published, not for the durable lesson that can be rewritten.

See [`docs/NOTE-DERIVATION-STANDARD.md`](NOTE-DERIVATION-STANDARD.md) for the full standard.

## 6. Land the findings the right way

- Notes work is **additive** to the Orange-derived path. Do not delete, narrow, or replace Orange path items. Attach to an existing path point, add a child step or adjacent branch, improve or add a tool card, add analyzer behavior, or file a product gap only when a blocker is explicit.
- Wire note-derived tools, scripts, one-liners, analyzers, lesson boxes, command templates, and path branches into the **actual user-visible Next Steps / Orange path surface**: the `publicFieldNotes` / Field Notes surface bound to `path`, current Tool Builder owners, Evidence analyzers, report owners, or current workflow owners. Do not park them in disconnected registries, dashboard-only lists, loose docs, or hidden code paths.
- Update stable current owners directly when possible, for example `data/note-integration-packets.js` for packet-derived Field Notes and `data/product-hardening/note-progress-current.js` for the re-mining projection. Do not add disposable wrapper, overlay, release-specific patch, or parallel-registry shortcuts.
- Keep raw course text, targets, flags, credentials, screenshots, and exploit recipes out of public Obol. Publish only normalized, non-verbatim derived guidance.

## 7. Prove negative findings

Every re-mined note dimension must resolve to one auditable outcome: `added`, `covered`, `queued`, `private-only`, `not-applicable`, or `blocked`, published as a per-note, per-dimension row in `data/product-hardening/note-progress-current.js` or the current live re-mining projection (`remining.auditRows`). Blank or generic `none`, `no change`, or `not useful` entries are invalid.

Outcome proof requirements:

- `added` cites proof plus actual Next Steps path integration, changed owners, tool IDs, analyzer IDs, report IDs, or path IDs.
- `covered` cites the existing owner ID.
- `queued` cites the queue or product-gap ID and names why it could not be built in the same pass.
- `private-only` gives a public-safe reason.
- `not-applicable` gives a specific reason.
- `blocked` gives the blocker and next action.

`tools/validate-note-remining-audits.js` enforces this. See [`docs/NOTE-MINING-RUBRIC.md`](NOTE-MINING-RUBRIC.md).

## 8. Release every product build

Every product build is a versioned release. In the same PR:

- bump `data/current-release.js`, then run `node tools/sync-current-release.js --write` to update README and `index.html`;
- add `docs/vX.Y.md` and a `## vX.Y - ...` entry at the top of [`CHANGELOG.md`](../CHANGELOG.md);
- add `tests/run-vX.Y-tests.js` that invokes `tools/validate-release-pr.js` and asserts the current release version-agnostically;
- demote the previous release's test off any live-current assertion. README release token, `index.html` shell tokens, and `data/current-release.js` literals all become version-agnostic checks. `tools/validate-historical-tests.js` catches the common cases;
- regenerate generated owners after any manifest/fragment change, and run `node tools/sync-product-build-next.js --write` whenever queue, work-package, or source-packet metric state changes.

Docs-only clarification PRs do not need to bump the public site release number unless they change product behavior, queue state, generated outputs, or the visible website release identity.

## 9. Validate and keep it green

- Inner loop: `node tools/scope-check.js`.
- Notes/queue gates: `node tools/validate-notes-impact.js`, `node tools/validate-note-integration.js`, `node tools/validate-note-remining-audits.js`, `node tools/validate-note-derivation-docs.js`, `node tools/sync-product-build-next.js --check`, `node tools/validate-product-hardening-queue.js`.
- Release gates and the historical chain are owned by CI on `[preflight]` / `[full-regression]` heads; see [`BUILDING.md`](../BUILDING.md). A release is merge-ready only when the exact final head is green.
