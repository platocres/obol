# Notes-to-Product Impact Contract

This document is the operating contract for turning private source notes into observable Obol product improvements.

The 556-note disposition ledger remains the source-accounting umbrella. A reviewed count is not, by itself, evidence that the product improved. Every modeled note must identify what the durable lesson became and where that output lives.

## Required decision for every reviewed note

Every reviewed source note ends in one terminal disposition: `modeled`, `superseded`, `rejected`, or `private-reference-only`.

When the disposition is `modeled`, the reviewer must decide which output classes apply:

| Output class | Meaning |
| --- | --- |
| Field Note | Contextual educational guidance shown only where relevant. |
| Tool Builder Change | A command variant, switch, mode, preset, output option, warning, or failure lesson belongs in a relevant builder. |
| Path Change | A new branch, blocker, unlock, next-step possibility, or decision rule belongs in Path. |
| Evidence Change | Proof capture, parser expectations, or a proof boundary changes. |
| Report Change | Reporting, remediation, or proof wording changes. |
| Private Only | The source remains useful for private lookup but should not create public product material. |

A modeled note must not stop at a Field Note when the reviewed source clearly exposes a missing tool option, realistic Path branch, Evidence rule, or reporting improvement. If contextual guidance is sufficient, that decision should be visible from the resulting bindings and output kind rather than assumed.

## Current projection

`data/product-hardening/notes-impact-current.js` derives the current notes-to-product projection from the public-safe ledger and normalized Field Notes. It reports:

- source review funnel: total, reviewed, modeled, private-only, superseded, rejected, and pending;
- normalized public outputs;
- Tool, Path, Evidence, Report, and troubleshooting impact;
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

A packet is complete only when its useful lessons have been normalized and any resulting tool, Path, Evidence, report, or troubleshooting gaps have been acted on or deliberately left as explicit open gaps.

## Dashboard interpretation

The dashboard is meant to answer five questions at a glance:

1. How much source material has been reviewed?
2. What subject matter has been mined?
3. What product outputs were created?
4. Which Obol surfaces were actually improved?
5. What did the notes reveal that Obol still cannot represent well?

This is why `modeled` and `product-integrated` are not treated as synonyms.

## Runtime compaction relationship

Notes Integration and runtime compaction are separate tracks but share the same product-hardening principle: durable behavior must have a current owner.

Historical runtime layers should leave live startup once their observable behavior has a stable current owner and equivalence proof. At that point historical tests should protect the durable contract through fixtures or current-owner tests instead of requiring obsolete UI/runtime layers to execute forever.

The target state is one current dashboard, workflow, tool platform, Evidence path, report path, and CSS owner, with old versions retained only where they still provide useful historical fixtures or documentation.
