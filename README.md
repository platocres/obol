# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.52**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is a current-state entry point, not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md); the release/build workflow in [`BUILDING.md`](BUILDING.md); the full agent build loop in [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md).

## Continue developing (start here)

Told to "read the README and keep developing"? Do this, no further instruction required:

1. **One PR.** Confirm there is no open release/product-hardening PR (continue it if there is); otherwise open exactly one non-draft release PR.
2. **Do the queue.** Work the highest-priority Product Build Next item below and its recommended coherent work package (see [Future-agent quickstart](#future-agent-quickstart)).
3. **Re-mine raw notes, not summaries.** The active notes work is source re-mining. Clone the private source repo `platocres/obol-source-notes`, run `git lfs pull` to fetch the raw `*.enex`, and read the **actual raw note bodies** — the committed review packets are truncated shortlists. Full mechanics: [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) and [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md).
4. **Land it additively and prove it.** Wire new outputs into the actual Next Steps / Orange path surface; record a per-note, per-dimension re-mining outcome (`added`, `covered`, `queued`, `private-only`, `not-applicable`, or `blocked`) with proof. Do not add wrapper, overlay, or parallel-registry shortcuts.
5. **Release every build.** Bump the version, sync generated outputs, add the release doc, CHANGELOG entry, and test suite, and keep the exact final head green. See [`BUILDING.md`](BUILDING.md).

## Current agent directive

Re-mine already-reviewed notes from the original private source notes before starting new pending-note packets, unless the user explicitly overrides that order. Return to the raw note, not the existing public Field Note or prior disposition. Notes work is additive to the Orange-derived path — attach to or extend existing points, never delete or narrow them. Every re-mined dimension needs auditable negative proof; blank or generic `none` or `no change` entries are invalid. Details: [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md).

## Product contract

Obol remains a website the user can simply visit and use: no backend, account system, telemetry, install prompt, or automatic command execution. **Human-run commands only** — Obol builds and explains commands; the operator runs them externally in an authorized environment and returns output for Evidence review. The normal loop is `Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`. Command recognition is not success; durable facts come only from explicit supported Evidence. See [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Future-agent quickstart

Before building, read this README, [`BUILDING.md`](BUILDING.md), and [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md); for notes work also read [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md).

- There must be only one open release/product-hardening PR at a time; CI enforces this with `tools/validate-open-pr-uniqueness.js`. Continue the active one or close it as superseded before opening another. Do not use a Draft to Ready transition as a release gate.
- Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, then complete as many items as safely fit the same ownership area, architectural context, and blast radius.
- Keep queue-item accountability atomic. Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests.
- Do not batch unrelated work; stop when the next item changes ownership area, architecture, migration risk, or test strategy.
- Use `node tools/scope-check.js` during development; sync generated Product Build Next output and keep the whole work package in the one active PR until the exact final head is green.

## Required context map

- [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) - the do-this-now build loop, including raw-source note re-mining.
- [`BUILDING.md`](BUILDING.md) - release flow, validation tiers, one-open-PR rule, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, work-package rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md) - runtime ownership and the retirement lifecycle.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/TOOL-BUILDER-COVERAGE.md`](docs/TOOL-BUILDER-COVERAGE.md) - the Tool Builder Platform and runnable-tool inventory.
- [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) - source re-mining rubric, the private-source boundary (`platocres/obol-source-notes`), and the notes-to-product decision model.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) and [`docs/CORRECTIVE-PLAN.md`](docs/CORRECTIVE-PLAN.md) - UX goals and the durable corrective roadmap.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and the regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

## Active product queue

Product Build Next is the only active development queue. Its atomic source of truth is `data/product-hardening/product-hardening-queue.js`; re-mining and notes projections live in `data/product-hardening/note-progress-current.js`; coherent multi-item metadata lives in `data/product-hardening/work-packages.js`. The README and Product Hardening Dashboard consume these same sources, so the generated block below stays in sync with the dashboard. Queue tracks and rules live in [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md).

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.
Runtime consolidation figures come from `data/runtime-consolidation-current.js`, the same projection the Product Hardening Dashboard renders.

**Current product-hardening queue:** 219/653 complete (34%), 15 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.
**Notes Integration:** 135/556 reviewed — 102 modeled, 28 private-only, 421 pending.
**Derived note guidance:** 56 Field Notes · 51 tool-bound · 53 Path-bound · 17 Evidence · 5 Report.
**Declared note-driven product mechanics:** 2 total · 2 builder · 0 Path logic · 0 Evidence parser · 0 report generator · 0 workflow.
**Latest mined themes:** Linux local privilege escalation, Credentials / auth material, Object authorization / IDOR, Windows local privilege escalation.
**Notes impact contract:** `docs/NOTES-IMPACT.md`.
**Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer).
**Current runtime ownership areas:** 7 owners account for 272 historical fragments — 215 semantically flattened, 57 still exact-owned; 55 fragments stay retired in the frozen ledger.
**Runtime area owners:** Domain data (103, semantic-snapshot) · Core state and derivation (69, semantic-delta-replay) · Report base and application UI (43, semantic-delta-replay) · Evidence parsing (37, ordered-fragment-concatenation) · Nmap builders (3, ordered-fragment-concatenation) · Report overlays (14, ordered-fragment-concatenation) · Tool reference data (3, ordered-fragment-concatenation).
**Measured in Chromium (v9.40):** Home 321→19 · Next Steps 329→27 · Evidence 365→21 · Report 335→20 JavaScript/CSS requests.
**Runtime compaction contract:** `docs/RUNTIME-COMPACTION.md`.

**Recommended work package:** **Notes Impact and Source Re-mining** — 3 live items / 11 tracked.
**Work-package entry:** **Re-mine all already-reviewed notes from original sources**
**Ownership area:** `notes/impact-packets`
**Package guidance:** Treat the 556-note disposition item as the umbrella, but do not let the umbrella hide the immediate work: re-mine already-reviewed notes from their original private sources before fresh pending-note packets. The note-progress projection splits the source re-mining gate into dashboard/schema plus themed re-mining rows; those rows remain additive queue projections while this package stays compatible with base queue validation. Re-mining must check for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, actual Next Steps path placement, lesson boxes, examples, troubleshooting, cleanup, report guidance, code-level mechanics, and product gaps. Preserve the Orange-derived path as an additive baseline and do not use disposable wrapper layers.
**Package dependencies:** Notes Integration Foundation

**Live items in this package:**
- **Re-mine all already-reviewed notes from original sources** — Return to the original private source note for every already-reviewed modeled, guidance-only, reviewed-not-modeled, private-only, superseded, or rejected row. Do not merely inspect the existing public Field Note or prior rationale. Re-mine from scratch for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, and product gaps.
- **Burn down all 556 note dispositions** — Umbrella disposition goal for all 556 notes. Fresh pending-note packets remain queued beneath the full-spectrum re-mining gate: agents must first re-mine already-reviewed notes from the original private sources, add missed product outputs, preserve the Orange-derived path additively, and prove every negative finding with an auditable per-dimension outcome.
- **Notes packet: AD and pivoting** — Mine Active Directory, lateral movement, tunneling, pivoting, routing, credential use, evidence boundaries, and missing workflow/tool options.

**Related items to consider, not automatically in scope:** Design contextual field-notes disclosure.

**Highest-priority live items:**
1. **Re-mine all already-reviewed notes from original sources** — Return to the original private source note for every already-reviewed modeled, guidance-only, reviewed-not-modeled, private-only, superseded, or rejected row. Do not merely inspect the existing public Field Note or prior rationale. Re-mine from scratch for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, and product gaps.
2. **Add note re-mining dashboard and schema tracking** — Track re-mining separately from first-pass review. The dashboard and README should show old-rubric reviewed count, full-spectrum re-mined count, remaining old-rubric-only notes, negative finding outcome counts, invalid-negative-proof red flags, and extraction dimensions for tools, GUI switches, scripts, one-liners, analyzers, Path bindings, lessons, troubleshooting, cleanup, reports, and product gaps.
3. **Re-mine reviewed web upload and inclusion notes** — Return to the original private upload, traversal, LFI/RFI, wrapper, hosting, and inclusion-chain notes already reviewed. Add to existing public outputs with missed tool cards, GUI controls, command templates, analyzer expectations, Path logic, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps. Preserve Orange path nodes and add to them rather than deleting or replacing them.
4. **Re-mine reviewed XSS and session notes** — Return to the original private XSS, browser impact, cookie, CSP, request-context, and session notes already reviewed. Mine again for useful tool cards, switches, scripts, one-liners, analyzers, Path attachments, lessons, examples, troubleshooting, cleanup, report guidance, and product gaps.
5. **Re-mine reviewed credentials and auth notes** — Return to the original private credential, hash, ticket, certificate, key, cookie, token, validation-boundary, and auth-failure notes already reviewed. Add missed builder modes, GUI switches, command templates, analyzers, credential routing, Path handoffs, lessons, troubleshooting, cleanup, report guidance, and product gaps.
6. **Re-mine reviewed Linux privesc notes** — Return to the original private Linux privilege-escalation notes already reviewed. Mine again for missed tool cards, shell one-liners, scripts, GUI controls, analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
7. **Re-mine private-only and superseded notes** — Return to original private notes previously marked private-reference-only, superseded, rejected, or reviewed-not-modeled. Keep raw recipes and private material private, but re-check whether public-safe tool ideas, command templates, analyzer rules, lesson boxes, troubleshooting, cleanup, report guidance, or additive Path improvements were missed.
8. **Burn down all 556 note dispositions** — Umbrella disposition goal for all 556 notes. Fresh pending-note packets remain queued beneath the full-spectrum re-mining gate: agents must first re-mine already-reviewed notes from the original private sources, add missed product outputs, preserve the Orange-derived path additively, and prove every negative finding with an auditable per-dimension outcome.

**Track status:**
- **Critical correctness:** 5/5 complete (100%), 0 modeled.
- **Architecture / runtime:** 19/22 complete (86%), 3 modeled.
- **UI / UX repair:** 10/11 complete (91%), 1 modeled.
- **Tool GUI builders:** 19/19 complete (100%), 0 modeled.
- **Credential modes:** 14/14 complete (100%), 0 modeled.
- **Manual outcomes:** 8/8 complete (100%), 0 modeled.
- **Notes integration:** 135/556 complete (24%), 2 modeled.
- **Offline / performance:** 1/6 complete (17%), 0 modeled.
- **Testing / visual QA:** 8/12 complete (67%), 3 modeled.

Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required. Use `#/dashboard` for the Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use `node tools/scope-check.js` as the focused inner-loop gate during development. [`BUILDING.md`](BUILDING.md) owns the preflight and full-regression requirements and lists the permanent notes-impact and runtime-consolidation checks; CI owns the complete historical regression chain on explicit full-regression heads and `main`.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
