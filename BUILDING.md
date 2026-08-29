# Obol Build and Release Workflow

This file is a mandatory companion to `README.md` and `CHANGELOG.md` for future Obol build work. Build agents should read all three before changing release architecture, methodology, Evidence behavior, reporting, CI, or project metrics.

## Incremental release policy

**Incremental commits on a single draft release PR are encouraged. Intermediate CI/preflight failures are acceptable while the PR is Draft. The release may not leave Draft or be merged until repository quality debt, release preflight, README synchronization, release-contract validation, and the complete historical regression suite pass on the exact final head.**

The intended release flow is:

- create exactly one `release/obol-vX.Y` branch from current `main`
- open exactly one draft PR for that release immediately
- push incremental, coherent commits to that same PR as methodology, Evidence, core/Dashboard, UI, tests, docs, README, and changelog work is completed
- treat red intermediate checks as normal development state while the PR remains Draft
- do not create a second build/release PR to work around a red intermediate state
- before leaving Draft, regenerate the README Build Next block and run the repository release contract, release preflight, and current release regression suite
- require `implemented-quality = 0` and `mapped-delivery = 0` before a release that expands canonical methodology coverage can be considered merge-ready
- once the draft snapshot is coherent, make the exact final release-branch commit with `[release-final]` in its commit message; this explicitly triggers the complete historical `test` job while the PR is still Draft
- require that pre-ready `test` run, release preflight, release-quality gate, and README synchronization to pass on that exact final head before marking the PR Ready for review
- mark the PR Ready for review only after the exact final head is green; the `ready_for_review` event may run the complete `test` job again and that result becomes the protected merge check
- if another commit is pushed after a green run, treat the previous result as superseded and require the new head to pass again before merge

The `[release-final]` trigger exists to avoid a circular gate: draft PRs normally skip the expensive complete historical chain, but policy requires that chain to pass before a release leaves Draft. It is a finalization signal, not an iterative development test runner. Do not put `[release-final]` on ordinary work-in-progress commits.

Release-PR metadata enforcement applies only to release-intent pull requests. Normal documentation, maintenance, and CI-fix PRs still run the regression suite and required status checks, but they are not required to use a release branch name or release-description template.

## Quality-debt ordering

`C.buildNext52(lanes)` remains the source of truth for release work ordering:

1. implemented-quality repairs
2. mapped-delivery repairs
3. canonical gaps

A canonical-gap expansion release must not skip priority 1 or priority 2 debt. The release process should fail closed when either class is nonzero rather than relying on a release-specific test author to remember the rule.

## Merge-readiness rule

A release is merge-ready only when the exact final head is green. Earlier failed or cancelled runs are development history and do not block merge once superseded, but earlier green runs do not authorize a newer untested head.
