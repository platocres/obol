## Summary

-
-
-

## Live cards / surfaces

Required for any user-visible product change. Link the exact surface a maintainer should inspect after deploy.

- Live route(s):
- Direct card/tool/path/report route(s):
- Dashboard surface, if applicable:

## Product Build Next item(s)

- Item ID(s):
- Status change(s):
- Acceptance criteria satisfied:

## Live Integration Done Gate

Product Build Next work is not complete while its output is only a disconnected artifact, fixture, data file, hidden registry, loose doc, or proof file.

- [ ] The changed output is wired into the live route, card, dashboard, tool, analyzer, report, or runtime surface that consumes it.
- [ ] Direct user-visible route/card links are included above when a surface is affected.
- [ ] Runtime or lazy-bundle load order is updated when the new output must execute before another projection.
- [ ] Queue/progress status was changed only after live visibility wiring existed.
- [ ] Tests assert both the data artifact and the live integration path that consumes it.
- [ ] The PR does not claim completion while also saying the same item has `remaining integration`, needs a `later pass`, is `not visible yet`, or is an `additive proof artifact only`.
- [ ] Deferred useful findings have named blockers, blast-radius reasons, missing-source proof, private-only reasons, or product-gap IDs.

For re-mining artifacts, run:

```bash
node tools/validate-live-integration-done-gate.js data/product-hardening/<artifact>.js
```

## Tests

```bash

```

## Safety / source-boundary notes

- Raw course text, target details, flags, credentials, cookies, screenshots, exploit recipes, listener/callback mechanics, and reusable replay steps remain private.
- Public Obol contains only rewritten, generalized, public-safe guidance and product logic.
