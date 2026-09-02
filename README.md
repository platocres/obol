# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.31**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Detailed build workflow lives in [`BUILDING.md`](BUILDING.md).

## Product contract

Obol remains a website the user can simply visit and use. There is no backend, account system, telemetry, install prompt, or automatic command execution.

**Human-run commands only.** Obol builds and explains commands, but the operator runs them externally in an authorized environment and returns output for Evidence review. Command planning can account for operating from Kali or from a Windows host while preserving target-local and platform-neutral implementations.

The normal loop is:

`Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`

Command recognition is not success. Durable facts come only from explicit supported Evidence. Manual outcome advancement is workflow state, not report-ready proof, unless Evidence is supplied.

## Future-agent quickstart

Before building:

1. Read this README.
2. Read [`BUILDING.md`](BUILDING.md) for release workflow, exact-head validation, and merge-readiness rules.
3. Read [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the v9 product vision, queue rules, coherent work-package model, and Definition of Done.
4. If the work touches private-source notes, read [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) before reviewing a packet. Reviewed-note counts are not enough: modeled notes must declare the product output they created or why contextual guidance is sufficient.
5. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js` plus `data/product-hardening/work-packages.js` for Product Build Next.
6. Confirm there is no open release/product-hardening PR. If one exists, continue it instead of opening another.
7. If no release PR exists, create the release branch and open one normal, **non-draft** release PR as early as GitHub permits. Keep that same PR for the entire build. Required checks, not Draft status, prevent premature merge.
8. Start with the highest-priority Product Build Next item unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, not as a one-item limit.
9. Inspect related, adjacent, and dependency-linked items in the same ownership area. Complete as many as safely fit the same architectural context and blast radius. Do not stop merely because the first item's acceptance criteria are satisfied if closely related work can be completed and fully tested in the same PR.
10. Keep queue-item accountability atomic. Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests.
11. Do not batch unrelated work. Stop expanding the package when the next item materially changes ownership area, architectural context, migration risk, or test strategy.
12. Use `node tools/scope-check.js` while developing the current work package. The complete historical chain remains a final/main preservation gate rather than a manual per-edit checklist.
13. Sync generated Product Build Next output, run the required validation, and keep the entire coherent work package in the one active release/product-hardening PR until the exact final head is green.

There must be only one open release/product-hardening PR at a time. If one exists, continue it or close it as superseded before opening another. CI enforces this with `tools/validate-open-pr-uniqueness.js`. Do not use a Draft -> Ready transition as part of the release process and do not replace a healthy PR merely to change review state.

## Required context map

- [`BUILDING.md`](BUILDING.md) - exact release flow, validation tiers, one-open-PR rule, coherent work-package burn-down, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, work-package rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - runtime ownership, compaction strategy, and legacy-layer boundaries.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/TOOL-BUILDER-COVERAGE.md`](docs/TOOL-BUILDER-COVERAGE.md) - stable Tool Builder Platform, runnable-tool inventory, and representative-builder migration contract.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private source repo `platocres/obol-source-notes` and normalized public-output workflow.
- [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) - required notes-to-product output decision, packet review model, dashboard interpretation, and runtime-compaction relationship.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded product defects.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and historical regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

Pinned Orange Cyber Defense mind map provenance remains `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg` from `https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main`; detailed source accounting lives in `docs/NORTH-STAR.md`.

## Active product queue

Product Build Next is the only active development queue. Its atomic item source of truth is `data/product-hardening/product-hardening-queue.js`; coherent multi-item package metadata lives in `data/product-hardening/work-packages.js`. The README and Product Hardening Dashboard consume both so the highest-priority item remains the entry point while agents are encouraged to burn down a meaningful same-ownership work package rather than nibbling one checkbox at a time.

The 556-note disposition item is an umbrella requirement, not permission to perform anonymous review waves forever. Notes work should be organized as coherent subject packets and reported through the notes-to-product impact projection so the dashboard shows what was learned, where guidance is bound, what product mechanics actually changed, and what gaps remain.

Historical runtime layers are explicit product debt, not permanent architecture. v9.29 completed the Dashboard retirement slice: the current Dashboard owns its route and paint, historical Dashboard data/presentation owners are out of live startup, and fixture/current-owner tests preserve the durable behavior. Remaining runtime areas should follow the same current-owner, equivalence, fixture, live-layer removal, and obsolete-test-retirement lifecycle instead of keeping old layers alive forever.

v9.31 starts the next slice outside the Dashboard: Path, Card, and Tools now have a stable current operator-route owner. Path presents a compact current decision screen, while Card/Tools keep guided builders first and fold raw historical command blocks behind supporting detail.

The completed Orange methodology/source queue is historical, regression-protected baseline material. Do not reopen it unless a real defect is found or the pinned upstream source is deliberately repinned. Detailed Orange accounting belongs in the North Star/source-depth docs above, not in this README.

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.

**Current product-hardening queue:** 146/638 complete (23%), 11 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.
**Notes Integration:** 76/556 reviewed — 53 modeled, 19 private-only, 480 pending.
**Derived note guidance:** 32 Field Notes · 27 tool-bound · 29 Path-bound · 7 Evidence · 4 Report.
**Declared note-driven product mechanics:** 1 total · 1 builder · 0 Path logic · 0 Evidence parser · 0 report generator · 0 workflow.
**Latest mined themes:** File upload.
**Notes impact contract:** `docs/NOTES-IMPACT.md`.

**Recommended work package:** **Notes Impact and Themed Burn-down** — 6 live items / 8 tracked.
**Work-package entry:** **Burn down all 556 note dispositions**
**Ownership area:** `notes/impact-packets`
**Package guidance:** Treat the 556-note disposition item as the umbrella. Burn notes down in coherent themed packets, and for every modeled source record which Field Note, tool-bound or Path-bound guidance, Evidence/report/troubleshooting output, code-level product change, or explicit product gap it produced.
**Package dependencies:** Notes Integration Foundation

**Live items in this package:**
- **Burn down all 556 note dispositions** — Umbrella disposition goal. Review work should be executed in themed packets and must record what each modeled note changed in Field Notes, tools, Path, Evidence, reports, troubleshooting, or product gaps.
- **Notes packet: XSS and session impact** — Mine XSS, browser/session impact, cookie/CSP controls, request context, proof boundaries, remediation, and missing product branches.
- **Notes packet: credentials and authentication** — Mine credentials, hashes, tickets, certificates, validation boundaries, auth failure modes, tool options, and cross-tool/path handoffs.
- **Notes packet: Windows privilege escalation** — Mine Windows privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
- **Notes packet: Linux privilege escalation** — Mine Linux privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
- **Notes packet: AD and pivoting** — Mine Active Directory, lateral movement, tunneling, pivoting, routing, credential use, evidence boundaries, and missing workflow/tool options.

**Related items to consider, not automatically in scope:** Design contextual field-notes disclosure.

**Highest-priority live items:**
1. **Burn down all 556 note dispositions** — Umbrella disposition goal. Review work should be executed in themed packets and must record what each modeled note changed in Field Notes, tools, Path, Evidence, reports, troubleshooting, or product gaps.
2. **Notes packet: XSS and session impact** — Mine XSS, browser/session impact, cookie/CSP controls, request context, proof boundaries, remediation, and missing product branches.
3. **Notes packet: credentials and authentication** — Mine credentials, hashes, tickets, certificates, validation boundaries, auth failure modes, tool options, and cross-tool/path handoffs.
4. **Notes packet: Windows privilege escalation** — Mine Windows privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
5. **Notes packet: Linux privilege escalation** — Mine Linux privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
6. **Notes packet: AD and pivoting** — Mine Active Directory, lateral movement, tunneling, pivoting, routing, credential use, evidence boundaries, and missing workflow/tool options.
7. **Quiet service worker caching** — Improve repeat-load and offline behavior without prompting users to install anything.
8. **IndexedDB workspace storage** — Support durable larger local workspaces, multiple engagements, and cached indexes while remaining browser-local.

**Track status:**
- **Critical correctness:** 4/4 complete (100%), 0 modeled.
- **Architecture / runtime:** 10/13 complete (77%), 3 modeled.
- **UI / UX repair:** 8/9 complete (89%), 1 modeled.
- **Tool GUI builders:** 19/19 complete (100%), 0 modeled.
- **Credential modes:** 14/14 complete (100%), 0 modeled.
- **Manual outcomes:** 8/8 complete (100%), 0 modeled.
- **Notes integration:** 76/556 complete (14%), 2 modeled.
- **Offline / performance:** 1/6 complete (17%), 0 modeled.
- **Testing / visual QA:** 6/9 complete (67%), 3 modeled.

Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required.

Use `#/dashboard` for the active Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use the focused current-work-package check during development:

```bash
node tools/scope-check.js
```

Use [`BUILDING.md`](BUILDING.md) for preflight and release-final requirements. CI owns the complete historical regression chain on final release heads and `main`; agents should not manually copy and run every `run-vX.Y-tests.js` file for each small edit.

The permanent notes-impact checks are:

```bash
node tools/validate-notes-impact.js
node tools/validate-note-integration.js
node tools/sync-product-build-next.js --check
node tests/run-v9.31-tests.js
```

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
