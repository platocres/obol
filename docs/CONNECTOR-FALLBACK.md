# Connector-only GitHub fallback

Some ChatGPT/agent runtimes cannot resolve `github.com`, `api.github.com`, or `raw.githubusercontent.com` from their shell. That is a runtime/network limitation, not permission to stop early, call a PR done, or ask Brandon to finish the build.

## Required behavior

When shell GitHub access fails, switch to the connected GitHub tools and keep working inside the same PR.

Use the connector to:

- check for existing open release/product-hardening PRs before opening a new one;
- fetch repository files with `fetch_file`;
- read branch heads and PR metadata with `get_pr_info` or approved GitHub REST fetches;
- write files with `create_file` and `update_file`, using the blob SHA returned by `fetch_file`;
- inspect CI with `fetch_commit_workflow_runs`, `fetch_workflow_run_jobs`, and `fetch_workflow_job_logs`;
- update the PR description with the release-contract sections required by `tools/validate-release-pr.js`;
- rerun failed jobs only after a failure is plausibly flaky or after metadata-only fixes that do not create a new commit.

A local DNS failure does not weaken the merge-ready rule. The build is not done until the required PR checks pass on the exact head that will be merged.

## Observed DNS failure pattern

If one direct shell diagnostic such as `git ls-remote https://github.com/platocres/obol.git HEAD` returns `Could not resolve host: github.com`, stop retrying local shell GitHub access for that build. Treat the runtime as connector-only until the environment changes.

The next steps are:

- keep the current release branch or PR as the unit of work;
- fetch source, docs, queue owners, and test files through the GitHub connector;
- create or update files through connector writes with full replacement content;
- inspect workflow runs and job logs through the connector;
- fix the same PR until the exact head is green.

Do not downgrade the work to a narrative answer because DNS failed. Do not tell Brandon the build is complete until the PR checks pass.

## File update pattern

`update_file` replaces the entire file. Fetch a narrow range first when the file is large and you only need the current blob SHA:

```text
fetch_file(path="README.md", ref="release/obol-vX.Y", start_line=1, end_line=1)
```

Then fetch the content ranges needed to reconstruct the complete replacement. Do not submit partial file contents to `update_file`; that will truncate the file.

For generated files, prefer the repo's sync scripts when a local clone works. When a local clone does not work, use CI logs from the generated-sync phase as the source of truth for what is out of sync, patch the generated projection carefully, and run the PR checks again.

## Private notes and Git LFS

If direct clone, Git LFS, or raw ENEX access is unavailable, follow `docs/RAW-NOTES-LFS.md` and use the complete packet route:

```text
platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json
```

That fallback proves text-based source re-mining only when the schema-2 manifest reports `complete_cleaned_text`, truncation policy `none`, 556 notes, 29 packets, and zero truncated notes. Do not claim direct raw ENEX access from a GitHub contents pointer or from a runtime that could not materialize the LFS object.

## CI discipline

Use the phase split to fix the real failure instead of guessing:

- `v9-current-product` usually means current release registration, the active release test, queue validation, or version identity;
- `v9-mid-product` usually means note integration, source-cluster progression, note-card placement, or derivation rules;
- `v9-early-product` usually means card UI, route registration, field notes, accessibility, or tool-builder contracts;
- `generated-sync` means README, changelog, release docs, runtime owners, or generated queue projections are stale;
- `quality-preservation` means PR governance, release-contract sections, release quality, README history ownership, or one-open-PR uniqueness;
- `browser-smoke` means real rendered route behavior, console cleanliness, request budgets, or screenshot-backed visual/runtime proof.

Do not call the build merge-ready because most checks passed. A failed required check means keep building on the same PR until the exact head is green.
