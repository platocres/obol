# Obol - Offensive Box Operations Ledger

Obol is a static, offline-capable browser workspace for OSCP-style labs, Active Directory practice, and CTFs. It combines target tracking, methodology guidance, command building, Evidence review, Next Steps, and report drafting without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v7.5**

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

The **North Star Dashboard** is the single in-app location for project-wide hard numbers. Its overview-first v6.6 layout remains the current presentation shell, while v7.5 atomizes the pinned SCCM source family, completes twenty-three SCCM fidelity units, advances the six SCCM parents that were still frozen partial at the v6.2 boundary, and continues the live Build Next queue into admin source inventory. Detailed engineering metrics, source-fidelity accounting, and the complete Build Next queue remain available as drill-downs.

## Project status

Obol keeps methodology breadth and source-depth/source-fidelity accounting separate. A broad methodology section can be represented while subordinate source material still needs decomposition or end-to-end review.

Current v7.5 baseline:

- **117 / 127** canonical sections fully implemented
- **10** partial
- **0** gaps
- **0** stale mappings
- **92%** fully implemented
- **100%** represented
- **6 / 17** methodology source files atomized
- **24 / 34** frozen partial baselines decomposed
- **93 / 93** currently inventoried atomic units fidelity-complete
- **10** items in the live Build Next queue
- **0** implemented-quality repairs
- **0** mapped-delivery repairs

The **127 canonical** section denominator measures structural breadth. It is deliberately separate from source-depth and atomic source-fidelity progress. v7.5 advances only `sccm.elevate1`, `sccm.elevate2`, `sccm.elevate3`, `sccm.takeover2`, `sccm.creds2`, and `sccm.creds5`, the six `sccm.md` parents that remained partial at the frozen v6.2 source-depth boundary. SCCM reconnaissance, PXE/NAA recovery, distribution-point credential recovery, SCCM MSSQL database takeover, computer-admin NAA recovery, administrative execution, cleanup, and post-exploitation mapping retain their historical canonical completion while gaining deeper atomic source accounting. Completing 93/93 currently inventoried units does **not** mean the pinned Orange source is exhausted: the frozen 34-section v6.2 source-depth denominator is preserved, with 10 broad source-inventory/decomposition items still live.

The detailed definitions, pinned provenance, denominators, completion language, and audit requirements live in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md). The current presentation boundary is the stable `C.currentProjectModel(...)` pointer, backed by `C.projectModel75(...)` in v7.5.

## Permanent North Star requirements

This section is permanent. The pinned source links and product contracts below must not be removed or silently replaced.

- Obol models its Active Directory methodology from the **Orange Cyber Defense mind map**, pinned to the 2025.03 snapshot: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Source repository: https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Keep comparing Obol against the pinned source and preserve reproducible source provenance.
- Do not confuse normalized canonical representation with exhausting useful source depth. Canonical breadth, source inventory, broad-owner coverage, and atomic source fidelity remain separate measures.
- Every useful source element must ultimately be modeled end to end, explicitly superseded with rationale, or explicitly rejected with rationale.
- Preserve unfinished denominators. Unatomized source files and undecomposed frozen baselines remain visibly pending rather than disappearing from percentages.
- Maintain the machine-readable **atomic source-fidelity ledger** and enough upstream structure to preserve prerequisites, branches, variants, transitions, tools, outcomes, cleanup, and reporting implications.
- Review upstream tool choices instead of copying them blindly. Prefer current, practical, user-friendly tools when they improve the operator workflow.
- Account explicitly for **operating from Kali or from a Windows host** at each relevant step.
- Source integration must include **improving "Next Steps"**, command generation, copy/paste Evidence interpretation, cleanup/restoration where relevant, lineage, and reporting.
- Meaningful optional command behavior belongs in **proper GUI based toggles** or equivalent semantic controls instead of opaque default one-liners.
- New methodology must **fit well into the reporting that Obol performs**, with traceability from decision path and preserved Evidence to report-ready proof.
- Project-wide progress belongs in one North Star Dashboard. Home may summarize it and link to it, but must not create a second competing accounting surface.
- **The UI and UX should always be reviewed** for navigation clarity, version hygiene, understandable terminology, and useful progressive disclosure when capability changes.
- Broad card ownership, 100% represented coverage, or a terminal audit label alone never proves the source has been fully mined.
- Facts, artifacts, credentials, access, privilege, execution, and compromise remain separate proof boundaries. Project/source accounting metadata never creates engagement facts.

The complete accounting contract is in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md). The source-depth work plan is in [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md).

## Command behavior

The permanent command rule is:

> The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.

Obol generates commands for humans to review and run elsewhere. It does not silently execute them, infer that tool startup means success, or treat credential material as privilege.

## Engineering docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - architecture ownership, consolidation boundary, and legacy-layer compaction strategy.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) - methodology, source-depth, source-fidelity, denominators, and Build Next accounting.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - durable Evidence and proof-boundary rules.
- [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - source-depth audit plan.
- [`BUILDING.md`](BUILDING.md) - release workflow, validation tiers, and exact-head merge-readiness contract.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

## Architecture direction

Obol grew through additive release overlays while the product model was still changing. Those historical layers remain where they still encode behavior protected by regression tests. v6.6 established the consolidation boundary, v6.8 added stable current-project pointers, and v7.5 continues using those pointers while extending source accounting through AD CS, Kerberos delegation, ACL / ACE control paths, MITM / relay paths, authenticated mapping, and SCCM:

- project status has one current projection model exposed through `C.currentProjectModel(...)`;
- Dashboard and README consume that model instead of recalculating progress independently;
- Node-side tooling shares one current runtime loader;
- release scaffolding is delta-based, so a release does not create empty methodology, Dashboard, or Evidence shims merely for version symmetry;
- historical UI overlays must become inactive when a later release owns the same version surface;
- future runtime compaction should replace one stable ownership area at a time, prove regression equivalence, then remove only the layers that are genuinely superseded.

This is intentionally not a rewrite. The goal is a smaller set of explicit owners without trading visible technical debt for hidden regressions.

## To-do

### North Star objectives

- Consume the live Build Next queue in quality-first order.
- Decompose the remaining frozen partial baselines into meaningful source nodes before claiming new source-fidelity completion.
- Preserve completed source-family atomic ledgers as historical, regression-protected denominators while new source families are inventoried.
- Continue decomposing the frozen partial baseline until useful source depth is explicitly accounted for.
- Compact historical runtime ownership one stable area at a time behind regression-equivalent replacements.
- Keep Dashboard, README, release tooling, and future status consumers on the stable consolidated current project model.

### Recent changes

- **v7.5** - atomized the pinned `sccm.md` family into twenty-three meaningful units, reused mature SCCM reconnaissance, PXE, credential-recovery, takeover, execution, cleanup, and post-mapping owners, added focused site-system relay, forced/automatic client-push, MSSQL-server relay, policy-request, and site-database credential owners, advanced the six frozen SCCM partial parents, and moved Build Next into admin source inventory.
- **v7.4** - atomized the pinned `authenticated.md` family into nineteen meaningful units, reused mature BloodHound, AD CS, SCCM, Kerberoasting, Entra, lateral-movement, and vulnerability-specific owners, added focused classic-enumeration, posture-assessment, and authenticated-coercion owners, advanced the three frozen authenticated partial parents, and moved Build Next into SCCM source inventory.
- **v7.3** - atomized the pinned `mitm.md` family into ten meaningful units, modeled listener, NTLM LDAP(S)/SMB/HTTP/MSSQL/NETLOGON and Kerberos HTTP/SMB/LDAP(S) relay paths, explicitly superseded obsolete MS08-068 self-relay as a preferred modern workflow, advanced the remaining frozen `mitm.listen` parent, preserved the historical NTLM and Kerberos relay canonical milestones, and moved Build Next into authenticated source inventory.

For older releases, see [`CHANGELOG.md`](CHANGELOG.md).

### Build next

The block below is generated from the same current project model used by the North Star Dashboard. The Dashboard remains the full interactive view; CI prevents the README snapshot from drifting.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit it manually.

**Current live queue:** 10 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps.
**Canonical methodology:** 117/127 fully implemented (92%), 10 partial, 0 gaps, 100% represented.
**Orange source fidelity:** 6/17 source files atomized, 24/34 partial baselines decomposed, 93/93 inventoried atomic units fidelity-complete.
**Current phase:** Orange source inventory and decomposition.

**Highest-priority live items:**
1. **Additional admin credential sources** — admin.md · source depth inventory.
2. **Poisoning** — no_creds.md · source depth inventory.
3. **Unauthenticated coercion** — no_creds.md · source depth inventory.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required.

## Validation

```bash
node tools/release-smoke.js
node tests/run-v7.5-tests.js
node tools/release-preflight.js
node tools/sync-readme-build-next.js --check
node tools/validate-release-quality.js
```

The exact release and merge-readiness rules are owned by [`BUILDING.md`](BUILDING.md).

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
