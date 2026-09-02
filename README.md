# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.29**

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

Historical runtime layers are explicit product debt, not permanent architecture. The current Dashboard route owns its loading shell and render without allowing historical dashboard output to paint first, and the repository now has real Playwright coverage for the six core routes plus dashboard paint-history proof. The active compaction gate is therefore physical dashboard-layer retirement: decouple any live domain behavior from historical dashboard owners, remove those owners from startup, then retire tests that protected only the old delivery shape.

The completed Orange methodology/source queue is historical, regression-protected baseline material. Do not reopen it unless a real defect is found or the pinned upstream source is deliberately repinned. Detailed Orange accounting belongs in the North Star/source-depth docs above, not in this README.

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.

**Current product-hardening queue:** 120/634 complete (19%), 13 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.
**Notes Integration:** 55/556 reviewed — 43 modeled, 12 private-only, 501 pending.
**Derived note guidance:** 24 Field Notes · 20 tool-bound · 22 Path-bound · 5 Evidence · 4 Report.
**Declared note-driven product mechanics:** 0 total · 0 builder · 0 Path logic · 0 Evidence parser · 0 report generator · 0 workflow.
**Latest mined themes:** File upload, File inclusion, XSS / session hardening.
**Notes impact contract:** `docs/NOTES-IMPACT.md`.

**Recommended work package:** **Dashboard Runtime Compaction** — 1 live item / 4 tracked.
**Work-package entry:** **Retire historical dashboard runtime layers**
**Ownership area:** `runtime/dashboard-retirement`
**Package guidance:** Keep the current no-flash route owner, add real browser smoke proof, then remove old dashboard owners from live startup after equivalence is proven. The same current-owner/fixture/test-retirement lifecycle applies to the rest of the runtime.
**Package dependencies:** Runtime Consolidation Foundation

**Live items in this package:**
- **Retire historical dashboard runtime layers** — After browser smoke and route equivalence are proven, remove old dashboard data and presentation owners from live startup and preserve only useful historical fixtures.

**Related items to consider, not automatically in scope:** Dashboard ownership consolidation; No new layered queue architecture.

**Highest-priority live items:**
1. **Retire historical dashboard runtime layers** — After browser smoke and route equivalence are proven, remove old dashboard data and presentation owners from live startup and preserve only useful historical fixtures.
2. **Burn down all 556 note dispositions** — Umbrella disposition goal. Review work should be executed in themed packets and must record what each modeled note changed in Field Notes, tools, Path, Evidence, reports, troubleshooting, or product gaps.
3. **Notes packet: web upload and inclusion** — Mine upload, traversal, LFI/RFI, wrapper, serving, interpretation, proof-chain, remediation, and tool/path implications as one coherent packet.
4. **Notes packet: XSS and session impact** — Mine XSS, browser/session impact, cookie/CSP controls, request context, proof boundaries, remediation, and missing product branches.
5. **Notes packet: credentials and authentication** — Mine credentials, hashes, tickets, certificates, validation boundaries, auth failure modes, tool options, and cross-tool/path handoffs.
6. **Notes packet: Windows privilege escalation** — Mine Windows privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
7. **Notes packet: Linux privilege escalation** — Mine Linux privilege-escalation discovery, evidence, tool options, failure modes, path branches, proof boundaries, and reporting guidance.
8. **Notes packet: AD and pivoting** — Mine Active Directory, lateral movement, tunneling, pivoting, routing, credential use, evidence boundaries, and missing workflow/tool options.

**Track status:**
- **Critical correctness:** 4/4 complete (100%), 0 modeled.
- **Architecture / runtime:** 8/12 complete (67%), 3 modeled.
- **UI / UX repair:** 7/8 complete (88%), 1 modeled.
- **Tool GUI builders:** 18/18 complete (100%), 0 modeled.
- **Credential modes:** 14/14 complete (100%), 0 modeled.
- **Manual outcomes:** 8/8 complete (100%), 0 modeled.
- **Notes integration:** 55/556 complete (10%), 2 modeled.
- **Offline / performance:** 1/6 complete (17%), 0 modeled.
- **Testing / visual QA:** 5/8 complete (63%), 3 modeled.

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
node tests/run-v9.29-tests.js
```

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
