# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.77**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is the entrypoint and current handoff. The README is not a changelog. Detailed build mechanics live in [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md), release mechanics live in [`BUILDING.md`](BUILDING.md), and release history lives in [`CHANGELOG.md`](CHANGELOG.md).

## Continue developing (start here)

Told to "read the README and keep developing"? This is the single agent quickstart. It is also the future-agent handoff.

Agents may be operating from Kali or from a Windows host. Obol still never executes those commands for the operator; the site builds human-reviewed commands, analyzes pasted output, and moves the Next Steps path from supported Evidence.

1. **Use one active PR.** Keep one open release/product-hardening PR for active product-hardening work. Check for open release/product-hardening PRs first. Continue the active one if it exists; otherwise open one normal non-draft PR for the work.
2. **Read the canonical docs by ownership.** Use [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) for the full agent loop, [`BUILDING.md`](BUILDING.md) for release/CI rules, [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the product-hardening contract, and the notes docs below only when the queued work involves note mining.
3. **Do Product Build Next.** Start with the highest-priority Product Build Next item. Treat it as the entry point into the recommended coherent work package, not as a one-item limit. Use the generated Product Build Next item below unless the user explicitly directs otherwise. The dashboard and README consume the same queue sources, so do not hand-edit the generated block outside the queue owners or their current-release projection.
4. **Batch carefully.** Use the recommended coherent work package when it keeps one PR inside the same ownership area. Every item advanced or closed still needs its own acceptance criteria and proof.
5. **For notes work, use the generated Next notes batch or cluster queue.** Re-mine from raw private notes or the complete sequential packet fallback, not old summaries. **Extract the value, not the wording.** Public Obol gets re-authored guidance, synthetic examples, generalized templates, path logic, tool cards, analyzers, lesson boxes, and product mechanics; it must not copy course prose, flags, credentials, targets, screenshots, or exact solution chains. With v9.75, future note builds must use the cluster queue in `data/product-hardening/source-note-clusters-current.js` and mine whole clusters instead of blind 20-note slices. See [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md), [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md), and [`docs/SOURCE-NOTE-CLUSTERING.md`](docs/SOURCE-NOTE-CLUSTERING.md).
6. **Use live tracking, not release narrative.** Do not use `CHANGELOG.md` to decide what remains to be re-mined. Current status lives in Product Build Next, the Product Hardening Dashboard, `data/product-hardening/source-note-clusters-current.js`, and `data/product-hardening/note-progress-current.js`.
7. **Land and prove the work.** Wire new outputs into the actual user-visible Next Steps / Orange path surface where relevant, update stable current owners instead of adding disposable wrappers, sync generated outputs, run the focused validators for the touched ownership area, and keep the exact final head green.

Product Build Next source note: This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually. Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.

## Product contract

Obol remains a website the user can visit and use: no backend, account system, telemetry, install prompt, or automatic command execution. Commands are built for humans to review and run externally in authorized environments. The normal loop is `Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`. Command recognition is not success; durable facts come only from supported Evidence. See [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Canonical docs

- [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) - detailed build loop and notes-mining workflow.
- [`BUILDING.md`](BUILDING.md) - release flow, validation tiers, PR contract, generated sync commands, and merge readiness.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active product-hardening vision, tracks, work-package rules, and Definition of Done.
- [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md) - private source access proof and complete packet fallback.
- [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md), and [`docs/SOURCE-NOTE-CLUSTERING.md`](docs/SOURCE-NOTE-CLUSTERING.md) - notes derivation, extraction, clustering, integration, and product-impact rules.
- [`docs/ACTIONABLE-CARD-CONTRACT.md`](docs/ACTIONABLE-CARD-CONTRACT.md) and [`docs/CARD-UI-STANDARD.md`](docs/CARD-UI-STANDARD.md) - primary card action-spine and operator UI standards.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md), [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md), [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md), and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - deeper architecture, runtime, UX, and completed Orange baseline context.

Historical Orange AD mindmap source: `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg`.

## Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
Generated from the same queue sources as the Product Hardening Dashboard. Do not edit this block manually.

**Current product-hardening queue:** 226/657 complete (34%), 6 concrete queued, 9 modeled/standing items.
**Private notes source:** [`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw) — 556 notes and 1326 embedded resources accounted.
**Private review packets:** `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json` — 556/556 notes, 29 packets, 0 truncated.
**Notes review status:** 215/556 reviewed; 341 pending; 133 modeled; 31 private-only.
**Source re-mining status:** 215/215 full-spectrum re-mined; 0 old-rubric-only notes remain.
**Source-note cluster status:** 341/341 pending notes clustered into 17 public-safe cluster review items; 0 pending notes remain unclustered.
**Next notes batch:** **IDOR, HTTP verb tampering, and authorization replay boundaries** (`source-note-cluster-web-authz-idor-verb-tampering`) — 18 notes from `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json`.
**Queue mode:** `cluster-review` for cluster `web-authz-idor-verb-tampering`.
**Selector:** Read complete packet text for cluster web-authz-idor-verb-tampering from platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json; mine the whole cluster before terminal dispositions.
**Acceptance:** Ship public-safe product mechanics from the whole cluster, then disposition each note with card/analyzer/field-note/report/queue/private rationale.

**Recommended work package:** **Notes Impact and Source Re-mining** — 2 concrete live items / 19 tracked.
**Next concrete entry:** **IDOR, HTTP verb tampering, and authorization replay boundaries**
**Ownership area:** `notes/impact-packets`
**Package dependencies:** Notes Integration Foundation.
**Package detail:** Use the Product Hardening Dashboard for full track ledgers and `data/product-hardening/work-packages.js` for the long-form package guidance.

**Highest-priority concrete live items:**
1. **IDOR, HTTP verb tampering, and authorization replay boundaries** — Cluster-driven notes gate: 18 pending source notes in `web-authz-idor-verb-tampering` must be mined from complete packet text before terminal dispositions resume.
2. **Burn down all 556 note dispositions** — Concrete notes-first gate: 341 private source notes remain pending and are now organized into 17 cluster review items; mine the active cluster queue before terminal dispositions continue.
3. **Quiet service worker caching** — Improve repeat-load and offline behavior without prompting users to install anything.
4. **IndexedDB workspace storage** — Support durable larger local workspaces, multiple engagements, and cached indexes while remaining browser-local.
5. **Web Workers for heavy tasks** — Move evidence parsing, search indexing, and report generation off the UI thread.

**Queue automation:** `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/build-next-queue-hygiene-current.js`, `data/product-hardening/note-progress-current.js`, `data/product-hardening/source-note-clusters-current.js`, and `data/product-hardening/work-packages.js` are the queue owners. The dashboard and this README projection consume those same sources.
Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required. Use `#/dashboard` for the Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use `node tools/scope-check.js` as the focused inner-loop gate during development. [`BUILDING.md`](BUILDING.md) owns preflight, full-regression, and exact-head merge-readiness rules. CI owns the complete historical regression chain on explicit full-regression heads and `main`.

Historical runtime proof wording remains available for regression ownership checks: semantic flattening plus retirement; v9.44 retirement; Current runtime ownership; CSS/theme semantic ownership; runtime-app-single-paint; **Architecture / runtime:** 19/22 complete; **Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer); 215 semantically flattened, 57 still exact-owned.

**Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer).

**Current runtime ownership areas:** 7 owners account for 272 historical fragments — 215 semantically flattened, 57 still exact-owned; 55 fragments stay retired in the frozen ledger. Report base and application UI (43, semantic-delta-replay). Evidence parsing (37, ordered-fragment-concatenation).

Historical queue proof wording remains available for regression ownership checks: critical correctness complete; UI/UX track advanced; **Critical correctness:** 5/5 complete (100%); **UI / UX repair:** 10/11 complete; **Testing / visual QA:** 8/12 complete.

Historical complete-packet proof wording remains available for regression ownership checks: 556/556 notes in 29 complete-text packets, 0 truncated, 8,725,188 cleaned text chars.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
