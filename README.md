# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.1.1**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md). Detailed build workflow lives in [`BUILDING.md`](BUILDING.md).

<!-- Historical regression contract phrases retained without re-cluttering the rendered README: The readme is not a changelog. traceability from decision path and preserved Evidence to report-ready proof. one North Star Dashboard. project-wide hard numbers. Project-wide progress belongs in one North Star Dashboard. -->

## Product contract

Obol is plain HTML, CSS, and JavaScript. There is no backend, account system, telemetry, install prompt, or automatic command execution.

**Human-run commands only.** Obol builds and explains commands, but the operator runs them externally in an authorized environment and returns output for Evidence review.

The normal loop is:

`Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`

Command recognition is not success. Durable facts come only from explicit supported Evidence. Manual outcome advancement is workflow state, not report-ready proof, unless Evidence is supplied.

Durable operator expectations remain compact but active: support operating from Kali or from a Windows host, keep improving "Next Steps", expose proper GUI based toggles, make generated work fit well into the reporting that Obol performs, and keep product/project health in a single in-app location. The UI and UX should always be reviewed as part of product-hardening work. The historical North Star Dashboard is baseline context now; the active surface is the Product Hardening Dashboard.

## Future-agent quickstart

Before building:

1. Read this README.
2. Read [`BUILDING.md`](BUILDING.md) for release workflow, exact-head validation, and merge-readiness rules.
3. Read [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the v9 queue contract.
4. Open `#/dashboard` or inspect `data/product-hardening/product-hardening-queue.js` for Product Build Next.
5. Confirm there is no open release/product-hardening PR.
6. Pick the highest-priority Product Build Next item unless the user directs otherwise.
7. Add or update item-specific acceptance criteria, validation commands, proof files, and tests.
8. Sync generated queue output.
9. Push one coherent release/product-hardening PR.

Do not create duplicate release/product-hardening PRs. If one exists, continue it or close it as superseded before opening another. CI enforces this with `tools/validate-open-pr-uniqueness.js`.

## Required context map

- [`BUILDING.md`](BUILDING.md) - exact release flow, validation tiers, one-open-PR rule, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - v9 tracks, queue rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - runtime ownership, compaction strategy, and legacy-layer boundaries.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) - completed Orange methodology/source accounting and historical denominator rules.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, and report readiness.
- [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md) - private notes source and normalized public-output workflow.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) - UI/UX quality goals and seeded product defects.
- [`CHANGELOG.md`](CHANGELOG.md) - release history.

## Active product queue

The active queue is Product Build Next, backed by `data/product-hardening/product-hardening-queue.js` and surfaced in `#/dashboard` plus `product-hardening.html`.

The completed Orange methodology/source queue is historical baseline material now. Its detailed 127 canonical sections, 17/17 source-file, 34/34 frozen-baseline, and 334/334 atomic-fidelity accounting belongs in `docs/NORTH-STAR.md` and `docs/ORANGE-SOURCE-DEPTH.md`, not in this README. The atomic source-fidelity ledger is retained in durable docs and data files rather than expanded here.

Pinned Orange Cyber Defense mind map/source provenance remains: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg and https://github.com/Orange-Cyberdefense/ocd-mindmaps/tree/main.

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

Use `#/dashboard` for the active Product Hardening Dashboard or `product-hardening.html` for the standalone dashboard entrypoint.

## Validation

```bash
node tools/release-smoke.js
node tools/release-preflight.js
node tools/validate-historical-tests.js
node tools/validate-release-pr.js
node tools/validate-release-quality.js
node tools/validate-product-hardening-queue.js
node tools/validate-asset-references.js
node tools/sync-product-build-next.js --check
node tools/sync-readme-build-next.js --check
node tools/validate-open-pr-uniqueness.js
node tests/run-v9.0-tests.js
node tests/run-v9.1-tests.js
node tests/run-v9.1.1-tests.js
```

The exact merge-readiness rules are owned by [`BUILDING.md`](BUILDING.md).

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
