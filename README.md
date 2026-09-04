# Obol - Offensive Box Operations Ledger

Obol is a static, browser-local workspace for OSCP-style labs, Active Directory practice, and CTFs. It tracks targets, Evidence, Next Steps, command-builder guidance, and report readiness without executing commands for the operator.

Live site: `https://platocres.github.io/obol/`

Current release: **v9.56**

Open `#/dashboard` for the active Product Hardening Dashboard and Product Build Next queue.

The README is a current-state entry point, not a changelog. Release history lives in [`CHANGELOG.md`](CHANGELOG.md); the release/build workflow in [`BUILDING.md`](BUILDING.md); the full agent build loop in [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md).

## Continue developing (start here)

Told to "read the README and keep developing"? This is the single agent quickstart. Do this, no further instruction required:

1. **One PR.** Confirm there is no open release/product-hardening PR. Continue it if one exists; otherwise open exactly one non-draft release/product-hardening PR. Do not use a Draft to Ready transition as a release gate.
2. **Read the operating docs.** Read this README, [`BUILDING.md`](BUILDING.md), [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md), and [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md). For notes work also read [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md), [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md).
3. **Do the queue.** Start with the highest-priority Product Build Next item below unless the user directs otherwise. Treat it as the entry point into the recommended coherent work package, then complete as many items as safely fit the same ownership area, architectural context, and blast radius. Every item advanced or closed still needs its own acceptance criteria, validation commands, proof files, and item-specific tests.
4. **Re-mine raw notes, not summaries.** The active notes work is source re-mining. Clone the private source repo [`platocres/obol-source-notes`](https://github.com/platocres/obol-source-notes), open the exact raw ENEX directory at [`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw), run `git lfs pull` to fetch the raw `*.enex`, and read the **actual raw note bodies**. If the agent runtime cannot clone or read Git LFS directly, use the complete sequential packets at `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json`; they are generated from verified raw ENEX sources, cover 556/556 notes, and must show zero truncation. Full mechanics: [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) and [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md).
5. **Extract the value, not the wording.** Use the source's educational content aggressively: methodology, decision logic, proof boundaries, failure modes, examples, troubleshooting, cleanup, report guidance, tool behavior, command patterns, and missing product capabilities. Public Obol must contain Obol-owned rewritten guidance, synthetic examples, generalized templates, path logic, tool cards, analyzers, and lessons. Do not copy or lightly paraphrase course prose, walkthroughs, screenshots, target details, flags, credentials, or exact solution chains. See [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md).
6. **Land it additively and prove it.** Wire new outputs into the actual user-visible Next Steps / Orange path surface where relevant. Record a per-note, per-dimension re-mining outcome (`added`, `covered`, `queued`, `private-only`, `not-applicable`, or `blocked`) with proof. Do not add wrapper, overlay, release-specific patch, or parallel-registry shortcuts.
7. **Check the live tracking source.** Do not use `CHANGELOG.md` to decide what remains to be re-mined. CHANGELOG is release narrative only. Current tracking lives in `data/product-hardening/note-progress-current.js`, Product Build Next, and the Product Hardening Dashboard. A note is not complete just because an older release mentioned it.
8. **Release every product build.** Bump the version when the product changes, sync generated outputs, add the release doc, CHANGELOG entry, and test suite, and keep the exact final head green. See [`BUILDING.md`](BUILDING.md).

## Current agent directive

Re-mine already-reviewed notes from the original private source notes before starting new pending-note packets, unless the user explicitly overrides that order. Return to the raw note or to the complete sequential private packet generated from verified raw ENEX, not the existing public Field Note, prior disposition, old themed artifact, or truncated review window. Notes work is additive to the Orange-derived path: attach to or extend existing points, never delete or narrow them. Extract all durable educational and product value, but re-author it into Obol-owned public-safe guidance rather than copying or lightly paraphrasing source/course expression. Every re-mined dimension needs auditable negative proof; blank or generic `none` or `no change` entries are invalid. Details: [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md), [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md), [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md).

## Product contract

Obol remains a website the user can simply visit and use: no backend, account system, telemetry, install prompt, or automatic command execution. **Human-run commands only** — Obol builds and explains commands; the operator runs them externally in an authorized environment and returns output for Evidence review. The normal loop is `Targets -> Evidence -> Next Steps -> operator runs command externally -> Evidence review -> Next Steps recalculation -> Report`. Command recognition is not success; durable facts come only from explicit supported Evidence. See [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md).

## Required context map

- [`docs/AGENT-WORKFLOW.md`](docs/AGENT-WORKFLOW.md) - the do-this-now build loop, including raw-source note re-mining.
- [`docs/RAW-NOTES-LFS.md`](docs/RAW-NOTES-LFS.md) - exact Git LFS proof, complete sequential packet fallback, and the rule that old themed/truncated artifacts are not exhaustive source material.
- [`BUILDING.md`](BUILDING.md) - release flow, validation tiers, one-open-PR rule, and merge-readiness contract.
- [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md) - active v9 product vision, tracks, work-package rules, and item Definition of Done.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/RUNTIME-COMPACTION.md`](docs/RUNTIME-COMPACTION.md) - runtime ownership and the retirement lifecycle.
- [`docs/PROOF-CONTRACT.md`](docs/PROOF-CONTRACT.md) - Evidence, proof boundaries, manual outcomes, and report readiness.
- [`docs/TOOL-BUILDER-COVERAGE.md`](docs/TOOL-BUILDER-COVERAGE.md) - the Tool Builder Platform and runnable-tool inventory.
- [`docs/NOTE-DERIVATION-STANDARD.md`](docs/NOTE-DERIVATION-STANDARD.md) - the rule for extracting all useful source lessons while re-authoring public Obol content into original guidance.
- [`docs/NOTE-MINING-RUBRIC.md`](docs/NOTE-MINING-RUBRIC.md), [`docs/NOTES-INTEGRATION.md`](docs/NOTES-INTEGRATION.md), and [`docs/NOTES-IMPACT.md`](docs/NOTES-IMPACT.md) - source re-mining rubric, the private-source boundary ([`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw)), and the notes-to-product decision model.
- [`docs/UX-QUALITY.md`](docs/UX-QUALITY.md) and [`docs/CORRECTIVE-PLAN.md`](docs/CORRECTIVE-PLAN.md) - UX goals and the durable corrective roadmap.
- [`docs/NORTH-STAR.md`](docs/NORTH-STAR.md) and [`docs/ORANGE-SOURCE-DEPTH.md`](docs/ORANGE-SOURCE-DEPTH.md) - completed Orange methodology/source accounting and the regression baseline.
- [`CHANGELOG.md`](CHANGELOG.md) - release history only, not the live re-mining tracker.

## Active product queue

Product Build Next is the only active development queue. Its atomic source of truth is `data/product-hardening/product-hardening-queue.js`; complete private packet metrics live in `data/product-hardening/source-review-packets-current.js`; re-mining and notes projections live in `data/product-hardening/note-progress-current.js`; queue hygiene lives in `data/product-hardening/build-next-queue-hygiene-current.js`; coherent multi-item metadata lives in `data/product-hardening/work-packages.js`. The README and Product Hardening Dashboard consume these same sources, so the generated block below stays in sync with the dashboard. Queue tracks and rules live in [`docs/PRODUCT-HARDENING.md`](docs/PRODUCT-HARDENING.md).

### Product Build Next

<!-- OBOL-PRODUCT-BUILD-NEXT:START -->
This block is generated from `data/product-hardening/product-hardening-queue.js` plus `data/product-hardening/build-next-queue-hygiene-current.js`. Do not edit it manually.
Recommended work-package metadata comes from `data/product-hardening/work-packages.js`.
Runtime consolidation figures come from `data/runtime-consolidation-current.js`, the same projection the Product Hardening Dashboard renders.

**Current product-hardening queue:** 220/653 complete (34%), 9 concrete queued, 11 modeled/standing items.
**Private notes source:** [`https://github.com/platocres/obol-source-notes/tree/main/sources/raw`](https://github.com/platocres/obol-source-notes/tree/main/sources/raw) — 556 notes and 1326 embedded resources accounted.
**Private review packets:** `platocres/obol-source-notes@agent/review-packets:data/review-packets/manifest.json` — 556/556 notes in 29 complete-text packets, 0 truncated, 8,725,188 cleaned text chars.
**Raw source proof:** workflow run 33877189291 verified HTB ENEX 194,191,214 bytes sha256 `ceeab3da0770ecd3…` before packet generation.
**Notes Integration:** 135/556 reviewed — 102 modeled, 28 private-only, 421 pending.
**Derived note guidance:** 56 Field Notes · 51 tool-bound · 53 Path-bound · 17 Evidence · 5 Report.
**Declared note-driven product mechanics:** 11 total · 1 builder · 0 Path logic · 0 Evidence parser · 0 report generator · 0 workflow.
**Latest mined themes:** Linux local privilege escalation, Credentials / auth material, Object authorization / IDOR, Windows local privilege escalation.
**Notes impact contract:** `docs/NOTES-IMPACT.md`.
**Source re-mining:** old-rubric reviewed 135/556 · full-spectrum re-mined 19/135 · old-rubric-only remaining 116.
**Negative finding outcomes:** added 7 · covered 150 · queued 27 · private-only 24 · not-applicable 96 · blocked 0.
**Re-mining red flags:** 0 currently flagged across 11 invalid/missing-proof guardrails.
**Extraction dimensions:** 16 tracked — Path bindings, tool cards, GUI controls, scripts/one-liners, command templates, terminal analyzers, Evidence expectations, path movement, lessons/examples, troubleshooting, cleanup, report guidance, product mechanics, product gaps, and additive Orange baseline.
**Re-mining dashboard/schema:** complete — overview-first dashboard with drill-down detail sections for the same generated state.
**Runtime consolidation:** 5 operator startup requests, down from 286 (98% fewer).
**Current runtime ownership areas:** 7 owners account for 272 historical fragments — 215 semantically flattened, 57 still exact-owned; 55 fragments stay retired in the frozen ledger.
**Runtime area owners:** Domain data (103, semantic-snapshot) · Core state and derivation (69, semantic-delta-replay) · Report base and application UI (43, semantic-delta-replay) · Evidence parsing (37, ordered-fragment-concatenation) · Nmap builders (3, ordered-fragment-concatenation) · Report overlays (14, ordered-fragment-concatenation) · Tool reference data (3, ordered-fragment-concatenation).
**Measured in Chromium (v9.40):** Home 321→19 · Next Steps 329→27 · Evidence 365→21 · Report 335→20 JavaScript/CSS requests.
**Runtime compaction contract:** `docs/RUNTIME-COMPACTION.md`.

**Recommended work package:** **Notes Impact and Source Re-mining** — 6 concrete live items / 18 tracked.
**Next concrete entry:** **Re-mine reviewed XSS and session notes**
**Ownership area:** `notes/impact-packets`
**Package guidance:** Treat the 556-note disposition item as the umbrella, but do not let the umbrella hide the immediate work: re-mine already-reviewed notes from their original private sources before fresh pending-note packets. The note-progress projection splits the source re-mining gate into dashboard/schema plus themed re-mining rows; those rows remain additive queue projections while this package stays compatible with base queue validation. Re-mining must check for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, actual Next Steps path placement, lesson boxes, examples, troubleshooting, cleanup, report guidance, code-level mechanics, and product gaps. Preserve the Orange-derived path as an additive baseline and do not use disposable wrapper layers.
**Package dependencies:** Notes Integration Foundation

**Concrete live items in this package:**
- **Re-mine reviewed XSS and session notes** — Return to the original private XSS, browser impact, cookie, CSP, request-context, and session notes already reviewed. Mine again for useful tool cards, switches, scripts, one-liners, analyzers, Path attachments, lessons, examples, troubleshooting, cleanup, report guidance, and product gaps.
- **Re-mine reviewed credentials and auth notes** — Return to the original private credential, hash, ticket, certificate, key, cookie, token, validation-boundary, and auth-failure notes already reviewed. Add missed builder modes, GUI switches, command templates, analyzers, credential routing, Path handoffs, lessons, troubleshooting, cleanup, report guidance, and product gaps.
- **Re-mine reviewed Linux privesc notes** — Return to the original private Linux privilege-escalation notes already reviewed. Mine again for missed tool cards, shell one-liners, scripts, GUI controls, analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
- **Re-mine private-only and superseded notes** — Return to original private notes previously marked private-reference-only, superseded, rejected, or reviewed-not-modeled. Keep raw recipes and private material private, but re-check whether public-safe tool ideas, command templates, analyzer rules, lesson boxes, troubleshooting, cleanup, report guidance, or additive Path improvements were missed.
- **Notes packet: XSS and session impact** — Mine XSS, browser/session impact, cookie/CSP controls, request context, proof boundaries, remediation, and missing product branches.
- **Notes packet: credentials and authentication** — Mine credentials, hashes, tickets, certificates, validation boundaries, auth failure modes, tool options, and cross-tool/path handoffs.

**Related items to consider, not automatically in scope:** Design contextual field-notes disclosure.

**Standing source re-mining gates:**
- **Re-mine all already-reviewed notes from original sources** — standing gate, not the next concrete batch. Return to the original private source note for every already-reviewed modeled, guidance-only, reviewed-not-modeled, private-only, superseded, or rejected row. Do not merely inspect the existing public Field Note or prior rationale. Re-mine from scratch for tool cards, GUI switches, scripts, one-liners, terminal-output analyzers, additive Path bindings, lesson boxes, examples, troubleshooting, cleanup, report guidance, product mechanics, and product gaps.
- **Burn down all 556 note dispositions** — standing gate, not the next concrete batch. Umbrella disposition goal for all 556 notes. Fresh pending-note packets remain queued beneath the full-spectrum re-mining gate: agents must first re-mine already-reviewed notes from the original private sources, add missed product outputs, preserve the Orange-derived path additively, and prove every negative finding with an auditable per-dimension outcome.

**Highest-priority concrete live items:**
1. **Re-mine reviewed XSS and session notes** — Return to the original private XSS, browser impact, cookie, CSP, request-context, and session notes already reviewed. Mine again for useful tool cards, switches, scripts, one-liners, analyzers, Path attachments, lessons, examples, troubleshooting, cleanup, report guidance, and product gaps.
2. **Re-mine reviewed credentials and auth notes** — Return to the original private credential, hash, ticket, certificate, key, cookie, token, validation-boundary, and auth-failure notes already reviewed. Add missed builder modes, GUI switches, command templates, analyzers, credential routing, Path handoffs, lessons, troubleshooting, cleanup, report guidance, and product gaps.
3. **Re-mine reviewed Linux privesc notes** — Return to the original private Linux privilege-escalation notes already reviewed. Mine again for missed tool cards, shell one-liners, scripts, GUI controls, analyzer expectations, additive Path branches, proof boundaries, lesson boxes, examples, troubleshooting, cleanup, report guidance, and product gaps without deleting Orange baseline path items.
4. **Re-mine private-only and superseded notes** — Return to original private notes previously marked private-reference-only, superseded, rejected, or reviewed-not-modeled. Keep raw recipes and private material private, but re-check whether public-safe tool ideas, command templates, analyzer rules, lesson boxes, troubleshooting, cleanup, report guidance, or additive Path improvements were missed.
5. **Notes packet: XSS and session impact** — Mine XSS, browser/session impact, cookie/CSP controls, request context, proof boundaries, remediation, and missing product branches.
6. **Notes packet: credentials and authentication** — Mine credentials, hashes, tickets, certificates, validation boundaries, auth failure modes, tool options, and cross-tool/path handoffs.
7. **UI quality audit rubric** — Add a fixed per-screen audit checklist under docs/visual-qa/ (hierarchy, density, consistency, affordance, state feedback, accessibility). Run once per primary screen and file each finding as its own queue item instead of ad-hoc fixes.
8. **Quiet service worker caching** — Improve repeat-load and offline behavior without prompting users to install anything.

**Queue hygiene guardrail:** Completed packet work and standing umbrella gates must not appear as the next concrete build. `data/product-hardening/build-next-queue-hygiene-current.js` enforces this before README/dashboard rendering and CI validates it.

**Track status:**
- **Critical correctness:** 5/5 complete (100%), 0 modeled.
- **Architecture / runtime:** 19/22 complete (86%), 3 modeled.
- **UI / UX repair:** 10/11 complete (91%), 1 modeled.
- **Tool GUI builders:** 19/19 complete (100%), 0 modeled.
- **Credential modes:** 14/14 complete (100%), 0 modeled.
- **Manual outcomes:** 8/8 complete (100%), 0 modeled.
- **Notes integration:** 136/556 complete (24%), 4 modeled.
- **Offline / performance:** 1/6 complete (17%), 0 modeled.
- **Testing / visual QA:** 8/12 complete (67%), 3 modeled.

Generated by `node tools/sync-product-build-next.js --write`. Verify with `node tools/sync-product-build-next.js --check`.
<!-- OBOL-PRODUCT-BUILD-NEXT:END -->

## Run locally

Open `index.html` in a browser. No server or package install is required. Use `#/dashboard` for the Product Hardening Dashboard or `product-hardening.html` for its standalone entrypoint.

## Validation

Use `node tools/scope-check.js` as the focused inner-loop gate during development. [`BUILDING.md`](BUILDING.md) owns the preflight and full-regression requirements and lists the permanent notes-impact and runtime-consolidation checks; CI owns the complete historical regression chain on explicit full-regression heads and `main`.

## GitHub Pages

The repository serves directly from `main` and `/ (root)`.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test.
