# Obol Build and Release Workflow

This file is a mandatory companion to `README.md`, `CHANGELOG.md`, and `docs/ORANGE-SOURCE-DEPTH.md` for future Obol build work. Build agents should read all four before changing release architecture, methodology, Evidence behavior, reporting, CI, project metrics, or Orange source-depth accounting.

## Incremental release policy

**Incremental commits on a single draft release PR are encouraged. Ordinary release-branch commits run only lightweight smoke validation. The current-release regression gate runs only when a commit explicitly contains `[preflight]` or `[release-final]`, and the complete historical regression chain runs only for `[release-final]`, ready-for-review pull requests, and `main`. The release may not leave Draft or be merged until repository quality debt, release preflight, README synchronization, release-contract validation, and the complete historical regression suite pass on the exact final head.**

The intended release flow is:

- create exactly one `release/obol-vX.Y` branch from current `main`
- open exactly one draft PR for that release immediately
- push incremental, coherent commits to that same PR as methodology, Evidence, core/Dashboard, UI, tests, docs, README, and changelog work is completed
- ordinary release commits run `node tools/release-smoke.js`, which checks JavaScript syntax and local `index.html` asset references without requiring the release to be complete
- use a commit containing `[preflight]` when the current release snapshot is coherent enough to run `node tools/release-preflight.js`; do not use `[preflight]` as an every-commit test trigger
- do not create a second build/release PR to work around a failed smoke, preflight, or historical run
- before leaving Draft, regenerate the README Build Next block and run the repository release contract, release preflight, current release regression suite, and historical-test future-safety validator
- require `implemented-quality = 0` and `mapped-delivery = 0` before methodology expansion can be considered merge-ready
- when canonical gaps are zero, use the v6.2 source-depth baseline rather than declaring Orange complete; audited baseline items must become explicitly modeled, superseded, or rejected with a reason
- once the draft snapshot is coherent, make the exact final release-branch commit with `[release-final]` in its commit message; this runs smoke validation, release preflight, and the complete historical `test` job while the PR is still Draft
- require that exact final head to pass smoke, preflight, historical-test future safety, the complete historical regression chain, release-quality gate, release-contract validation, and README synchronization before marking the PR Ready for review
- mark the PR Ready for review only after the exact final head is green; the `ready_for_review` event may run the complete `test` job again and that result becomes the protected merge check
- if another commit is pushed after a green final run, treat the previous result as superseded and require the new head to pass again before merge

The three validation tiers are intentionally different:

1. **Smoke** — every release-branch push; syntax plus local asset-reference sanity only.
2. **Preflight** — commits containing `[preflight]` or `[release-final]`; current-release wiring, historical-test future safety, repository release contract, quality debt, current release regressions, and README synchronization.
3. **Final historical validation** — `[release-final]`, ready-for-review PRs, and `main`; complete historical regression chain plus the permanent quality and synchronization gates.

This keeps incremental work visible without leaving a trail of full-suite failures for temporary development states. A smoke failure still means the commit itself is malformed and should be repaired, but ordinary incomplete release work is no longer expected to satisfy current-release or historical regression contracts.

`tools/validate-historical-tests.js` protects future releases from brittle historical assertions. Historical suites must test their historical model invariants and structural live-output contracts rather than hard-coding the current README version, current Build Next totals, or other mutable live-release values.

Release-PR metadata enforcement applies only to release-intent pull requests. Normal documentation, maintenance, and CI-fix PRs still run the regression suite and required status checks, but they are not required to use a release branch name or release-description template.

## Quality-debt and methodology ordering

`C.buildNext52(lanes)` remains the base source of truth for release work ordering through canonical coverage, and v6.2 extends it with `C.buildNext62(lanes)` when the source-depth phase is active:

1. implemented-quality repairs
2. mapped-delivery repairs
3. canonical gaps
4. source-depth audits from the frozen v6.2 partial-section baseline

A methodology-expansion release must not skip priority 1 or priority 2 debt. Canonical gaps outrank source-depth work while any gaps remain. Once gaps reach zero, source-depth audits become the active Orange completion queue.

The 127-section canonical denominator measures structural representation. The separate v6.2 source-depth denominator measures whether the useful detail under the 34 partial sections has actually been reviewed. Future builds must not equate 100% represented with Orange being exhausted. See `docs/ORANGE-SOURCE-DEPTH.md` for the audit states, required review dimensions, and completion target.

## Merge-readiness rule

A release is merge-ready only when the exact final head is green. Earlier failed or cancelled runs are development history and do not block merge once superseded, but earlier green runs do not authorize a newer untested head.
