# Obol - Offensive Box Operations Ledger

Obol is a static, offline-capable browser workspace for OSCP-style labs, Active Directory practice, and CTFs. It combines target tracking, methodology guidance, command building, Evidence review, Next Steps, and report drafting without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v8.8**

Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Architecture, source-accounting, Evidence, and release contracts live in dedicated engineering documents instead of being duplicated here. **The readme is not a changelog.**

## Use Obol

Obol is plain HTML, CSS, and JavaScript with no backend, no build step, no telemetry, and no automatic command execution. Engagement state stays in the browser unless the operator explicitly exports it.

**Human-run commands only.** Obol builds and explains commands, but the operator runs them externally in an authorized environment and returns the output for review.

The normal loop is:

`Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`

Command recognition is not success. Facts are created only from explicit supported Evidence. The durable proof rules are documented in [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Navigation

Primary navigation stays intentionally small:

- **Home** - resume the active context and see a compact project-status summary.
- **Targets** - manage scope and the single Nmap discovery/scan workflow.
- **Evidence** - review terminal/tool output and structured imports before applying proposed state.
- **Next Steps** - evidence-grounded work for the active context.
- **Report** - inspect proof readiness and build a reproducible report draft.

The **More** menu contains North Star Dashboard, Engagement Map, Methodology, Tool Library, Planned Work, Workspace Search, Evidence Lineage, Guide, and Workspace Data.

The **North Star Dashboard** is the single in-app location for project-wide hard numbers. v8.8 completes the final whole-file inventory for `valid_user.md`, taking the pinned Orange 2025.03 methodology-bearing source set to 17/17 files atomized and 334/334 inventoried atomic units fidelity-complete.

## Project status

Current v8.8 baseline:

- **127 / 127** canonical sections fully implemented
- **0** partial
- **0** gaps
- **0** stale mappings
- **100%** fully implemented
- **100%** represented
- **17 / 17** methodology source files atomized
- **34 / 34** frozen partial baselines decomposed
- **334 / 334** inventoried atomic units fidelity-complete
- **0** items in the live methodology/source Build Next queue
- **0** implemented-quality repairs
- **0** mapped-delivery repairs

The **127 canonical** denominator measures structural breadth. The historical **34-row** denominator preserves the sections that were partial at the v6.2 boundary. The **17-file** denominator measures whole-file source inventory. The **334-unit** ledger measures atomic source fidelity. These remain separate measures even now that all four are complete.

v8.8 reviews the final `valid_user.md` source family across password-policy review, lockout-aware password spraying, user-equals-password validation, AS-REP roastable-user discovery, AS-REP roasting, blind-Kerberoast source variants, and the pinned CVE-2022-33679 branch. Nine source units are represented by mature preferred owner surfaces and nine redundant, specialized, or brittle source variants are explicitly superseded with rationale rather than silently omitted.

Under the pinned Orange 2025.03 snapshot and Obol's current audit contract, whole-file source inventory and atomic source fidelity are now complete. Future methodology changes require a deliberate upstream repin or a newly identified quality defect rather than silently reopening completed denominators.

The detailed definitions, pinned provenance, denominators, completion language, and audit requirements live in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md). The completed source-depth plan is in [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md).

## Permanent North Star requirements

This section is permanent. The pinned source links and product contracts below must not be removed or silently replaced.

- Obol models its Active Directory methodology from the **Orange Cyber Defense mind map**, pinned to the 2025.03 snapshot: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Source repository: https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Keep comparing Obol against the pinned source and preserve reproducible source provenance.
- Do not confuse normalized canonical representation with source depth. Canonical breadth, source inventory, broad-owner coverage, and atomic source fidelity remain separate measures.
- Every useful source element must ultimately be modeled end to end, explicitly superseded with rationale, or explicitly rejected with rationale.
- Preserve completed and unfinished denominators rather than making work disappear from percentages.
- Maintain the machine-readable **atomic source-fidelity ledger** and enough upstream structure to preserve prerequisites, branches, variants, transitions, tools, outcomes, cleanup, and reporting implications.
- Review upstream tool choices instead of copying them blindly. Prefer current, practical, user-friendly tools when they improve the operator workflow.
- Account explicitly for **operating from Kali or from a Windows host** at each relevant step.
- Source integration must include **Next Steps**, command generation or an explicit supersession rationale, copy/paste Evidence interpretation, cleanup/restoration where relevant, lineage, and reporting.
- Meaningful optional command behavior belongs in **proper GUI based toggles** or equivalent semantic controls instead of opaque default one-liners.
- New methodology must **fit well into the reporting that Obol performs**, with traceability from decision path and preserved Evidence to report-ready proof.
- Project-wide progress belongs in one North Star Dashboard. Home may summarize it and link to it, but must not create a second competing accounting surface.
- **The UI and UX should always be reviewed** for navigation clarity, version hygiene, understandable terminology, and useful progressive disclosure when capability changes.
- Broad card ownership, 100% represented coverage, 100% canonical implementation, or a terminal audit label alone never proves the source has been fully mined.
- Facts, artifacts, credentials, access, privilege, execution, and compromise remain separate proof boundaries. Project/source accounting metadata never creates engagement facts.

## Command behavior

The permanent command rule is:

> The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.

Obol generates commands for humans to review and run elsewhere. It does not silently execute them, infer that tool startup means success, or treat credential material as privilege.

## Engineering docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - architecture ownership, consolidation boundary, and legacy-layer compaction strategy.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) - methodology, source-depth, source-fidelity, denominators, and Build Next accounting.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - durable Evidence and proof-boundary rules.
- [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - source-depth audit plan and completion record.
- [`BUILDING.md`](BUILDING.md) - release workflow, validation tiers, and exact-head merge-readiness contract.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

## Architecture direction

Obol grew through additive release overlays while the product model was still changing. Those historical layers remain where they still encode behavior protected by regression tests. v6.6 established the consolidation boundary, v6.8 added stable current-project pointers, and v8.8 keeps current status consumers on those stable boundaries:

- project status has one current projection model exposed through `C.currentProjectModel(...)`;
- Dashboard and README consume that model instead of recalculating progress independently;
- Node-side tooling shares one current runtime loader;
- release scaffolding is delta-based, so a release does not create empty methodology, Dashboard, or Evidence shims merely for version symmetry;
- historical UI overlays must become inactive when a later release owns the same version surface;
- future runtime compaction should replace one stable ownership area at a time, prove regression equivalence, then remove only the layers genuinely superseded.

With the pinned Orange source queue complete, regression-equivalent runtime compaction and UX refinement become the natural next engineering work unless the upstream methodology is deliberately repinned.

## To-do

### North Star objectives

- Preserve the completed 127/127 canonical, 34/34 frozen-baseline, 17/17 whole-file, and 334/334 atomic-fidelity denominators as regression-protected milestones.
- Keep the live methodology/source queue empty unless a real quality defect is discovered or the pinned upstream snapshot is deliberately changed.
- Compact historical runtime ownership one stable area at a time behind regression-equivalent replacements.
- Improve navigation, progressive disclosure, terminology, and operator flow without creating competing project-status surfaces.
- Keep Dashboard, README, release tooling, and future status consumers on the stable consolidated current project model.

### Recent changes

- **v8.8** - completed whole-file source inventory for `valid_user.md`, reviewed eighteen final source units, advanced file-level inventory to 17/17, expanded the atomic ledger to 334/334, closed the live methodology/source queue, and preserved explicit proof and supersession boundaries.
- **v8.7** - completed whole-file source inventory for `trusts.md`, reviewed thirty-four source units, advanced file-level inventory to 16/17, and expanded the atomic ledger to 316/316.
- **v8.6** - completed whole-file source inventory for `know_vuln_auth.md`, reviewed sixteen source units, advanced file-level inventory to 15/17, and expanded the atomic ledger to 282/282.

For older releases, see [`CHANGELOG.md`](CHANGELOG.md) and the versioned documents under `docs/`.

### Build next

The block below is generated from the same current project model used by the North Star Dashboard. The Dashboard remains the full interactive view; CI prevents the README snapshot from drifting.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit it manually.

**Current live queue:** 0 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps.
**Canonical methodology:** 127/127 fully implemented (100%), 0 partial, 0 gaps, 100% represented.
**Orange source fidelity:** 17/17 source files atomized, 34/34 partial baselines decomposed, 334/334 inventoried atomic units fidelity-complete.
**Current phase:** Orange source fidelity complete.

**Highest-priority live items:**
No queued items.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required.

## Validation

```bash
node tools/release-smoke.js
node tests/run-v8.8-tests.js
node tools/release-preflight.js
node tools/sync-readme-build-next.js --check
node tools/validate-release-quality.js
```

The exact release and merge-readiness rules are owned by [`BUILDING.md`](BUILDING.md).

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
