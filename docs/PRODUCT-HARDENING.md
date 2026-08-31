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

No product-hardening queue item may move beyond `queued` without item-specific acceptance criteria and test proof.

Any item with status `modeled`, `implemented`, `tested`, `complete`, `superseded`, or `rejected` must carry these fields in the queue data after `data/product-hardening/product-hardening-queue.js` is evaluated:

- `acceptance`
- `test_plan`
- `validation_commands`
- `required_tests`
- `proof_files`
- `risk`
- `status_notes`

Items moved to `implemented`, `tested`, or `complete` must name at least one item-specific test or validator in `required_tests`. The normal proof path is:

1. implement the change;
2. update the queue item status and its Definition of Done fields;
3. add or update the item-specific test or validator;
4. run the validation commands named by the item;
5. sync the README Product Build Next block if queue totals changed;
6. merge only after the exact PR head is green.

This is enforced by `tools/validate-product-hardening-queue.js` and covered by `tests/run-v9.0.1-tests.js`.

## Future-agent workflow

1. Read `README.md`.
2. Review Product Build Next.
3. Open `product-hardening.html` or the in-app dashboard surface.
4. Pick the highest-priority live queue item unless the user explicitly directs otherwise.
5. Build the item without adding unnecessary compatibility shims.
6. Update the product-hardening queue data and the queue item's Definition of Done fields.
7. Add or update item-specific tests.
8. Run validation.
9. Update the README Product Build Next block.
10. Push one coherent release PR.

## Validation

Use:

```bash
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tests/run-v9.0-tests.js
node tests/run-v9.0.1-tests.js
```

These checks do not replace the existing release smoke/preflight/historical chain. They add the product-hardening governance checks needed for the v9 phase.
