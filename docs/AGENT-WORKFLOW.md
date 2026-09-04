# Obol agent build loop

This is the detailed, do-this-now workflow for an agent told to "read the README and keep developing." The README keeps a short **Continue developing (start here)** summary; this document holds the full mechanics so the README can stay lean. Read [`BUILDING.md`](../BUILDING.md) for the release contract and [`docs/PRODUCT-HARDENING.md`](PRODUCT-HARDENING.md) for the engineering contract.

## 1. Orient

1. Read `README.md`, this file, and [`BUILDING.md`](../BUILDING.md).
2. Confirm there is no open release/product-hardening PR. If one exists, continue it instead of opening another. There must be only one open release/product-hardening PR at a time.
3. Open `#/dashboard` (or inspect `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/note-progress-current.js`, and `data/product-hardening/work-packages.js`) to see Product Build Next and the recommended coherent work package.

## 2. Pick the work

- Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, not a one-item limit.
- Burn down as many items as safely fit the **same ownership area**, architectural context, and test surface. Stop expanding when the next item changes ownership area, migration risk, or test strategy.
- Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests in `data/product-hardening/item-test-contracts.js`.

## 3. Notes work is raw-source re-mining

The active notes work is **source re-mining**, not reading the public Field Note, prior rationale, prior disposition, or output IDs. Re-mine the **original private raw notes**:

1. The private source repo is `platocres/obol-source-notes`. Add/clone it.
2. The ENEX exports are Git LFS objects. The committed review packets under `data/review-packets/` are **truncated title/tag shortlists** — do not make a high-confidence product claim from them. Pull the real bodies:
   ```bash
   git lfs install
   git lfs pull            # fetches sources/raw/*.enex (large; be patient)
   python scripts/verify_sources.py
   ```
3. Extract the full body of a note by `note_id` (`<source_id>-<sha256(content)[:16]}`) from the ENEX and read it end to end. `scripts/build_review_packets.py` shows the ENML-cleaning and note-id derivation.
4. For each already-reviewed note, re-mine against every extraction dimension: path bindings, tool cards, GUI switches, scripts/one-liners, command templates, terminal-output analyzers, Evidence expectations, path movement, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, product gaps, and additive Orange baseline.
5. Check the live tracking source before choosing or closing a re-mining packet. `CHANGELOG.md` is release narrative only. Current re-mining status lives in `data/product-hardening/note-progress-current.js`, Product Build Next, and the Product Hardening Dashboard.

## 4. Derive the value, do not copy the expression

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

## 5. Land the findings the right way

- Notes work is **additive** to the Orange-derived path. Do not delete, narrow, or replace Orange path items. Attach to an existing path point, add a child step or adjacent branch, improve or add a tool card, add analyzer behavior, or file a product gap.
- Wire note-derived tools, scripts, one-liners, analyzers, lesson boxes, command templates, and path branches into the **actual user-visible Next Steps / Orange path surface** (the `publicFieldNotes` / Field Notes surface bound to `path`). Do not park them in disconnected registries, dashboard-only lists, loose docs, or hidden code paths.
- Update stable current owners directly (for example `data/note-integration-packets.js` for packet-derived Field Notes, `data/product-hardening/note-progress-current.js` for the re-mining projection). Do not add disposable wrapper, overlay, release-specific patch, or parallel-registry shortcuts.
- Keep raw course text, targets, flags, credentials, screenshots, and exploit recipes out of public Obol. Publish only normalized, non-verbatim derived guidance.

## 6. Prove negative findings

Every re-mined note dimension must resolve to one auditable outcome: `added`, `covered`, `queued`, `private-only`, `not-applicable`, or `blocked`, published as a per-note, per-dimension row in `data/product-hardening/note-progress-current.js` (`remining.auditRows`). Blank or generic `none`, `no change`, or `not useful` entries are invalid. `covered` cites the owner ID, `queued` cites the queue/product-gap ID, `private-only`/`not-applicable` give a public-safe reason, `blocked` gives the blocker and next action, and `added` cites proof plus actual Next Steps path integration. `tools/validate-note-remining-audits.js` enforces this. See [`docs/NOTE-MINING-RUBRIC.md`](NOTE-MINING-RUBRIC.md).

## 7. Release every product build

Every product build is a versioned release. In the same PR:

- bump `data/current-release.js`, then run `node tools/sync-current-release.js --write` (updates README + `index.html`);
- add `docs/vX.Y.md` and a `## vX.Y — …` entry at the top of [`CHANGELOG.md`](../CHANGELOG.md);
- add `tests/run-vX.Y-tests.js` (invokes `tools/validate-release-pr.js`; assert the current release version-agnostically);
- demote the previous release's test off any live-current assertion (README release token, `index.html` shell tokens, and `data/current-release.js` literals all become version-agnostic checks). `tools/validate-historical-tests.js` catches the common cases;
- regenerate generated owners after any manifest/fragment change, and run `node tools/sync-product-build-next.js --write` whenever queue or work-package state changes.

Docs-only clarification PRs do not need to bump the public site release number unless they change product behavior, queue state, generated outputs, or the visible website release identity.

## 8. Validate and keep it green

- Inner loop: `node tools/scope-check.js`.
- Notes/queue gates: `node tools/validate-notes-impact.js`, `node tools/validate-note-integration.js`, `node tools/validate-note-remining-audits.js`, `node tools/validate-note-derivation-docs.js`, `node tools/sync-product-build-next.js --check`, `node tools/validate-product-hardening-queue.js`.
- Release gates and the historical chain are owned by CI on `[preflight]` / `[full-regression]` heads; see [`BUILDING.md`](../BUILDING.md). A release is merge-ready only when the exact final head is green.
