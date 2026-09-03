# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.42**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Detailed build workflow lives in [`BUILDING.md`](BUILDING.md).

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
4. If the work touches private-source notes, read [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) before reviewing a packet. Reviewed-note counts are not enough: modeled notes must declare the product output they created or why contextual guidance is sufficient.
5. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js` plus `data/product-hardening/work-packages.js` for Product Build Next.
6. Confirm there is no open release/product-hardening PR. If one exists, continue it instead of opening another.
7. If no release PR exists, create the release branch and open one normal, **non-draft** release PR as early as GitHub permits. Keep that same PR for the entire build. Required checks, not Draft status, prevent premature merge.
8. Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, not as a one-item limit.
9. Inspect related, adjacent, and dependency-linked items in the same ownership area. Complete as many as safely fit the same architectural context and blast radius. Do not stop merely because the first item's acceptance criteria are satisfied if closely related work can be completed and fully tested in the same PR.
10. Keep queue-item accountability atomic. Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests.
11. Do not batch unrelated work. Stop expanding the package when the next item materially changes ownership area, architectural context, migration risk, or test strategy.
12. Use `node tools/scope-check.js` while developing the current work package. The complete historical chain remains a final/main preservation gate rather than a manual per-edit checklist.
13. Sync generated Product Build Next output, run the required validation, and keep the entire coherent work package in the one active release/product-hardening PR until the exact final head is green.

There must be only one open release/product-hardening PR at a time. If one exists, continue it or close it as superseded before opening another. CI enforces this with `tools/validate-open-pr-uniqueness.js`. Do not use a Draft -> Ready transition as part of the release process and do not replace a healthy PR merely to change review state.

## Required context map

- [`BUILDING.md`](BUILDING.md) - exact release flow, validation tiers, one-open-PR rule, coherent work-package burn-down, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, work-package rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - runtime ownership, consolidated per-area owners, compaction strategy, and legacy-layer boundaries.
- [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md) - per-area retirement lifecycle, consolidated ownership state, and test-retirement rules.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/TOOL-BUILDER-COVERAGE.md`](docs/TOOL-BUILDER-COVERAGE.md) - stable Tool Builder Platform, runnable-tool inventory, and representative-builder migration contract.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private source repo `platocres/obol-source-notes` and normalized public-output workflow.
- [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) - required notes-to-product output decision, packet review model, dashboard interpretation, and runtime-compaction relationship.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded product defects.
- [`docs/CORRECTIVE-PLAN.md`](docs/CORRECTIVE-PLAN.md) - durable corrective roadmap: notes conversion-engine fix, workstream ordering, and the aims-achieved definition.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and historical regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

Pinned Orange Cyber Defense mind map provenance remains `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg` from `https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main`; detailed source accounting lives in `docs/NORTH-STAR.md`.

## Active product queue

Product Build Next is the only active development queue. Its atomic item source of truth is `data/product-hardening/product-hardening-queue.js`; coherent multi-item package metadata lives in `data/product-hardening/work-packages.js`. The README and Product Hardening Dashboard consume both so the highest-priority item remains the entry point while agents are encouraged to burn down a meaningful same-ownership work package rather than nibbling one checkbox at a time.

Queue tracks, work-package rules, notes-integration policy, and runtime-compaction status live in [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md); the completed Orange methodology/source accounting is regression-protected baseline in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md).

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.
Runtime consolidation figures come from `data/runtime-consolidation-current.js`, the same projection the Product Hardening Dashboard renders.

**Current product-hardening queue:** 202/648 complete (31%), 14 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.
**Notes Integration:** 127/556 reviewed — 95 modeled, 27 private-only, 429 pending.
**Derived note guidance:** 48 Field Notes · 43 tool-bound · 45 Path-bound · 14 Evidence · 5 Report.
**Declared note-driven product mechanics:** 2 total · 2 builder · 0 Path logic · 0 Evidence parser · 0 report generator · 0 workflow.
**Latest mined themes:** Windows local privilege escalation.
**Notes impact contract:** `docs/NOTES-IMPACT.md`.
**Runtime consolidation:** 5 operator startup requests, down from 307 (98% fewer).
**Current runtime ownership areas:** 7 owners account for 297 historical fragments — 103 semantically flattened, 194 still exact-owned; 30 fragments stay retired in the frozen ledger.
**Runtime area owners:** Domain data (103, semantic-snapshot) · Core state and derivation (69, ordered-fragment-concatenation) · Report base and application UI (64, ordered-fragment-concatenation) · Evidence parsing (41, ordered-fragment-concatenation) · Nmap builders (3, ordered-fragment-concatenation) · Report overlays (14, ordered-fragment-concatenation) · Tool reference data (3, ordered-fragment-concatenation).
**Measured in Chromium (v9.40):** Home 321→19 · Next Steps 329→27 · Evidence 365→21 · Report 335→20 JavaScript/CSS requests.
**Runtime compaction contract:** `docs/RUNTIME-COMPACTION.md`.

**Recommended work package:** **Runtime Layer Consolidation** — 4 live items / 8 tracked.
**Work-package entry:** **Flatten the core ownership area**
**Ownership area:** `runtime/ownership-areas`
**Package guidance:** Request consolidation is done: every ownership area now loads one generated owner instead of one request per historical fragment, proven equivalent and enforced by a browser request budget. What remains is semantic flattening, one ownership area at a time. For each area, prove which fragments still encode unique behavior, move that behavior onto the current owner, retire the superseded fragments from the frozen ledger, and retire the assertions that only protected their delivery shape. Do not flatten two areas in one pass — each has its own equivalence and migration surface.
**Package dependencies:** Runtime Consolidation Foundation, Dashboard Runtime Compaction

**Live items in this package:**
- **Flatten the core ownership area** — The core owner still concatenates 69 versioned state and derivation overlays. Collapse overlapping migration, applicability, and ranking deltas into a current core owner once equivalence and browser-local workspace migration are proven per overlay.
- **Flatten the application ownership area** — The application owner still concatenates 64 report-base, prelude, and UI overlays. Move surviving behavior onto the current workflow and operator-route owners, then retire the superseded presentation fragments.
- **Flatten the Evidence parsing ownership area** — The route-lazy Evidence owner still concatenates 41 parser overlays. Consolidate the parser chain into a current Evidence owner without changing conservative interpretation or proof boundaries.
- **Flatten the stylesheet ownership area** — The single stylesheet owner is a flat concatenation of 69 fragments that still override each other. Collapse dead and superseded rules into an authored current stylesheet once visual regression proof exists.

**Related items to consider, not automatically in scope:** Runtime compaction and test-retirement policy; No new layered queue architecture; Bundle and request budget.

**Highest-priority live items:**
1. **Flatten the core ownership area** — The core owner still concatenates 69 versioned state and derivation overlays. Collapse overlapping migration, applicability, and ranking deltas into a current core owner once equivalence and browser-local workspace migration are proven per overlay.
2. **Flatten the application ownership area** — The application owner still concatenates 64 report-base, prelude, and UI overlays. Move surviving behavior onto the current workflow and operator-route owners, then retire the superseded presentation fragments.
3. **Flatten the Evidence parsing ownership area** — The route-lazy Evidence owner still concatenates 41 parser overlays. Consolidate the parser chain into a current Evidence owner without changing conservative interpretation or proof boundaries.
4. **Flatten the stylesheet ownership area** — The single stylesheet owner is a flat concatenation of 69 fragments that still override each other. Collapse dead and superseded rules into an authored current stylesheet once visual regression proof exists.
5. **Burn down all 556 note dispositions** — Umbrella disposition goal. Review work should be executed in themed packets and must record what each modeled note changed in Field Notes, tools, Path, Evidence, reports, troubleshooting, or product gaps.
6. **Re-audit all reviewed notes for missed mechanics** — Re-audit every note already processed under the old rubric — all 127 reviewed, not only the 95 modeled — because the defect was the review standard itself. Re-judge modeled, guidance-only, reviewed-not-modeled, and private-only dispositions against the new bar and convert to declared product changes (tool toggle, Path branch, evidence rule, report/workflow change) wherever one was missed. Cheaper than fresh review since rationales already exist; distinct from the first-pass review of the 429 pending notes.
7. **Notes packet: Linux privilege escalation** — Mine Linux privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
8. **Notes packet: AD and pivoting** — Mine Active Directory, lateral movement, tunneling, pivoting, routing, credential use, evidence boundaries, and missing workflow/tool options.

**Track status:**
- **Critical correctness:** 4/4 complete (100%), 0 modeled.
- **Architecture / runtime:** 13/20 complete (65%), 3 modeled.
- **UI / UX repair:** 9/10 complete (90%), 1 modeled.
- **Tool GUI builders:** 19/19 complete (100%), 0 modeled.
- **Credential modes:** 14/14 complete (100%), 0 modeled.
- **Manual outcomes:** 8/8 complete (100%), 0 modeled.
- **Notes integration:** 127/556 complete (23%), 2 modeled.
- **Offline / performance:** 1/6 complete (17%), 0 modeled.
- **Testing / visual QA:** 7/11 complete (64%), 3 modeled.

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
node tools/sync-runtime-bundles.js --check
node tools/validate-runtime-bundles.js
node tools/sync-current-styles.js --check
node tools/validate-runtime-consolidation-sync.js
```

Regenerate the semantic domain owner with `node tools/sync-domain-current.js --write`, the exact-concatenation runtime owners with `node tools/sync-runtime-bundles.js --write`, and the stylesheet owner with `node tools/sync-current-styles.js --write` after any change to the runtime manifest or a historical fragment. Never hand-edit a generated owner: `data/runtime-manifest.js` declares each area’s current-owner strategy, and the validators prove the semantic/exact boundaries.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
