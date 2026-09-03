# Product Hardening

v9 starts Obol's post-Orange product-hardening phase. The Orange 2025.03 methodology/source-fidelity queue remains complete; product hardening is a separate engineering queue focused on runtime consolidation, UI/UX quality, command-builder coverage, credential modes, manual outcomes, notes integration, offline/performance work, and visual/browser QA.

## Product contract

The user-facing contract remains unchanged:

- users visit the website and use the website;
- no account is required;
- no backend is required;
- no telemetry is added;
- no install prompt is added;
- no command is automatically executed;
- commands are built for humans to review and run externally;
- Evidence-based proof remains separate from manual workflow advancement.

Browser features such as service workers, IndexedDB, and Web Workers may improve repeat-load performance, persistence, offline behavior, and responsiveness later, but they must remain implementation details rather than prerequisites the user has to install or configure.

## Product-hardening vision

The active queue exists to make Obol feel like a coherent product rather than another sequence of release overlays. Future work should converge on these outcomes:

- one current version authority across UI, reports, exports, README, and dashboard;
- one current runtime ownership path, with historical layers compacted only after regression-equivalent replacements exist;
- one quantified Product Hardening Dashboard with high-level figures/progress bars and Build Next near the top, followed by detailed track ledgers;
- user-facing workflow screens centered on the operator's engagement rather than project-development accounting;
- a reusable schema-driven GUI command-builder engine so every relevant tool can expose a minimum useful command plus contextual toggles and switches without bespoke per-tool mini-apps;
- first-class credential modes for password, hash, ticket, certificate, key, token, and session material where relevant;
- both Evidence-based advancement and manual outcome advancement (`successful`, `failed`, `blocked`, `skipped`) without treating a manual assertion as report-ready proof;
- normalized field-note guidance derived from the private `platocres/obol-source-notes` source repo and bound to tools/path nodes without publishing raw course exports;
- quiet browser-side performance improvements that preserve the "visit the site and use it" experience;
- browser/visual QA strong enough to catch broken assets, route errors, stale version text, contrast problems, and obvious UI regressions.

Do not implement these goals by adding a new versioned product-hardening runtime file for every release. The queue data and stable work-package metadata should evolve while stable owners remain stable.

## Current release authority

v9.2 completes `cc-version-authority`. `data/current-release.js` is now the stable owner for the current product release label and phase identity used by live presentation and generated product metadata.

The header, browser title, settings identity, report release metadata/footer, export release metadata, README current release, in-app Product Hardening Dashboard, and standalone Product Hardening Dashboard consume this authority. README projection is enforced by `tools/sync-current-release.js`; the authority boundary is checked by `tools/validate-current-release.js` and current release regression coverage.

This does **not** make the product release and workspace schema the same concept. `C.VERSION` remains the v8.8 browser workspace/runtime schema compatibility identity until a deliberate storage/runtime migration changes it. Future product releases should update `data/current-release.js` rather than inventing a new current-version constant or a fake v9 runtime overlay.

## Asset reference integrity

v9.3 completes `cc-asset-validation`. `tools/validate-asset-references.js` owns local asset-graph integrity for Obol's HTML entrypoints and follows reachable HTML, CSS, supported dynamic browser resource references, and the stable current runtime manifest. Missing local assets and references that escape the repository root fail validation with owning-file and resolved-path context.

`tools/release-smoke.js` consumes that validator so broken assets fail ordinary release-branch pushes, not only the final regression gate. `tools/release-preflight.js` is phase-aware: Product Hardening releases validate stable v9 owners and do not require fake `core-v9.x` or `project-model-v9.x` layers.

Runtime-manifest ownership may replace hand-maintained load projection, but it must preserve or strengthen this invariant: every current or lazy asset reachable from an Obol entrypoint is resolvable before a release can merge.

## Version trust surfaces

v9.4 completes `cc-report-version` and `qa-version-test`. The stable `data/current-release.js` authority now also exposes shared identity helpers used by the live v8.8 browser bridge to normalize current product metadata without changing the v8.8 workspace/runtime schema identity.

Final report output is normalized at the current-release boundary rather than by rewriting historical report overlays. Report-owned `**Obol:** vX.Y` metadata and generated-footer version labels are replaced with the current product release, while `**Workspace schema:** 8.8.0` remains distinct and operator-provided Evidence/code-block content is left untouched. Sanitized exports receive the same current `obolRelease` and `obolReleaseLabel` metadata through the shared helper.

`tools/validate-version-identity.js` is the permanent regression gate for this contract. It verifies the browser tagline/title/settings presentation, README and dashboard release identity, final report metadata/footer normalization, export metadata, idempotence, Evidence preservation, and workspace-schema separation. `tools/release-preflight.js` runs it for every Product Hardening preflight/final release.

Historical report files may continue to contain their own historical implementation labels where those files are regression fixtures. Current product-facing output must not surface those labels as the current release identity.

## Contrast and focus quality

v9.5 completes `cc-link-contrast`, `ux-keyboard-focus`, and `qa-contrast-test` as the **Contrast and Focus Quality Pass** package.

`assets/accessibility.css` is the stable current workspace owner for link, hover, focus-visible, forced-colors, and reduced-motion accessibility treatment after the historical stylesheet chain. Link and hover tokens are required to meet at least WCAG AA `4.5:1` contrast against supported dark page/panel surfaces. Focus indicators must exceed `3:1` against those surfaces and remain visible inside clipped components.

`assets/accessibility.js` progressively enhances existing non-native clickable workspace surfaces without rewriting historical UI layers. Card headers, state cards, phase/toggle chips, facts, progress/timer controls, lane tabs, and the banner dismiss control become keyboard reachable and activate with Enter or Space when they are not already native controls. Open modals receive dialog semantics, initial focus, contained Tab/Shift+Tab traversal, and focus restoration to the invoking control on close.

The live `assets/app-v8.8.js` bridge loads these stable non-versioned owners because the workspace/runtime schema remains v8.8. The standalone Product Hardening Dashboard keeps its link/focus contract in `assets/product-hardening-dashboard.css`, which is also used by the in-app dashboard.

`tools/validate-accessibility-contract.js` permanently calculates dark-surface contrast ratios and checks focus-visible, forced-colors, keyboard activation, modal focus management, live asset wiring, and the screenshot-assisted QA contract. `docs/visual-qa/contrast-focus.md` defines the representative routes, viewports, and focus/link states that visual review should inspect. Numerical contrast remains deterministic; screenshots supplement it by catching composition/clipping problems static analysis cannot see.

Future UI/runtime work should preserve or strengthen this stable accessibility boundary rather than inventing local focus colors or bypassing the current owner.

## Runtime consolidation foundation

v9.6 completes `runtime-current-entry`, `runtime-data-manifest`, and `runtime-historical-equivalence` inside the **Runtime Consolidation Foundation** package without deleting historical behavior layers.

`data/runtime-manifest.js` is the stable owner for the current browser runtime and the Node current-runtime data/core subsets. `index.html` loads `data/runtime-manifest.js` and `assets/runtime-current.js` instead of hand-maintaining hundreds of versioned asset tags. `tools/current-runtime.js` consumes the same manifest rather than duplicating historical DATA/CORE arrays.

The v9.5 load shape is frozen in `tests/fixtures/runtime-v9.5-load-order.json`, and `tools/validate-runtime-manifest.js` keeps the historical script order and stylesheet cascade observable while proving manifest-backed v8.8 runtime initialization. Product Hardening preflight permanently runs this equivalence gate before historical runtime files may be removed.

`tools/validate-asset-references.js` also traverses manifest-owned current and lazy assets, so moving load-order ownership out of `index.html` does not weaken missing-asset detection.

## CSS ownership consolidation

v9.7 completes `runtime-css-consolidation` without claiming the separate `perf-bundle-budget` work.

The executable workspace runtime now has one stable non-versioned stylesheet owner: `assets/obol-current.css`. `data/runtime-manifest.js` exposes only that file in `styles`, while the frozen v9.5 stylesheet sequence remains explicit under `compatibility.historicalStyles`.

`tools/sync-current-styles.js` generates `assets/obol-current.css` as a pure ordered `@import` projection of that manifest-owned compatibility list. It adds no style rules of its own. `tools/validate-runtime-manifest.js` verifies that every historical fragment appears exactly once, in the original order, and that the v9.5 stylesheet SHA-256 order fingerprint still matches the frozen fixture. Product Hardening preflight runs `node tools/sync-current-styles.js --check` before runtime equivalence.

This gives styling one boring current owner while preserving historical cascade behavior and source-observation regressions. It intentionally does **not** reduce the number of CSS network requests yet; physical bundling/minification/request-budget work remains queued under `perf-bundle-budget`.

With this item complete, Architecture / runtime is 4/10. The next highest-priority item is `runtime-dashboard-owner`, which moves execution into the **Dashboard and User Workflow Rebalance** ownership area. Per the coherent-package stop rule, v9.7 does not skip that priority boundary just to consume more items from the runtime package.

v9.40 later closed the delivery half that v9.7 deliberately left open: the same owner is now the flattened concatenation of those 69 fragments rather than an `@import` chain, so the cascade is unchanged and costs one request instead of seventy.

## Runtime layer consolidation

v9.40 completes `runtime-area-consolidation`. Every historical runtime ownership area resolves to exactly one stable, non-versioned owner that is the **exact ordered concatenation** of its fragments — three at operator startup (domain 103, core 69, application 64) and four route-lazy (Evidence 41, Nmap 3, report overlays 14, tool reference 3) — plus the flattened stylesheet cascade.

Operator startup drops from 307 requests to 5. Measured in Chromium: Home 321→19, Next Steps 329→27, Evidence 365→21, Report 335→20.

Nothing is minified, reordered, or rewritten, and the frozen v9.5 fragment ledger and its order fingerprints are untouched. `tools/sync-runtime-bundles.js` generates the owners; `tools/validate-runtime-bundles.js` proves equivalence, including the three hazards that make classic-script concatenation unsafe (strict-mode prologue leakage, automatic semicolon insertion across fragment boundaries, and lost parse isolation) plus an A/B global-surface diff. `tests/playwright-smoke.js` enforces a per-route request ceiling and fails when a historical fragment is fetched directly.

**This is request consolidation, not semantic flattening.** The owners still concatenate 297 versioned fragments that override each other. Product Build Next therefore leads with the **Runtime Layer Consolidation** package: one queued flattening item per ownership area, each with its own equivalence, workspace-migration, and test-retirement proof. Do not flatten two areas in one pass.

`data/runtime-consolidation-current.js` is the single projection for consolidation figures. The Product Hardening Dashboard and the generated README block both read it; `tools/validate-runtime-consolidation-sync.js` fails when they drift apart.

## Single dashboard rule

Product hardening must have one quantified dashboard surface. The dashboard top should make overall progress obvious through figures, progress bars, the recommended coherent work package, and the broader Build Next queue. Detailed ledgers belong below the high-level summary.

The in-app `#/dashboard` route is the active Product Hardening Dashboard. `product-hardening.html` remains a standalone entrypoint for the same queue data. The completed v8.8 Orange methodology/source dashboard is a baseline summary, not the active product queue.

The dashboard and README Product Build Next block must consume the same atomic queue data from `data/product-hardening/product-hardening-queue.js` and the same package metadata from `data/product-hardening/work-packages.js`.

## Single open PR rule

Product-hardening work must not scatter across duplicate PRs. There must be only one open release/product-hardening PR at a time.

Release PRs are opened as normal, non-draft PRs as early as GitHub permits. Required checks and exact-head validation are the merge gate. Draft status is not part of the release workflow, and a healthy release PR must not be closed/recreated merely to move between Draft and Ready states. Failed checks are development state on the same PR, not a reason to replace it.

Before opening a release, product-hardening, dashboard, queue, Definition of Done, or burn-down PR, agents must check the repository's open PRs. If an active release/product-hardening PR already exists, continue that PR or explicitly close the stale one as superseded before opening another.

`tools/validate-open-pr-uniqueness.js` enforces this for release/product-hardening PRs and is invoked by the release contract validator.

## Queue tracks

The current tracks are:

- Critical correctness
- Architecture / runtime
- UI / UX repair
- Tool GUI builders
- Credential modes
- Manual outcomes
- Notes integration
- Offline / performance
- Testing / visual QA

Future work should update the queue data directly rather than creating version-specific product-hardening runtime layers.

## Coherent work packages

The Product Build Next queue remains atomic, but the unit of engineering execution can be larger than one item. `data/product-hardening/work-packages.js` groups related queue items into coherent work packages so agents can make meaningful progress while they already have the relevant ownership area and tests loaded into context.

Each package records:

- `ownershipArea` - the architectural/product surface that binds the work together;
- `itemIds` - atomic queue items that are reasonable to implement together;
- `dependencies` - package-level sequencing dependencies;
- `relatedItems` - nearby work worth considering without automatically expanding scope;
- `parallelSafe` - whether the package's internal work is naturally separable; this does not override the one-open-PR rule;
- `recommendedBatch` - whether the package should normally be treated as a multi-item burn-down;
- `guidance` - a concise description of why the items belong together.

The highest-priority queued item remains authoritative for where work begins. The work-package layer does not reorder the queue or hide priority. It takes that entry item and tells the agent which adjacent/dependency-linked items can reasonably be completed in the same architectural pass.

Agents should complete as many live package items as safely fit the same ownership area, architectural context, migration boundary, and test strategy. They should not stop after one item merely because its acceptance criteria pass when additional same-package work can be completed and fully proven without materially increasing blast radius.

The opposite rule matters just as much: do not use work packages as an excuse to bundle unrelated changes. Stop expanding the package when the next item changes ownership area, requires substantially different reasoning or migration work, or makes the PR harder to review, validate, and roll back.

## Item-specific Definition of Done

Product-hardening queue items are not allowed to drift into vibes. Any item that leaves `queued` status must have an item-specific test contract in `data/product-hardening/item-test-contracts.js`.

That contract must name:

- acceptance criteria;
- validation commands;
- proof files.

`tools/validate-product-hardening-queue.js` fails when a `modeled`, `complete`, `superseded`, or `rejected` item lacks that proof. This protects future builds from marking queue work done without tests.

Work-package batching does not weaken this contract. If one PR closes five queue items, all five items need their own status/proof/test coverage. Package-level coherence is for development efficiency; item-level proof remains the accountability boundary.

Historical regression suites are preservation boundaries, not README-layout locks. They should prove the historical model/behavior they own and durable current structural contracts where truly necessary. They must not force retired Orange-era README wording, historical Build Next blocks, or mutable current-release values back into the active handoff.

## Future-agent workflow

1. Read `README.md`.
2. Read `BUILDING.md` for the exact release workflow, validation tiers, coherent package rules, and exact-head merge rule.
3. Review this document and `docs/ARCHITECTURE.md` before changing runtime ownership or queue architecture.
4. Check open PRs and continue the active release/product-hardening PR if one exists.
5. If no release PR exists, create the release branch and open one normal non-draft PR as early as GitHub permits. Keep that same PR through development and failed checks.
6. Review Product Build Next in `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js` plus `data/product-hardening/work-packages.js`.
7. Start with the highest-priority live queue item unless the user explicitly directs otherwise. Treat it as the entry point into the recommended work package rather than a one-item limit.
8. Inspect live package items, dependencies, and related items. Complete as many as safely fit the same ownership area and blast radius without adding unnecessary compatibility shims or release-only ownership layers.
9. Update each product-hardening queue item independently when its disposition changes.
10. Add or update each changed item's acceptance criteria, validation commands, proof files, and item-specific tests.
11. Stop package expansion when the next item materially changes architectural context, migration risk, ownership, or test strategy. Do not batch unrelated work for item-count optics.
12. When the product release changes, update `data/current-release.js` and synchronize README with `node tools/sync-current-release.js --write`.
13. Sync Product Build Next and the work-package projection with `node tools/sync-product-build-next.js --write`.
14. Run the required validation from `BUILDING.md`.
15. Keep the coherent package in the one active release PR and do not merge until the exact final head and PR required checks are green.

## Notes source boundary

Raw OffSec/HTB source exports live in the private repository `platocres/obol-source-notes`. Future agents should use that repository as private source material when burning down the Notes Integration queue. Public Obol should receive normalized, derived guidance, queue dispositions, tool/path improvements, and implementation changes rather than raw course exports.

The notes ledger must account for all 556 staged notes through explicit terminal or review states. See `docs/NOTES-INTEGRATION.md` for the detailed ingestion and disposition contract.

## Validation

Use `BUILDING.md` as the source of truth for the full release gate. Product-hardening-specific checks include:

```bash
node tools/validate-historical-tests.js
node tools/validate-product-hardening-queue.js
node tools/validate-current-release.js
node tools/validate-version-identity.js
node tools/validate-accessibility-contract.js
node tools/sync-current-styles.js --check
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
node tests/run-v9.7-tests.js
```

These checks do not replace smoke, preflight, release-contract validation, or the complete historical chain. They add the phase-specific governance needed for v9 product hardening.
