# Obol - Offensive Box Operations Ledger

Obol is a static, offline-capable browser workspace for OSCP-style labs, Active Directory practice, and CTFs. It combines target tracking, methodology guidance, command building, Evidence review, Next Steps, and report drafting without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.1**

Current Obol release: **v9.1**

Completed Orange methodology/source baseline: **v8.8**

Open `#/dashboard` for the active Product Hardening Dashboard and Build Next queue. The completed Orange baseline remains visible as a regression-protected baseline summary, but it is no longer the active product queue.

Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Architecture, source-accounting, Evidence, product-hardening, and release contracts live in dedicated engineering documents instead of being duplicated here. **The readme is not a changelog.**

## Use Obol

Obol is plain HTML, CSS, and JavaScript with no backend, no build step, no telemetry, and no automatic command execution. Engagement state stays in the browser unless the operator explicitly exports it.

**Human-run commands only.** Obol builds and explains commands, but the operator runs them externally in an authorized environment and returns the output for review.

The normal loop is:

`Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`

Command recognition is not success. Facts are created only from explicit supported Evidence. The durable proof rules are documented in [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Navigation

Primary navigation stays intentionally small:

- **Home** - resume the active context and see current product-hardening status plus active engagement state.
- **Targets** - manage scope and the single Nmap discovery/scan workflow.
- **Evidence** - review terminal/tool output and structured imports before applying proposed state.
- **Next Steps** - evidence-grounded work for the active context.
- **Report** - inspect proof readiness and build a reproducible report draft.

The **More** menu contains advanced project, methodology, map, tool, lineage, guide, search, and workspace-data surfaces.

The active **Dashboard** route now opens the Product Hardening Dashboard. This is the single dashboard for current product-wide status, and it is the high-level surface for the v9 product queue, runtime consolidation, UI/UX repair, tool-builder coverage, credential modes, manual outcomes, notes integration, offline/performance, and QA.

## Product hardening status

v9.0 created the product-hardening queue and dashboard. v9.1 makes that queue visible from the app dashboard, fixes confusing v8.8/v9 wording, and adds item-specific test contracts so future agents cannot mark product-hardening work as modeled, complete, superseded, or rejected without naming the tests and proof files that support that disposition.

Future agents should read this README, open the product-hardening dashboard, pick the highest-priority Product Build Next item, update the queue data, sync the README, validate, and push one coherent PR. Do not add another product-hardening data/runtime file per release unless there is a real ownership change.

Raw notes are staged privately in `platocres/obol-source-notes`. Public Obol must receive only normalized, derived guidance and implementation changes, not raw course notes or notebook dumps.

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.

**Current product-hardening queue:** 0/632 complete (0%), 74 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.

**Highest-priority live items:**
1. **Create one version authority** — Header, title, settings, report preview, report footer, export metadata, README, and dashboard must consume one current-version source.
2. **Validate every referenced asset** — Parse HTML entrypoints and fail CI when any script, stylesheet, or static asset reference is missing.
3. **Normalize report version identity** — Generated report text and footers must not retain stale historical version strings.
4. **Fix dark-theme link contrast** — Dark-blue links on dark panels need readable contrast, hover, and focus states.
5. **Current runtime entrypoint** — Move toward one current browser entrypoint and one current Node loader boundary instead of expanding historical load arrays forever.
6. **CSS ownership consolidation** — Collapse active styling into a small current set while preserving regressions for historical behavior.
7. **Asset manifest and generated load order** — Generate asset references from a manifest instead of hand-editing long script/link chains.
8. **Dashboard ownership consolidation** — Keep one dashboard owner for project/product progress and avoid release-specific competing status panels.

**Track status:**
- **Critical correctness:** 0/4 complete (0%), 0 modeled.
- **Architecture / runtime:** 0/10 complete (0%), 3 modeled.
- **UI / UX repair:** 0/8 complete (0%), 1 modeled.
- **Tool GUI builders:** 0/18 complete (0%), 0 modeled.
- **Credential modes:** 0/14 complete (0%), 0 modeled.
- **Manual outcomes:** 0/8 complete (0%), 0 modeled.
- **Notes integration:** 0/556 complete (0%), 2 modeled.
- **Offline / performance:** 0/6 complete (0%), 0 modeled.
- **Testing / visual QA:** 0/8 complete (0%), 3 modeled.

Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Completed Orange baseline

The v8.8 baseline remains regression-protected:

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

Under the pinned Orange 2025.03 snapshot and Obol's current audit contract, whole-file source inventory and atomic source fidelity are complete. Future methodology changes require a deliberate upstream repin or a newly identified quality defect rather than silently reopening completed denominators.

## Permanent North Star requirements

This section is permanent. The pinned source links and product contracts below must not be removed or silently replaced.

- Obol models its Active Directory methodology from the **Orange Cyber Defense mind map**, pinned to the 2025.03 snapshot: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Source repository: https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Keep comparing Obol against the pinned source and preserve reproducible source provenance.
- Do not confuse normalized canonical representation with exhausting useful source depth. Canonical breadth, source inventory, broad-owner coverage, and atomic source fidelity remain separate measures.
- Every useful source element must ultimately be modeled end to end, explicitly superseded with rationale, or explicitly rejected with rationale.
- Preserve completed and unfinished denominators rather than making work disappear from percentages.
- Maintain the machine-readable **atomic source-fidelity ledger** and enough upstream structure to preserve prerequisites, branches, variants, transitions, tools, outcomes, cleanup, and reporting implications.
- Review upstream tool choices instead of copying them blindly. Prefer current, practical, user-friendly tools when they improve the operator workflow.
- Account explicitly for **operating from Kali or from a Windows host** at each relevant step.
- Source integration must include improving "Next Steps", command generation or an explicit supersession rationale, copy/paste Evidence interpretation, cleanup/restoration where relevant, lineage, and reporting.
- Meaningful optional command behavior belongs in **proper GUI based toggles** or equivalent semantic controls instead of opaque default one-liners.
- New methodology must **fit well into the reporting that Obol performs**, with traceability from decision path and preserved Evidence to report-ready proof.
- Project-wide progress belongs in one North Star Dashboard for project-wide hard numbers. In v9, that route opens the Product Hardening Dashboard first while the completed Orange North Star accounting remains available as a baseline summary.
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
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - v9 product-hardening tracks and queue rules.
- [`docs/TOOL-BUILDER-COVERAGE.md`](docs/TOOL-BUILDER-COVERAGE.md) - GUI command-builder coverage contract.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private notes source and normalized guidance workflow.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded defects.
- [`BUILDING.md`](BUILDING.md) - release workflow, validation tiers, and exact-head merge-readiness contract.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

## Architecture direction

Runtime compaction should replace one stable ownership area at a time, prove regression equivalence, then remove only genuinely superseded historical layers. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## To-do

### North Star objectives

- Preserve the completed 127/127 canonical, 34/34 frozen-baseline, 17/17 whole-file, and 334/334 atomic-fidelity denominators as regression-protected milestones.
- Keep the live methodology/source queue empty unless a real quality defect is discovered or the pinned upstream snapshot is deliberately changed.
- Compact historical runtime ownership one stable area at a time behind regression-equivalent replacements.
- Improve navigation, progressive disclosure, terminology, and operator flow without creating competing project-status surfaces.
- Keep Dashboard, README, release tooling, and future status consumers on stable current models.

### Recent changes

- **v9.1** - made the app dashboard the active product-hardening dashboard, clarified current release language, preserved v8.8 as the completed Orange baseline, and added item-specific test contracts for product-hardening queue dispositions.
- **v9.0 foundation** - added the product-hardening queue, standalone dashboard, generated Product Build Next block, private notes source pointer, and validation/docs needed for future agents to continue without reopening the Orange queue.
- **v8.8** - completed whole-file source inventory for `valid_user.md`, advanced file-level inventory to 17/17, expanded the atomic ledger to 334/334, closed the live methodology/source queue, and preserved explicit proof and supersession boundaries.
- **v8.7** - completed whole-file source inventory for `trusts.md`, advanced file-level inventory to 16/17, and expanded the atomic ledger to 316/316.

For older releases, see [`CHANGELOG.md`](CHANGELOG.md) and the versioned documents under `docs/`.

### Build next

The block below is generated from the same current project model used by the completed Orange baseline dashboard. CI prevents the README snapshot from drifting.

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

Open `#/dashboard` for the active Product Hardening Dashboard or `product-hardening.html` for the standalone dashboard entrypoint.

## Validation

```bash
node tools/release-smoke.js
node tests/run-v8.8-tests.js
node tools/release-preflight.js
node tools/sync-readme-build-next.js --check
node tools/validate-release-quality.js
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
```

The exact release and merge-readiness rules are owned by [`BUILDING.md`](BUILDING.md).

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
