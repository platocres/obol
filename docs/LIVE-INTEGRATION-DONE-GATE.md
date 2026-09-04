# Live Integration Done Gate

No orphan artifacts. This is the hard stop that prevents orphan artifacts from being counted as completed Product Hardening work.

## Rule

Product Build Next work is not done until the product change is live-integrated into the surface that consumes it.

A PR may not claim completion for a card, path note, tool, analyzer, dashboard metric, note-mining output, queue item, or generated product surface when the changed output only exists as a disconnected artifact, document, fixture, hidden registry, loose data file, or future-facing proof file.

## Forbidden completion language

Do not present a PR as complete for an item if the PR body, release note, or final response still says any of the following about that same item:

- `remaining integration`
- `later pass should wire`
- `not visible yet`
- `additive proof artifact only`
- `needs to be wired into live surfaces`
- `dashboard/runtime integration remains`

Those phrases are allowed only when they refer to a deliberately queued follow-up item with a named blocker or product-gap ID. They are not allowed for the queue item being marked complete.

## Completion checklist

Before moving any Product Build Next item out of `queued`, prove all applicable items below:

- The changed output is visible on the intended live route.
- Direct card, tool, path, dashboard, or report links are listed in the PR body when a user-visible surface is affected.
- Runtime or lazy-bundle load order is updated when the new output needs to execute before another projection.
- Queue and progress status are updated only after live visibility wiring exists.
- Tests assert both the data artifact and the live integration path that consumes it.
- The PR body does not describe required follow-up work for the item being claimed complete.
- Any deferred useful finding has a named blocker, blast-radius reason, missing-source proof, private-only reason, or product-gap ID.

## Source re-mining specific rule

Source re-mining is product development, not artifact staging. If a PR adds a file matching `data/product-hardening/*remining*.js`, the release test must also prove at least one live integration route for that artifact.

Acceptable proof includes one or more of:

- `data/runtime-manifest.js` loads the artifact before the route, dashboard, notes-impact, or progress projection that consumes it.
- The artifact self-integrates into `OBOL_NOTE_INTEGRATION`, `OBOL_PRODUCT_HARDENING_NOTE_PROGRESS`, a current Tool Builder owner, a current Evidence analyzer, a report owner, or an operator route owner.
- A route/card test proves `#/card/<card-id>`, `#/path`, `#/dashboard`, a Tool Builder card, or another user-visible route can reach the new output.

A test that only imports the artifact and checks its metadata is not enough.

## PR body requirement

When a PR claims a user-visible product change, the PR body must include a `Live cards / surfaces` section or equivalent wording that tells the maintainer where to look after deploy. For card work, include direct `#/card/<card-id>` routes.

## Validator

Run the done-gate validator in any release that adds note re-mining, cards, path notes, tools, analyzers, dashboard metrics, or generated product outputs:

```bash
node tools/validate-live-integration-done-gate.js data/product-hardening/<artifact>.js
```

The validator is intentionally conservative. It does not prove browser rendering by itself. It catches the exact failure mode where an artifact is created, tested in isolation, and described as done without being wired into the live product.