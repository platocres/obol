# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs.

Live site: `https://platocres.github.io/obol/`

Current release: **v5.3**

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

The **More** menu contains:

- **North Star Dashboard** — the single in-app location for project-wide methodology, command UX, Evidence, execution-context, Next Steps mapping, tool-review, reporting, UI/UX, trend, backlog, delivery-debt, delivery-readiness, build-next, and quality-repair metrics
- Engagement Map
- Methodology
- Tool Library
- Planned Work
- Workspace Search
- Evidence Lineage
- Guide
- Workspace Data

Home may show a compact project-health summary and link to the dashboard. Project-wide hard numbers and percentages belong to the dedicated dashboard rather than being duplicated across other pages.

## Current canonical methodology status

The pinned 2025.03 Active Directory methodology denominator contains **127 canonical sections**.

Current live state:

- **52 / 127 fully implemented**
- **49 partial**
- **26 gaps**
- **0 stale implemented mappings**
- **41% fully implemented**
- **80% represented**

These numbers are methodology accounting only. Parser coverage, reporting coverage, command controls, execution metadata, UI/UX health, delivery readiness, and quality-repair metrics have their own denominators on the North Star Dashboard and do not inflate methodology completion.

A canonical implemented or partial section is delivery-ready only when at least one tracked mapped workflow has a runnable command contract, an explicit copy/paste Evidence profile, explicit execution-side metadata, and reporting traceability. v5.3 uses that floor to repair already-implemented methodology before expanding the strict implementation count.

The first v5.3 repair wave targets eight mapped workflows that were useful but not fully delivery-ready in repository accounting: Anonymous SMB Enumeration, DNS Enumeration & Zone Transfer, Kerberos Ticket Hygiene, LAPS Local Admin Password Read, Local Enumeration Sweep, SeImpersonatePrivilege, DPAPI Credential Decryption, and Stored Credential Hunting. Their proof boundaries remain conservative: credential discovery does not imply access, tickets do not imply privilege, and a privilege being present does not imply SYSTEM.

## Evidence and proof rules

- Facts, evidence, activity, credentials, progress, reachability, and artifacts remain scoped to the relevant host/domain context.
- Supported, refuted, and inconclusive knowledge remain distinct.
- Typed artifacts preserve producer/consumer lineage and review gates.
- Reachability distinguishes direct, pivot, observed-only, stale, and broken state.
- Successful activity records historical command/evidence snapshots rather than reconstructing current UI state.
- Material foothold, privilege, objective, credential, and network transitions use explicit proof requirements.
- Screenshot checks remain operator-confirmed and external; Obol does not capture or inspect screenshots.
- Generated tickets, certificates, relay listeners, startup banners, discovery output, or command presence never silently become access or compromise facts.

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
- Preserve context isolation, proof boundaries, lineage, reachability, cleanup obligations, and browser-local compatibility while methodology depth increases.

### Recent changes

- **v5.3** — repaired the first implemented-quality debt wave by adding explicit Evidence profiles and audited execution-side metadata to eight already-implemented or implementation-bearing workflows, with conservative proof boundaries and live Dashboard accounting.
- **v5.2** — added delivery-ready canonical accounting and a prioritized Build next queue that repairs implemented quality debt before ordinary mapped debt and new canonical gaps.
- **v5.1** — added searchable mapped-workflow delivery-debt drill-down for Run, Evidence, execution metadata, and reporting contracts.

### Build next

- Continue working from the live v5.2/v5.3 Build next and quality-repair views. Finish remaining implemented canonical quality debt before raising the strict implementation count.
- Close remaining mapped-workflow delivery debt so Run, Evidence, execution metadata, and reporting stay aligned on represented methodology.
- Finish the remaining SCCM PXE/NAA, client-push lifecycle, policy-request credential, and site-database decryption gaps with full operator-loop contracts.
- Deepen the partial persistence workflows with broader target-version fixtures, exact cleanup validation, and stronger service-use proof where appropriate.
- Deepen trust abuse beyond enumeration and MSSQL linked-server paths.
- Address Windows low-access AppLocker bypass, UAC bypass, and Kerberos-relay branches.
- Deepen partial AD CS, relay, coercion, delegation, ACL, certificate-movement, and authenticated-enumeration sections until they can truthfully move to implemented.
- Expand Kerberos relay handling without treating generic NTLM relay coverage as equivalent.
- Add authenticated historical-vulnerability workflows only where they remain useful, current enough for training, and safe to present accurately.
- Continue expanding Evidence normalization and full-session transcript fixtures as command/output contracts mature.
- Replace more execution-side inference with explicit command metadata as methodology audits progress.
- Continue validating fast-moving command contracts against current upstream releases when behavior changes.
- Refresh the pinned canonical snapshot deliberately when upstream changes; never allow the denominator to drift silently.
- Continue exact activity-ID lineage, multi-hop target/chronology improvements, pivot troubleshooting depth, and proof-readiness templates where stronger evidence supports them.
- Keep the primary information architecture simple. New functionality should not automatically become a new primary navigation destination.

## Build-agent checklist

Before every build:

- read this README
- read `CHANGELOG.md`
- inspect the current North Star Dashboard metrics, delivery-readiness view, quality-repair view, Build next queue, and canonical backlog
- branch from refreshed current `main`
- preserve browser-local state compatibility when practical
- update code, tests, docs, changelog, release wiring, and README only when current requirements change
- run the complete historical regression chain plus the new release suite
- keep generated reports, Evidence semantics, Next Steps, command UX, and execution context connected to methodology changes

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Regression tests

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests. The current release suite is:

```bash
node tests/run-v5.3-tests.js
```

Historical suite ownership and release-specific regression notes live in `CHANGELOG.md` and the files under `tests/` and `docs/`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
