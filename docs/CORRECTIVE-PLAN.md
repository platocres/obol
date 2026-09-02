# Corrective Build Plan

This document is the durable roadmap for getting Obol to its stated ambitions. It complements the atomic queue in `data/product-hardening/product-hardening-queue.js` and the coherent packages in `data/product-hardening/work-packages.js`. The queue and the generated README Product Build Next block remain the live source of truth for status; this document explains the ordering and the corrective intent behind it.

## Root problem this plan corrects

Notes review was being measured by the wrong metric. As of 127/556 reviewed, 95 notes were modeled but only **1** produced a declared code-level product mechanic; the other 94 were guidance-only text. The pipeline was converting private notes into a field-notes notebook rather than into product capability (new tool-builder toggles, Path branches, evidence rules, report changes), which is the outcome `docs/UX-QUALITY.md` explicitly warns against.

The fix is to change what "done" means for a note: a modeled note must either declare a product mechanic or carry an explicit, justified guidance-only reason. Review count (x/556) is demoted to a secondary metric behind mechanic conversion.

## Ordering principle

Sequence by user value per unit of review bandwidth, honoring the one-open-PR rule. Two areas are treated as effectively closed and receive no new work absent a real defect: the six 100%-complete engineering tracks, and the remaining `architecture-runtime` compaction (invisible to users — deferred to the end).

## Workstreams

### WS1 — Fix the notes to product conversion engine (live in the queue now)

Highest leverage. Fix the engine before processing more notes.

- `notes-conversion-rubric` — enforce mechanic-or-justified-reason in `tools/validate-notes-impact.js`.
- `notes-mechanic-backfill` — re-mine the already-modeled notes for mechanics; convert guidance-only into declared product changes where warranted.
- `notes-script-category` — add a `script` disposition kind so reusable scripts/one-liners are tracked outputs.

These are live queue items in the `notes-impact-burn-down` package, sequenced immediately after the umbrella `notes-disposition-burn-down` entry.

### WS2 — Finish the notes backlog under the new bar

After WS1, resume themed packets one PR at a time, each reporting mechanics created rather than notes read:

- `notes-packet-linux-privesc`
- `notes-packet-ad-pivoting`
- remaining unthemed notes swept into coherent packets until 556 terminal dispositions.

### WS3 — Path three-mode unification (`ux-path-three-mode`, live in the queue)

Formalize checklist / simplified / live-map as three renderers over the existing `nextStepsOverview34` graph. The single-model foundation already exists in `assets/operator-route-current.js`; the missing piece is the pan/zoom SVG map renderer plus explicit view-mode switching. Track: `ui-ux`.

### WS4 — UI audit rubric (`ux-audit-rubric`, live in the queue)

Add a fixed-checklist audit under `docs/visual-qa/` (hierarchy, density, consistency, affordance, state feedback, accessibility). Run once per primary screen and file each finding as its own item. Track: `testing-qa`.

### WS5 — Offline / performance track

Genuinely unbuilt but no user is blocked today, so it ranks below content and UX. Build in dependency order: `perf-service-worker`, `perf-indexeddb`, `perf-storage-migration`, `perf-workers`, `perf-update-notice`. Honor the product contract: no install prompt, no telemetry, browser-local only.

### WS6 — Close the modeled items and retire dead runtime

Resolve the remaining `modeled` items to `complete`/reclassified with their proof contracts, then apply the `RUNTIME-COMPACTION.md` retirement lifecycle to Home/Path, Tool Builders, Evidence, Reports, and CSS — last, and only where a live historical layer still loads.

## Historical-test robustness note

Promoting WS3/WS4 grew the queue and raised `q.totals().total` from 638 to 640. `tests/run-v9.31-tests.js` previously asserted `total === 638` exactly, which pinned a mutable, always-growing value — the anti-pattern `BUILDING.md` warns against for historical suites. That assertion was made robust: it now checks `total >= 638` (monotonic growth) and `notes === 556` (the durable pinned denominator), preserving the contract v9.31 actually owns while letting the roadmap grow. Future roadmap items should follow the same rule: assert durable invariants, not frozen totals.

## Definition of "all aims achieved"

- Notes at 556/556 terminal dispositions **and** a healthy modeled-note to product-mechanic ratio.
- All nine engineering tracks complete, no `modeled` limbo, offline/performance complete.
- Path renders three modes over one graph; UI audit passed per screen.
- One current runtime owner per surface; historical layers are fixtures, not live startup.
- Every closed item carries acceptance criteria, validation commands, and proof files.
