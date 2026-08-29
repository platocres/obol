# Obol - Offensive Box Operations Ledger

Obol is a static, offline-capable browser workspace for OSCP-style labs, Active Directory practice, and CTFs. It combines target tracking, methodology guidance, command building, Evidence review, Next Steps, and report drafting without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v6.6**

Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Architecture, source-accounting, Evidence, and release contracts live in the dedicated engineering documents linked below instead of being duplicated here.

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

The **North Star Dashboard** is the single in-app owner for project-wide hard numbers. v6.6 makes its default view intentionally scan-friendly. Detailed engineering metrics, source-fidelity accounting, and the complete Build Next queue remain available as drill-downs.

## Project status

Obol keeps methodology breadth and source-depth/source-fidelity accounting separate. A broad methodology section can be represented while subordinate source material still needs decomposition or end-to-end review.

Current v6.6 baseline:

- **95 / 127** canonical sections fully implemented
- **32** partial
- **0** gaps
- **0** stale mappings
- **75%** fully implemented
- **100%** represented
- **1 / 17** methodology source files atomized
- **7 / 34** frozen partial baselines decomposed
- **5 / 19** inventoried atomic units fidelity-complete
- **41** items in the live Build Next queue
- **0** implemented-quality repairs
- **0** mapped-delivery repairs

v6.6 intentionally does not increase these numbers. It consolidates how project truth is derived and presented so future methodology work can move faster without multiplying bookkeeping.

The detailed definitions, pinned provenance, denominators, completion language, and audit requirements live in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md). The current presentation boundary is `C.projectModel66(...)`, which derives Dashboard and README status from the existing domain models instead of maintaining competing copies of the same counts.

## Permanent North Star requirements

This section is permanent. The pinned source links below must not be removed or silently replaced.

- Obol models its Active Directory methodology from the Orange Cyberdefense 2025.03 mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Source repository: https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Keep comparing Obol against the pinned source and preserve reproducible source provenance.
- Do not confuse normalized canonical representation with exhausting useful source depth. Canonical breadth, source inventory, broad-owner coverage, and atomic source fidelity remain separate measures.
- Every useful source element must ultimately be modeled end to end, explicitly superseded with rationale, or explicitly rejected with rationale.
- Preserve unfinished denominators. Unatomized source files and undecomposed frozen baselines remain visibly pending rather than disappearing from percentages.
- Review upstream tool choices instead of copying them blindly. Prefer current, practical, user-friendly tools when they improve the operator workflow.
- Account for whether the operator is working from Kali or Windows at each relevant step.
- Source integration must improve Next Steps, command controls, copy/paste Evidence interpretation, cleanup/restoration where relevant, lineage, and reporting.
- Command controls should expose meaningful options without turning every command into an unnecessary wall of switches.
- Project-wide progress belongs in one North Star Dashboard. Home may summarize it and link to it, but must not create a second competing accounting surface.
- UI and UX should be reviewed continuously for navigation clarity, version hygiene, understandable terminology, and useful progressive disclosure.
- Broad card ownership, 100% represented coverage, or a terminal audit label alone never proves the source has been fully mined.

The complete accounting contract is in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md). The source-depth work plan is in [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md).

## Build next

The block below is generated from the same current project model used by the North Star Dashboard. The Dashboard remains the full interactive view; CI prevents the README snapshot from drifting.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same current project model used by the North Star Dashboard. Do not edit it manually.

**Current live queue:** 41 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps.
**Canonical methodology:** 95/127 fully implemented (75%), 32 partial, 0 gaps, 100% represented.
**Source fidelity:** 1/17 source files atomized, 7/34 partial baselines decomposed, 5/19 inventoried atomic units fidelity-complete.
**Current phase:** Architecture consolidation.

**Highest-priority live items:**
1. **ESC13 issuance-policy / group-link template path** — adcs.md · source fidelity.
2. **ESC15 application-policy injection for Schannel** — adcs.md · source fidelity.
3. **ESC15 application-policy injection for request-agent use** — adcs.md · source fidelity.
4. **ESC4 writable certificate-template ACL** — adcs.md · source fidelity.
5. **ESC7 ManageCA officer transition** — adcs.md · source fidelity.
6. **ESC7 ManageCertificates enable / issue / retrieve path** — adcs.md · source fidelity.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Recent changes

- **v6.6** - consolidated current project status behind one derived model, rebuilt the Dashboard around an overview-first design with drill-downs, shortened the README, split durable engineering contracts into dedicated docs, centralized the Node-side current runtime loader, and changed release scaffolding so releases add only the behavior-specific surfaces they actually need.
- **v6.5** - delivered the first five atomic source-fidelity units end to end and advanced only the broad canonical parents whose inventoried depth was actually exhausted.
- **v6.4** - introduced atomic source-fidelity accounting below the 127-section canonical layer and separated broad ownership from end-to-end fidelity completion.

## Engineering docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - architecture ownership, consolidation boundary, and legacy-layer compaction strategy.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) - methodology, source-depth, source-fidelity, denominators, and Build Next accounting.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - durable Evidence and proof-boundary rules.
- [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - source-depth audit plan.
- [`BUILDING.md`](BUILDING.md) - release workflow, validation tiers, and exact-head merge-readiness contract.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

## Architecture direction

Obol grew through additive release overlays while the product model was still changing. Those historical layers remain where they still encode behavior protected by regression tests, but v6.6 establishes a consolidation boundary:

- project status has one current projection model;
- Dashboard and README consume that model instead of recalculating progress independently;
- Node-side tooling shares one current runtime loader;
- release scaffolding is delta-based, so a release does not create empty methodology, Dashboard, or Evidence shims merely for version symmetry;
- future runtime compaction should replace one stable ownership area at a time, prove regression equivalence, then remove only the layers that are genuinely superseded.

This is intentionally not a rewrite. The goal is a smaller set of explicit owners without trading visible technical debt for hidden regressions.

## Run locally

Open `index.html` in a browser. No server or package install is required.

## Validation

Lightweight release-branch smoke validation:

```bash
node tools/release-smoke.js
```

Current-release regression suite:

```bash
node tests/run-v6.6-tests.js
```

Coherent release preflight:

```bash
node tools/release-preflight.js
```

README/Dashboard synchronization:

```bash
node tools/sync-readme-build-next.js --check
```

Release quality gate:

```bash
node tools/validate-release-quality.js
```

The exact release and merge-readiness rules are owned by [`BUILDING.md`](BUILDING.md).

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
