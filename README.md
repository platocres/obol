# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v10.08**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is the entrypoint and current handoff. The README is not a changelog. Detailed build mechanics live in [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md), release mechanics live in [`BUILDING.md`](BUILDING.md), connector-only fallback workflow lives in [`docs/CONNECTOR-FALLBACK.md`](docs/CONNECTOR-FALLBACK.md), the tool-builder backlog sequence and builder/Evidence Definition of Done live in [`docs/TOOL-BUILDER-BUILD-QUEUE.md`](docs/TOOL-BUILDER-BUILD-QUEUE.md), and release history lives in [`CHANGELOG.md`](CHANGELOG.md).

## Continue developing (start here)

Told to "read the README and keep developing"? This is the single agent quickstart. It is also the future-agent handoff.

Agents may be operating from Kali or from a Windows host. Obol still never executes those commands for the operator; the site builds human-reviewed commands, analyzes pasted output, and moves the Next Steps path from supported Evidence.

1. **Use one active PR.** Keep one open release/product-hardening PR for active product-hardening work. Check for open release/product-hardening PRs first. Continue the active one if it exists; otherwise open one normal non-draft PR for the work.
2. **Read the canonical docs by ownership.** Use [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) for the full agent loop, [`BUILDING.md`](BUILDING.md) for release/CI rules, [`docs/CONNECTOR-FALLBACK.md`](docs/CONNECTOR-FALLBACK.md) when shell GitHub access or DNS fails, [`docs/TEST-GOVERNANCE.md`](docs/TEST-GOVERNANCE.md) for the required PR checks and how to update tests when a release advances, [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the product-hardening contract, [`docs/TOOL-BUILDER-BUILD-QUEUE.md`](docs/TOOL-BUILDER-BUILD-QUEUE.md) for the modeled-tool implementation sequence, minimal-command rule, and mandatory Evidence-ingestion/Next-Steps contract, and the notes docs only when Product Build Next or the user explicitly asks for historical note-derivation work.
3. **Do Product Build Next.** Start with the highest-priority Product Build Next item. Treat it as the entry point into the recommended coherent work package, not as a one-item limit. Use the generated Product Build Next item below unless the user explicitly directs otherwise. The dashboard and README consume the same queue sources, so do not hand-edit the generated block outside the queue owners or their current-release projection.
4. **Batch carefully.** Use the recommended coherent work package when it keeps one PR inside the same ownership area. Every item advanced or closed still needs its own acceptance criteria and proof. For Tool Builder releases, a completed version is removed from the active queue in the same PR; history belongs in the changelog and release document.
5. **Treat note-mining docs as closed-source reference unless reactivated.** Source-note mining completed in v9.95. Do not look for another generated notes batch by default, and do not resurrect old cluster items as public UI filler. Historical note-derived work still uses the rule: **Extract the value, not the wording.** Use [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md), [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md), and [`docs/SOURCE-NOTE-CLUSTERING.md`](docs/SOURCE-NOTE-CLUSTERING.md) as provenance and safety references only unless Product Build Next explicitly reopens note-derived work.
6. **Use live tracking, not release narrative.** Do not use `CHANGELOG.md` to decide what remains to be re-mined. Current status lives in Product Build Next, the Product Hardening Dashboard, `data/product-hardening/source-note-clusters-current.js`, and `data/product-hardening/note-progress-current.js`.
7. **Land and prove the work.** Wire new outputs into the actual user-visible Next Steps / Orange path surface where relevant, update stable current owners instead of adding disposable wrappers, sync generated outputs, run the focused validators for the touched ownership area, and keep the exact final head green. A tool must not be promoted to implemented merely because it renders a command: decision-relevant output must have executable Evidence ingestion, conservative proof boundaries, and Next Steps movement/blocking where applicable. Modeled tools remain modeled until a real schema-driven builder exists with minimum viable command generation, supplied/Evidence-derived prefill, additive toggles, executable Evidence ingestion, and path movement or blocking where the Evidence supports it. If local shell access to GitHub fails, follow [`docs/CONNECTOR-FALLBACK.md`](docs/CONNECTOR-FALLBACK.md) and keep fixing the same PR through the connector until required checks pass.

The completed broad audit item was **Post-mining Next Steps and tool-card clarity audit**. The v10.08 implemented-builder audit is complete, but the modeled Tool Builder implementation backlog remains active until every modeled inventory record is implemented, superseded, or rejected with proof.

Product Build Next source note: This block is generated from `data/product-hardening/product-hardening-queue.js`. Do not edit it manually. Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.

## Product contract

Obol remains a website the user can visit and use: no backend, account system, telemetry, install prompt, or automatic command execution. Commands are built for humans to review and run externally in authorized environments. The normal loop is `Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`. Command recognition is not success; durable facts come only from supported Evidence. See [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Canonical docs

- [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) - detailed build loop and notes-mining workflow.
- [`BUILDING.md`](BUILDING.md) - release flow, validation tiers, PR contract, generated sync commands, and merge readiness.
- [`docs/CONNECTOR-FALLBACK.md`](docs/CONNECTOR-FALLBACK.md) - connector-only workflow for runtimes that cannot resolve GitHub from the shell; failed local DNS does not weaken the exact-head green-check rule.
- [`docs/TEST-GOVERNANCE.md`](docs/TEST-GOVERNANCE.md) - the lean test model: the two required PR checks (`full-historical-regression` aggregate plus `browser-smoke`), the granular phase jobs behind them, and how to update tests when a release advances.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active product-hardening vision, tracks, work-package rules, and Definition of Done.
- [`docs/TOOL-BUILDER-BUILD-QUEUE.md`](docs/TOOL-BUILDER-BUILD-QUEUE.md) - exact next-build sequence for modeled-to-implemented builders plus the permanent minimal-command, executable Evidence-ingestion, conservative proof, Next Steps handoff, and completed-batch removal contract.
- [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md) - private source access proof and complete packet fallback.
- [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md), and [`docs/SOURCE-NOTE-CLUSTERING.md`](docs/SOURCE-NOTE-CLUSTERING.md) - historical notes derivation, extraction, clustering, integration, and product-impact rules; use as reference unless current Product Build Next explicitly reopens note-derived work.
- [`docs/ACTIONABLE-CARD-CONTRACT.md`](docs/ACTIONABLE-CARD-CONTRACT.md) and [`docs/CARD-UI-STANDARD.md`](docs/CARD-UI-STANDARD.md) - primary card action-spine and operator UI standards.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md), [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md), [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md), and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - deeper architecture, runtime, UX, and completed Orange baseline context.

Historical Orange AD mindmap source: `https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg`.

## Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
Generated from the same queue sources as the Product Hardening Dashboard. Do not edit this block manually.

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

**Highest-priority concrete live items:**
1. **Post-mining modeled tool builder implementation backlog** — v10.08 completed the implemented-builder audit only. Remaining modeled inventory records still need schema-driven builders or explicit supersession/rejection with the full Tool Builder contract before this backlog can close.
2. **Post-mining runtime and old-layer retirement audit** — Use the current-owner/equivalence/fixture lifecycle to identify old note-mining and historical layers that can be retired without changing observable behavior.
3. **Post-mining regression speed and coverage pass** — With the note queue closed, shorten slow historical/browser checks where proven redundant while keeping exact-head full regression and browser smoke meaningful.
4. **Quiet service worker caching** — Improve repeat-load and offline behavior without prompting users to install anything.
5. **IndexedDB workspace storage** — Support durable larger local workspaces, multiple engagements, and cached indexes while remaining browser-local.

**Queue automation:** `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/build-next-queue-hygiene-current.js`, `data/product-hardening/note-progress-current.js`, `data/product-hardening/source-note-clusters-current.js`, and `data/product-hardening/work-packages.js` are the queue owners. The dashboard and this README projection consume those same sources.
Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Tool Builder implementation queue

This section is active work only. Completed Tool Builder batches are removed when they land; their history lives in `CHANGELOG.md` and release docs. The full contract remains in [`docs/TOOL-BUILDER-BUILD-QUEUE.md`](docs/TOOL-BUILDER-BUILD-QUEUE.md): start with the minimal valid command for the selected tool/mode, fill only real collected target/material parameters, parsed Evidence/workspace parameters, or safe defaults, add every extra flag through explicit GUI controls, and ship executable Evidence ingestion for every decision-relevant mode.

Batch labels are decoupled from the site release number: a batch keeps its name until it lands, so other tracks can advance the version without renumbering unfinished Tool Builder work.

Active batch:

1. **Remaining modeled tool implementation backlog.** v10.08 completed the **Implemented-tool Evidence and cross-surface audit** for builders already marked implemented, but modeled tools remain modeled until a real schema-driven builder exists. Every remaining modeled tool must ship the same full contract: minimum viable command generation, supplied/Evidence-derived prefill, additive GUI toggles, executable Evidence ingestion, proof boundaries, cleanup/report guidance, and conservative Next Steps movement or blocking where applicable.

Future Tool Builder work should burn down this active modeled inventory instead of pretending the backlog is closed.

## Run locally

Open `index.html` in a browser. No server or package install is required. Use `#/dashboard` for the Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use `node tools/scope-check.js` as the focused inner-loop gate during development. [`BUILDING.md`](BUILDING.md) owns preflight, full-regression, and exact-head merge-readiness rules. CI owns the complete historical regression chain on explicit full-regression heads and `main`.

Historical runtime proof wording remains available for regression ownership checks: semantic flattening plus retirement; v9.44 retirement; Current runtime ownership; CSS/theme semantic ownership; runtime-app-single-paint; **Architecture / runtime:** 19/22 complete; **Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer); 215 semantically flattened, 57 still exact-owned.

**Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer).

**Current runtime ownership areas:** 7 owners account for 272 historical fragments - 215 semantically flattened, 57 still exact-owned; 55 fragments stay retired in the frozen ledger. Report base and application UI (43, semantic-delta-replay). Evidence parsing (37, ordered-fragment-concatenation).

Historical queue proof wording remains available for regression ownership checks: critical correctness complete; UI/UX track advanced; **Critical correctness:** 5/5 complete (100%); **UI / UX repair:** 10/11 complete; **Testing / visual QA:** 8/12 complete.

Historical complete-packet proof wording remains available for regression ownership checks: 556/556 notes in 29 complete-text packets, 0 truncated, 8,725,188 cleaned text chars.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
