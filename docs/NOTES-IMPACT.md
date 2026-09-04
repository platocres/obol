# Notes-to-Product Impact Contract

This document is the operating contract for turning private source notes into observable Obol product improvements.

The 556-note disposition ledger remains the source-accounting umbrella. A reviewed count is not, by itself, evidence that the product improved. Every modeled note must identify what the durable lesson became and where that output lives.

## Required decision for every reviewed note

Every reviewed source note ends in one terminal disposition: `modeled`, `superseded`, `rejected`, or `private-reference-only`.

When the disposition is `modeled`, the reviewer must decide which output classes apply:

| Output class | Meaning |
| --- | --- |
| Field Note | Contextual educational guidance shown only where relevant. |
| Lesson Box | A collapsible, path-local teaching panel explaining the reasoning, examples, mistakes, and mental model for the current path point. |
| Tool Card | A new tool card or a substantive update to an existing card, including purpose, inputs, command template, expected output, proof boundary, troubleshooting, and cleanup. |
| GUI Control | A command-builder switch, mode, preset, credential option, output option, warning, or execution-context selector. |
| Script or One-Liner | A reusable public-safe command, script, or template derived from the note and generalized with variables rather than copied private substance. |
| Terminal Analyzer | Parser or interpretation behavior for pasted output that helps Evidence review or moves the operator further down Next Steps. |
| Tool Builder Change | A command variant, switch, mode, preset, output option, warning, or failure behavior requires a code-level builder change. |
| Path Change | A new branch, blocker, unlock, next-step possibility, decision rule, or additive path-node attachment requires a code-level Path change. |
| Evidence Change | Proof capture, parser expectations, or a proof boundary requires Evidence behavior to change. |
| Report Change | Reporting, remediation, notes, commands, or proof wording requires report behavior to change. |
| Troubleshooting or Cleanup | Failure-mode guidance, rollback commands, restoration notes, or state-changing cautions are added to the relevant path/tool context. |
| Product Gap | The note exposes a capability Obol should have but the current pass cannot implement; the gap must be recorded concretely. |
| Private Only | The source remains useful for private lookup but should not create public product material. |

A modeled note must not stop at a Field Note when the reviewed source clearly exposes a missing tool card, GUI control, reusable command, realistic Path branch, Evidence rule, output analyzer, cleanup step, report improvement, or product gap. If contextual guidance is sufficient, that decision must be explicit rather than assumed.

Beginning with v9.29 review waves, every new modeled disposition must therefore contain either at least one `productChanges` declaration with implementation/test `proofRefs`, or a substantive `guidanceOnlyReason` explaining why the normalized Field Note/context binding is sufficient. The pre-v9.29 ledger is preserved as historical source-review evidence and is not retroactively rewritten to manufacture product-change claims that were not recorded at the time.

## Re-mining already-reviewed notes

The corrective pass for previously reviewed notes is **re-mining**, not ordinary audit. Re-mining means returning to the original private source note and reviewing it again under [`NOTE-MINING-RUBRIC.md`](NOTE-MINING-RUBRIC.md). The reviewer must not limit the pass to prior public Field Notes, existing rationale, output IDs, previous packet accounting, or the old disposition.

Every already-reviewed note, including previously modeled, guidance-only, reviewed-not-modeled, private-reference-only, superseded, and rejected rows, remains suspect until the original source has been re-read under the full extraction rubric.

For each re-mined source, the audit record must answer whether the original source yielded or ruled out:

- tool cards;
- GUI switches, modes, presets, warnings, and execution contexts;
- scripts, one-liners, and command templates;
- terminal-output analyzers;
- path bindings, child steps, adjacent branches, blockers, unlocks, or decision rules;
- Evidence parser expectations and proof boundaries;
- collapsible lesson boxes and rewritten examples;
- troubleshooting and failure-mode guidance;
- cleanup and rollback guidance;
- report, notes, and command-log guidance;
- product gaps;
- private-only material that cannot be published.

A re-mined note can add outputs to an existing modeled note. The goal is to add missed useful product material, not to replace the original public guidance unless it is wrong.

## Additive path rule

The Orange-derived path remains the baseline methodology. Note-driven changes are additive unless a separate migration item explicitly authorizes replacement and proves equivalence.

Notes should attach guidance, examples, tool cards, analyzers, scripts, and decision logic to the appropriate existing Orange path point whenever possible. If no existing point fits, create an adjacent additive path node or a queued product gap. Do not delete, narrow, or replace original Orange path items during note mining.

This protects the source-fidelity baseline while allowing Brandon's notes to make each path point more useful, better explained, more tool-aware, and more capable of interpreting terminal output.

## Guidance bindings are not code changes

The impact projection deliberately separates **where guidance is delivered** from **what product mechanics changed**.

A Field Note with `toolIds: ['curl']` is tool-bound guidance. It means the lesson appears in curl context. It does **not** prove that the curl Tool Builder gained a switch, mode, preset, warning, or output option. Likewise, a `pathIds` binding means guidance is visible in Path context; it does not by itself prove the recommendation engine gained a new branch.

Code-level changes must be declared separately on the reviewed disposition when they occur. The supported declarations are:

- `tool-builder-change`
- `path-logic-change`
- `evidence-parser-change`
- `report-generator-change`
- `workflow-change`

A declared product change must include proof references to the implementation/tests that changed. If no code-level change is declared, the dashboard should say so and describe the output as guidance/binding rather than implying a deeper integration.

This distinction is important because the dashboard is supposed to tell the user what Obol actually gained, not inflate output counts by treating contextual placement as implementation work.

## Conversion rubric and guidance-only ratchet

The primary notes metric is mechanic conversion, not review count. `data/product-hardening/notes-impact-current.js` exposes a `rubric` projection over modeled notes:

- `mechanicBacked` — modeled notes with at least one declared product change;
- `justifiedGuidanceOnly` — modeled notes that are guidance-only **and** carry an explicit `guidanceOnlyReason`;
- `unjustifiedGuidanceOnly` — modeled notes carrying neither (the backlog);
- `mechanicConversionPct` — `mechanicBacked / modeled`, the headline number.

`tools/validate-notes-impact.js` enforces the rubric so guidance-only is a justified exception rather than the default:

1. modeled notes reviewed in wave v9.29+ must declare a product change or an explicit `guidanceOnlyReason` (per-note rule);
2. the `unjustifiedGuidanceOnly` backlog must never exceed a frozen ceiling (`backlogCeiling`, currently 43), which is the pre-v9.29 debt. New modeled notes cannot raise it because rule 1 already blocks them; `notes-mechanic-backfill` re-mines the backlog and **lowers the ceiling** as notes are converted, so the ratchet only tightens;
3. at least one modeled note must declare a real product mechanic.

Reducing review count is not progress if it grows the backlog; the ratchet makes that impossible and keeps the dashboard honest about what Obol actually gained.

## Current projection

`data/product-hardening/notes-impact-current.js` derives the current notes-to-product projection from the public-safe ledger and normalized Field Notes. It reports:

- source review funnel: total, reviewed, modeled, private-only, superseded, rejected, and pending;
- normalized public Field Notes;
- tool-bound and Path-bound contextual guidance;
- Evidence, Report, troubleshooting, cleanup, and script guidance;
- separately declared code-level product mechanics changes;
- theme coverage;
- latest review-wave impact;
- open Notes Integration queue gaps.

The Product Hardening Dashboard renders this projection directly. README generation consumes the same projection for its compact Notes Integration summary.

The next projection expansion should report re-mining progress separately from first-pass source review so a note can be visibly marked as reviewed under the old rubric but not yet re-mined under the full product-extraction rubric.

## Packet-based review

`notes-disposition-burn-down` remains the umbrella requirement that all 556 notes reach a terminal disposition. Review work beneath that umbrella should be performed and reported as coherent subject packets rather than anonymous review-count waves.

Fresh pending-note packets are blocked behind the re-mining queue unless the user explicitly overrides that order. Previously reviewed material must be re-mined from original source first because the defect lived in the old review standard.

Prefer packets such as:

- file upload and file inclusion;
- XSS and session behavior;
- credentials and authentication material;
- Windows privilege escalation;
- Linux privilege escalation;
- Active Directory and pivoting;
- web authorization and request manipulation.

A packet is complete only when its useful lessons have been normalized and any resulting tool, Path, Evidence, report, troubleshooting, cleanup, script, one-liner, analyzer, or workflow gaps have been acted on or deliberately left as explicit open gaps.

For every modeled source, the packet review must answer two separate questions:

1. What normalized guidance/output did this source produce and where is it bound?
2. Did it require a code-level product mechanics change? If yes, declare the change type and proof refs. If no, record a `guidanceOnlyReason` explaining why guidance is sufficient after tool cards, GUI controls, scripts, one-liners, analyzers, Path movement, lessons, troubleshooting, cleanup, reports, and product gaps were considered.

## Dashboard interpretation

The dashboard is meant to answer five questions at a glance:

1. How much source material has been reviewed?
2. What subject matter has been mined?
3. What normalized guidance was created and where is it delivered?
4. Which Obol mechanics actually changed because of the notes?
5. What did the notes reveal that Obol still cannot represent well?

For re-mining work, the dashboard should additionally show:

1. how many already-reviewed notes have been re-mined from original source;
2. how many notes remain old-rubric only;
3. how many tool cards, GUI controls, scripts, one-liners, analyzers, lesson boxes, troubleshooting notes, cleanup items, report improvements, and product gaps were extracted;
4. whether fresh pending-note packets are blocked until re-mining is complete.

This is why `modeled`, `context-bound`, `product-mechanics-changed`, and `re-mined-under-full-rubric` are separate concepts.

## Runtime compaction relationship

Notes Integration and runtime compaction are separate tracks but share the same product-hardening principle: durable behavior must have a current owner.

Historical runtime layers should leave live startup once their observable behavior has a stable current owner and equivalence proof. At that point historical tests should protect the durable contract through fixtures or current-owner tests instead of requiring obsolete UI/runtime layers to execute forever.

The target state is one current dashboard, workflow, tool platform, Evidence path, report path, and CSS owner, with old versions retained only where they still provide useful historical fixtures or documentation.