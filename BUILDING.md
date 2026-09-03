# Obol Build and Release Workflow

This file is a mandatory companion to `README.md` for future Obol build work. Read `docs/PRODUCT-HARDENING.md` for the active v9 engineering contract, then consult the owner docs relevant to the change: `docs/ARCHITECTURE.md`, `docs/NORTH-STAR.md`, `docs/PROOF-CONTRACT.md`, `docs/NOTES-INTEGRATION.md`, `docs/NOTES-IMPACT.md`, `docs/RUNTIME-COMPACTION.md`, `docs/UX-QUALITY.md`, and `docs/ORANGE-SOURCE-DEPTH.md`.

## Incremental release policy

**Use one normal, non-draft release PR from the start. Ordinary release-branch commits run lightweight smoke validation. `[preflight]` runs the current-release gate. `[release-final]` runs smoke, preflight, and the complete historical chain. Required checks and exact-head validation prevent premature merge; Draft status is not part of the Obol release workflow.**

**Every build is a versioned release — bump the version across the board, every time, not only for large changes.** Each merged build must, in the same PR:

- bump `data/current-release.js` to the next `vX.Y` (patch `vX.Y.Z` only for a follow-up fix to an unreleased head);
- add a `docs/vX.Y.md` release doc whose first heading is `# Obol vX.Y`;
- add a `tests/run-vX.Y-tests.js` suite that invokes `tools/validate-release-pr.js` and asserts the current release version-agnostically (never hard-code the current `Current release: **vX.Y**` token — mirror the previous release's test, which was demoted to `rp[0]===9&&rp[1]>=N`);
- add a `## vX.Y — …` entry at the top of `CHANGELOG.md` (release narratives live here, never in README);
- run `node tools/sync-current-release.js --write` and `node tools/sync-product-build-next.js --write`, then validate with `node tools/validate-current-release.js` and `node tools/validate-release-pr.js`.

Product-hardening releases are delta-based: do **not** create `core-vX.Y.js`, `app-vX.Y.js`, `project-model-vX.Y.js`, or `obol-vX.Y.css` overlays. When bumping, demote the previous release's test off any live-current assertion (`release.version` equality and the exact README release token both become version-agnostic checks) so the historical suite keeps passing.

The intended release flow is:

- create exactly one `release/obol-vX.Y` or `release/obol-vX.Y.Z` branch from current `main`;
- if you are pinned to an agent working branch and cannot create a `release/*` branch, release from that branch instead. `tools/validate-release-pr.js` accepts `release/obol-vX.Y` **or** a documented agent working branch (`claude/…`, `codex/…`, `agent/…`, `hardening/…`) as a release head, and detects release intent from a `Obol vX.Y …` or `Release vX.Y: …` title. The full release-PR contract — title carries the version, description length, required product-hardening sections, and one-open-release-PR uniqueness — applies identically either way. Do not retitle a release to dodge that contract;
- open exactly one normal, non-draft PR for that release as early as GitHub permits; if GitHub requires a branch difference before PR creation, one minimal release-scaffold or governance commit is acceptable, then open the PR immediately;
- before opening any release, product-hardening, dashboard, queue, Definition of Done, or burn-down PR, search open PRs and continue the active one if it exists;
- keep exactly one open release/product-hardening PR at a time;
- never use Draft status as a release gate, and never close/recreate a healthy release PR merely to transition between Draft and Ready states;
- push incremental, coherent commits to that same PR;
- ordinary release commits run `node tools/release-smoke.js`;
- while developing a coherent package, use `node tools/scope-check.js` as the focused inner-loop gate instead of manually running every historical release suite;
- use `[preflight]` when a coherent current-release snapshot is ready;
- do not create a second build/release/product-hardening PR to work around a failed check;
- when the product release changes, update `data/current-release.js`, synchronize README with `node tools/sync-current-release.js --write`, and validate the authority with `node tools/validate-current-release.js`;
- regenerate the active Product Build Next block with `node tools/sync-product-build-next.js --write` whenever queue state changes or work-package metadata changes;
- validate the retired Orange methodology/source projection with `node tools/sync-readme-build-next.js --check`; while that queue remains complete, the historical block is intentionally absent from README;
- require `implemented-quality = 0` and `mapped-delivery = 0` before methodology expansion is merge-ready;
- preserve canonical, frozen-baseline, file-level, and atomic denominators as historical milestones without forcing their detailed accounting into the current README;
- audited source units must end as explicitly `modeled`, `superseded`, or `rejected` with rationale and required review dimensions accounted for;
- product-hardening queue items may not move to `modeled`, `complete`, `superseded`, or `rejected` unless the applicable item-test contract names acceptance criteria, validation commands, and proof files for that item;
- make the exact final release commit with `[release-final]` only after code, tests, docs, README, changelog or dedicated release documentation, and PR description form one coherent snapshot;
- require smoke, preflight, historical-test future safety, the complete historical regression chain, release-quality gate, release-contract validation, open-PR uniqueness validation, current-release synchronization, and generated Product Build Next synchronization on that exact head;
- require the non-draft PR's required checks to pass on that same exact final head before calling the release merge-ready;
- treat any later commit as a new head that must be validated again.

`tools/validate-open-pr-uniqueness.js` enforces the one-open-release/product-hardening-PR rule. It is invoked by `tools/validate-release-pr.js` for release-intent pull requests and rejects duplicate open release/product-hardening PRs.

The validation tiers are:

1. **Focused scope check** - `node tools/scope-check.js` during active package development; proves the current ownership area without forcing the whole historical archive through every small edit.
2. **Smoke** - every release-branch push; JavaScript syntax plus local index asset-reference sanity.
3. **Preflight** - `[preflight]` and `[release-final]`; current-release wiring, historical-test future safety, release contract, quality debt, current release regressions, and generated queue synchronization.
4. **Final historical validation** - `[release-final]`, non-draft release pull requests, and `main`; `node tools/run-historical-contracts.js` owns the complete historical regressions plus the permanent quality and synchronization gates.

Do not maintain or instruct agents to manually copy a giant list of `tests/run-vX.Y-tests.js` commands into their normal development loop. The named historical runner owns discovery and ordered execution of those preservation suites. Historical tests remain real gates; the change is that their orchestration has one owner instead of being duplicated across README, CI, and agent instructions.

The release PR remains open and non-draft throughout development. A red required check means "keep building on this PR," not "replace the PR." GitHub branch protection and required checks are the merge gate.

`tools/validate-historical-tests.js` prevents historical suites from hard-coding mutable current-release values or stale README contracts. Historical suites should test the historical model/behavior they own and stable structural contracts, not force old Orange-era README sections back into the active handoff.

Release-PR metadata enforcement applies only to release-intent pull requests. Normal documentation, maintenance, and CI-fix PRs are not required to impersonate a release.

## Product-hardening item Definition of Done

Every Product Build Next item must carry its own proof once it leaves `queued` status. The proof lives in `data/product-hardening/item-test-contracts.js` plus any current release extension loaded by the validator, and `tools/validate-product-hardening-queue.js` fails if a status-bearing item lacks all three of these:

- acceptance criteria describing the behavior or governance guarantee;
- validation commands proving the item-specific work;
- proof files where the implementation, docs, or tests live.

A product-hardening PR that burns down one or more queue items must therefore include the implementation, each applicable queue/status update, each item's test contract, item-specific tests or validators, README/dashboard sync when totals or generated blocks change, and a green exact-head Actions run.

No queue item may be marked complete merely because a broad historical test suite still passes. The item-specific contract must prove the behavior added or changed by that queue item.

## Coherent work-package burn-down

Product Build Next is atomic for accountability, but a release PR is **not** limited to one queue item. The highest-priority queued item is the entry point into the next engineering context, not an instruction to stop after one checkbox.

`data/product-hardening/work-packages.js` groups queue items that share an ownership area, architectural context, dependencies, and test surface. The README and Product Hardening Dashboard project its recommended package alongside the flat priority queue.

When burning down Product Build Next:

1. Start from the highest-priority unblocked queued item unless the user explicitly directs otherwise.
2. Inspect its recommended work package plus related and dependency-linked items.
3. Complete as many queued items as safely fit the same ownership area, architectural context, migration boundary, and test strategy while that context is already loaded.
4. Do not stop merely because the entry item's acceptance criteria have been satisfied if additional package items can be implemented and fully proven without materially increasing blast radius.
5. Keep every queue item atomic for status and proof. Each item advanced or closed still requires its own acceptance criteria, validation commands, proof files, and item-specific tests.
6. Do not batch unrelated work just to increase item count. Stop expanding the package when the next item changes ownership area, requires a different architectural context, introduces a distinct migration risk, or would make the PR harder to reason about and roll back.
7. Package dependencies guide sequencing; `relatedItems` are suggestions for consideration, not automatic scope. `parallelSafe` is descriptive metadata, not permission to violate the one-open-release-PR rule.
8. Keep the coherent package in the existing active release/product-hardening PR. Do not open one PR per item and do not split closely coupled package items across avoidable release layers.
9. Sync Product Build Next after queue or package metadata changes and require the exact final package head to pass all item-specific and repository-wide gates.

The desired release shape is therefore: **one PR -> one coherent engineering area -> potentially many queue items -> atomic proof for every item closed**.

## Delta-based release surfaces

Beginning with v6.6, release scaffolding is **delta-based**. A new version number is not a reason to create empty compatibility files.

Every release must provide the current release/project metadata, current regression suite, release documentation, README update, and whatever UI/runtime wiring the release actually changes. Type-specific overlays such as methodology, Dashboard metadata, Intake/Evidence, reporting, or tool data are added only when that release genuinely changes that ownership area.

Do not create no-op `methodology-vX.Y.js`, `dashboard-vX.Y.js`, `intake-vX.Y.js`, `app-vX.Y.js`, `core-vX.Y.js`, or similar shims solely for naming symmetry. `tools/validate-release-pr.js` is phase-aware and should validate the release shape that actually belongs to the work.

For v9 product hardening, prefer stable non-versioned owners for queue data, work-package metadata, builder schemas, storage, workers, dashboard data, release identity, and validation. Versioned release docs/tests are fine; versioned runtime sediment is not the default implementation pattern.

## Consolidated current-state rule

v6.6 established the boundary between domain models and current project-status presentation. v6.8 added a stable non-versioned pointer, and v8.8 closed the Orange source-fidelity phase through that boundary. v9 product-hardening work adds a separate queue/dashboard source of truth without reopening the completed Orange methodology/source queue.

- `C.currentProjectModel(...)` is the preferred current projection boundary for historical canonical progress, source-fidelity progress, quality debt, and Orange accounting.
- Versioned project adapters remain available as historical regression boundaries. Current tooling and documentation should not require edits merely to discover the newest historical adapter name when a stable pointer is available.
- Product-hardening status comes from `data/product-hardening/product-hardening-queue.js`; coherent package recommendations come from `data/product-hardening/work-packages.js`; README Product Build Next and the Product Hardening Dashboard consume both.
- Current product release identity comes from `data/current-release.js`. Header/title, settings, report release metadata/footer, export release metadata, README current release, and dashboard presentation consume that source. `C.VERSION` remains the workspace/runtime schema compatibility identity until an intentional runtime/storage migration changes it.
- New UI overlays should express genuine behavior changes. Do not append another project-health panel merely because the version changed.
- The default product dashboard should show the recommended Product Build Next work package and broader queue near the top. The completed Orange dashboard is historical baseline context, not the active product queue.
- The README is an entry point and future-agent handoff. Durable architecture, proof, source accounting, product vision, and history belong in their owned documents.

`data/runtime-manifest.js` is the stable current browser/Node load-order authority established in v9.6. `tools/current-runtime.js` consumes that authority for Node-side current loading. Do not recreate duplicate hand-maintained runtime arrays in tools, tests, or HTML.

## Historical runtime compaction

The historical browser load chain is acknowledged technical debt. With the pinned Orange 2025.03 methodology/source queue complete in v8.8, regression-equivalent compaction is now a primary engineering direction rather than secondary cleanup. `docs/RUNTIME-COMPACTION.md` owns the detailed retirement lifecycle.

For each ownership area selected for compaction:

1. identify the historical layers that jointly own the behavior;
2. implement a consolidated stable current owner with the same observable contracts;
3. prove current behavior and required historical invariants through regression-equivalent tests, adding browser-level proof when presentation/routing behavior is being removed;
4. preserve state migration for existing browser-local workspaces;
5. move still-useful historical expectations to fixture/current-owner tests;
6. remove only the live layers genuinely superseded by the consolidated owner;
7. retire assertions that protected only obsolete delivery shape.

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

A release is merge-ready only when the exact final head is green. Earlier failed or cancelled runs are development history and do not block a later green head, but earlier green runs do not authorize a newer untested head. The PR being non-draft does not imply merge readiness; required checks on the exact final head are authoritative.
