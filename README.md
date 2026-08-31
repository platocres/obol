# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.1.1**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Detailed build workflow lives in [`BUILDING.md`](BUILDING.md).

## Product contract

Obol remains a website the user can simply visit and use. There is no backend, account system, telemetry, install prompt, or automatic command execution.

**Human-run commands only.** Obol builds and explains commands, but the operator runs them externally in an authorized environment and returns output for Evidence review.

The normal loop is:

`Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`

Command recognition is not success. Durable facts come only from explicit supported Evidence. Manual outcome advancement is workflow state, not report-ready proof, unless Evidence is supplied.

## Future-agent quickstart

Before building:

1. Read this README.
2. Read [`BUILDING.md`](BUILDING.md) for release workflow, exact-head validation, and merge-readiness rules.
3. Read [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the v9 product vision, queue rules, and Definition of Done.
4. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js` for Product Build Next.
5. Confirm there is no open release/product-hardening PR.
6. Pick the highest-priority Product Build Next item unless the user directs otherwise.
7. Implement it without adding unnecessary versioned compatibility layers.
8. Add or update item-specific acceptance criteria, validation commands, proof files, and tests.
9. Sync generated Product Build Next output and run the required validation.
10. Push one coherent release/product-hardening PR and require the exact final head to be green before merge.

There must be only one open release/product-hardening PR at a time. If one exists, continue it or close it as superseded before opening another. CI enforces this with `tools/validate-open-pr-uniqueness.js`.

## Required context map

- [`BUILDING.md`](BUILDING.md) - exact release flow, validation tiers, one-open-PR rule, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, queue rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - runtime ownership, compaction strategy, and legacy-layer boundaries.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private source repo `platocres/obol-source-notes` and normalized public-output workflow.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded product defects.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and historical regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

Pinned Orange Cyber Defense mind map provenance remains `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg`; detailed source provenance and the upstream repository pointer live in `docs/NORTH-STAR.md`.

## Active product queue

Product Build Next is the only active development queue. Its source of truth is `data/product-hardening/product-hardening-queue.js`, and the same data feeds the README and Product Hardening Dashboard.

The completed Orange methodology/source queue is historical, regression-protected baseline material. Do not reopen it unless a real defect is found or the pinned upstream source is deliberately repinned. Detailed Orange accounting belongs in the North Star/source-depth docs above, not in this README.

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.

**Current product-hardening queue:** 0/632 complete (0%), 74 queued, 9 foundation items modeled.
**Private notes source:** `platocres/obol-source-notes` — 556 notes and 1326 embedded resources accounted.

**Highest-priority live items:**
1. **Create one version authority** — Header, title, settings, report preview, report footer, export metadata, README, and dashboard must consume one current-version source.
2. **Validate every referenced asset** — Parse HTML entrypoints and fail CI when any script, stylesheet, or static asset reference is missing.
3. **Normalize report version identity** — Generated report text and footers must not retain stale historical version strings.
4. **Fix dark-theme link contrast** — Dark-blue links on dark panels need readable contrast, hover, and focus states.
5. **Current runtime entrypoint** — Move toward one current browser entrypoint and one current Node loader boundary instead of expanding historical load arrays forever.
6. **CSS ownership consolidation** — Collapse active styling into a small current set while preserving regressions for historical behavior.
7. **Asset manifest and generated load order** — Generate asset references from a manifest instead of hand-editing long script/link chains.
8. **Dashboard ownership consolidation** — Keep one dashboard owner for project/product progress and avoid release-specific competing status panels.

**Track status:**
- **Critical correctness:** 0/4 complete (0%), 0 modeled.
- **Architecture / runtime:** 0/10 complete (0%), 3 modeled.
- **UI / UX repair:** 0/8 complete (0%), 1 modeled.
- **Tool GUI builders:** 0/18 complete (0%), 0 modeled.
- **Credential modes:** 0/14 complete (0%), 0 modeled.
- **Manual outcomes:** 0/8 complete (0%), 0 modeled.
- **Notes integration:** 0/556 complete (0%), 2 modeled.
- **Offline / performance:** 0/6 complete (0%), 0 modeled.
- **Testing / visual QA:** 0/8 complete (0%), 3 modeled.

Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required.

Use `#/dashboard` for the active Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

The exact required release flow is owned by [`BUILDING.md`](BUILDING.md). The core repository checks are:

```bash
node tools/validate-historical-tests.js
node tools/validate-release-pr.js
node tools/validate-release-quality.js
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tools/validate-open-pr-uniqueness.js
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
node tests/run-v9.1.1-tests.js
```

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
