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
10. Sync Product Build Next and any dashboard/readme projections sourced from the queue.
11. Run the required validation from `BUILDING.md`.
12. Push one coherent release PR and do not merge until the exact final head is green.

## Notes source boundary

Raw OffSec/HTB source exports live in the private repository `platocres/obol-source-notes`. Future agents should use that repository as private source material when burning down the Notes Integration queue. Public Obol should receive normalized, derived guidance, queue dispositions, tool/path improvements, and implementation changes rather than raw course exports.

The notes ledger must account for all 556 staged notes through explicit terminal or review states. See `docs/NOTES-INTEGRATION.md` for the detailed ingestion and disposition contract.

## Validation

Use `BUILDING.md` as the source of truth for the full release gate. Product-hardening-specific checks include:

```bash
node tools/validate-historical-tests.js
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tools/validate-open-pr-uniqueness.js
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
node tests/run-v9.1.1-tests.js
```

These checks do not replace smoke, preflight, release-contract validation, or the complete historical chain. They add the phase-specific governance needed for v9 product hardening.
