# Obol Build and Release Workflow

This file is a mandatory companion to `README.md` for future Obol build work. Read `docs/PRODUCT-HARDENING.md` for the active v9 engineering contract, then consult the owner docs relevant to the change: `docs/ARCHITECTURE.md`, `docs/NORTH-STAR.md`, `docs/PROOF-CONTRACT.md`, `docs/NOTES-INTEGRATION.md`, `docs/UX-QUALITY.md`, and `docs/ORANGE-SOURCE-DEPTH.md`.

## Incremental release policy

**Use one draft release PR. Ordinary release-branch commits run lightweight smoke validation. `[preflight]` runs the current-release gate. `[release-final]` runs smoke, preflight, and the complete historical chain. A release may not leave Draft or be merged until the exact final head is green.**

The intended release flow is:

- create exactly one `release/obol-vX.Y` or `release/obol-vX.Y.Z` branch from current `main`;
- open exactly one draft PR for that release immediately;
- before opening any release, product-hardening, dashboard, queue, Definition of Done, or burn-down PR, search open PRs and continue the active one if it exists;
- keep exactly one open release/product-hardening PR at a time;
- push incremental, coherent commits to that same PR;
- ordinary release commits run `node tools/release-smoke.js`;
- use `[preflight]` when a coherent current-release snapshot is ready;
- do not create a second build/release/product-hardening PR to work around a failed check;
- regenerate the active Product Build Next block with `node tools/sync-product-build-next.js --write` whenever queue state changes;
- validate the retired Orange methodology/source projection with `node tools/sync-readme-build-next.js --check`; while that queue remains complete, the historical block is intentionally absent from README;
- require `implemented-quality = 0` and `mapped-delivery = 0` before methodology expansion is merge-ready;
- preserve canonical, frozen-baseline, file-level, and atomic denominators as historical milestones without forcing their detailed accounting into the current README;
- audited source units must end as explicitly `modeled`, `superseded`, or `rejected` with rationale and required review dimensions accounted for;
- product-hardening queue items may not move to `modeled`, `complete`, `superseded`, or `rejected` unless `data/product-hardening/item-test-contracts.js` names acceptance criteria, validation commands, and proof files for that item;
- make the exact final release commit with `[release-final]` only after code, tests, docs, README, changelog or dedicated release documentation, and PR description form one coherent snapshot;
- require smoke, preflight, historical-test future safety, the complete historical regression chain, release-quality gate, release-contract validation, open-PR uniqueness validation, and generated Product Build Next synchronization on that exact head;
- mark the PR Ready for review only after that exact final head is green;
- treat any later commit as a new head that must be validated again.

`tools/validate-open-pr-uniqueness.js` enforces the one-open-release/product-hardening-PR rule. It is invoked by `tools/validate-release-pr.js` for release-intent pull requests and rejects duplicate open release/product-hardening PRs.

The three validation tiers are:

1. **Smoke** - every release-branch push; JavaScript syntax plus local index asset-reference sanity.
2. **Preflight** - `[preflight]` and `[release-final]`; current-release wiring, historical-test future safety, release contract, quality debt, current release regressions, and generated queue synchronization.
3. **Final historical validation** - `[release-final]`, ready-for-review pull requests, and `main`; complete historical regressions plus the permanent quality and synchronization gates.

`tools/validate-historical-tests.js` prevents historical suites from hard-coding mutable current-release values or stale README contracts. Historical suites should test the historical model/behavior they own and stable structural contracts, not force old Orange-era README sections back into the active handoff.

Release-PR metadata enforcement applies only to release-intent pull requests. Normal documentation, maintenance, and CI-fix PRs are not required to impersonate a release.

## Product-hardening item Definition of Done

Every Product Build Next item must carry its own proof once it leaves `queued` status. The proof lives in `data/product-hardening/item-test-contracts.js`, and `tools/validate-product-hardening-queue.js` fails if a status-bearing item lacks all three of these:

- acceptance criteria describing the behavior or governance guarantee;
- validation commands proving the item-specific work;
- proof files where the implementation, docs, or tests live.

A product-hardening PR that burns down a queue item must therefore include the implementation, the queue/status update when applicable, the item-test contract, item-specific tests or validators, README/dashboard sync when totals or generated blocks change, and a green exact-head Actions run.

No queue item may be marked complete merely because a broad historical test suite still passes. The item-specific contract must prove the behavior added or changed by that queue item.

## Delta-based release surfaces

Beginning with v6.6, release scaffolding is **delta-based**. A new version number is not a reason to create empty compatibility files.

Every release must provide the current release/project metadata, current regression suite, release documentation, README update, and whatever UI/runtime wiring the release actually changes. Type-specific overlays such as methodology, Dashboard metadata, Intake/Evidence, reporting, or tool data are added only when that release genuinely changes that ownership area.

Do not create no-op `methodology-vX.Y.js`, `dashboard-vX.Y.js`, `intake-vX.Y.js`, `app-vX.Y.js`, `core-vX.Y.js`, or similar shims solely for naming symmetry. `tools/validate-release-pr.js` is phase-aware and should validate the release shape that actually belongs to the work.

For v9 product hardening, prefer stable non-versioned owners for queue data, builder schemas, storage, workers, dashboard data, and validation. Versioned release docs/tests are fine; versioned runtime sediment is not the default implementation pattern.

## Consolidated current-state rule

v6.6 established the boundary between domain models and current project-status presentation. v6.8 added a stable non-versioned pointer, and v8.8 closed the Orange source-fidelity phase through that boundary. v9 product-hardening work adds a separate queue/dashboard source of truth without reopening the completed Orange methodology/source queue.

- `C.currentProjectModel(...)` is the preferred current projection boundary for historical canonical progress, source-fidelity progress, quality debt, and Orange accounting.
- Versioned project adapters remain available as historical regression boundaries. Current tooling and documentation should not require edits merely to discover the newest historical adapter name when a stable pointer is available.
- Product-hardening status comes from `data/product-hardening/product-hardening-queue.js`; README Product Build Next and the Product Hardening Dashboard consume that same source.
- Current release/version identity should have one owner. The `cc-version-authority` queue item exists to finish that consolidation across UI, reports, exports, README, and dashboard.
- New UI overlays should express genuine behavior changes. Do not append another project-health panel merely because the version changed.
- The default product dashboard should show Product Build Next first. The completed Orange dashboard is historical baseline context, not the active product queue.
- The README is an entry point and future-agent handoff. Durable architecture, proof, source accounting, product vision, and history belong in their owned documents.

`tools/current-runtime.js` owns the Node-side current data/core load order until runtime-consolidation queue work replaces that boundary with a smaller current owner. Do not copy long load arrays into every tool or test.

## Historical runtime compaction

The historical browser load chain is acknowledged technical debt. With the pinned Orange 2025.03 methodology/source queue complete in v8.8, regression-equivalent compaction is now a primary engineering direction rather than secondary cleanup.

For each ownership area selected for compaction:

1. identify the historical layers that jointly own the behavior;
2. implement a consolidated replacement with the same observable contracts;
3. prove current behavior and required historical invariants through regression-equivalent tests;
4. preserve state migration for existing browser-local workspaces;
5. remove only the layers genuinely superseded by the consolidated owner.

A smaller file count is not a win if it changes Evidence semantics, command behavior, recommendation logic, report lineage, or workspace compatibility.

Historical tests are allowed to evolve when their old assertion was about obsolete delivery shape rather than historical behavior. For example, an Orange-era test should preserve its v8.8 source-fidelity facts and v8.8 runtime artifacts, but it should not require the current README to display an old Orange status sentence forever.

## Quality-debt and methodology ordering

The methodology/source Build Next model preserves this priority order whenever work exists:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already inventoried units;
5. source-depth inventory/decomposition for any remaining frozen v6.2 baseline rows;
6. whole-file source inventory for methodology-bearing Orange files that are not yet fully atomized.

v8.8 completed the pinned Orange 2025.03 methodology/source accounting at 127/127 canonical sections, 34/34 frozen baselines, 17/17 methodology-bearing files, and 334/334 inventoried atomic units fidelity-complete. The live methodology/source queue is therefore correctly empty.

Do not invent source debt merely to keep Build Next populated. A new methodology/source queue should appear only when a real quality defect is found or the pinned upstream snapshot is deliberately changed.

Never equate one denominator by itself with source exhaustion. The completion claim depends on all required denominators, terminal dispositions, and audit dimensions remaining intact. See `docs/ORANGE-SOURCE-DEPTH.md` and `docs/NORTH-STAR.md`.

## Merge-readiness rule

A release is merge-ready only when the exact final head is green. Earlier failed or cancelled runs are development history and do not block a later green head, but earlier green runs do not authorize a newer untested head.
