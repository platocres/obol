# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.70**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is the entrypoint and current handoff. Detailed build mechanics live in [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md), release mechanics live in [`BUILDING.md`](BUILDING.md), and release history lives in [`CHANGELOG.md`](CHANGELOG.md).

## Continue developing (start here)

Told to "read the README and keep developing"? This is the single agent quickstart.

1. **Use one active PR.** Check for open release/product-hardening PRs first. Continue the active one if it exists; otherwise open one normal non-draft PR for the work.
2. **Read the canonical docs by ownership.** Use [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) for the full agent loop, [`BUILDING.md`](BUILDING.md) for release/CI rules, [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) for the product-hardening contract, and the notes docs below only when the queued work involves note mining.
3. **Do Product Build Next.** Start with the generated Product Build Next item below unless the user explicitly directs otherwise. The dashboard and README consume the same queue sources, so do not hand-edit the generated block.
4. **For notes work, use the generated Next notes batch.** Re-mine from raw private notes or the complete sequential packet fallback, not old summaries. **Extract the value, not the wording.** Public Obol gets re-authored guidance, synthetic examples, generalized templates, path logic, tool cards, analyzers, lesson boxes, and product mechanics; it must not copy course prose, flags, credentials, targets, screenshots, or exact solution chains. See [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md), [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md).
5. **Use live tracking, not release narrative.** Do not use `CHANGELOG.md` to decide what remains to be re-mined. Current status lives in Product Build Next, the Product Hardening Dashboard, and `data/product-hardening/note-progress-current.js`.
6. **Land and prove the work.** Update stable current owners instead of adding disposable wrappers, sync generated outputs, run the focused validators for the touched ownership area, and keep the exact final head green.

## Product contract

Obol remains a website the user can visit and use: no backend, account system, telemetry, install prompt, or automatic command execution. Commands are built for humans to review and run externally in authorized environments. The normal loop is `Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`. Command recognition is not success; durable facts come only from supported Evidence. See [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Canonical docs

- [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) — detailed build loop and notes-mining workflow.
- [`BUILDING.md`](BUILDING.md) — release flow, validation tiers, PR contract, generated sync commands, and merge readiness.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) — active product-hardening vision, tracks, work-package rules, and Definition of Done.
- [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md) — private source access proof and complete packet fallback.
- [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) — notes derivation, extraction, integration, and product-impact rules.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md), [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md), [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md), and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) — deeper architecture, runtime, UX, and completed Orange baseline context.

## Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
Generated from the same queue sources as the Product Hardening Dashboard. Do not edit this block manually.

**Current product-hardening queue:** 226/657 complete (34%), 7 concrete queued, 9 modeled/standing items.
**Private notes source:** [`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw) — 556 notes and 1326 embedded resources accounted.
**Private review packets:** `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json` — 556/556 notes, 29 packets, 0 truncated.
**Notes review status:** 135/556 reviewed; 421 pending; 102 modeled; 28 private-only.
**Source re-mining status:** 107/135 full-spectrum re-mined; 28 old-rubric-only notes remain.
**Next notes batch:** **Old-rubric reviewed source re-mining batch 3** (`notes-batch-old-rubric-reviewed-remine-003`) — 20 notes from `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json`.
**Selector:** Select the next 20 already-reviewed notes that lack full-spectrum audit rows, using manifest/source order and excluding themes already closed by released re-mining proof.
**Acceptance:** Every selected note receives a 16-dimension re-mining audit row plus public-safe product output, covered rationale, queued product gap, or private-boundary proof. Do not advance to offline/performance work after this batch unless both note gates are complete.

**Recommended work package:** **Notes Impact and Source Re-mining** — 2 concrete live items / 18 tracked.
**Next concrete entry:** **Re-mine all already-reviewed notes from original sources**
**Ownership area:** `notes/impact-packets`
**Package dependencies:** Notes Integration Foundation.
**Package detail:** Use the Product Hardening Dashboard for full track ledgers and `data/product-hardening/work-packages.js` for the long-form package guidance.

**Highest-priority concrete live items:**
1. **Re-mine all already-reviewed notes from original sources** — Concrete notes-first gate: 28 already-reviewed old-rubric-only notes still need full-spectrum source re-mining before offline/performance work can become next.
2. **Burn down all 556 note dispositions** — Concrete notes-first gate: 421 private source notes still need disposition/mining before offline/performance work can become next.
3. **Quiet service worker caching** — Improve repeat-load and offline behavior without prompting users to install anything.
4. **IndexedDB workspace storage** — Support durable larger local workspaces, multiple engagements, and cached indexes while remaining browser-local.
5. **Web Workers for heavy tasks** — Move evidence parsing, search indexing, and report generation off the UI thread.

**Queue automation:** `data/product-hardening/product-hardening-queue.js`, `data/product-hardening/build-next-queue-hygiene-current.js`, `data/product-hardening/note-progress-current.js`, and `data/product-hardening/work-packages.js` are the queue owners. The dashboard and this README projection consume those same sources.
Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required. Use `#/dashboard` for the Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use `node tools/scope-check.js` as the focused inner-loop gate during development. [`BUILDING.md`](BUILDING.md) owns preflight, full-regression, and exact-head merge-readiness rules. CI owns the complete historical regression chain on explicit full-regression heads and `main`.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
