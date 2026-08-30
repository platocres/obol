# Obol Build and Release Workflow

This file is a mandatory companion to `README.md`, `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/NORTH-STAR.md`, `docs/PROOF-CONTRACT.md`, and `docs/ORANGE-SOURCE-DEPTH.md` for future Obol build work. Read the relevant owner before changing release architecture, methodology, Evidence behavior, reporting, CI, project metrics, or source-depth/source-fidelity accounting.

## Incremental release policy

**Use one draft release PR. Ordinary release-branch commits run lightweight smoke validation. `[preflight]` runs the current-release gate. `[release-final]` runs smoke, preflight, and the complete historical chain. A release may not leave Draft or be merged until the exact final head is green.**

The intended release flow is:

- create exactly one `release/obol-vX.Y` branch from current `main`;
- open exactly one draft PR for that release immediately;
- push incremental, coherent commits to that same PR;
- ordinary release commits run `node tools/release-smoke.js`;
- use `[preflight]` when a coherent current-release snapshot is ready;
- do not create a second build/release PR to work around a failed check;
- regenerate the README Build Next block and validate repository wiring before finalization;
- require `implemented-quality = 0` and `mapped-delivery = 0` before methodology expansion is merge-ready;
- when canonical gaps are zero, continue through source-fidelity accounting rather than declaring the source complete;
- preserve the frozen v6.2 partial baseline and existing atomic units;
- audited source units must end as explicitly `modeled`, `superseded`, or `rejected` with rationale and required review dimensions accounted for;
- make the exact final release commit with `[release-final]` only after code, tests, docs, README, changelog, and PR description form one coherent snapshot;
- require smoke, preflight, historical-test future safety, the complete historical regression chain, release-quality gate, release-contract validation, and README synchronization on that exact head;
- mark the PR Ready for review only after that exact final head is green;
- treat any later commit as a new head that must be validated again.

The three validation tiers are:

1. **Smoke** - every release-branch push; JavaScript syntax plus local index asset-reference sanity.
2. **Preflight** - `[preflight]` and `[release-final]`; current-release wiring, historical-test future safety, release contract, quality debt, current release regressions, and README synchronization.
3. **Final historical validation** - `[release-final]`, ready-for-review pull requests, and `main`; complete historical regressions plus the permanent quality and synchronization gates.

`tools/validate-historical-tests.js` prevents historical suites from hard-coding mutable current-release README or queue values. Historical suites should test historical model invariants and structural live-output contracts.

Release-PR metadata enforcement applies only to release-intent pull requests. Normal documentation, maintenance, and CI-fix PRs are not required to impersonate a release.

## Delta-based release surfaces

Beginning with v6.6, release scaffolding is **delta-based**. A new version number is not a reason to create empty compatibility files.

Every release must provide the current release/project metadata, current state/version adapter, current regression suite, release documentation, changelog entry, README update, and whatever UI/runtime wiring the release actually changes. Type-specific overlays such as methodology, Dashboard metadata, Intake/Evidence, reporting, or tool data are added only when that release genuinely changes that ownership area.

Do not create no-op `methodology-vX.Y.js`, `dashboard-vX.Y.js`, `intake-vX.Y.js`, or similar shims solely for naming symmetry. `tools/validate-release-pr.js` enforces the minimal release contract; release-specific tests should explicitly verify any additional behavior-specific surfaces that the release requires.

This keeps future releases from rebuilding the same scaffolding around unchanged behavior.

## Consolidated current-state rule

v6.6 established the boundary between domain models and current project-status presentation. v6.8 added a stable non-versioned pointer for current consumers, and v7.6 continues through that boundary.

- `C.currentProjectModel(...)` is the preferred current projection boundary for canonical progress, source-fidelity progress, quality debt, Build Next, recent progress, and the next priority. In v7.6 it points to `C.projectModel76(...)`.
- Versioned project adapters remain available as historical regression boundaries. Current tooling and documentation should not require edits merely to discover the newest adapter name when the stable pointer is available.
- Dashboard, README synchronization, release-quality checks, and other current-status consumers use the consolidated current model instead of parsing README text or independently recalculating current counts.
- Current release/project metadata has one owner. Do not create competing project-wide count tables in UI or release-specific metadata.
- New UI overlays should express genuine behavior changes. Do not append another project-health panel merely because the version changed.
- The default North Star Dashboard is an overview. Matrices, ledgers, complete queues, and diagnostics belong behind deliberate drill-downs.
- The README is an entry point and current snapshot. Durable architecture, proof, source-accounting, and history belong in their dedicated documents.

`tools/current-runtime.js` owns the Node-side current data/core load order. Extend that loader when the current runtime changes instead of copying long load arrays into every tool or test.

## Historical runtime compaction

The historical browser load chain is acknowledged technical debt. Reduce it incrementally, not by deleting old version files for aesthetic reasons.

For each ownership area selected for compaction:

1. identify the historical layers that jointly own the behavior;
2. implement a consolidated replacement with the same observable contracts;
3. prove current and historical regression equivalence;
4. preserve state migration for existing browser-local workspaces;
5. remove only the layers genuinely superseded by the consolidated owner.

A smaller file count is not a win if it changes Evidence semantics, command behavior, recommendation logic, report lineage, or workspace compatibility.

## Quality-debt and methodology ordering

The current Build Next model preserves this priority order:

1. implemented-quality repairs;
2. mapped-delivery repairs;
3. canonical gaps;
4. atomic source-fidelity audits for already inventoried units;
5. source-depth inventory/decomposition for remaining broad partial baselines.

A methodology-expansion release must not skip priority 1 or 2 debt. Canonical gaps outrank source-fidelity work while gaps remain. Once gaps are zero, already-inventoried atomic units outrank still-unatomized broad sections because their missing requirements are known precisely. In v7.6, all 118 currently inventoried AD CS, Kerberos delegation, ACL / ACE, MITM / relay, authenticated, SCCM, and admin atomic units are complete, so the live queue remains in source-depth inventory/decomposition and proceeds into `no_creds.md` source paths. New source families must be atomized explicitly rather than silently extending an earlier completed denominator.

The 127-section canonical denominator measures structural representation. The frozen v6.2 source-depth baseline protects unresolved broad partial work from disappearing. The atomic source-fidelity ledger measures meaningful subordinate branches and the requirements needed to translate them into Obol's Run -> Evidence -> Next Steps -> Report loop.

Never equate 100% represented, a broad card mapping, or a terminal audit label by itself with source exhaustion. See `docs/ORANGE-SOURCE-DEPTH.md` and `docs/NORTH-STAR.md`.

## Merge-readiness rule

A release is merge-ready only when the exact final head is green. Earlier failed or cancelled runs are development history and do not block a later green head, but earlier green runs do not authorize a newer untested head.
