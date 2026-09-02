# Notes-to-Product Impact Contract

This document is the operating contract for turning private source notes into observable Obol product improvements.

The 556-note disposition ledger remains the source-accounting umbrella. A reviewed count is not, by itself, evidence that the product improved. Every modeled note must identify what the durable lesson became and where that output lives.

## Required decision for every reviewed note

Every reviewed source note ends in one terminal disposition: `modeled`, `superseded`, `rejected`, or `private-reference-only`.

When the disposition is `modeled`, the reviewer must decide which output classes apply:

| Output class | Meaning |
| --- | --- |
| Field Note | Contextual educational guidance shown only where relevant. |
| Tool Builder Change | A command variant, switch, mode, preset, output option, warning, or failure behavior requires a code-level builder change. |
| Path Change | A new branch, blocker, unlock, next-step possibility, or decision rule requires a code-level Path change. |
| Evidence Change | Proof capture, parser expectations, or a proof boundary requires Evidence behavior to change. |
| Report Change | Reporting, remediation, or proof wording requires report behavior to change. |
| Private Only | The source remains useful for private lookup but should not create public product material. |

A modeled note must not stop at a Field Note when the reviewed source clearly exposes a missing tool option, realistic Path branch, Evidence rule, or reporting improvement. If contextual guidance is sufficient, that decision must be explicit rather than assumed.

Beginning with v9.29 review waves, every new modeled disposition must therefore contain either at least one `productChanges` declaration with implementation/test `proofRefs`, or a substantive `guidanceOnlyReason` explaining why the normalized Field Note/context binding is sufficient. The pre-v9.29 ledger is preserved as historical source-review evidence and is not retroactively rewritten to manufacture product-change claims that were not recorded at the time.

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

## Current projection

`data/product-hardening/notes-impact-current.js` derives the current notes-to-product projection from the public-safe ledger and normalized Field Notes. It reports:

- source review funnel: total, reviewed, modeled, private-only, superseded, rejected, and pending;
- normalized public Field Notes;
- tool-bound and Path-bound contextual guidance;
- Evidence, Report, troubleshooting, and cleanup guidance;
- separately declared code-level product mechanics changes;
- theme coverage;
- latest review-wave impact;
- open Notes Integration queue gaps.

The Product Hardening Dashboard renders this projection directly. README generation consumes the same projection for its compact Notes Integration summary.

## Packet-based review

`notes-disposition-burn-down` remains the umbrella requirement that all 556 notes reach a terminal disposition. Review work beneath that umbrella should be performed and reported as coherent subject packets rather than anonymous review-count waves.

Prefer packets such as:

- file upload and file inclusion;
- XSS and session behavior;
- credentials and authentication material;
- Windows privilege escalation;
- Linux privilege escalation;
- Active Directory and pivoting;
- web authorization and request manipulation.

A packet is complete only when its useful lessons have been normalized and any resulting tool, Path, Evidence, report, troubleshooting, or workflow gaps have been acted on or deliberately left as explicit open gaps.

For every modeled source, the packet review must answer two separate questions:

1. What normalized guidance/output did this source produce and where is it bound?
2. Did it require a code-level product mechanics change? If yes, declare the change type and proof refs. If no, record a `guidanceOnlyReason` explaining why guidance is sufficient.

## Dashboard interpretation

The dashboard is meant to answer five questions at a glance:

1. How much source material has been reviewed?
2. What subject matter has been mined?
3. What normalized guidance was created and where is it delivered?
4. Which Obol mechanics actually changed because of the notes?
5. What did the notes reveal that Obol still cannot represent well?

This is why `modeled`, `context-bound`, and `product-mechanics-changed` are separate concepts.

## Runtime compaction relationship

Notes Integration and runtime compaction are separate tracks but share the same product-hardening principle: durable behavior must have a current owner.

Historical runtime layers should leave live startup once their observable behavior has a stable current owner and equivalence proof. At that point historical tests should protect the durable contract through fixtures or current-owner tests instead of requiring obsolete UI/runtime layers to execute forever.

The target state is one current dashboard, workflow, tool platform, Evidence path, report path, and CSS owner, with old versions retained only where they still provide useful historical fixtures or documentation.
