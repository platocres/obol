# Obol Build and Release Workflow

Read this with [README.md](README.md) and [docs/AGENT-WORKFLOW.md](docs/AGENT-WORKFLOW.md). [docs/TEST-GOVERNANCE.md](docs/TEST-GOVERNANCE.md) owns the live CI contract. [docs/PRODUCT-HARDENING.md](docs/PRODUCT-HARDENING.md) owns queue accounting and item-specific Definition of Done.

## Current validation policy

Every normal, non-draft PR runs the complete regression phases and the browser proof workflow. The required gates are `full-historical-regression` and `browser-smoke`. The former aggregates the phase jobs without running them twice. `main`, scheduled, and manual runs confirm repository health after merge.

Commit markers such as `[preflight]`, `[full-regression]`, and `[release-final]` are historical conventions, not a way to opt into or out of PR validation. Use ordinary descriptive commit messages. Local `tools/release-smoke.js` and `tools/release-preflight.js` remain available, but their names do not describe separate required PR jobs.

During editing, run the changed behavior's focused tests. For an ownership-area check, use `node tools/run-historical-contracts.js --phase <phase>` with the phase map in [docs/TEST-GOVERNANCE.md](docs/TEST-GOVERNANCE.md). `node tools/scope-check.js` remains a broad local fallback. Do not copy a growing list of old release suites into the inner loop.

Do not retire a behavioral test merely because it is old or slow. Move useful assertions into current-owner tests when replacing release-shaped coverage. Remove obsolete wording, filename, and version-snapshot assertions only after identifying the durable behavior and retaining its protection. Never add fake UI content or queue records to satisfy a stale test. The phase runner owns CI test registration.

## Decide whether this is a product release

Every product-affecting build must update [CHANGELOG.md](CHANGELOG.md). Versioned product-hardening builds follow the checklist below, including changes to product behavior, queue state, generated product outputs, or visible release identity.

Documentation, CI, and development-tooling maintenance can use an ordinary maintenance branch and PR without bumping the website version when those product surfaces stay unchanged. Do not create a release scaffold just to document a workflow fix. PR metadata enforcement is release-intent aware; maintenance PRs do not need to impersonate releases.

For a product release:

1. Update `data/current-release.js` to the next `vX.Y`. Use `vX.Y.Z` for a follow-up fix to an unreleased head. Keep the browser workspace/schema identity `C.VERSION` separate from the product version.
2. Add `docs/vX.Y.md`, beginning with `# Obol vX.Y`, and author its `## What changed` bullets. The changelog synchronizer can create the current entry from that summary; it does not replace the need to author or review release notes. If the current changelog entry already exists, review it explicitly when the summary changes.
3. Add or update `tests/run-vX.Y-tests.js` so it invokes `tools/validate-release-pr.js` and checks current release identity without pinning future releases to an old literal. Register new durable behavior tests in the appropriate `tools/run-historical-contracts.js` phase. Retain existing behavioral coverage when replacing older release-shaped tests.
4. Update each changed queue item's acceptance criteria, validation commands, proof files, and item-specific tests before advancing its disposition.
5. Run `node tools/sync-generated.js --write`, review all generated diffs, then run `node tools/sync-generated.js --check`.
6. Run the focused behavior tests, `node tools/validate-current-release.js`, and `node tools/validate-release-pr.js --repo-only`. PR CI also validates the release metadata and open-PR uniqueness.
7. Update the PR description and require the full regression and browser gates on the final head before calling the release merge-ready.

## One active PR and one coherent work package

Check open PRs before creating a release, product-hardening, dashboard, queue, or burn-down PR. Continue the active release/product-hardening PR if one exists. Keep one normal, non-draft PR open through implementation and failed checks; do not close and recreate it to escape a failure.

Prefer a `release/obol-vX.Y` branch for product releases. A documented agent branch (`claude/…`, `codex/…`, `agent/…`, or `hardening/…`) can carry a release when needed. The title must still identify `Obol vX.Y` or `Release vX.Y`, agree with the release being shipped, and satisfy `tools/validate-release-pr.js`. Product-hardening release descriptions need Summary, README handoff, Product-hardening queue, Validation added, and Compatibility sections.

Open the PR as soon as GitHub permits a coherent initial diff. A minimal scaffold or governance commit is acceptable when a branch difference is required. Push reviewed increments to that same PR. Required checks, not Draft status, are the merge gate.

For ordinary continuation, the highest-priority unblocked Product Build Next item is the entry point. The user can explicitly select other work. `data/product-hardening/work-packages.js` groups related items that share ownership, dependencies, and validation strategy. Complete as much related work as can be fully reviewed and proven in that context; stop expansion when ownership, migration risk, or test strategy changes.

Each item remains atomic for proof. `tools/validate-product-hardening-queue.js` requires acceptance criteria, validation commands, and proof files in `data/product-hardening/item-test-contracts.js` or its loaded current extension before a status-bearing item leaves `queued`. A passing broad suite alone cannot close a queue item. `parallelSafe` and `relatedItems` metadata do not create permission for competing release PRs or unrelated scope.

## Generated files and authored owners

Use the existing generators through one sequential entrypoint:

```bash
node tools/sync-generated.js --list
node tools/sync-generated.js --write
node tools/sync-generated.js --check
```

No argument defaults to check mode. `--write` explicitly rewrites projections and stops on the first failure; it is not transactional, so inspect partial changes if a generator fails. Check mode runs all generators and reports all failures without rewriting tracked files. The command does not commit, push, publish, or change queue dispositions. `BUILDING.md` is authored documentation, not a generated text-replacement target.

| Authored source | Generated projection | Generator |
| --- | --- | --- |
| Runtime manifest and domain ledger | `assets/obol-domain-current.js` | `tools/sync-domain-current.js` |
| Runtime manifest and core ledger | `assets/obol-core-current.js` | `tools/sync-core-current.js` |
| Runtime manifest, application ledger, release and current route owners | `assets/obol-app-current.js` | `tools/sync-app-current.js` |
| Runtime manifest and exact-owned fragments | Exact runtime bundles named in the manifest | `tools/sync-runtime-bundles.js` |
| Runtime manifest and stylesheet sources | `assets/obol-current.css` | `tools/sync-current-styles.js` |
| `data/current-release.js` | README release line and `index.html` identity | `tools/sync-current-release.js` |
| Current queue, package, and progress owners | README Product Build Next | `tools/sync-product-build-next.js` |
| Current model's completed Orange accounting | Retired methodology/source README projection check | `tools/sync-readme-build-next.js` |
| Authored `docs/vX.Y.md` summary | Missing current `CHANGELOG.md` entry | `tools/sync-current-changelog.js` |

Runtime generation precedes consumers that load current bundles. Updating release identity alone does not regenerate the application bundle; the unified command includes both generators. A source change and its resulting generated diff belong in the same reviewed commit.

Generated synchronization runs in the existing `generated-sync` regression phase. The optional release-branch synchronization workflow uses the same command. Inspect any later bot commit as a new head and verify its checks; never infer merge readiness from the head that preceded it. If shell access fails, follow [docs/CONNECTOR-FALLBACK.md](docs/CONNECTOR-FALLBACK.md) instead of hand-patching bundles.

## Runtime and compatibility boundaries

Product-hardening releases are delta-based. A new version does not justify `core-vX.Y.js`, `app-vX.Y.js`, `project-model-vX.Y.js`, stylesheet overlays, no-op wrappers, or parallel registries. Evolve stable owners and generate their projections.

`data/runtime-manifest.js` is the shared browser/Node load-order authority; `tools/current-runtime.js` consumes it. Current release identity comes from `data/current-release.js`. Queue state comes from `data/product-hardening/product-hardening-queue.js`, with work-package metadata in `data/product-hardening/work-packages.js`. README and Dashboard consume those same sources.

Compaction must preserve browser-local workspace migration, Evidence semantics, report lineage, and observable route behavior. Request reduction, semantic execution ownership, first-paint protection, and physical retirement are separate claims. Prove equivalence before retiring a live owner or its behavioral tests. Follow [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/RUNTIME-COMPACTION.md](docs/RUNTIME-COMPACTION.md) for the ownership-specific proof boundaries.

The completed Orange/source-note accounting is historical context. Do not invent source debt, restart re-mining from changelog stories, or replace the generated Product Build Next authority with another queue. [docs/NOTE-MINING-WORKFLOW.md](docs/NOTE-MINING-WORKFLOW.md) applies when that work is explicitly reopened.

## Merge-readiness rule

A PR is merge-ready only when the required checks pass for the final head that will be merged. GitHub may run those checks against a synthetic merge commit; confirm that run belongs to the current PR head and base. Earlier failures are development history; earlier green runs do not prove a newer head. Any later commit, including generated artifacts or a merge from main, needs validation again.

Report the head SHA, focused validation, relevant CI links, and any remaining uncertainty in the PR handoff. Do not merge without the user's direction. A normal, non-draft PR is open for review throughout the work; that alone says nothing about readiness.
