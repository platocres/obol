# Next notes batch handoff

The README Product Build Next block is the source of truth for active queue order. While notes remain incomplete, future agents must work the generated `Next notes batch` before moving to offline or browser-performance items.

Current v9.60 handoff:

- Batch ID: `notes-batch-old-rubric-reviewed-remine-001`
- Label: Old-rubric reviewed source re-mining batch 1
- Source route: `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json`
- Selection rule: select the next 20 already-reviewed notes that lack full-spectrum audit rows, using manifest/source order and excluding themes already closed by released re-mining proof.
- Acceptance rule: every selected note receives a 16-dimension re-mining audit row plus public-safe product output, covered rationale, queued product gap, or private-boundary proof.

After a batch closes, regenerate Product Build Next and follow the next generated `Next notes batch` until both notes-first gates are complete.

Do not advance to `perf-service-worker` or any offline/performance item while this generated next notes batch or either notes-first gate remains active.

Proof surfaces:

- `data/product-hardening/build-next-queue-hygiene-current.js` publishes `nextNotesBatch` and validates the active notes-first handoff.
- `tools/sync-product-build-next.js` renders the `Next notes batch` lines into README Product Build Next.
- `tests/run-v9.60-tests.js` asserts the batch ID, source route, selector, acceptance rule, notes-first ordering, and offline/performance block.
