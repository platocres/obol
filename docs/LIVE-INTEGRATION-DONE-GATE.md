# Live Integration Done Gate

Product Build Next work is not done until the product change is live-integrated into the consuming surface.

## No orphan artifacts

A PR must not claim Product Build Next completion when the change exists only as a disconnected data file, fixture, doc, hidden registry, loose proof artifact, or PR-body promise.

The changed output must be visible or consumable on the live route, card, dashboard, tool, analyzer, report, or runtime surface that owns it.

## Evidence ingestion for command and analyzer work

A command, tool card, proof control, analyzer, or path item that expects pasted terminal output, browser-observation text, or proof notes is not live-integrated until Evidence ingestion knows what to do with that output.

Evidence ingestion must emit conservative activities and outcome facts for the relevant card. It must not promote raw output into unsupported access, impact, session-compromise, or report-ready proof.

## Forbidden completion language

A PR that closes a Product Build Next item must not also say the same item has:

- `remaining integration`
- `later pass should wire`
- `not visible yet`
- `additive proof artifact only`
- `needs to be wired into live surfaces`
- `dashboard/runtime integration remains`

Those phrases are allowed only when the work is deliberately left queued with a named blocker and a separate Product Build Next item ID.

## Completion checklist

Before a Product Build Next item leaves `queued` status, the PR must prove:

- the changed output is visible or consumable on the intended live surface;
- direct links to affected live routes/cards are in the PR body;
- runtime or lazy-bundle load order is updated when needed;
- queue/progress status changed only after live wiring exists;
- tests assert both the data artifact and the live integration path that consumes it;
- Evidence ingestion is tested for any command, tool-card, proof-control, analyzer, or path item that expects pasted output;
- the PR body does not describe required follow-up integration for a claimed-complete item;
- deferred useful findings include a blocker reason, owning surface, and Product Build Next gap ID.

## Source re-mining rule

If a PR adds `data/product-hardening/*remining*.js`, the matching release test must prove that the artifact is loaded by a live route or current-release extension, updates public field notes/path bindings/progress, and changes the generated Product Build Next state when relevant.

A test that only imports the artifact and checks its metadata is not enough.

## Same-surface work rule

Buildable same-surface work must be built in the current pass or explicitly blocked. `docs/SAME-SURFACE-GAP-PARKING-GUARD.md` owns the rule.

## Generated artifact sync

When generated release artifacts are part of the PR, keep the head on a human-authored commit after bot sync if the branch rules require regression and browser checks against the latest SHA. A bot-generated artifact-sync head can otherwise leave required checks unattached to the mergeable head even when the generated files are correct.
