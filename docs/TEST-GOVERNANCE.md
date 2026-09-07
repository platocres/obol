# Test Governance

Obol keeps a **lean, honest set of checks**. Their job is narrow and important:
make sure an agent can read the README, build the next Product Build Next item,
and not silently break the product or the README -> Build Next workflow while
doing it. The tests exist to catch that class of mistake, not to freeze every
past release forever.

## PR gates are the forward ratchet

Every pull request runs a lean, honest set of checks. Only **two** are
required in branch protection:

- **`full-historical-regression`** (`.github/workflows/full-regression-pr.yml`) -
  an aggregate gate that turns green only when every regression phase passes.
- **`browser-smoke`** (`.github/workflows/browser-smoke.yml`) - route smoke,
  action-first card UI smoke, full browser smoke, and the deep browser
  ownership proofs.

Keep the branch ruleset requiring exactly those two.

The regression suite still runs as **separate, parallel phase jobs** (syntax,
legacy-core, runtime, cards/UI, notes, current-product, quality, generated-sync)
so a failure points straight at the area that broke instead of forcing a
re-run of one long job one fix at a time. Those phase rows are for diagnosis;
the aggregate `full-historical-regression` gate (which just waits on them via
`needs:` and re-runs nothing) is what merge protection requires. Adding a phase
or moving a check between phases therefore never changes the required set.

## Tests protect current behavior and durable contracts, not frozen per-release state

The regression runner executes the current-behavior suites and current
validators directly against the live repository. It protects durable
properties:

- no duplicate or empty cards, and no unknown card routes;
- no private source-note leakage, and secrets stay redacted in exports/reports;
- no automatic exploit execution (commands remain copy-only guidance);
- one live current runtime/dashboard owner, with working boot and asset wiring;
- Evidence parsing and report lineage stay intact;
- the primary card action spine, evidence/decision guidance, and canonical
  demotion behavior stay intact;
- the README Product Build Next block stays generated from, and in sync with,
  the queue owners and the current release.

There is no per-release replay of old README wording, old queue ids, or old
workflow shapes. When the current release advances, update the current-release
test (`tests/run-v<version>-tests.js`) and the queue owners in place, and prune
the previous release's test rather than accumulating a fossil suite for every
version. Never add product junk, hidden UI copy, fake cards, fake queue
entries, or read-time content injection to keep a stale assertion alive - fix
or delete the stale assertion instead.

## Main checks are after-merge confirmation

`main`, scheduled, and manual runs execute the same complete
`tools/run-historical-contracts.js` runner as post-merge health. They confirm
what the PR already proved; they are not the first place a regression should
appear. That is why `.github/workflows/tests.yml` runs only on main, schedule,
and manual dispatch - never on pull requests or release branches - so PRs show
the two real gates instead of duplicate rows.
