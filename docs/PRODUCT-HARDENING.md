# Product Hardening

v9 starts Obol's post-Orange product-hardening phase. The Orange 2025.03 methodology/source-fidelity queue remains complete; product hardening is a separate engineering queue focused on runtime consolidation, UI/UX quality, command-builder coverage, credential modes, manual outcomes, notes integration, offline/performance work, and visual/browser QA.

## Product contract

The user-facing contract remains unchanged:

- users visit the website and use the website;
- no account is required;
- no backend is required;
- no telemetry is added;
- no command is automatically executed;
- commands are built for humans to review and run externally;
- Evidence-based proof remains separate from manual workflow advancement.

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

## Future-agent workflow

1. Read `README.md`.
2. Check open PRs and continue the active release/product-hardening PR if one exists.
3. Review Product Build Next.
4. Open `#/dashboard` for the Product Hardening Dashboard.
5. Pick the highest-priority live queue item unless the user explicitly directs otherwise.
6. Build the item without adding unnecessary compatibility shims.
7. Update the product-hardening queue data when the item disposition changes.
8. Add or update that item's test contract.
9. Add or update item-specific tests or validators.
10. Run validation.
11. Update the README Product Build Next block.
12. Push one coherent release PR.

## Validation

Use:

```bash
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tools/validate-open-pr-uniqueness.js
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
```

These checks do not replace the existing release smoke/preflight/historical chain. They add the product-hardening governance checks needed for the v9 phase.
