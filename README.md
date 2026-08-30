# Obol - Offensive Box Operations Ledger

Obol is a static, offline-capable browser workspace for OSCP-style labs, Active Directory practice, and CTFs. It combines target tracking, methodology guidance, command building, Evidence review, Next Steps, and report drafting without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v7.7**

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

The **North Star Dashboard** is the single in-app location for project-wide hard numbers. Its overview-first presentation remains the current shell. v7.7 atomizes the pinned `no_creds.md` family into thirty-one source-fidelity units, explicitly supersedes the deprecated Nmap `-sP` spelling and the redundant Bettercap DHCPv6 alternative, advances the remaining frozen poisoning and unauthenticated-coercion parents, deepens the already-complete no-credential discovery/enumeration/PXE/TimeRoast parents, and moves the live Build Next queue into `lat_move.md` source inventory.

## Project status

Obol keeps methodology breadth and source-depth/source-fidelity accounting separate. A broad methodology section can be represented while subordinate source material still needs decomposition or end-to-end review.

Current v7.7 baseline:

- **120 / 127** canonical sections fully implemented
- **7** partial
- **0** gaps
- **0** stale mappings
- **94%** fully implemented
- **100%** represented
- **8 / 17** methodology source files atomized
- **27 / 34** frozen partial baselines decomposed
- **149 / 149** currently inventoried atomic units fidelity-complete
- **7** items in the live Build Next queue
- **0** implemented-quality repairs
- **0** mapped-delivery repairs

The **127 canonical** section denominator measures structural breadth. It is deliberately separate from source-depth and atomic source-fidelity progress. v7.7 advances only `no_creds.poisoning` and `no_creds.coerce`, the two `no_creds.md` parents that remained partial at the frozen v6.2 source-depth boundary. Historical no-credential completions retain their original milestones while gaining deeper atomic source accounting. Completing 149/149 currently inventoried units does **not** mean the pinned Orange source is exhausted: the frozen 34-section v6.2 source-depth denominator is preserved, with 7 broad source-inventory/decomposition items still live.

The detailed definitions, pinned provenance, denominators, completion language, and audit requirements live in [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md). The current presentation boundary is the stable `C.currentProjectModel(...)` pointer, backed by `C.projectModel77(...)` in v7.7.

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

Obol grew through additive release overlays while the product model was still changing. Those historical layers remain where they still encode behavior protected by regression tests. v6.6 established the consolidation boundary, v6.8 added stable current-project pointers, and v7.7 continues using those pointers while extending source accounting through AD CS, Kerberos delegation, ACL / ACE control paths, MITM / relay paths, authenticated mapping, SCCM, admin access, and no-credential paths:

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

- **v7.7** - atomized the pinned `no_creds.md` family into thirty-one meaningful units, preserved the deprecated Nmap `-sP` spelling and redundant Bettercap DHCPv6 alternative as superseded source outcomes, reused mature discovery, SMB, LDAP, Kerberos, PXE, TimeRoast, and MITM-listener owners, added focused DHCPv6, ARP-interception, and unauthenticated-coercion owners, advanced the remaining frozen poisoning/coercion parents, and moved Build Next into lateral-movement source inventory.
- **v7.6** - atomized the pinned `admin.md` family into twenty-five meaningful units, preserved the legacy pre-July-2022 PPLdump path as superseded, reused mature LSASS, SAM, LSA, DPAPI, and token owners, added focused protected-LSASS, session impersonation, AD CS-backed impersonation, profile-discovery, KeePass, and AD Connect owners, advanced the remaining frozen `admin.misc` parent, and moved Build Next into `no_creds.md` source inventory.
- **v7.5** - atomized the pinned `sccm.md` family into twenty-three meaningful units, reused mature SCCM reconnaissance, PXE, credential-recovery, takeover, execution, cleanup, and post-mapping owners, added focused site-system relay, forced/automatic client-push, MSSQL-server relay, policy-request, and site-database credential owners, advanced the six frozen SCCM partial parents, and moved Build Next into admin source inventory.

For older releases, see [`CHANGELOG.md`](CHANGELOG.md).

### Build next

The block below is generated from the same current project model used by the North Star Dashboard. The Dashboard remains the full interactive view; CI prevents the README snapshot from drifting.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit it manually.

**Current live queue:** 7 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps.
**Canonical methodology:** 120/127 fully implemented (94%), 7 partial, 0 gaps, 100% represented.
**Orange source fidelity:** 8/17 source files atomized, 27/34 partial baselines decomposed, 149/149 inventoried atomic units fidelity-complete.
**Current phase:** Orange source inventory and decomposition.

**Highest-priority live items:**
1. **Certificate-based movement** — lat_move.md · source depth inventory.
2. **MSSQL movement** — lat_move.md · source depth inventory.
3. **WebDAV coercion** — low_access.md · source depth inventory.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required.

## Validation

```bash
node tools/release-smoke.js
node tests/run-v7.7-tests.js
node tools/release-preflight.js
node tools/sync-readme-build-next.js --check
node tools/validate-release-quality.js
```

The exact release and merge-readiness rules are owned by [`BUILDING.md`](BUILDING.md).

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
