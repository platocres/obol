# Test Governance

Obol tests have two jobs, and they should not be confused.

## PR gates are the forward ratchet

Pull requests must run the strict gates that keep new work clean before merge. The required PR surface is intentionally small and meaningful:

- the eight named jobs in `.github/workflows/full-regression-pr.yml`;
- `browser-smoke`, including route smoke, action-first card UI smoke, full browser smoke, and deep browser ownership proofs.

This keeps PRs around eight to nine meaningful checks instead of stacking duplicate smoke/preflight/test rows on top of the real gates.

## Historical tests preserve behavior, not old queue state forever

Historical release tests should protect durable behavior and safety properties:

- no duplicate or empty cards;
- no private source-note leakage;
- no unknown card routes;
- no automatic exploit execution;
- no stale dashboard owner;
- no broken Evidence parsing or report lineage;
- no loss of action spine, evidence guidance, decision guidance, or canonical demotion behavior.

Historical release tests should not freeze mutable current state forever. A test is stale when it says an old release must remain the current release, an old queue item must remain the next queue item, or an old cluster must remain the latest completed cluster after a later release legitimately advances the ledger.

When a stale historical-state assertion fails, fix the test contract. Do not add product junk, hidden UI copy, fake cards, fake queue entries, or inert product markers just to satisfy the old assertion.

## Main checks are after-merge confirmation, not the first discovery point

`main`, scheduled, and manual runs still execute `tools/run-historical-contracts.js` as a complete preservation proof. Those runs should confirm what the PR already proved. They should not be the first place a real regression appears.

That is why `.github/workflows/tests.yml` no longer runs on pull requests or release branches. PRs use the split full-regression workflow and browser workflow directly. Main keeps the complete runner for repository health.

## How to update old tests

When a release advances the Product Build Next queue or source-note cluster ledger:

- update the new release test to prove the new integration and new queue handoff;
- demote the previous release test from exact current-state equality to monotonic historical proof;
- keep item-specific validators strict for touched or newly mined content;
- leave legacy debt visible in the queue instead of pretending every old card already meets the newest rubric.

Good replacement pattern:

- Bad: `latestCompletedClusterId === 'old-cluster-id'`
- Good: the old cluster remains recorded as completed, the new cluster is latest, and the next queue item is coherent.

- Bad: `Current release: **v9.77**` must appear forever.
- Good: the current release is at least v9.77 and the v9.77 artifact remains registered or historically proven.

- Bad: current README must keep old handoff wording forever.
- Good: current README points to the active queue, and durable historical facts live in release docs or owned validator fixtures.
