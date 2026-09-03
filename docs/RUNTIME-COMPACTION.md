# Runtime Compaction and Historical Test Retirement

Obol's current product must converge toward one boring current runtime rather than preserving every historical presentation layer in live startup forever.

Historical behavior matters. Historical execution shape does not automatically matter.

## North star

The target state is one current owner for each live product surface:

- Dashboard
- Home and Path workflow
- Tool Builder platform
- Evidence parsing and proof review
- Report generation
- CSS/theme ownership
- browser-local storage and migration

Old versioned assets may remain as fixtures or historical documentation when they still provide regression value, but they should not remain live startup participants merely because an old regression suite once executed them.

## Retirement rule

A historical live layer can leave startup when all of the following are true:

1. A stable current owner exists for the behavior.
2. Observable equivalence is proven for the behavior that still matters.
3. Real browser coverage exists for user-visible route/runtime behavior when static assertions cannot prove the transition.
4. State/workspace migration compatibility is preserved where applicable.
5. Historical expectations that still matter have moved to current-owner or fixture-based tests.
6. The historical asset is removed from the startup manifest or route loading path.
7. Obsolete assertions that protected only delivery shape are deleted or archived.
8. README and Product Hardening Dashboard architecture progress are updated.

Do not preserve an old UI owner just so an old test can keep finding it. Preserve the contract the test was meant to protect. Do not remove a historical owner merely because a current renderer exists if another live layer still has a load-time dependency on that historical data.

## Compaction order

Product Build Next should retire layers by ownership area rather than attempting one giant rewrite.

The first package is Dashboard retirement because the user could visibly see old dashboard layers paint before the current Product Hardening Dashboard. The v9.29 sequence is:

1. Establish current dashboard no-flash ownership.
2. Add Playwright browser smoke coverage for the core routes, including Dashboard, with console-error failure, dashboard paint-history proof, and representative screenshots.
3. Prove the remaining historical dashboard data/presentation dependencies can be removed or decoupled without breaking mixed historical core/runtime owners.
4. Remove only the historical dashboard owners whose live dependencies have been eliminated.
5. Move historical expectations that still matter to fixtures/current-owner tests and retire assertions that protected obsolete delivery shape.
6. Apply the same retirement method to Home/Path, Tool Builders, Evidence, Reports, and CSS.

The order matters: **current owner -> browser proof/equivalence -> dependency removal -> physical layer retirement -> obsolete-test retirement**.

## Dashboard status in v9.29

`#/dashboard` is protected as a current-owned route during compatibility startup. `assets/runtime-current.js` claims Dashboard intent, installs the current loading shell, blocks historical writes to the shared view while that intent is active, and `assets/dashboard-route-current.js` renders and guards the current Product Hardening Dashboard.

The real Chromium smoke gate is green for Home, Targets, Evidence, Next Steps, Report, and Dashboard, including dashboard paint-history observation through the legacy timer window. `qa-playwright-smoke` is therefore complete.

The physical Dashboard compaction has also crossed the live-startup boundary. All sixteen versioned `data/dashboard-v*` owners are now absent from `startupScripts`, along with fourteen Dashboard-only v5.1-v6.5 presentation overlays. Those files remain available in the frozen historical ledger for regression/fixture history, but normal browser startup no longer executes them.

Historical core overlays still need the metadata objects those old Dashboard data files exposed. Rather than keeping sixteen versioned owners live, `data/dashboard-compat-current.js` is the single stable, data-only compatibility seam loaded before the remaining historical core chain on operator routes. It reproduces the historical `OBOL_DASHBOARD_V49` through `OBOL_DASHBOARD_V65` metadata without owning command, tool, Path, Evidence, or reporting mutations.

`tools/validate-dashboard-compat-equivalence.js` executes the old Dashboard data owners only as a historical fixture and proves that the compact seam produces metadata-equivalent values for all sixteen owners. The validator is part of Product Hardening preflight.

The v6.5 audit was important because `data/dashboard-v6.5.js` also carried AD CS product mutations. Those behaviors already have the proper domain owner in `data/source-delivery-v6.5.js`, including the Certify/Certutil command variants, agent/target certificate artifact handoffs, and source-depth delivery metadata. The compact Dashboard seam therefore remains metadata-only rather than becoming a new hidden product-behavior layer.

The exact-head preservation gate completed successfully after physical compaction: real browser smoke, lightweight release smoke, Product Hardening preflight, dependency audit, metadata equivalence, and the complete historical contract runner all passed together. `runtime-dashboard-layer-retirement` is therefore complete rather than left in a perpetual implemented-but-queued state.

The Product Hardening Dashboard exposes this state directly: current script counts, zero live historical Dashboard-data owners, real-browser proof status, the runtime queue, and an ownership-area retirement matrix for Dashboard, Home/Path, Tool Builders, Evidence, Reports, and CSS.

## Consolidated ownership in v9.40

Dashboard retirement removed layers. v9.40 does something different and complementary: it stops the *remaining* layers from costing one request each.

Every ownership area now resolves to one stable, non-versioned owner — 103 domain, 69 core, 64 application, and 61 route-lazy fragments behind seven owners — plus a flattened stylesheet cascade. v9.41 makes the first semantic cut: the 103 domain fragments no longer execute directly in the current runtime and are represented by `assets/obol-domain-current.js`, an authored graph snapshot proven equivalent to the frozen ledger. Operator startup remains 5 requests, down from 307. Measured in Chromium: Home 321→19, Next Steps 329→27, Evidence 365→21, Report 335→20.

Request consolidation shipped first because exact concatenation preserved behavior while reducing fetch count. The current proof chain is now split by owner strategy:

- `tools/sync-domain-current.js` generates the semantic domain owner from the historical domain ledger.
- `tools/validate-domain-current-equivalence.js` proves the same `OBOL_*` root order, graph topology, shared identities, cycles, mutability flags, RegExp metadata, function signatures, and authored function behavior.
- `tools/sync-runtime-bundles.js` generates the remaining exact-concatenation owners from the manifest.
- `tools/validate-runtime-bundles.js` proves exact concatenation for those owners, rules out strict-mode prologue leakage and ASI fusion across fragment boundaries, checks parse isolation, and diffs the current-domain-plus-core fragment chain against the current-domain-plus-core owner chain in isolated VM contexts.
- `tests/playwright-smoke.js` enforces a per-route request ceiling and fails when any historical fragment is fetched directly. The gate was verified against the pre-consolidation runtime, where every route fails.

**Consolidation is not automatic retirement.** The frozen ledger is untouched. Current accounting is 103 domain fragments semantically flattened, 194 fragments still executing through exact owners, and 30 Dashboard fragments retired to fixtures. Product Build Next therefore leads with the next queued flattening item per remaining ownership area — core, application, Evidence parsing, and stylesheet. Each is a separate pass with its own equivalence, workspace-migration, and test-retirement proof. Do not flatten two areas at once: their migration surfaces are unrelated, and a combined pass cannot be rolled back cleanly.

## Dependency and equivalence audits

`node tools/audit-dashboard-runtime-dependencies.js` inventories every historical `data/dashboard-v*.js` file that participates in live startup, the `OBOL_DASHBOARD_*` globals it exports, live startup consumers of those globals, and detected domain-mutation signals inside the file.

The physical retirement assertion is enabled in Product Hardening preflight:

```bash
node tools/audit-dashboard-runtime-dependencies.js --require-retired
```

That command must continue to report zero historical Dashboard data owners in `startupScripts`.

The compact compatibility seam is separately proven against the frozen historical owners:

```bash
node tools/validate-dashboard-compat-equivalence.js
```

This distinction matters. The dependency audit proves the old files are not live. The equivalence validator proves the one remaining metadata seam still satisfies the historical core contracts that matter. Neither test permits Dashboard metadata to become an owner for operator-domain behavior.

The desired replacement is not another stack of versioned compatibility shims. Historical Dashboard-owned domain mutations that remain product behavior belong in the appropriate methodology/source-delivery/current owner. Historical Dashboard metrics needed only for regression history belong in fixtures/docs. The same rule applies as other ownership areas are compacted.

## Test tiers

Development should use the smallest test set that proves the current work package.

- `node tools/scope-check.js` is the focused v9.29/current-work-package check.
- release smoke remains the ordinary release-branch push gate.
- preflight remains the coherent current-release gate and includes Dashboard compatibility equivalence plus the hard retirement assertion.
- `node tools/run-historical-contracts.js` is the named complete historical regression gate used for final release confidence.
- `.github/workflows/browser-smoke.yml` runs the real Chromium route smoke and uploads screenshots for the six primary surfaces.

CI delegates the complete ready-PR/main/release-final preservation chain to the named historical runner. Browser smoke is a separate user-visible runtime gate because a static historical assertion cannot prove route paint order, console cleanliness, local asset loading, or real rendered composition.

The complete historical runner is intentionally expensive. It should protect final/current behavior and historical contracts, not be the default inner-loop command for every small edit.

## Test retirement

A historical test may be retired or rewritten when its protected behavior has a stable current owner and the old assertion requires obsolete implementation shape. Retirement must leave equivalent or stronger protection behind.

Good retirement:

- old dashboard test becomes a browser/current-dashboard behavior test plus a historical fixture where needed;
- old README wording assertion is replaced by generated current README synchronization;
- old runtime load-order assertion becomes a frozen fixture plus current manifest equivalence check;
- old Dashboard data metadata checks are preserved through `validate-dashboard-compat-equivalence.js` without requiring those sixteen owners to execute in live startup.

Bad retirement:

- deleting a test because it is slow without identifying what behavior it protected;
- removing a historical layer before state migration, browser behavior, or observable equivalence is proven;
- keeping a compatibility layer in live startup solely because a test references its filename;
- moving real operator-domain behavior into a generic compatibility metadata shim.

## Dashboard visibility

Runtime compaction is first-class Product Hardening work. The dashboard shows which ownership areas still execute historical layers, which have current owners, what proof exists, and whether obsolete historical tests have actually been retired. This matrix should be updated as each ownership area moves through current owner, equivalence, physical retirement, and test retirement rather than treating runtime debt as invisible background cleanup.

Dashboard is the first ownership area to cross and close the physical-retirement boundary. Future runtime compaction should apply the same method to Home/Path and the other remaining live compatibility areas, but Product Build Next can now return to the higher-priority packetized Notes Integration work instead of holding the release open on a completed Dashboard gate.
