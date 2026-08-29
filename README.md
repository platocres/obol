# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs.

Live site: `https://platocres.github.io/obol/`

Current release: **v5.9**

Release history belongs in [`CHANGELOG.md`](CHANGELOG.md). **Build agents must review this README, [`BUILDING.md`](BUILDING.md), and the changelog before changing architecture, methodology, Evidence behavior, reporting, CI, release workflow, or project metrics.** `BUILDING.md` owns the incremental draft-PR release policy and exact-head merge-readiness rules.

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

The **North Star Dashboard** is the single in-app location for project-wide methodology, command UX, Evidence, execution-context, Next Steps mapping, tool-review, reporting, UI/UX, trend, backlog, delivery-debt, delivery-readiness, build-next, quality-repair, README queue-sync, canonical-progress, and release-contract metrics. Home may show a compact summary and link to it, but project-wide hard numbers belong on the Dashboard.

## Current canonical methodology status

The pinned 2025.03 Active Directory methodology denominator contains **127 canonical sections**.

Current live state:

- **82 / 127 fully implemented**
- **34 partial**
- **11 gaps**
- **0 stale implemented mappings**
- **65% fully implemented**
- **91% represented**

These numbers are methodology accounting only. Parser coverage, reporting coverage, command controls, execution metadata, UI/UX health, delivery readiness, and quality-repair metrics have their own denominators on the North Star Dashboard and do not inflate methodology completion.

A canonical implemented or partial section is delivery-ready only when at least one tracked mapped workflow has a runnable command contract, an explicit copy/paste Evidence profile, explicit execution-side metadata, and reporting traceability.

v5.9 consumes the next five canonical gaps from the synchronized v5.8 Build Next queue: UAC bypass, EternalBlue, Exchange quick-win / ProxyShell, GLPI quick-win, and Java deserialization service validation. Each receives a delivery-ready owner with explicit execution context, conservative Evidence interpretation, decision-path placement, reporting traceability, and bounded proof semantics. Strict completion rises from 77/127 to 82/127 and canonical gaps fall from 16 to 11.

v5.9 also makes Build Next ordering a permanent release-quality invariant. `tools/validate-release-quality.js` recalculates the live queue and blocks merge readiness whenever implemented-quality or mapped-delivery debt is nonzero. The gate runs in release preflight and the protected `test` job, so canonical expansion cannot ship while higher-priority delivery debt remains.

The release workflow is documented in [`BUILDING.md`](BUILDING.md): one `release/obol-vX.Y` branch, one visible draft PR, incremental coherent commits, intermediate red checks allowed while Draft, and exact-final-head green validation before merge readiness. Normal documentation and maintenance PRs still receive regression coverage without being forced to impersonate a release PR.

The README/Dashboard backlog synchronization introduced in v5.4 remains permanent. The README Build next agenda is generated from the same repository model that powers **North Star Dashboard → Build Next**. The dashboard is the authoritative full drill-down, while the README contains a CI-enforced human-readable snapshot of that queue.

## Evidence and proof rules

- Facts, evidence, activity, credentials, progress, reachability, and artifacts remain scoped to the relevant host/domain context.
- Supported, refuted, and inconclusive knowledge remain distinct.
- Typed artifacts preserve producer/consumer lineage and review gates.
- Reachability distinguishes direct, pivot, observed-only, stale, and broken state.
- Successful activity records historical command/evidence snapshots rather than reconstructing current UI state.
- Material foothold, privilege, objective, credential, and network transitions use explicit proof requirements.
- Screenshot checks remain operator-confirmed and external; Obol does not capture or inspect screenshots.
- Generated tickets, certificates, relay listeners, startup banners, discovery output, configuration changes, exploit-module startup, or command presence never silently become access or compromise facts.
- PrintNightmare detection does not imply SYSTEM. PrivExchange coercion does not imply relay success. ProxyNotShell requires explicit remote identity output. AppLocker policy discovery is separate from bypass proof. Kerberos relay control and ticket creation are separate from SYSTEM, which requires explicit post-transition identity evidence.
- UAC bypass requires independent elevated integrity-level output rather than `fodhelper.exe` startup. EternalBlue keeps vulnerable detection, opened-session execution, and explicit SYSTEM identity as separate boundaries. Exchange and GLPI detection remain below privilege, and Java deserialization requires the explicit `OBOL_JAVA_DESER_OK` callback marker before remote execution is recorded.

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
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.
- Make sure that the data being integrated from the Orange Cyber Defense mind map is improving "Next Steps" and that as users complete each step they are being properly led down the mind map's decision path.
- Make sure that each tool for each step of the path is not only proper, but has the proper GUI based toggles to adjust commands and that OBOL is able to interpret copy/paste evidence from user terminals to improve its ability to determine next steps.
- Make sure that all elements of a path, it's tools, and that tool's evidence fit well into the reporting that Obol performs and can be utilized properly in reporting.
- All of this applies both now and retroactively. All tools and paths and evidence collection and reporting need to be fully functional and fully useful from a user's perspective, and intuitive both from a UI and a UX perspective.
- All of this needs to be tracked in a single dashboard I can access when I look at the Obol website with hard numbers and percentages. The dashboard needs to be contained in one place within obol. The home page can and should mention it, link to it, and highlight important numbers but mentions of "Orange Cyber Defense" should not appear elsewhere.
- The readme is not a changelog and should only contain overviews on changes from the last 3 versions. A changelog should be created and maintained with more verbose history of all changes over time and agents are obliged to check it for a sense of the history of the project on each build attempt. This includes "foundations kept" and parts of the "to-do" list that belong in a change log. There should be a to-do list that lists the north star objectives in one section, recent changes in another section, and a section for what should be built next that the agent should prioritize for the next version.
- The UI and UX should always be reviewed to make sure it is sensible and that version mentions and past aesthetic choices are not bleeding over into various places. Version numbers should be kept up-to-date everywhere.

## To-do

### North Star objectives

- Keep the pinned 2025.03 methodology denominator, source provenance, decision path, and tool review reproducible and visible from the single North Star Dashboard.
- Make every represented workflow usable end to end: sensible command controls, explicit Kali/Windows execution context, conservative copy/paste Evidence, Next Steps integration, and reporting traceability.
- Close canonical gaps without inflating completion from parser, UI, reporting, or metadata work alone.
- Prefer tools and command surfaces that are current, understandable, practical for OSCP-style labs, and better for the operator than blindly mirroring an upstream tool choice.
- Preserve context isolation, proof boundaries, lineage, reachability, cleanup obligations, browser-local compatibility, and release-gate integrity while methodology depth increases.

### Recent changes

- **v5.9** — made zero implemented-quality and mapped-delivery debt a generic release invariant, then completed UAC bypass, EternalBlue, Exchange ProxyShell, GLPI, and Java deserialization, raising strict completion from 61% to 65% and represented coverage from 87% to 91%.
- **v5.8** — completed PrintNightmare, PrivExchange, ProxyNotShell, AppLocker bypass, and Kerberos relay, raising strict completion from 57% to 61% and represented coverage from 83% to 87%; also added a release PR contract so the required CI check rejects wrong release branches or missing PR descriptions.
- **v5.7** — completed DNSAdmins abuse, Entra/AD Connect discovery, Certifried, MS14-068, and noPac, raising strict completion from 53% to 57% and represented coverage from 80% to 83%.

### Build next

The generated block below is the GitHub-readable agenda snapshot. **North Star Dashboard → Build Next** remains the authoritative full queue. `tools/sync-readme-build-next.js` regenerates this block from the same live repository state, and CI fails if the two drift apart.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit the generated queue manually. The dashboard remains the authoritative full drill-down; this README snapshot is CI-enforced.

**Current live queue:** 11 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 11 canonical gaps.
**Canonical methodology:** 82/127 fully implemented (65%), 34 partial, 11 gaps, 91% represented.

**Highest-priority live items:**
1. **Java RMI** — low_hanging.md · canonical gap.
2. **Log4Shell** — low_hanging.md · canonical gap.
3. **Tomcat / JBoss manager** — low_hanging.md · canonical gap.
4. **Veeam quick-win path** — low_hanging.md · canonical gap.
5. **Kerberos relay** — mitm.md · canonical gap.
6. **PXE / NAA credential path** — no_creds.md · canonical gap.
7. **TimeRoasting** — no_creds.md · canonical gap.
8. **PXE / NAA credential recovery** — sccm.md · canonical gap.
9. **Child-to-parent trust paths** — trusts.md · canonical gap.
10. **External / forest trust paths** — trusts.md · canonical gap.
11. **Parent-to-child trust paths** — trusts.md · canonical gap.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Build-agent checklist

Before every build:

- read this README
- read `BUILDING.md` and follow its single draft release PR / incremental commit policy
- read `CHANGELOG.md`
- inspect the current North Star Dashboard metrics, delivery-readiness view, quality-repair view, Build Next queue, and canonical backlog
- branch from refreshed current `main` directly to exactly one `release/obol-vX.Y` branch and open exactly one draft release PR immediately
- push incremental coherent commits to that same draft PR; intermediate red checks are acceptable while the PR is Draft
- search for an existing release PR before creating one; never create a duplicate `build/obol-vX.Y` or staging release PR to work around a red state
- preserve browser-local state compatibility when practical
- before leaving Draft, ensure code, tests, documentation, changelog, release wiring, and README form one coherent release snapshot
- regenerate the README Build Next snapshot with `node tools/sync-readme-build-next.js --write`
- verify README/Dashboard queue synchronization with `node tools/sync-readme-build-next.js --check`
- require `implemented-quality = 0` and `mapped-delivery = 0` with `node tools/validate-release-quality.js` before canonical-gap expansion is merge-ready
- run `node tools/release-preflight.js` before marking the PR ready for review
- ensure `tools/validate-release-pr.js --repo-only` passes
- make historical tests assert historical model invariants rather than hard-coding whichever release is currently visible in README
- require a substantive release PR description with Summary, Canonical methodology accounting, Conservative Evidence boundaries, Release wiring, Regression coverage, and Compatibility sections
- mark the PR Ready for review only after the release snapshot is coherent
- require the complete historical regression chain, README synchronization, release-quality gate, and green required `test` status on the exact final PR head before merge
- if another commit lands after green validation, treat the prior result as superseded and validate the new exact head again
- keep generated reports, Evidence semantics, Next Steps, command UX, and execution context connected to methodology changes

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Regression tests

Release-branch pushes run the current-release preflight rather than the complete historical chain:

```bash
node tools/release-preflight.js
```

The current release suite is:

```bash
node tests/run-v5.9-tests.js
```

The repository-only release contract check is:

```bash
node tools/validate-release-pr.js --repo-only
```

The permanent release-quality debt gate is:

```bash
node tools/validate-release-quality.js
```

Draft PRs may remain red while work is in progress. Ready-for-review pull requests and `main` run the complete historical regression chain, the generic release-quality check, and README queue synchronization. Release-intent PRs additionally validate branch naming and description completeness. Superseded runs on the same ref are cancelled by workflow concurrency.

The README queue synchronization check is:

```bash
node tools/sync-readme-build-next.js --check
```

Historical suite ownership and release-specific regression notes live in `CHANGELOG.md` and the files under `tests/` and `docs/`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
