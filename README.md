# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs.

Live site: `https://platocres.github.io/obol/`

Current release: **v6.6**

## What Obol does

Obol keeps the operator in the loop. It never executes commands, installs tools, scans, authenticates, pivots, or exploits. The working loop is:

**Targets → Evidence → Next Steps → operator runs a command externally → Evidence review → Next Steps recalculation → Report**

The five primary views are **Home**, **Targets**, **Evidence**, **Next Steps**, and **Report**. Advanced/reference surfaces live under **More**, including the North Star Dashboard, Engagement Map, Methodology, Tool Library, Planned Work, Workspace Search, Evidence Lineage, Guide, and Workspace Data.

Obol is browser-local plain HTML/CSS/JavaScript with no backend, build step, account system, or telemetry.

## Project status

v6.6 is an architecture-consolidation release. It intentionally leaves methodology progress unchanged while making the project easier to reason about and extend.

- **Canonical methodology:** 95 / 127 fully implemented, 32 partial, 0 gaps, 0 stale, **75% fully implemented**, **100% represented**.
- **Source audit:** 1 / 17 methodology files atomized, 7 / 34 frozen partial baselines decomposed, 5 / 19 inventoried atomic units fidelity-complete.
- **Quality debt:** 0 implemented-quality repairs and 0 mapped-delivery repairs.
- **Build Next:** 41 live items, beginning with the highest-priority remaining atomic source-fidelity audit.

**Canonical breadth is not source exhaustion.** The 127 canonical sections measure structural representation. The separate atomic source-fidelity ledger measures whether useful subordinate source material has actually been reviewed and translated through Obol's complete operator loop.

The North Star Dashboard is the single in-app location for project-wide hard numbers. Beginning with v6.6, the Dashboard and this README consume the same current project model rather than maintaining competing progress calculations.

## Architecture and engineering docs

The README is the entry point, not the place where every durable engineering contract lives.

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture, ownership boundaries, the v6.6 consolidation boundary, and the strategy for safely compacting historical runtime layers.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) — canonical breadth, source-depth, atomic source-fidelity accounting, denominator rules, and completion language.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) — conservative Evidence and proof semantics.
- [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) — source-depth/source-fidelity audit plan.
- [`BUILDING.md`](BUILDING.md) — mandatory release workflow, CI tiers, quality ordering, and exact-head merge readiness.
- [`CHANGELOG.md`](CHANGELOG.md) — complete release history. **The readme is not a changelog.**

### v6.6 consolidation rule

Obol grew through additive release overlays while the product model was still being discovered. Those layers are technical debt, but they also contain working behavior protected by the regression suite. v6.6 therefore does not attempt a risky rewrite.

Current project progress now has one projection boundary, `C.projectModel66(...)`. Dashboard, README synchronization, and release-quality tooling consume it. Historical runtime layers stay in place until an ownership area can be replaced with regression-equivalent consolidated code and then removed deliberately.

Future releases should extend or replace an owner intentionally instead of appending another project-status panel or parallel current-count calculation.

## Command behavior contract

The permanent command rule is:

> The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.

That means options with operational meaning should be available through **proper GUI based toggles** or similarly clear controls rather than being hidden inside an overloaded default command. Commands also need explicit execution context so Obol can help an operator who is **operating from Kali or from a Windows host** without pretending the two environments are interchangeable.

Obol generates commands for humans to review and run elsewhere. It does not silently execute them.

## Evidence / paste-in review

Paste terminal output or other text evidence into **Evidence**. Obol normalizes supported transcript formats, reconstructs activities where confidence is sufficient, and records only facts supported by the relevant Evidence contract.

Command recognition is not success. Tool startup is not execution. Discovery is not access. Credential, certificate, or ticket material is not privilege. A failed or ambiguous action does not manufacture a convenient opposite conclusion.

See [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) for the durable proof rules.

## Permanent North Star requirements

**Do not remove this section.** It is the short project-entry version of the permanent North Star contract. Detailed accounting lives in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md).

The canonical source is the Orange Cyber Defense mind map, pinned to the 2025.03 Active Directory snapshot:

- `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg`
- `https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main`
- upstream commit `6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e`
- AD tree `51b414fc0c0a1a4414e86986ec5e2b5225a6d698`

Permanent requirements:

- Keep the pinned **127 canonical** section denominator structurally stable unless the canonical snapshot itself is deliberately revised.
- Fully implement the Orange source rather than treating a broad parent card as proof that useful subordinate branches have been mined.
- Preserve source structure, branch conditions, prerequisites, meaningful variants, tool choices, transitions, cleanup/restoration obligations, and outcomes well enough to drive operator decisions.
- Every useful upstream element must end as implemented end-to-end, explicitly superseded with rationale, or explicitly rejected with rationale. Broad owner mapping is never enough by itself.
- Keep canonical breadth, source inventory/decomposition, and atomic source fidelity as separate metrics. **100% represented must never be described as fully mining Orange.**
- Maintain the machine-readable atomic source-fidelity ledger and keep unfinished denominators visible.
- Use the source material to improve practical product behavior, including **improving "Next Steps"**, Evidence interpretation, decision paths, execution context, command controls, cleanup, lineage, and reporting.
- Tool choices must be reviewed rather than copied mechanically from upstream. Better maintained or clearer operator options may supplement or supersede an upstream tool when the rationale is explicit.
- When meaningful command behavior is optional, expose **proper GUI based toggles** or equivalent semantic controls rather than hiding behavior in an opaque one-liner.
- New methodology must **fit well into the reporting that Obol performs**, with traceability from the decision path and preserved Evidence to report-ready proof.
- Facts, artifacts, credentials, access, privilege, execution, and compromise remain separate proof boundaries. Source/accounting metadata never creates engagement facts.
- The UI and UX should always be reviewed when capability is added. Project health belongs in the North Star Dashboard rather than being duplicated across Home, Methodology, Guide, or README.
- Preserve the human-run safety boundary and browser-local workspace compatibility.

## Using Obol

Open the live GitHub Pages site or serve the repository as static files. Create/select a target, set relevant parameters, and use Targets/Methodology/Next Steps to generate a command or decide what to investigate. Run that command yourself in the appropriate environment, paste the resulting output into Evidence, review the interpretation, and continue from the recalculated Next Steps.

Workspace exports are browser-local data snapshots. Sanitized export keeps the same workspace structure while redacting secret values intended not to leave the working copy.

## Development

Read [`BUILDING.md`](BUILDING.md) before changing release architecture, methodology, Evidence behavior, reporting, CI, project metrics, or source-fidelity accounting.

Release work uses one `release/obol-vX.Y` branch and one draft PR. Ordinary commits receive smoke validation. `[preflight]` runs the current-release gate. `[release-final]` runs the full release and historical chain. A release is merge-ready only when the exact final head is green and the protected Ready-for-review run also succeeds.

## To-do

### North Star objectives

- Continue consuming the live Build Next queue in quality-first order.
- Complete source-fidelity audits for already-inventoried atomic units before broadening source inventory when higher-priority debt is zero.
- Continue decomposing the remaining frozen partial baselines until useful source depth is explicitly accounted for.
- Compact historical runtime ownership incrementally behind regression-equivalent replacements rather than through a rewrite.
- Keep the Dashboard, README, release tooling, and future status consumers on the consolidated current project model.

### Recent changes

- **v6.6** — consolidated current project status into one derived model, simplified the North Star Dashboard into an at-a-glance overview with drill-downs, split durable contracts out of the README, and established the safe runtime-compaction boundary without changing methodology or Evidence semantics.
- **v6.5** — completed the first five atomic source-fidelity units, advanced canonical coverage to 95 / 127 implemented, and reduced Build Next to 41 items while preserving conservative proof boundaries.
- **v6.4** — introduced atomic source-fidelity accounting and the machine-readable ledger, separating source-depth/fidelity progress from the 127-section canonical breadth metric.

For older releases, see [`CHANGELOG.md`](CHANGELOG.md).

### Build next

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit it manually.

**Current live queue:** 41 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps.
**Canonical methodology:** 95/127 fully implemented (75%), 32 partial, 0 gaps, 100% represented.
**Orange source fidelity:** 1/17 source files atomized, 7/34 partial baselines decomposed, 5/19 inventoried atomic units fidelity-complete.
**Next priority:** **ESC13 issuance-policy / group-link template path** — source fidelity.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->
