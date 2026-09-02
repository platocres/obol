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
3. State/workspace migration compatibility is preserved where applicable.
4. Historical expectations that still matter have moved to current-owner or fixture-based tests.
5. The historical asset is removed from the startup manifest or route loading path.
6. Obsolete assertions that protected only delivery shape are deleted or archived.
7. README and Product Hardening Dashboard architecture progress are updated.

Do not preserve an old UI owner just so an old test can keep finding it. Preserve the contract the test was meant to protect.

## Compaction order

Product Build Next should retire layers by ownership area rather than attempting one giant rewrite.

The first package is Dashboard retirement because the user can visibly see old dashboard layers paint before the current Product Hardening Dashboard. The sequence is:

1. Current dashboard no-flash ownership.
2. Remove historical dashboard owners from live startup.
3. Move dashboard historical expectations to fixtures/current-owner tests.
4. Apply the same retirement method to Home/Path, Tool Builders, Evidence, Reports, and CSS.

## Test tiers

Development should use the smallest test set that proves the current work package.

- `node tools/scope-check.js` is the focused v9.29/current-work-package check.
- release smoke remains the ordinary release-branch push gate.
- preflight remains the coherent current-release gate.
- `node tools/run-historical-contracts.js` is the named complete historical regression gate used for final release confidence.

The complete historical runner is intentionally expensive. It should protect final/current behavior and historical contracts, not be the default inner-loop command for every small edit.

## Test retirement

A historical test may be retired or rewritten when its protected behavior has a stable current owner and the old assertion requires obsolete implementation shape. Retirement must leave equivalent or stronger protection behind.

Good retirement:

- old dashboard test becomes a fixture/current-dashboard behavior test;
- old README wording assertion is replaced by generated current README synchronization;
- old runtime load-order assertion becomes a frozen fixture plus current manifest equivalence check.

Bad retirement:

- deleting a test because it is slow without identifying what behavior it protected;
- removing a historical layer before state migration or observable equivalence is proven;
- keeping a compatibility layer in live startup solely because a test references its filename.

## Dashboard visibility

Runtime compaction is first-class Product Hardening work. The dashboard should make it obvious which ownership areas still execute historical layers and which have reached current-owner equivalence and test retirement.
