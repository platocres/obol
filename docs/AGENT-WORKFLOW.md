# Obol agent build loop

This is the detailed, do-this-now workflow for an agent told to "read the README and keep developing." The README keeps a short **Continue developing (start here)** summary; this document holds the full mechanics so the README can stay lean.

The workflow is shared by ChatGPT 5.5 High and Opus 4.8 High. Make the task, ownership, and evidence explicit so a build does not depend on one model remembering an entire conversation. `AGENTS.md` and `CLAUDE.md` point here; they do not own separate queues or competing build policies.

## 1. Orient from current state

1. Read `README.md`, this file, [BUILDING.md](../BUILDING.md), and [TEST-GOVERNANCE.md](TEST-GOVERNANCE.md). Follow relevant owner links before changing their area. If the user requests all linked documents, read them all; the focused reading path does not override that request.
2. Inspect the actual base/head commits and local changes. Check open PRs. Continue the active release/product-hardening PR rather than opening a competing one. Use [CONNECTOR-FALLBACK.md](CONNECTOR-FALLBACK.md) when shell access fails.
3. Follow the user's current request. For ordinary continuation, the generated **Product Build Next** block in README is the queue authority. Its sources are `data/product-hardening/product-hardening-queue.js` and `data/product-hardening/work-packages.js`; the Dashboard consumes the same owners.
4. Read the owner docs named by that handoff. The Claude UX plan is a separate lane and applies only when the user explicitly selects it. Release history and completed audit narratives are context, not instructions to restart completed work.

## 2. Make the work reviewable before expanding it

Put a compact work brief in the existing PR description, or in working notes until the PR can be opened. This is a description of this task, not another build queue:

```text
Task source: user request or Product Build Next item/package IDs
Base and working head: commit SHAs; branch and PR
Goal: observable result
Acceptance: behavior that must pass, including a relevant failure case
Owners: authored files, live consumers, generated outputs
Scope boundary: related work included; unrelated work deferred and why
Validation: focused commands; browser scenario if presentation changes
```

Start with the highest-priority unblocked item unless directed otherwise. Batch related live items only while they share ownership, migration risk, and validation strategy. Each item advanced still needs its own acceptance criteria, validation commands, proof files, and item-specific coverage in `data/product-hardening/item-test-contracts.js`. A larger model context window is not a reason to combine unrelated work.

## 3. Trace the source to the live consumer

Before editing, find the authored owner, its callers, and any generated projection. Read the relevant existing implementation and test; do not infer ownership from a filename alone. [ARCHITECTURE.md](ARCHITECTURE.md) and `data/runtime-manifest.js` describe these boundaries.

Edit authored sources, then regenerate. Do not insert patches into `assets/obol-app-current.js` or another generated bundle. Do not add a versioned overlay or a temporary CI source-rewriting script to work around an unclear source location. Inspect surrounding code and the failing diagnostic before trying another patch.

Product behavior must reach its real consuming route or state boundary. Registry entries, dashboard counters, and isolated unit assertions alone do not prove a live integration. Follow [PROOF-CONTRACT.md](PROOF-CONTRACT.md), [ACTIONABLE-CARD-CONTRACT.md](ACTIONABLE-CARD-CONTRACT.md), and the selected ownership area's standards.

## 4. Build and check one coherent increment

- Implement the acceptance criteria through the existing owners. Prefer a small vertical change that can be exercised end to end, then extend it to the other closely related items in scope.
- For a bug, preserve a reproducing regression when practical. Test observable behavior and meaningful negative cases; do not mirror the implementation or freeze incidental prose and filenames.
- Run the focused test or validator for the changed behavior. Use the phase map in [TEST-GOVERNANCE.md](TEST-GOVERNANCE.md) when a whole ownership area needs checking. `tools/scope-check.js` remains a broad local fallback, not a cheap substitute for selecting the relevant test.
- Run `node tools/sync-generated.js --write` after changes to generated inputs, then `node tools/sync-generated.js --check`. Inspect the diff, including generated outputs, before committing. These commands neither commit nor publish changes.
- For UI changes, exercise the real route at desktop and mobile widths and inspect the rendered result. For state changes, cover migration, missing input, and conservative failure behavior as applicable. Existing CI browser proof remains required.
- Read the first failing diagnostic before broadening testing. If a repair fails again, revisit the source/consumer boundary and reproduce the failure locally or from CI logs. Repeated speculative commits do not count as progress.

## 5. Use notes only when the task calls for them

Source-note mining is complete. Do not restart it because an older document describes re-mining as active. Check Product Build Next and `data/product-hardening/note-progress-current.js` before selecting note work.

When the user or live queue explicitly reopens note-derived work, follow [NOTE-MINING-WORKFLOW.md](NOTE-MINING-WORKFLOW.md), [RAW-NOTES-LFS.md](RAW-NOTES-LFS.md), and [NOTE-DERIVATION-STANDARD.md](NOTE-DERIVATION-STANDARD.md). That conditional workflow preserves the complete-source, derivation, live-integration, path-placement, and per-dimension proof requirements. Keep private source expression out of public Obol.

## 6. Release or maintain according to the actual change

[BUILDING.md](../BUILDING.md) owns the release decision and artifact checklist. Product-affecting builds require release history and the applicable release artifacts. Maintenance limited to development tooling, CI, or documentation does not need a product-version bump when it leaves product behavior, queue state, generated product outputs, and visible release identity unchanged.

Open one normal, non-draft PR as soon as a coherent initial diff exists. Keep implementation, tests, documentation, and any item status changes together on that PR. Do not merge it automatically.

## 7. Review separately from implementation

Make a separate review pass over the diff against the work brief. Ask whether the real consumer uses the change, negative cases preserve the contract, generated files reproduce, and each completion claim has direct proof. Do not weaken a failing assertion merely to turn a check green. If it protects obsolete shape, identify and retain the behavior it was meant to protect before replacing it.

Every PR runs the complete regression phases and browser proof. `[preflight]`, `[full-regression]`, and `[release-final]` commit markers are not needed to trigger PR checks. Required checks on the final head are the merge-readiness evidence; earlier green commits are not proof for a newer commit. Record blockers honestly when a check cannot run.

## 8. Leave a factual handoff

Before switching models or pausing a build, update the same PR description with a compact snapshot. A new agent should verify the branch and queue against the live repository before resuming:

```text
PR / branch / current head:
Task and acceptance criteria:
Implemented and directly verified:
Changed authored owners and generated outputs:
Tests run and the commit they prove:
Remaining failures or uncertainty:
Next concrete action:
Required files/docs to read:
```

Distinguish implemented behavior from queued/model-only work. Include test commands and relevant CI run links, not a transcript of every attempt. A handoff does not advance queue status or make an untested head merge-ready.
