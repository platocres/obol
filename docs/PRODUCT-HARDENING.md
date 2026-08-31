# Product Hardening

v9.0 starts Obol's post-Orange product-hardening phase. The Orange 2025.03 methodology/source-fidelity queue remains complete; product hardening is a separate engineering queue focused on runtime consolidation, UI/UX quality, command-builder coverage, credential modes, manual outcomes, notes integration, offline/performance work, and visual/browser QA.

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

The dashboard and README Product Build Next block must consume the same queue data from `data/product-hardening/product-hardening-queue.js`.

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

## Queue item Definition of Done

The product-hardening queue is not allowed to become a vibes ledger. Any item moved beyond `queued` must have item-specific proof in `data/product-hardening/product-hardening-dod.js`.

For every item marked `modeled`, `implemented`, `tested`, `complete`, `superseded`, or `rejected`, the DoD ledger must name:

- concrete acceptance criteria;
- the test plan;
- runnable validation commands;
- required tests or validator files;
- proof files that demonstrate the work;
- the risk the test coverage prevents;
- status notes explaining why the item is at that state.

`tools/validate-product-hardening-queue.js` enforces this. If a future agent marks an item as done without adding item-specific tests or validation, CI should fail.

## Future-agent workflow

1. Read `README.md`.
2. Review Product Build Next.
3. Open `product-hardening.html` or the in-app dashboard surface.
4. Pick the highest-priority live queue item unless the user explicitly directs otherwise.
5. Build the item without adding unnecessary compatibility shims.
6. Add or update item-specific test or validation coverage.
7. Update `data/product-hardening/product-hardening-dod.js` when the item status moves beyond `queued`.
8. Update the product-hardening queue data.
9. Run validation.
10. Update the README Product Build Next block.
11. Push one coherent PR.

## Validation

Use:

```bash
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tests/run-v9.0-tests.js
```

These checks do not replace the existing release smoke/preflight/historical chain. They add the product-hardening governance checks needed for the v9 phase.
