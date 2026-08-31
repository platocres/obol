# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.6**

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
4. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js` plus `data/product-hardening/work-packages.js` for Product Build Next.
5. Confirm there is no open release/product-hardening PR. If one exists, continue it instead of opening another.
6. If no release PR exists, create the release branch and open one normal, **non-draft** release PR as early as GitHub permits. Keep that same PR for the entire build. Required checks, not Draft status, prevent premature merge.
7. Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, not as a one-item limit.
8. Inspect related, adjacent, and dependency-linked items in the same ownership area. Complete as many as safely fit the same architectural context and blast radius. Do not stop merely because the first item's acceptance criteria are satisfied if closely related work can be completed and fully tested in the same PR.
9. Keep queue-item accountability atomic. Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests.
10. Do not batch unrelated work. Stop expanding the package when the next item materially changes ownership area, architectural context, migration risk, or test strategy.
11. Sync generated Product Build Next output, run the required validation, and keep the entire coherent work package in the one active release/product-hardening PR until the exact final head is green.

There must be only one open release/product-hardening PR at a time. If one exists, continue it or close it as superseded before opening another. CI enforces this with `tools/validate-open-pr-uniqueness.js`. Do not use a Draft -> Ready transition as part of the release process and do not replace a healthy PR merely to change review state.

## Required context map

- [`BUILDING.md`](BUILDING.md) - exact release flow, validation tiers, one-open-PR rule, coherent work-package burn-down, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, work-package rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - runtime ownership, compaction strategy, and legacy-layer boundaries.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private source repo `platocres/obol-source-notes` and normalized public-output workflow.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded product defects.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and historical regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

Pinned Orange Cyber Defense mind map provenance remains `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg` from `https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main`; detailed source accounting lives in `docs/NORTH-STAR.md`.

## Active product queue

Product Build Next is the only active development queue. Its atomic item source of truth is `data/product-hardening/product-hardening-queue.js`; coherent multi-item package metadata lives in `data/product-hardening/work-packages.js`. The README and Product Hardening Dashboard consume both so the highest-priority item remains the entry point while agents are encouraged to burn down a meaningful same-ownership work package rather than nibbling one checkbox at a time.

The completed Orange methodology/source queue is historical, regression-protected baseline material. Do not reopen it unless a real defect is found or the pinned upstream source is deliberately repinned. Detailed Orange accounting belongs in the North Star/source-depth docs above, not in this README.

### Product Build Next

**Next-build release-governance rider:** the next release must permanently carry forward the one-branch/one-PR workflow established after v9.6: open the release PR non-draft from the start, keep development and failed checks on that same PR, never require Draft -> Ready, and use exact-head required checks as the merge gate. This rider is release-process hardening layered on top of Product Build Next; it is not a substitute for completing and proving queue items.

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.

**Current product-hardening queue:** 10/632 complete (2%), 64 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.

**Recommended work package:** **Runtime Consolidation Foundation** — 3 live items / 6 tracked.
**Work-package entry:** **CSS ownership consolidation**
**Ownership area:** `runtime/build-loading`
**Package guidance:** Treat the current entrypoint, active CSS ownership, generated asset manifest, equivalence harness, lazy-load boundary, and request budget as one consolidation area when the same runtime context is already loaded.
**Package dependencies:** none.

**Live items in this package:**
- **CSS ownership consolidation** — Collapse active styling into a small current set while preserving regressions for historical behavior.
- **Lazy-load deep engineering views** — Move heavy dashboard, methodology, tool library, lineage, and historical surfaces behind deliberate loading boundaries.
- **Bundle and request budget** — Reduce request count and parse cost from the current historical-load chain.

**Related items to consider, not automatically in scope:** No new layered queue architecture.

**Highest-priority live items:**
1. **CSS ownership consolidation** — Collapse active styling into a small current set while preserving regressions for historical behavior.
2. **Dashboard ownership consolidation** — Keep one dashboard owner for project/product progress and avoid release-specific competing status panels.
3. **Lazy-load deep engineering views** — Move heavy dashboard, methodology, tool library, lineage, and historical surfaces behind deliberate loading boundaries.
4. **Make Home user-first** — Home should prioritize active target, known facts, queued intent, evidence needing review, best next move, and proof readiness.
5. **Move build metrics out of prime workflow** — Source accounting and product-hardening metrics belong in the dashboard/About surfaces, not the main box workflow.
6. **Expose dashboard clearly in navigation** — Make the master dashboard easy to find from normal site navigation without cluttering the primary operator loop.
7. **Improve Path clarity** — Path should make the best next move, unlocks, queued actions, and blockers obvious.
8. **Design contextual field-notes disclosure** — Notes should appear as expandable relevant context, not as a dumped notebook.

**Track status:**
- **Critical correctness:** 4/4 complete (100%), 0 modeled.
- **Architecture / runtime:** 3/10 complete (30%), 3 modeled.
- **UI / UX repair:** 1/8 complete (13%), 1 modeled.
- **Tool GUI builders:** 0/18 complete (0%), 0 modeled.
- **Credential modes:** 0/14 complete (0%), 0 modeled.
- **Manual outcomes:** 0/8 complete (0%), 0 modeled.
- **Notes integration:** 0/556 complete (0%), 2 modeled.
- **Offline / performance:** 0/6 complete (0%), 0 modeled.
- **Testing / visual QA:** 2/8 complete (25%), 3 modeled.

Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required.

Use `#/dashboard` for the active Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

The exact required release flow is owned by [`BUILDING.md`](BUILDING.md). The core repository checks are:

```bash
node tools/validate-historical-tests.js
node tools/validate-release-pr.js
node tools/validate-release-quality.js
node tools/validate-product-hardening-queue.js
node tools/validate-current-release.js
node tools/validate-version-identity.js
node tools/validate-accessibility-contract.js
node tools/validate-runtime-manifest.js
node tools/validate-asset-references.js
node tools/sync-current-release.js --check
node tools/sync-product-build-next.js --check
node tools/validate-open-pr-uniqueness.js
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
node tests/run-v9.1.1-tests.js
node tests/run-v9.2-tests.js
node tests/run-v9.3-tests.js
node tests/run-v9.4-tests.js
node tests/run-v9.5-tests.js
node tests/run-v9.6-tests.js
```

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
