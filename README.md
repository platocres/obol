# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v10.20**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is the entrypoint and current handoff. It should stay lean, but it must keep the links future agents need when told to read the README and all linked documents. Detailed mechanics live in the canonical docs below.

## Continue developing (start here)

This is the single agent quickstart. Told to "read the README and keep developing"? Use this flow.

1. **Use one active product-hardening PR.** Check for an open release/product-hardening PR first. Continue it if it exists. Otherwise open one normal, non-draft PR for the work.
2. **Read the linked docs.** Read this README, [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md), [`BUILDING.md`](BUILDING.md), and the owner docs relevant to the Product Build Next item. For Tool Builder work, [`docs/TOOL-BUILDER-BUILD-QUEUE.md`](docs/TOOL-BUILDER-BUILD-QUEUE.md) is mandatory.
3. **Do Product Build Next.** Start with the highest-priority Product Build Next item. The generated Product Build Next block below is the current queue authority for ChatGPT/product-hardening agents. Treat the highest-priority item as the entry point into the recommended coherent work package, not as a one-item limit. Batch only closely related live items in the same ownership area. Every item advanced or closed still needs its own acceptance criteria and proof.
4. **Do not follow side-lane "next build" pointers unless directed.** [`docs/EXPERIENCE-REVAMP.md`](docs/EXPERIENCE-REVAMP.md) is a Claude UX feature lane. Its one-liners do not override Product Build Next unless the user explicitly asks for that UX revamp work.
5. **Land real product progress.** Wire new outputs into the actual user-visible Next Steps / Orange path surface where relevant, or into the live route, card, dashboard, tool, analyzer, report, or runtime surface that consumes them. Every tool batch must ship command generation and decision-relevant Evidence behavior together. For Tool Builder work, a tool is not implemented until it has minimum viable command or guided-handoff generation, real supplied/Evidence-derived prefill, additive controls, executable Evidence ingestion, proof boundaries, and conservative Next Steps movement or blocking where applicable.
6. **Update release history.** Every product-affecting build must update [`CHANGELOG.md`](CHANGELOG.md). Versioned product-hardening releases also need `data/current-release.js`, a `docs/vX.Y.md` release doc, the current release sync, Product Build Next sync when queue state changes, and the matching release test. Docs-only clarification PRs do not need a public release bump unless they change product behavior, queue state, generated outputs, or the visible website release identity.
7. **Keep private notes private.** Source-note mining is complete. Use notes docs as provenance and safety references unless Product Build Next explicitly reopens note-derived work. Extract the value, not the wording. Do not use `CHANGELOG.md` to decide what remains to be re-mined. Current re-mining status lives in the Product Build Next sources and dashboard.
8. **Prove the head.** Run the focused validators for the touched ownership area, keep generated blocks synchronized, and do not call the PR merge-ready until the exact final head is green.

The completed broad audit item was **Post-mining Next Steps and tool-card clarity audit**. The **Implemented-tool Evidence and cross-surface audit** is complete. The **Remaining modeled tool implementation backlog.** remains active until each modeled tool is implemented through the full Tool Builder contract or explicitly dispositioned with proof.

## Canonical docs

- [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) - detailed agent loop, live-integration expectations, notes rules, and validation cadence.
- [`BUILDING.md`](BUILDING.md) - release flow, validation tiers, PR contract, generated sync commands, and merge readiness.
- [`docs/CONNECTOR-FALLBACK.md`](docs/CONNECTOR-FALLBACK.md) - connector-only workflow when shell GitHub access or DNS fails.
- [`docs/TEST-GOVERNANCE.md`](docs/TEST-GOVERNANCE.md) - required checks, browser smoke, historical contracts, and test-update rules.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active product-hardening vision, tracks, work-package rules, and Definition of Done.
- [`docs/TOOL-BUILDER-BUILD-QUEUE.md`](docs/TOOL-BUILDER-BUILD-QUEUE.md) - active Tool Builder backlog sequence and the permanent command, Evidence, proof, and Next Steps contract.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - conservative Evidence boundaries. Command recognition is not success.
- [`docs/ACTIONABLE-CARD-CONTRACT.md`](docs/ACTIONABLE-CARD-CONTRACT.md) and [`docs/CARD-UI-STANDARD.md`](docs/CARD-UI-STANDARD.md) - user-visible card and operator surface standards.
- [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md), [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md), and [`docs/SOURCE-NOTE-CLUSTERING.md`](docs/SOURCE-NOTE-CLUSTERING.md) - historical notes derivation, extraction, clustering, integration, and impact rules.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md), [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md), [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md), and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - architecture, runtime, UX, and completed Orange baseline context.
- [`docs/EXPERIENCE-REVAMP.md`](docs/EXPERIENCE-REVAMP.md) - Claude UX revamp planning only; not the ChatGPT/product-hardening queue authority unless explicitly requested.
- [`CHANGELOG.md`](CHANGELOG.md) - release and product-visible change history.

Historical Orange AD mindmap source: `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg`.

## Product contract

Obol remains a website the user can visit and use: no backend, account system, telemetry, install prompt, or automatic command execution. Commands and third-party tool handoffs are built for humans to review and run externally in authorized environments. The normal loop is `Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`.

## Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
Generated from the same queue sources as the Product Hardening Dashboard. Do not edit this block manually.
This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually.

**Current product-hardening queue:** 227/658 complete (35%), 9 concrete queued, 9 modeled/standing items.
**Private notes source:** [`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw) — 556 notes and 1326 embedded resources accounted.
**Private review packets:** `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json` — 556/556 notes, 29 packets, 0 truncated.
**Complete source packet proof:** 556/556 notes in 29 complete-text packets, 0 truncated, 8,725,188 cleaned text chars.
**Raw source proof:** workflow run 33877189291 verified HTB ENEX 194,191,214 bytes and OffSec PEN-200 ENEX 110,367,324 bytes before packet extraction.
**Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer).
**Runtime consolidation owner:** `data/runtime-consolidation-current.js` feeds this README projection and the Product Hardening Dashboard.
**Notes review status:** 556/556 reviewed; 0 pending; 133 modeled; 31 private-only.
**Source re-mining status:** 556/556 full-spectrum re-mined; 0 old-rubric-only notes remain.
**Source-note cluster status:** source-note mining complete; no pending cluster review items remain.

**Recommended work package:** **Post-notes Operator UI Clarity** — 1 concrete live item / 6 tracked.
**Next concrete entry:** **Post-mining modeled tool builder implementation backlog**
**Ownership area:** `ui-ux/operator-surfaces`
**Package dependencies:** none.
**Package detail:** Use the Product Hardening Dashboard for full track ledgers and `data/product-hardening/work-packages.js` for the long-form package guidance.
**Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.

**Highest-priority concrete live items:**
1. **Post-mining modeled tool builder implementation backlog** — The implemented-builder audit is complete. The remaining modeled inventory is now grouped into functional Tool Library slices so agents can burn it down coherently instead of staring at a flat chip dump.
2. **Post-mining runtime and old-layer retirement audit** — The Tool Library route now uses the compact current Tool Builder extension plan. Dashboard and non-Tools product-hardening routes still need separate current-owner/equivalence retirement proof before this item can close.
3. **Post-mining regression speed and coverage pass** — With the note queue closed, shorten slow historical/browser checks where proven redundant while keeping exact-head full regression and browser smoke meaningful.
4. **Quiet service worker caching** — Improve repeat-load and offline behavior without prompting users to install anything.
5. **IndexedDB workspace storage** — Support durable larger local workspaces, multiple engagements, and cached indexes while remaining browser-local.

**Queue automation:** `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/build-next-queue-hygiene-current.js`, `data/product-hardening/note-progress-current.js`, `data/product-hardening/source-note-clusters-current.js`, and `data/product-hardening/work-packages.js` are the queue owners. The dashboard and this README projection consume those same sources.
Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required. Use `#/dashboard` for the Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use `node tools/scope-check.js` as the focused inner-loop gate during development. [`BUILDING.md`](BUILDING.md) owns preflight, full-regression, and exact-head merge-readiness rules. CI owns the complete historical regression chain on explicit full-regression heads and `main`.

For Tool Builder inventory organization work, run:

```bash
node --check data/product-hardening/tool-builder-backlog-current.js
node tests/run-tool-builder-inventory-organization-tests.js
```

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
