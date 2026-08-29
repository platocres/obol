# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs.

Live site: `https://platocres.github.io/obol/`

Current release: **v6.4**

Release history belongs in [`CHANGELOG.md`](CHANGELOG.md). **Build agents must review this README, [`BUILDING.md`](BUILDING.md), the changelog, and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) before changing architecture, methodology, Evidence behavior, reporting, CI, release workflow, project metrics, or Orange source-depth/source-fidelity accounting.** `BUILDING.md` owns the incremental draft-PR release policy and exact-head merge-readiness rules.

## Operating model

Obol is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless the operator explicitly exports it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, authenticates to systems, or exploits systems. It helps the operator decide what to try, build a command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

The normal loop is:

`Targets → Evidence → Next Steps → operator runs command externally → Evidence review → Next Steps recalculation → Report`

Command recognition is not success. Output is interpreted conservatively, and only explicit supported evidence may establish facts.

## Current information architecture

Primary navigation stays intentionally small:

- **Home** — resume the active context and see unresolved attention
- **Targets** — manage target scope and the single Nmap discovery/scan workflow
- **Evidence** — review terminal/tool output and structured imports
- **Next Steps** — prioritized, evidence-grounded work for the active context
- **Report** — proof readiness and reproducible reporting

The **More** menu contains North Star Dashboard, Engagement Map, Methodology, Tool Library, Planned Work, Workspace Search, Evidence Lineage, Guide, and Workspace Data.

The **North Star Dashboard** is the single in-app location for project-wide methodology, command UX, Evidence, execution-context, Next Steps mapping, tool-review, reporting, UI/UX, trend, backlog, delivery-debt, delivery-readiness, Build Next, quality-repair, README queue-sync, canonical-progress, Orange source-depth, atomic source-fidelity, and release-contract metrics. Home may show a compact summary and link to it, but project-wide hard numbers belong on the Dashboard.

## Current canonical methodology status

The pinned 2025.03 Active Directory methodology denominator contains **127 canonical sections**.

Current live state:

- **93 / 127 fully implemented**
- **34 partial**
- **0 gaps**
- **0 stale implemented mappings**
- **73% fully implemented**
- **100% represented**

These numbers are methodology accounting only. Parser coverage, reporting coverage, command controls, execution metadata, UI/UX health, delivery readiness, quality-repair metrics, Orange source-depth, and atomic source-fidelity accounting have their own denominators on the North Star Dashboard and do not inflate methodology completion.

A canonical implemented or partial section is delivery-ready only when at least one tracked mapped workflow has a runnable command contract, an explicit copy/paste Evidence profile, explicit execution-side metadata, and reporting traceability.

v6.2 completed the only remaining canonical gap, parent-to-child trust paths. The pinned Orange source describes that direction as the same family of path as child-to-parent; Obol models it explicitly with separate trust-context, secret-material, ticket-artifact, cross-domain-access, and privilege boundaries. Strict completion remains 93/127 and represented coverage remains 100%.

### Canonical breadth is not source exhaustion

**100% represented does not mean Obol has extracted 100% of the useful information in Orange.** The 127-section denominator is a normalized structural inventory. Broad canonical sections can contain subordinate variants, prerequisite distinctions, alternate tools, branch conditions, failure states, artifact handoffs, cleanup obligations, GUI-worthy controls, Evidence signatures, Next Steps transitions, and reporting implications that a broad card may only partially model.

At the v6.2 boundary, the **34 partial canonical sections were frozen as a separate Orange source-depth audit baseline**. Those baseline keys remain persistent even when broad canonical status changes, so subordinate Orange work cannot disappear from accounting.

v6.4 makes that accounting atomic. The Dashboard now separates three layers:

- **Canonical breadth** — 127 normalized sections, currently 100% represented.
- **Source inventory depth** — methodology files and frozen partial baselines decomposed into meaningful subordinate source units.
- **Atomic source fidelity** — each inventoried unit reviewed against the full Obol operator contract and given an explicit terminal disposition.

The first atomized source file is `adcs.md`. Its seven broad partial canonical parents are now decomposed into **19 atomic AD CS source units** across enumeration plus ESC1, ESC2/3, ESC4, ESC5, ESC6, ESC7, ESC8, ESC9/10, ESC11, ESC13, ESC14, ESC15, and meaningful source variants. Initial v6.4 source-fidelity state is **1 / 17 methodology files atomized**, **7 / 34 frozen partial baselines decomposed**, and **0 / 19 inventoried atomic units fidelity-complete**. All 19 already have at least one broad Obol owner, which is intentionally shown as representation rather than completion.

An atomic unit is fidelity-complete only when the source branch and decision conditions are captured, upstream tools and Obol owner mapping are accounted for, tool suitability is reviewed, the Run/GUI command surface is usable, execution side is explicit, copy/paste Evidence and proof boundaries work, Next Steps transitions are wired, cleanup/restoration is handled where relevant, reporting/lineage works, and the unit ends as **modeled**, **superseded**, or **rejected** with rationale.

The permanent plan and completion definition live in [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md). North Star Dashboard owns the hard source-fidelity counts, requirement matrix, and prioritized drill-down. A broad card mapping, 100% canonical representation, or a terminal label by itself must never be treated as proof that Orange is exhausted.

The release-quality invariant introduced in v5.9 remains permanent. `tools/validate-release-quality.js` recalculates the live queue and blocks merge readiness whenever implemented-quality or mapped-delivery debt is nonzero. The gate runs in release preflight and the protected `test` job, so methodology expansion cannot ship while higher-priority delivery debt remains.

The release workflow is documented in [`BUILDING.md`](BUILDING.md): one `release/obol-vX.Y` branch, one visible draft PR, incremental coherent commits, lightweight smoke validation on ordinary pushes, explicit `[preflight]` validation for coherent release snapshots, `[release-final]` for the complete exact-head historical chain, and exact-final-head green validation before merge readiness. Normal documentation and maintenance PRs still receive regression coverage without being forced to impersonate a release PR.

The README/Dashboard backlog synchronization introduced in v5.4 remains permanent. The README Build Next agenda is generated from the same repository model that powers **North Star Dashboard → Build Next**. The dashboard is the authoritative full drill-down, while the README contains a CI-enforced human-readable snapshot of that queue.

## Evidence and proof rules

- Facts, evidence, activity, credentials, progress, reachability, and artifacts remain scoped to the relevant host/domain context.
- Supported, refuted, and inconclusive knowledge remain distinct.
- Typed artifacts preserve producer/consumer lineage and review gates.
- Reachability distinguishes direct, pivot, observed-only, stale, and broken state.
- Successful activity records historical command/evidence snapshots rather than reconstructing current UI state.
- Material foothold, privilege, objective, credential, and network transitions use explicit proof requirements.
- Screenshot checks remain operator-confirmed and external; Obol does not capture or inspect screenshots.
- Generated tickets, certificates, relay listeners, startup banners, discovery output, configuration changes, exploit-module startup, or command presence never silently become access or compromise facts.
- Java RMI registry discovery is not execution; a vulnerability/check result remains distinct from an opened remote session.
- A Log4Shell probe request is not proof. Only an explicit CVE/template match or independently observed callback supports the vulnerability finding.
- Tomcat/JBoss manager reachability, authenticated manager access, deployment, and execution remain separate boundaries.
- Veeam product presence is context only. CVE evidence, recovered reusable credentials, and remote execution each require explicit supporting output.
- Kerberos relay listener startup is not relay success. Certificate or ticket material does not imply administrator or SYSTEM privilege.
- PXE discovery is context only. Protected-PXE hash material and recovered NAA username/password material are separate facts.
- TimeRoast collection produces offline SNTP-MS material; cracking it does not silently establish authenticated access.
- Trust enumeration, recovered trust or krbtgt material, forged/saved Kerberos tickets, and successful cross-domain service access remain separate proof boundaries.
- Parent-to-child trust context or ticket construction does not imply child-domain administrator or SYSTEM access; explicit service access and privilege proof remain separate.
- Source-fidelity accounting is project metadata only. Source-node inventory or audit status never creates engagement facts, credentials, access, execution, privilege, or compromise claims.

## Command behavior contract

The v3.3 command rule remains permanent:

> **The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.**

Nmap remains single-owner under Targets. Rubeus retains its dedicated workbench. Existing semantic command builders and tool-specific GUI controls should be reused rather than duplicated.

A fixed command is not automatically a UX defect. Single-purpose/native commands can remain fixed when additional controls would make the maneuver less clear.

## Permanent North Star requirements

- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg and https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Create infrastructure to keep up with how much of the Orange Cyber Defense mind map and its decision path and tools has been fully implemented and how much remains to be implemented within Obol.
- Consider whether the tools from the Orange Cyber Defense mind map are actually the best, most user friendly tools and if they are not, add better tools to the path.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.
- **Do not confuse normalized canonical representation with exhausting useful Orange source depth. Maintain the frozen v6.2 source-depth baseline and the v6.4 atomic source-fidelity ledger, mine every meaningful branch deeply, and require explicit modeled / superseded / rejected outcomes before claiming Orange is exhausted.**
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.
- Make sure that the data being integrated from the Orange Cyber Defense mind map is improving "Next Steps" and that as users complete each step they are being properly led down the mind map's decision path.
- Make sure that each tool for each step of the path is not only proper, but has the proper GUI based toggles to adjust commands and that OBOL is able to interpret copy/paste evidence from user terminals to improve its ability to determine next steps.
- Make sure that all elements of a path, its tools, and that tool's evidence fit well into the reporting that Obol performs and can be utilized properly in reporting.
- All of this applies both now and retroactively. All tools and paths and evidence collection and reporting need to be fully functional and fully useful from a user's perspective, and intuitive both from a UI and a UX perspective.
- All of this needs to be tracked in a single dashboard I can access when I look at the Obol website with hard numbers and percentages. The dashboard needs to be contained in one place within Obol. The home page can and should mention it, link to it, and highlight important numbers but mentions of "Orange Cyber Defense" should not appear elsewhere.
- The readme is not a changelog and should only contain overviews on changes from the last 3 versions. A changelog should be created and maintained with more verbose history of all changes over time and agents are obliged to check it for a sense of the history of the project on each build attempt. This includes "foundations kept" and parts of the "to-do" list that belong in a change log. There should be a to-do list that lists the north star objectives in one section, recent changes in another section, and a section for what should be built next that the agent should prioritize for the next version.
- The UI and UX should always be reviewed to make sure it is sensible and that version mentions and past aesthetic choices are not bleeding over into various places. Version numbers should be kept up-to-date everywhere.
- “Fully implemented” must not mean merely that every top-level or normalized Orange Cyberdefense section has an Obol workflow mapped to it. Obol must also audit the underlying Orange source material at the meaningful node, subnode, branch, decision-edge, prerequisite, technique-variant, tool, reference, and outcome level. Every useful upstream element must be either implemented end to end in Obol, explicitly superseded by a better Obol approach with rationale, or explicitly rejected as obsolete, redundant, unsafe, or not useful with rationale.

Canonical methodology coverage and Orange source-fidelity coverage must be tracked separately. Reaching 100% representation of the canonical methodology must never be described as having fully mined or fully implemented the Orange Cyberdefense source unless the source-fidelity audit is also complete.

The project must preserve enough upstream structure to determine not only that an Orange section exists, but what subordinate paths exist inside it, what conditions lead to each path, what tools Orange associates with each path, what evidence distinguishes one state from another, and how those branches should influence Obol’s Next Steps, command controls, Evidence interpretation, and reporting.

Partial canonical sections must be decomposed until the remaining Orange depth is explicitly accounted for. No broad Obol card or workflow may silently stand in for multiple materially different Orange branches merely to increase completion metrics.

Whenever the pinned Orange source is reviewed, Obol must maintain a machine-readable source-fidelity ledger mapping meaningful upstream nodes and decision edges to Obol owners, source provenance, branch conditions, tool inventory, operator-side requirements, Evidence/Next Steps/reporting expectations, cleanup obligations, and explicit audit status.

The Dashboard must keep canonical breadth, source inventory depth, broad-owner coverage, atomic audit status, and North Star requirement completion as separate metrics. Source-file and partial-baseline atomization must remain visible until every methodology-bearing source file and every frozen v6.2 partial baseline has been decomposed or explicitly accounted for.

A raw or derived percentage must never hide an unfinished denominator. If a source file has not yet been atomized, it remains visibly pending rather than being omitted from source-fidelity accounting.

## To-do

### North Star objectives

- Keep the pinned 2025.03 methodology denominator, source provenance, decision path, tool review, frozen v6.2 source-depth baseline, and v6.4 atomic source-fidelity ledger reproducible and visible from the single North Star Dashboard.
- Make every represented workflow usable end to end: sensible command controls, explicit Kali/Windows execution context, conservative copy/paste Evidence, Next Steps integration, cleanup/restoration where needed, and reporting traceability.
- Preserve zero canonical gaps while atomizing the remaining methodology source and systematically converting useful atomic Orange depth into modeled, superseded, or explicitly rejected outcomes.
- Prefer tools and command surfaces that are current, understandable, practical for OSCP-style labs, and better for the operator than blindly mirroring an upstream tool choice.
- Preserve context isolation, proof boundaries, lineage, reachability, cleanup obligations, browser-local compatibility, and release-gate integrity while methodology depth increases.

### Recent changes

- **v6.4** — added atomic Orange source-fidelity accounting below the 127-section layer; decomposed the seven broad AD CS partials into 19 atomic source units, added a Dashboard requirement matrix and drill-down, separated broad-owner coverage from fidelity completion, and refined Build Next into atomic fidelity work plus remaining source-inventory work.
- **v6.2** — completed parent-to-child trust paths, reaching 100% canonical representation with 93/127 fully implemented and zero gaps; froze the 34 partial sections as a separate Orange source-depth baseline and promoted source-depth audits into Dashboard/Build Next after higher-priority debt reaches zero.
- **v6.1** — completed PXE/NAA recovery, TimeRoasting, the SCCM PXE/NAA mapping, child-to-parent trust paths, and external/forest trust paths, raising strict completion from 69% to 72% and represented coverage from 95% to 99%; one canonical gap remained.

### Build next

The generated block below is the GitHub-readable agenda snapshot. **North Star Dashboard → Build Next** remains the authoritative full queue. `tools/sync-readme-build-next.js` regenerates this block from the same live repository state, and CI fails if the two drift apart.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit the generated queue manually. The dashboard remains the authoritative full drill-down; this README snapshot is CI-enforced.

**Current live queue:** 46 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 0 canonical gaps.
**Canonical methodology:** 93/127 fully implemented (73%), 34 partial, 0 gaps, 100% represented.
**Orange source fidelity:** 1/17 source files atomized, 7/34 partial baselines decomposed, 0/19 inventoried atomic units fidelity-complete.

**Highest-priority live items:**
1. **AD CS enumeration and routing** — adcs.md · source fidelity.
2. **ESC8 web-enrollment relay** — adcs.md · source fidelity.
3. **ESC1 enrollee-supplied identity template** — adcs.md · source fidelity.
4. **ESC2 any-purpose template routing into ESC3** — adcs.md · source fidelity.
5. **ESC3 enrollment-agent / on-behalf-of request** — adcs.md · source fidelity.
6. **ESC13 issuance-policy / group-link template path** — adcs.md · source fidelity.
7. **ESC15 application-policy injection for Schannel** — adcs.md · source fidelity.
8. **ESC15 application-policy injection for request-agent use** — adcs.md · source fidelity.
9. **ESC4 writable certificate-template ACL** — adcs.md · source fidelity.
10. **ESC7 ManageCA officer transition** — adcs.md · source fidelity.
11. **ESC7 ManageCertificates enable / issue / retrieve path** — adcs.md · source fidelity.
12. **ESC5 vulnerable PKI-object ACL / CA key path** — adcs.md · source fidelity.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Build-agent checklist

Before every build:

- read this README
- read `BUILDING.md` and follow its single draft release PR / incremental commit policy
- read `CHANGELOG.md`
- read `docs/ORANGE-SOURCE-DEPTH.md` before Orange methodology work
- inspect the current North Star Dashboard metrics, delivery-readiness view, quality-repair view, Build Next queue, canonical backlog, source-depth inventory, atomic source-fidelity ledger, and North Star requirement matrix
- branch from refreshed current `main` directly to exactly one `release/obol-vX.Y` branch and open exactly one draft release PR immediately
- push incremental coherent commits to that same draft PR; ordinary commits should rely on the lightweight `smoke` job rather than running release preflight or the complete historical chain
- use `[preflight]` only when a coherent current-release snapshot is ready for current-release validation
- search for an existing release PR before creating one; never create a duplicate `build/obol-vX.Y` or staging release PR to work around a failed check
- preserve browser-local state compatibility when practical
- before leaving Draft, ensure code, tests, documentation, changelog, release wiring, and README form one coherent release snapshot
- regenerate the README Build Next snapshot with `node tools/sync-readme-build-next.js --write`
- verify README/Dashboard queue synchronization with `node tools/sync-readme-build-next.js --check`
- require `implemented-quality = 0` and `mapped-delivery = 0` with `node tools/validate-release-quality.js` before methodology expansion is merge-ready
- when canonical gaps are zero, prioritize atomic source-fidelity audits for already-atomized source units, then decompose the remaining frozen source-depth baseline into atomic units; broad mappings never count as fidelity completion
- run `node tools/validate-historical-tests.js` and keep historical suites free of mutable current-release assertions
- run `node tools/release-preflight.js` or push a `[preflight]` commit before finalization
- ensure `tools/validate-release-pr.js --repo-only` passes
- require a substantive release PR description with Summary, Canonical methodology accounting, Conservative Evidence boundaries, Release wiring, Regression coverage, and Compatibility sections
- make the exact final release commit with `[release-final]` only after the snapshot is coherent
- mark the PR Ready for review only after smoke, preflight, and complete historical validation are green on that exact final head
- require the complete historical regression chain, README synchronization, release-quality gate, and green required `test` status on the exact final PR head before merge
- if another commit lands after green validation, treat the prior result as superseded and validate the new exact head again
- keep generated reports, Evidence semantics, Next Steps, command UX, execution context, source-depth inventory, and source-fidelity outcomes connected to methodology changes

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Regression tests

Ordinary release-branch pushes run only lightweight smoke validation:

```bash
node tools/release-smoke.js
```

A commit containing `[preflight]` runs the current-release preflight without running the complete historical chain:

```bash
node tools/release-preflight.js
```

Historical suites are scanned for mutable live-release assertions with:

```bash
node tools/validate-historical-tests.js
```

The current release suite is:

```bash
node tests/run-v6.4-tests.js
```

The repository-only release contract check is:

```bash
node tools/validate-release-pr.js --repo-only
```

The permanent release-quality debt gate is:

```bash
node tools/validate-release-quality.js
```

`[release-final]` commits, ready-for-review pull requests, and `main` run the complete historical regression chain, historical-test future-safety validation, the release contract, the generic release-quality check, and README queue synchronization. Superseded runs on the same ref are cancelled by workflow concurrency.

The README queue synchronization check is:

```bash
node tools/sync-readme-build-next.js --check
```

Historical suite ownership and release-specific regression notes live in `CHANGELOG.md` and the files under `tests/` and `docs/`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
