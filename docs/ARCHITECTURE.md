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

This deliberately separated **ownership consolidation** from **performance consolidation**. The historical CSS fragments still exist and still execute through the stable owner, preserving regression behavior and an easy rollback boundary.

v9.40 closes the delivery half. `assets/obol-current.css` is now the flattened ordered concatenation of the same 69 fragments rather than an `@import` chain, so the cascade is byte-for-byte what it was while costing one request instead of seventy. `tools/sync-current-styles.js` still generates it; the owner still adds no rules of its own; `tools/validate-runtime-manifest.js` still verifies exact fragment order against the frozen v9.5 fixture.

### Consolidated runtime ownership

v9.40 applies the same request-consolidation rule to JavaScript. v9.41 starts semantic flattening by replacing the domain area’s live 103-fragment chain with an authored current graph snapshot. Every historical ownership area still resolves to one stable, non-versioned owner, but strategies are now per-area:

| Ownership area | Fragments | Owner | Strategy | Loading |
| --- | --- | --- | --- | --- |
| Domain data | 103 | `assets/obol-domain-current.js` | semantic snapshot | operator startup |
| Core state and derivation | 69 | `assets/obol-core-current.js` | exact concatenation | operator startup |
| Report base and application UI | 64 | `assets/obol-app-current.js` | exact concatenation | operator startup |
| Evidence parsing | 41 | `assets/obol-evidence-current.js` | exact concatenation | route-lazy |
| Nmap builders | 3 | `assets/obol-nmap-current.js` | exact concatenation | route-lazy |
| Report overlays | 14 | `assets/obol-report-overlays-current.js` | exact concatenation | route-lazy |
| Tool reference data | 3 | `assets/obol-tool-reference-current.js` | exact concatenation | route-lazy |

`data/runtime-manifest.js` owns the area definitions. `tools/sync-domain-current.js` generates the semantic domain owner and `tools/validate-domain-current-equivalence.js` proves it against the frozen historical domain graph. `tools/sync-runtime-bundles.js` generates the six exact-concatenation owners, and `tools/validate-runtime-bundles.js` proves their delivery-shape hazards and observable equivalence. The fragments remain on disk as the frozen regression ledger.

This remains per-area work. Domain is flattened; core, app, Evidence parsing, and stylesheet flattening are still queued separately because each has a different equivalence and workspace-migration surface.

`data/runtime-consolidation-current.js` is the single projection for consolidation figures; the Product Hardening Dashboard and the generated README block both read it, and `tools/validate-runtime-consolidation-sync.js` fails when they drift apart.

Historical data, core, report, intake, app, and CSS fragment files therefore remain available where they still encode behavior. Future compaction may physically bundle or remove superseded fragments only after equivalent observable behavior is proven.

### Current dashboard and workflow ownership

v9.8 establishes `assets/workflow-current.js` as the stable non-versioned owner for the current Home, secondary dashboard navigation, in-app Product Hardening Dashboard handoff, and the current Next Steps decision brief. The v8.8 bridge remains responsible for release identity/report-export compatibility and lazy loading, but it no longer owns a release-specific Product Hardening Home panel or competing dashboard renderer.

`assets/product-hardening-dashboard.js` is the single current project/product progress renderer. The standalone `product-hardening.html` entrypoint and the in-app `#/dashboard` route use that same renderer. The embedded form returns to the Obol workspace instead of linking back to itself.

Prime workflow screens are engagement-first. Home derives active context, Evidence counts, queued operator intent, latest Evidence attention, recommendation state, blockers, recent activity, and report proof readiness from existing core models. It does not derive Orange source-accounting totals or Product Hardening build totals.

v9.31 adds `assets/operator-route-current.js` as the stable current owner for Path, Card, and Tools presentation. Path still uses `C.nextStepsOverview34(...)` for ranking semantics, but the visible route is now a current-owned decision screen rather than the old stacked panel sequence. Card and Tools surfaces keep current schema-driven builders first and collapse raw historical command blocks into supporting detail.

The master Product Dashboard is exposed in secondary navigation so it is easy to find without changing the five-item primary operator loop: Home, Targets, Evidence, Next Steps, Report.

`tools/validate-current-workflow.js` is the permanent ownership gate for this boundary and runs during Product Hardening preflight.

### Current Tool Builder ownership

v9.12 establishes a stable non-versioned Tool Builder Platform before representative tool builders are migrated.

`data/tool-builder-schema.js` owns the reusable builder contract: typed inputs, execution context, target/workspace autofill, credential-mode declarations, deterministic command tokens, Evidence expectations, manual-outcome boundaries, and report-lineage requirements. The schema rejects automatic execution hooks because Obol remains a command-planning surface, not an execution engine.

`assets/tool-builder-current.js` is the single generic browser renderer/compiler. It renders labeled controls from schema data, applies context autofill, produces a shell-safe command preview, and supports copy-only handoff. It does not own target facts, Evidence truth, success state, or report proof. Those remain in the existing engagement/core boundaries.

`data/tool-builder-inventory.js` is the explicit runnable-tool accounting owner. Current lane/card commands and the tool registry must resolve to an `implemented`, `modeled`, `superseded`, or `rejected` disposition with rationale. Aliases normalize to canonical identities so `nxc`, `cme`, and Impacket shorthand do not create parallel coverage records.

`tools/validate-tool-builder-platform.js` permanently enforces the schema/renderer/inventory/no-execution contract. The v8.8 current bridge lazily loads these owners on card/tool surfaces rather than introducing `app-v9.x`, `core-v9.x`, or release-specific Tool Builder layers.

Representative builders are migrations onto this platform, not new mini-apps. Existing bespoke behavior, beginning with the rich Nmap command builder, remains a compatibility boundary until a schema-driven replacement proves equivalent behavior and can retire the old rendering owner safely.

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

The Product Hardening Dashboard owns current project/product hard numbers. Its default view should answer, at a glance:

- Where are we?
- What remains?
- Is there quality debt?
- What should be built next?

Completed Orange accounting remains regression-protected historical context rather than a competing live dashboard owner. Engineering detail remains available through dashboard drill-downs rather than being placed in the primary operator scan path.

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
