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
5. Move the historical expectations that still matter to fixtures/current-owner tests and retire assertions that protected obsolete delivery shape.
6. Apply the same retirement method to Home/Path, Tool Builders, Evidence, Reports, and CSS.

The order matters: **current owner -> browser proof/equivalence -> dependency removal -> physical layer retirement -> obsolete-test retirement**.

## Dashboard status after v9.29

`#/dashboard` now bypasses the historical route renderer. `assets/app-v8.8.js` immediately installs a current Product Hardening loading shell, loads the current dashboard owners, and renders `assets/product-hardening-dashboard.js`. Historical dashboard presentation is therefore no longer allowed to paint first.

That does not yet mean every historical dashboard file can safely leave startup. Historical core overlays still contain hard load-time dependencies on historical dashboard data. For example, `assets/core-v6.5.js` reads `OBOL_DASHBOARD_V65` during initialization and throws if that owner is absent. Some historical `data/dashboard-v*.js` owners also performed command/tool/path mutations while defining dashboard/source-accounting metadata. Removing those files blindly would trade visible layering for a boot or methodology regression.

Accordingly, `runtime-dashboard-no-flash` is complete, while physical `runtime-dashboard-layer-retirement` remains queued. `qa-playwright-smoke` is intentionally the next gate. The physical-retirement item should only close when the browser proof is green and the remaining core/data dependencies have been decoupled or replaced by current/fixture-backed contracts.

## Dependency audit

`node tools/audit-dashboard-runtime-dependencies.js` inventories every historical `data/dashboard-v*.js` file that still participates in live startup, the `OBOL_DASHBOARD_*` globals it exports, live startup consumers of those globals, and detected domain-mutation signals inside the file.

Use it before each dashboard-compaction change. The audit makes the blocking work explicit rather than treating all dashboard files as interchangeable presentation assets.

Use:

```bash
node tools/audit-dashboard-runtime-dependencies.js
node tools/audit-dashboard-runtime-dependencies.js --json
```

Once the decoupling work is actually complete, this becomes a retirement assertion:

```bash
node tools/audit-dashboard-runtime-dependencies.js --require-retired
```

`--require-retired` must not be enabled in the ordinary release gate until the historical dashboard owners have genuinely left `startupScripts`. Its purpose is to become the final proof for `runtime-dashboard-layer-retirement`, not to create a fake green check while dependencies still exist.

The desired replacement is not another stack of versioned compatibility shims. Historical dashboard-owned domain mutations that are still product behavior should move to the appropriate stable/current domain owner or a deliberately consolidated compatibility owner. Historical dashboard metrics needed only for regression history should move to fixtures/docs. Only then should the old dashboard file leave startup.

## Test tiers

Development should use the smallest test set that proves the current work package.

- `node tools/scope-check.js` is the focused v9.29/current-work-package check.
- release smoke remains the ordinary release-branch push gate.
- preflight remains the coherent current-release gate.
- `node tools/run-historical-contracts.js` is the named complete historical regression gate used for final release confidence.
- `.github/workflows/browser-smoke.yml` runs the real Chromium route smoke and uploads screenshots for the six primary surfaces.

CI delegates the complete ready-PR/main/release-final preservation chain to the named historical runner. Browser smoke is a separate user-visible runtime gate because a static historical assertion cannot prove route paint order, console cleanliness, local asset loading, or real rendered composition.

The complete historical runner is intentionally expensive. It should protect final/current behavior and historical contracts, not be the default inner-loop command for every small edit.

## Test retirement

A historical test may be retired or rewritten when its protected behavior has a stable current owner and the old assertion requires obsolete implementation shape. Retirement must leave equivalent or stronger protection behind.

Good retirement:

- old dashboard test becomes a browser/current-dashboard behavior test plus a historical fixture where needed;
- old README wording assertion is replaced by generated current README synchronization;
- old runtime load-order assertion becomes a frozen fixture plus current manifest equivalence check.

Bad retirement:

- deleting a test because it is slow without identifying what behavior it protected;
- removing a historical layer before state migration, browser behavior, or observable equivalence is proven;
- keeping a compatibility layer in live startup solely because a test references its filename;
- deleting dashboard data that a still-live historical core owner requires at initialization.

## Dashboard visibility

Runtime compaction is first-class Product Hardening work. The dashboard should make it obvious which ownership areas still execute historical layers, which have current owners, which have browser/equivalence proof, and which old layers/tests are now safe to retire.
