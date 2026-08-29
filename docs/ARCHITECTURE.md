# Obol Architecture

Obol is a browser-local, static HTML/CSS/JavaScript application. It has no backend, no build step, no telemetry, and no command execution. The operator remains responsible for running commands externally and returning reviewed output to Obol.

## Product loop

`Targets → Evidence → Next Steps → operator runs command externally → Evidence review → Next Steps recalculation → Report`

The application is organized around four durable concerns:

- **Domain data** — methodology, cards, tools, evidence contracts, reporting metadata, and source provenance.
- **Core state and derivation** — browser-local engagement state, migrations, proof boundaries, applicability, recommendation ranking, progress accounting, and report readiness.
- **UI** — workflow views and command-building interactions. UI components consume derived state; they do not own project truth.
- **Validation** — current-release and historical regression suites, release quality, repository wiring, README synchronization, and exact-head CI.

## Consolidation boundary

Obol grew through additive release overlays. That was useful while the product model was changing quickly, but it also left historical presentation and accounting layers in the runtime. v6.6 established a consolidation boundary instead of attempting a high-risk rewrite, and v6.8 tightens that boundary with a stable current-model pointer.

From v6.6 forward:

1. **Current project progress has one authoritative adapter.** The versioned project model derives the current release, canonical breadth, source-depth/source-fidelity state, quality debt, Build Next queue, recent progress, and next priority from the existing domain models.
2. **Current consumers use a stable pointer.** Beginning with v6.8, `C.currentProjectModel(...)` points to the current versioned adapter (`C.projectModel68(...)` in v6.8). Tooling and documentation should prefer the stable pointer instead of hard-coding a release-specific function name.
3. **Dashboard and README are projections of that adapter.** They must not maintain independent copies of current progress counts or a competing work queue.
4. **The default Dashboard is an overview, not an engineering console.** Detailed matrices, ledgers, and delivery diagnostics belong behind explicit drill-downs.
5. **Version-specific UI layers should represent behavior deltas, not become new owners of project-wide truth.** A future release should extend the consolidated model or replace an owner deliberately rather than append another parallel status panel.
6. **Historical runtime layers remain until they can be flattened safely.** Their presence is technical debt, not an invitation to delete them without regression-equivalent replacement.

## Ownership rules

### Project status

`C.currentProjectModel(...)` is the current status boundary. It derives rather than duplicates:

- canonical breadth from the canonical methodology model;
- delivery and quality debt from Build Next/readiness models;
- source inventory and atomic fidelity from the source-fidelity model;
- release trend from the Dashboard milestone history.

The current versioned adapter remains available for regression history. Consumers may format current-model values, but should not recalculate them with independent hard-coded denominators.

### Engagement state

The browser-local state model remains authoritative for target context, facts, evidence, activities, artifacts, credentials, reachability, decisions, and report proof. Project-status refactoring must not change proof semantics.

### Dashboard

The North Star Dashboard owns project-wide hard numbers. Its default view should answer, at a glance:

- Where are we?
- What remains?
- Is there quality debt?
- What changed recently?
- What should be built next?

Engineering detail remains available through drill-downs rather than being placed in the primary scan path.

### Documentation

- `README.md` is the project entry point and current snapshot.
- `BUILDING.md` owns release workflow and merge-readiness rules.
- `docs/NORTH-STAR.md` owns detailed methodology/source accounting semantics.
- `docs/PROOF-CONTRACT.md` owns durable Evidence/proof boundaries.
- `docs/ORANGE-SOURCE-DEPTH.md` owns the source-depth audit plan.
- `CHANGELOG.md` owns release history.

## Legacy-layer strategy

The current runtime still loads historical version overlays because those files encode behavior accumulated over many releases. The consolidation boundary does not pretend that this is ideal, and it does not remove them merely to make the file tree look cleaner.

Future compaction should be incremental:

1. identify one stable ownership area;
2. create a consolidated replacement with identical observable contracts;
3. run current and historical regression coverage against the replacement;
4. remove only the superseded runtime layers for that ownership area;
5. keep migration compatibility for existing browser-local workspaces.

The target is a smaller set of boring, explicit owners, not a rewrite that trades visible technical debt for hidden regressions.

## Non-negotiable compatibility

Architectural consolidation must preserve:

- existing browser-local workspace migration and sanitized export;
- human-run command behavior;
- conservative Evidence interpretation and proof boundaries;
- Next Steps applicability and prioritization semantics;
- report lineage and proof readiness;
- the pinned canonical/source accounting denominators;
- the release-quality and exact-final-head CI contracts.
