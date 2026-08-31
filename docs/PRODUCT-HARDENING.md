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

Do not implement these goals by adding a new versioned product-hardening runtime file for every release. The queue data should evolve while stable owners remain stable.

## Current release authority

v9.2 completes `cc-version-authority`. `data/current-release.js` is now the stable owner for the current product release label and phase identity used by live presentation and generated product metadata.

The header, browser title, settings identity, report release metadata/footer, export release metadata, README current release, in-app Product Hardening Dashboard, and standalone Product Hardening Dashboard consume this authority. README projection is enforced by `tools/sync-current-release.js`; the authority boundary is checked by `tools/validate-current-release.js` and current release regression coverage.

This does **not** make the product release and workspace schema the same concept. `C.VERSION` remains the v8.8 browser workspace/runtime schema compatibility identity until a deliberate storage/runtime migration changes it. Future product releases should update `data/current-release.js` rather than inventing a new current-version constant or a fake v9 runtime overlay.

## Asset reference integrity

v9.3 completes `cc-asset-validation`. `tools/validate-asset-references.js` owns local asset-graph integrity for Obol's HTML entrypoints and follows reachable HTML, CSS, and supported dynamic browser resource references. Missing local assets and references that escape the repository root fail validation with owning-file and resolved-path context.

`tools/release-smoke.js` consumes that validator so broken assets fail ordinary release-branch pushes, not only the final regression gate. `tools/release-preflight.js` is phase-aware: Product Hardening releases validate stable v9 owners and do not require fake `core-v9.x` or `project-model-v9.x` layers.

Future asset-manifest work may replace hand-maintained load order, but it must preserve or strengthen this invariant: every asset reachable from an Obol entrypoint is resolvable before a release can merge.

## Single dashboard rule

Product hardening must have one quantified dashboard surface. The dashboard top should make overall progress obvious through figures, progress bars, and Build Next. Detailed ledgers belong below the high-level summary.

The in-app `#/dashboard` route is the active Product Hardening Dashboard. `product-hardening.html` remains a standalone entrypoint for the same queue data. The completed v8.8 Orange methodology/source dashboard is a baseline summary, not the active product queue.

The dashboard and README Product Build Next block must consume the same queue data from `data/product-hardening/product-hardening-queue.js`.

## Single open PR rule

Product-hardening work must not scatter across duplicate PRs. There must be only one open release/product-hardening PR at a time.

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

## Item-specific Definition of Done

Product-hardening queue items are not allowed to drift into vibes. Any item that leaves `queued` status must have an item-specific test contract in `data/product-hardening/item-test-contracts.js`.

That contract must name:

- acceptance criteria;
- validation commands;
- proof files.

`tools/validate-product-hardening-queue.js` fails when a `modeled`, `complete`, `superseded`, or `rejected` item lacks that proof. This protects future builds from marking queue work done without tests.

Historical regression suites are preservation boundaries, not README-layout locks. They should prove the historical model/behavior they own and durable current structural contracts where truly necessary. They must not force retired Orange-era README wording, historical Build Next blocks, or mutable current-release values back into the active handoff.

## Future-agent workflow

1. Read `README.md`.
2. Read `BUILDING.md` for the exact release workflow, validation tiers, and exact-head merge rule.
3. Review this document and `docs/ARCHITECTURE.md` before changing runtime ownership or queue architecture.
4. Check open PRs and continue the active release/product-hardening PR if one exists.
5. Review Product Build Next in `#/dashboard` or `data/product-hardening/product-hardening-queue.js`.
6. Pick the highest-priority live queue item unless the user explicitly directs otherwise.
7. Build the item without adding unnecessary compatibility shims or release-only ownership layers.
8. Update the product-hardening queue data when the item disposition changes.
9. Add or update that item's acceptance criteria, validation commands, proof files, and item-specific tests.
10. When the product release changes, update `data/current-release.js` and synchronize README with `node tools/sync-current-release.js --write`.
11. Sync Product Build Next and any dashboard/readme projections sourced from the queue.
12. Run the required validation from `BUILDING.md`.
13. Push one coherent release PR and do not merge until the exact final head is green.

## Notes source boundary

Raw OffSec/HTB source exports live in the private repository `platocres/obol-source-notes`. Future agents should use that repository as private source material when burning down the Notes Integration queue. Public Obol should receive normalized, derived guidance, queue dispositions, tool/path improvements, and implementation changes rather than raw course exports.

The notes ledger must account for all 556 staged notes through explicit terminal or review states. See `docs/NOTES-INTEGRATION.md` for the detailed ingestion and disposition contract.

## Validation

Use `BUILDING.md` as the source of truth for the full release gate. Product-hardening-specific checks include:

```bash
node tools/validate-historical-tests.js
node tools/validate-product-hardening-queue.js
node tools/validate-current-release.js
node tools/validate-asset-references.js
node tools/sync-current-release.js --check
node tools/sync-product-build-next.js --check
node tools/validate-open-pr-uniqueness.js
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
node tests/run-v9.1.1-tests.js
node tests/run-v9.2-tests.js
node tests/run-v9.3-tests.js
```

These checks do not replace smoke, preflight, release-contract validation, or the complete historical chain. They add the phase-specific governance needed for v9 product hardening.
