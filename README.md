# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.50**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Detailed build workflow lives in [`BUILDING.md`](BUILDING.md).

## Current agent directive

The next notes work is **source re-mining**, not fresh note mining. Re-mine already-reviewed notes from the original private source notes before starting new pending-note packets unless the user explicitly overrides that order.

Do not review only the existing public Field Note, previous rationale, previous disposition, or output IDs. Return to the original private note and mine it again for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, code-level mechanics, and product gaps.

Notes work is additive to the Orange-derived path. Do not delete, narrow, or replace original Orange mind-map path items during note mining. Attach to an existing path point, add a child step or adjacent branch, improve a tool card, add a new tool card, add analyzer behavior, or file a product gap.

## Product contract

Obol remains a website the user can simply visit and use. There is no backend, account system, telemetry, install prompt, or automatic command execution.

**Human-run commands only.** Obol builds and explains commands, but the operator runs them externally in an authorized environment and returns output for Evidence review. Command planning can account for operating from Kali or from a Windows host while preserving target-local and platform-neutral implementations.

The normal loop is:

`Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`

Command recognition is not success. Durable facts come only from explicit supported Evidence. Manual outcome advancement is workflow state, not report-ready proof, unless Evidence is supplied.

## Future-agent quickstart

Before building:

1. Read this README.
2. Read [`BUILDING.md`](BUILDING.md) for release workflow, exact-head validation, and merge-readiness rules.
3. Read [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the v9 product vision, queue rules, coherent work-package model, and Definition of Done.
4. If the work touches private-source notes, read [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) before reviewing a packet. Reviewed-note counts are not enough: modeled notes must declare the product output they created or why contextual guidance is sufficient after full-spectrum extraction was considered.
5. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/note-progress-current.js`, and `data/product-hardening/work-packages.js` for Product Build Next.
6. Confirm there is no open release/product-hardening PR. If one exists, continue it instead of opening another.
7. If no release PR exists, create the release branch and open one normal, **non-draft** release PR as early as GitHub permits. Keep that same PR for the entire build. Required checks, not Draft status, prevent premature merge.
8. Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, not as a one-item limit.
9. Inspect related, adjacent, and dependency-linked items in the same ownership area. Complete as many as safely fit the same architectural context and blast radius. Do not stop merely because the first item's acceptance criteria are satisfied if closely related work can be completed and fully tested in the same PR.
10. Keep queue-item accountability atomic. Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests.
11. Do not batch unrelated work. Stop expanding the package when the next item materially changes ownership area, architectural context, migration risk, or test strategy.
12. Use `node tools/scope-check.js` while developing the current work package. The complete historical chain remains a final/main preservation gate rather than a manual per-edit checklist.
13. Sync generated Product Build Next output, run the required validation, and keep the entire coherent work package in the one active release/product-hardening PR until the exact final head is green.

There must be only one open release/product-hardening PR at a time. If one exists, continue it or close it as superseded before opening another. CI enforces this with `tools/validate-open-pr-uniqueness.js`. Do not use a Draft -> Ready transition as part of the release process and do not replace a healthy PR merely to move between review states.

## Required context map

- [`BUILDING.md`](BUILDING.md) - exact release flow, validation tiers, one-open-PR rule, coherent work-package burn-down, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, work-package rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - runtime ownership, consolidated per-area owners, compaction strategy, and legacy-layer boundaries.
- [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md) - per-area retirement lifecycle, consolidated ownership state, and test-retirement rules.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/TOOL-BUILDER-COVERAGE.md`](docs/TOOL-BUILDER-COVERAGE.md) - stable Tool Builder Platform, runnable-tool inventory, and representative-builder migration contract.
- [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md) - mandatory full-spectrum source re-mining checklist, tool-card/script/analyzer extraction rules, and additive Orange path rule.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private source repo `platocres/obol-source-notes` and normalized public-output workflow.
- [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) - required notes-to-product output decision, packet review model, dashboard interpretation, and runtime-compaction relationship.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded product defects.
- [`docs/CORRECTIVE-PLAN.md`](docs/CORRECTIVE-PLAN.md) - durable corrective roadmap: notes conversion-engine fix, workstream ordering, and the aims-achieved definition.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and historical regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

Pinned Orange Cyber Defense mind map provenance remains `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg` from `https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main`; detailed source accounting lives in `docs/NORTH-STAR.md`.

## Active product queue

Product Build Next is the only active development queue. Its atomic item source of truth is `data/product-hardening/product-hardening-queue.js`; current notes packet/re-mining projections live in `data/product-hardening/note-progress-current.js`; coherent multi-item package metadata lives in `data/product-hardening/work-packages.js`. The README and Product Hardening Dashboard consume these sources so the highest-priority item remains the entry point while agents are encouraged to burn down a meaningful same-ownership work package rather than nibbling one checkbox at a time.

Queue tracks, work-package rules, notes-integration policy, and runtime-compaction status live in [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md); the completed Orange methodology/source accounting is regression-protected baseline in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md).

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.
Runtime consolidation figures come from `data/runtime-consolidation-current.js`, the same projection the Product Hardening Dashboard renders.

**Current product-hardening queue:** 219/653 complete (34%), 16 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.
**Notes Integration:** 135/556 reviewed — 102 modeled, 28 private-only, 421 pending.
**Derived note guidance:** 55 Field Notes · 50 tool-bound · 52 Path-bound · 17 Evidence · 5 Report.
**Declared note-driven product mechanics:** 2 total · 2 builder · 0 Path logic · 0 Evidence parser · 0 report generator · 0 workflow.
**Latest mined themes:** Linux local privilege escalation, Credentials / auth material, Object authorization / IDOR, Windows local privilege escalation.
**Notes impact contract:** `docs/NOTES-IMPACT.md`.
**Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer).
**Current runtime ownership areas:** 7 owners account for 272 historical fragments — 215 semantically flattened, 57 still exact-owned; 55 fragments stay retired in the frozen ledger.
**Runtime area owners:** Domain data (103, semantic-snapshot) · Core state and derivation (69, semantic-delta-replay) · Report base and application UI (43, semantic-delta-replay) · Evidence parsing (37, ordered-fragment-concatenation) · Nmap builders (3, ordered-fragment-concatenation) · Report overlays (14, ordered-fragment-concatenation) · Tool reference data (3, ordered-fragment-concatenation).
**Measured in Chromium (v9.40):** Home 321→19 · Next Steps 329→27 · Evidence 365→21 · Report 335→20 JavaScript/CSS requests.
**Runtime compaction contract:** `docs/RUNTIME-COMPACTION.md`.

**Recommended work package:** **Notes Impact and Source Re-mining** — 10 live items / 18 tracked.
**Work-package entry:** **Re-mine all already-reviewed notes from original sources**
**Ownership area:** `notes/impact-packets`
**Package guidance:** Treat the 556-note disposition item as the umbrella, but do not let the umbrella hide the immediate work: re-mine already-reviewed notes from their original private sources before fresh pending-note packets. Each re-mining item must check for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, code-level mechanics, and product gaps. Preserve the Orange-derived path as an additive baseline: attach to or extend existing points rather than deleting them.
**Package dependencies:** Notes Integration Foundation

**Live items in this package:**
- **Re-mine all already-reviewed notes from original sources** — Return to the original private source note for every already-reviewed modeled, guidance-only, reviewed-not-modeled, private-only, superseded, or rejected row. Do not merely inspect the existing public Field Note or prior rationale. Re-mine from scratch for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, and product gaps.
- **Add note re-mining dashboard and schema tracking** — Track re-mining separately from first-pass review. The dashboard and README should show old-rubric reviewed count, full-spectrum re-mined count, remaining old-rubric-only notes, and extraction dimensions for tools, GUI switches, scripts, one-liners, analyzers, Path bindings, lessons, troubleshooting, cleanup, reports, and product gaps.
- **Re-mine reviewed web upload and inclusion notes** — Return to the original private upload, traversal, LFI/RFI, wrapper, hosting, and inclusion-chain notes already reviewed. Add to existing public outputs with missed tool cards, GUI controls, command templates, analyzer expectations, Path logic, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps. Preserve Orange path nodes and add to them rather than deleting or replacing them.
- **Re-mine reviewed XSS and session notes** — Return to the original private XSS, browser impact, cookie, CSP, request-context, and session notes already reviewed. Mine again for useful tool cards, switches, scripts, one-liners, analyzers, Path attachments, lessons, examples, troubleshooting, cleanup, report guidance, and product gaps.
- **Re-mine reviewed credentials and auth notes** — Return to the original private credential, hash, ticket, certificate, key, cookie, token, validation-boundary, and auth-failure notes already reviewed. Add missed builder modes, GUI switches, command templates, analyzers, credential routing, Path handoffs, lessons, troubleshooting, cleanup, report guidance, and product gaps.
- **Re-mine reviewed Windows privesc notes** — Return to the original private Windows privilege-escalation notes already reviewed. Mine again for missed tool cards, PowerShell or command templates, GUI controls, parser/analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
- **Re-mine reviewed Linux privesc notes** — Return to the original private Linux privilege-escalation notes already reviewed. Mine again for missed tool cards, shell one-liners, scripts, GUI controls, analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
- **Re-mine private-only and superseded notes** — Return to original private notes previously marked private-reference-only, superseded, rejected, or reviewed-not-modeled. Keep raw recipes and private material private, but re-check whether public-safe tool ideas, command templates, analyzer rules, lesson boxes, troubleshooting, cleanup, report guidance, or additive Path improvements were missed.
- **Burn down all 556 note dispositions** — Umbrella disposition goal for all 556 notes. Fresh pending-note packets remain queued beneath the full-spectrum re-mining gate: agents must first re-mine already-reviewed notes from the original private sources, add missed product outputs, and preserve the Orange-derived path additively.
- **Notes packet: AD and pivoting** — Mine Active Directory, lateral movement, tunneling, pivoting, routing, credential use, evidence boundaries, and missing workflow/tool options.

**Related items to consider, not automatically in scope:** Design contextual field-notes disclosure.

**Highest-priority live items:**
1. **Re-mine all already-reviewed notes from original sources** — Return to the original private source note for every already-reviewed modeled, guidance-only, reviewed-not-modeled, private-only, superseded, or rejected row. Do not merely inspect the existing public Field Note or prior rationale. Re-mine from scratch for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, and product gaps.
2. **Add note re-mining dashboard and schema tracking** — Track re-mining separately from first-pass review. The dashboard and README should show old-rubric reviewed count, full-spectrum re-mined count, remaining old-rubric-only notes, and extraction dimensions for tools, GUI switches, scripts, one-liners, analyzers, Path bindings, lessons, troubleshooting, cleanup, reports, and product gaps.
3. **Re-mine reviewed web upload and inclusion notes** — Return to the original private upload, traversal, LFI/RFI, wrapper, hosting, and inclusion-chain notes already reviewed. Add to existing public outputs with missed tool cards, GUI controls, command templates, analyzer expectations, Path logic, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps. Preserve Orange path nodes and add to them rather than deleting or replacing them.
4. **Re-mine reviewed XSS and session notes** — Return to the original private XSS, browser impact, cookie, CSP, request-context, and session notes already reviewed. Mine again for useful tool cards, switches, scripts, one-liners, analyzers, Path attachments, lessons, examples, troubleshooting, cleanup, report guidance, and product gaps.
5. **Re-mine reviewed credentials and auth notes** — Return to the original private credential, hash, ticket, certificate, key, cookie, token, validation-boundary, and auth-failure notes already reviewed. Add missed builder modes, GUI switches, command templates, analyzers, credential routing, Path handoffs, lessons, troubleshooting, cleanup, report guidance, and product gaps.
6. **Re-mine reviewed Windows privesc notes** — Return to the original private Windows privilege-escalation notes already reviewed. Mine again for missed tool cards, PowerShell or command templates, GUI controls, parser/analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
7. **Re-mine reviewed Linux privesc notes** — Return to the original private Linux privilege-escalation notes already reviewed. Mine again for missed tool cards, shell one-liners, scripts, GUI controls, analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
8. **Re-mine private-only and superseded notes** — Return to original private notes previously marked private-reference-only, superseded, rejected, or reviewed-not-modeled. Keep raw recipes and private material private, but re-check whether public-safe tool ideas, command templates, analyzer rules, lesson boxes, troubleshooting, cleanup, report guidance, or additive Path improvements were missed.

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

Open `index.html` in a browser. No server or package install is required.

Use `#/dashboard` for the active Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use the focused current-work-package check during development:

```bash
node tools/scope-check.js
```

Use [`BUILDING.md`](BUILDING.md) for preflight and release-final requirements. CI owns the complete historical regression chain on final release heads and `main`; agents should not manually copy and run every `run-vX.Y-tests.js` file for each small edit.

The permanent notes-impact checks are:

```bash
node tools/validate-notes-impact.js
node tools/validate-note-integration.js
node tools/sync-product-build-next.js --check
node tests/run-v9.35-tests.js
```

The permanent runtime-consolidation checks are:

```bash
node tools/sync-domain-current.js --check
node tools/validate-domain-current-equivalence.js
node tools/sync-core-current.js --check
node tools/validate-core-current-equivalence.js
node tools/sync-runtime-bundles.js --check
node tools/validate-runtime-bundles.js
node tools/sync-current-styles.js --check
node tools/validate-runtime-consolidation-sync.js
```

Regenerate the semantic domain owner with `node tools/sync-domain-current.js --write`, the semantic core owner with `node tools/sync-core-current.js --write`, the exact-concatenation runtime owners with `node tools/sync-runtime-bundles.js --write`, and the stylesheet owner with `node tools/sync-current-styles.js --write` after any change to the runtime manifest or a historical fragment. Never hand-edit a generated owner: `data/runtime-manifest.js` declares each area’s current-owner strategy, and the validators prove the semantic/exact boundaries.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.