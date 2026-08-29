# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs.

Live site: `https://platocres.github.io/obol/`

Current release: **v5.8**

Release history belongs in [`CHANGELOG.md`](CHANGELOG.md). Build agents should review both this README and the changelog before changing architecture, methodology, Evidence behavior, reporting, or project metrics.

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

- **77 / 127 fully implemented**
- **34 partial**
- **16 gaps**
- **0 stale implemented mappings**
- **61% fully implemented**
- **87% represented**

These numbers are methodology accounting only. Parser coverage, reporting coverage, command controls, execution metadata, UI/UX health, delivery readiness, and quality-repair metrics have their own denominators on the North Star Dashboard and do not inflate methodology completion.

A canonical implemented or partial section is delivery-ready only when at least one tracked mapped workflow has a runnable command contract, an explicit copy/paste Evidence profile, explicit execution-side metadata, and reporting traceability.

v5.8 consumes the next five canonical gaps from the synchronized v5.7 Build Next queue: PrintNightmare, PrivExchange, ProxyNotShell, AppLocker bypass, and Kerberos relay. Each receives a delivery-ready owner with explicit execution context, Evidence interpretation, decision-path placement, reporting traceability, and conservative proof boundaries. Strict completion rises from 72/127 to 77/127 and canonical gaps fall from 21 to 16.

v5.8 also closes the release-process hole exposed by v5.7. Release PRs must use `release/obol-vX.Y`, include a substantive description with required release sections, and pass the required `test` status check on the exact current head before merge. The validator lives at `tools/validate-release-pr.js` and is exercised inside the current release regression suite, so malformed release PRs make the required test job fail.

The README/Dashboard backlog synchronization introduced in v5.4 remains permanent. The README Build next agenda is generated from the same repository model that powers **North Star Dashboard → Build Next**. The dashboard is the authoritative full drill-down, while the README contains a CI-enforced human-readable snapshot of that queue.

## Evidence and proof rules

- Facts, evidence, activity, credentials, progress, reachability, and artifacts remain scoped to the relevant host/domain context.
- Supported, refuted, and inconclusive knowledge remain distinct.
- Typed artifacts preserve producer/consumer lineage and review gates.
- Reachability distinguishes direct, pivot, observed-only, stale, and broken state.
- Successful activity records historical command/evidence snapshots rather than reconstructing current UI state.
- Material foothold, privilege, objective, credential, and network transitions use explicit proof requirements.
- Screenshot checks remain operator-confirmed and external; Obol does not capture or inspect screenshots.
- Generated tickets, certificates, relay listeners, startup banners, discovery output, configuration changes, or command presence never silently become access or compromise facts.
- PrintNightmare detection does not imply SYSTEM. PrivExchange coercion does not imply relay success. ProxyNotShell requires explicit remote identity output. AppLocker policy discovery is separate from bypass proof. Kerberos relay control and ticket creation are separate from SYSTEM, which requires explicit post-transition identity evidence.

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

- **v5.8** — completed PrintNightmare, PrivExchange, ProxyNotShell, AppLocker bypass, and Kerberos relay, raising strict completion from 57% to 61% and represented coverage from 83% to 87%; also added a release PR contract so the required CI check rejects wrong release branches or missing PR descriptions.
- **v5.7** — completed DNSAdmins abuse, Entra/AD Connect discovery, Certifried, MS14-068, and noPac, raising strict completion from 53% to 57% and represented coverage from 80% to 83%.
- **v5.6** — cleared the remaining mapped-workflow delivery debt, strengthened Evidence proof boundaries across the live queue, and completed five mature partial branches, raising strict canonical completion from 49% to 53%.

### Build next

The generated block below is the GitHub-readable agenda snapshot. **North Star Dashboard → Build Next** remains the authoritative full queue. `tools/sync-readme-build-next.js` regenerates this block from the same live repository state, and CI fails if the two drift apart.

<!-- OBOL-BUILD-NEXT:START -->
This block is generated from the same live repository state used by **North Star Dashboard → Build Next**. Do not edit the generated queue manually. The dashboard remains the authoritative full drill-down; this README snapshot is CI-enforced.

**Current live queue:** 16 items — 0 implemented-quality repairs, 0 mapped-delivery repairs, 16 canonical gaps.
**Canonical methodology:** 77/127 fully implemented (61%), 34 partial, 16 gaps, 87% represented.

**Highest-priority live items:**
1. **UAC bypass** — low_access.md · canonical gap.
2. **EternalBlue** — low_hanging.md · canonical gap.
3. **Exchange quick-win path** — low_hanging.md · canonical gap.
4. **GLPI quick-win path** — low_hanging.md · canonical gap.
5. **Java deserialization service** — low_hanging.md · canonical gap.
6. **Java RMI** — low_hanging.md · canonical gap.
7. **Log4Shell** — low_hanging.md · canonical gap.
8. **Tomcat / JBoss manager** — low_hanging.md · canonical gap.
9. **Veeam quick-win path** — low_hanging.md · canonical gap.
10. **Kerberos relay** — mitm.md · canonical gap.
11. **PXE / NAA credential path** — no_creds.md · canonical gap.
12. **TimeRoasting** — no_creds.md · canonical gap.

Generated by `node tools/sync-readme-build-next.js --write`. Verify with `node tools/sync-readme-build-next.js --check`.
<!-- OBOL-BUILD-NEXT:END -->

## Build-agent checklist

Before every build:

- read this README
- read `CHANGELOG.md`
- inspect the current North Star Dashboard metrics, delivery-readiness view, quality-repair view, Build Next queue, and canonical backlog
- branch from refreshed current `main`
- use a staging branch for iterative work and create exactly one final `release/obol-vX.Y` branch from the coherent tested snapshot
- search for an existing release PR before creating one; never create a duplicate `build/obol-vX.Y` release PR
- preserve browser-local state compatibility when practical
- prepare code, tests, documentation, changelog, release wiring, and README as one coherent release snapshot rather than using GitHub Actions as an iterative development runner
- regenerate the README Build Next snapshot with `node tools/sync-readme-build-next.js --write`
- verify README/Dashboard queue synchronization with `node tools/sync-readme-build-next.js --check`
- run `node tools/release-preflight.js` before moving the release branch
- ensure `tools/validate-release-pr.js --repo-only` passes before the final release branch is created
- make historical tests assert historical model invariants rather than hard-coding whichever release is currently visible in README
- require a substantive release PR description with Summary, Canonical methodology accounting, Conservative Evidence boundaries, Release wiring, Regression coverage, and Compatibility sections
- require a green `test` status check on the exact final PR head before merge
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
node tests/run-v5.8-tests.js
```

The repository-only release contract check is:

```bash
node tools/validate-release-pr.js --repo-only
```

Non-draft pull requests and `main` run the complete historical regression chain plus the README queue synchronization check. The v5.8 regression suite also validates release-branch naming and PR-description completeness during pull-request runs. Superseded runs on the same ref are cancelled by workflow concurrency.

The README queue synchronization check is:

```bash
node tools/sync-readme-build-next.js --check
```

Historical suite ownership and release-specific regression notes live in `CHANGELOG.md` and the files under `tests/` and `docs/`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
