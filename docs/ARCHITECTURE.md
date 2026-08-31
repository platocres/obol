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

Obol grew through additive release overlays. That was useful while the product model was changing quickly, but it also left historical presentation and accounting layers in the runtime. v6.6 established a consolidation boundary instead of attempting a high-risk rewrite, v6.8 added a stable current-model pointer, and v7.2 continues using that pointer while keeping versioned adapters as historical regression boundaries.

From v6.6 forward:

1. **Current project progress has one authoritative adapter.** The versioned project model derives the current release, canonical breadth, source-depth/source-fidelity state, quality debt, Build Next queue, recent progress, and next priority from the existing domain models.
2. **Current consumers use a stable pointer.** Beginning with v6.8, `C.currentProjectModel(...)` points to the current versioned adapter. In v7.2 it points to `C.projectModel72(...)`. Tooling and documentation should prefer the stable pointer instead of hard-coding a release-specific function name.
3. **Dashboard and README are projections of that adapter.** They must not maintain independent copies of current progress counts or a competing work queue.
4. **The default Dashboard is an overview, not an engineering console.** Detailed matrices, ledgers, and delivery diagnostics belong behind explicit drill-downs.
5. **Version-specific UI layers should represent behavior deltas, not become new owners of project-wide truth.** A future release should extend the consolidated model or replace an owner deliberately rather than append another parallel status panel.
6. **Historical runtime layers remain until they can be flattened safely.** Their presence is technical debt, not an invitation to delete them without regression-equivalent replacement.

## Current runtime manifest

v9.6 establishes `data/runtime-manifest.js` as the stable owner for the current ordered browser runtime and the Node-side current-runtime subsets. This is an ownership consolidation, not a deletion of historical behavior.

`index.html` loads only the stable manifest and `assets/runtime-current.js` for the historical application chain. The browser entrypoint projects scripts from the manifest in the same parser-blocking order that v9.5 used. `tools/current-runtime.js` consumes the manifest's Node data/core subsets rather than carrying its own duplicated arrays.

The v9.5 load shape is frozen in `tests/fixtures/runtime-v9.5-load-order.json`. `tools/validate-runtime-manifest.js` verifies the historical stylesheet order fingerprint, current stylesheet ownership, ordered script counts and SHA-256 fingerprint, browser and Node compatibility projections, and manifest-backed v8.8 runtime initialization. Product Hardening preflight runs this validator before a release can merge.

The manifest also makes lazy/current assets visible to repository asset validation, so moving the long chains out of `index.html` does not make broken references invisible to CI.

### Current CSS ownership

v9.7 advances `runtime-css-consolidation` without pretending that request-count optimization is already complete. The executable workspace runtime now exposes exactly one stable, non-versioned stylesheet owner: `assets/obol-current.css`.

The source of truth for historical cascade order remains `data/runtime-manifest.js` under `compatibility.historicalStyles`. `tools/sync-current-styles.js` generates `assets/obol-current.css` as a pure ordered `@import` projection of that list. The generated owner adds no independent rules, so it cannot become a second styling layer or silently change precedence. `tools/validate-runtime-manifest.js` verifies that every historical stylesheet is imported exactly once in the frozen v9.5 order and that the compatibility fingerprint still matches the v9.5 fixture.

This deliberately separates **ownership consolidation** from **performance consolidation**. The historical CSS fragments still exist and still execute through the stable owner, preserving regression behavior and an easy rollback boundary. `perf-bundle-budget` remains queued to reduce network requests and parse cost later; v9.7 does not claim that `@import` by itself reduces requests.

Historical data, core, report, intake, app, and CSS fragment files therefore remain available where they still encode behavior. Future compaction may physically bundle or remove superseded fragments only after equivalent observable behavior is proven.

## Ownership rules

### Project status

`C.currentProjectModel(...)` is the current status boundary. It derives rather than duplicates:

- canonical breadth from the canonical methodology model;
- delivery and quality debt from Build Next/readiness models;
- source inventory and atomic fidelity from the source-fidelity model;
- release trend from the Dashboard milestone history.

The current versioned adapter remains available for regression history. Consumers may format current-model values, but should not recalculate them with independent hard-coded denominators.

v7.2 demonstrates the intended boundary: the completed AD CS, Kerberos delegation, and ACL / ACE atomic ledgers remain source-accounting state, while the current project projection reports 41/41 inventoried units complete and moves Build Next into the 20 remaining broad source-inventory rows without creating a second progress model.

### Product release identity

`data/current-release.js` is the stable owner for the current product-release identity. Header/title presentation, settings identity, report release metadata/footer, export release metadata, README current-release synchronization, and Product Hardening Dashboard presentation consume this authority rather than keeping independent current-version literals.

The product release is deliberately separate from `C.VERSION`. `C.VERSION` remains the browser-workspace/runtime schema compatibility version until a deliberate storage/runtime migration changes it. Product releases must not rewrite historical workspace schema identity merely to make the visible application version advance.

`tools/sync-current-release.js` is the documentation projection for the README, and `tools/validate-current-release.js` guards the authority boundary. Future product-hardening releases update the stable authority instead of creating `core-v9.x`, `app-v9.x`, or project-model overlays solely for version presentation.

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
