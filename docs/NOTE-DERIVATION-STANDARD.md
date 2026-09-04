# Note Derivation Standard

This document defines how agents turn private course and lab notes into public-safe Obol product work.

## Core rule

Extract the value fully. Do not copy the expression.

Private notes are source knowledge. Agents should use them aggressively to improve Obol's methodology, path guidance, tool cards, GUI controls, command templates, analyzers, Evidence expectations, lesson boxes, troubleshooting, cleanup, report guidance, and product-gap tracking.

Public Obol must contain Obol-owned work: new wording, generalized models, synthetic examples, normalized command templates, and product behavior that stands on its own without the private note.

## What agents should look for

When reviewing or re-mining a source note, look for durable value in all of these forms:

- the reasoning model behind the technique;
- the decision point the operator faces;
- the proof needed before a lead becomes a fact;
- false positives, failure modes, and environmental blockers;
- exact preconditions that can be generalized into a checklist;
- reusable command shape that can become a variable-based template;
- useful switches, modes, presets, warnings, or execution contexts for Tool Builder;
- output patterns that Obol could parse or use to move Next Steps forward;
- report, cleanup, rollback, and note-taking requirements;
- teaching material that belongs in a contextual lesson box;
- product gaps where Obol cannot yet model, explain, generate, or validate the workflow.

A note can produce multiple outputs. Do not stop at a Field Note if the source also supports a tool-card change, GUI switch, reusable command template, analyzer, path branch, lesson box, troubleshooting item, cleanup rule, report improvement, or product gap.

## What must stay private

Do not publish raw or lightly rewritten private source expression, including:

- course prose or instructor wording;
- copied walkthrough paragraphs;
- screenshots, diagrams, or embedded notebook resources;
- flags, credentials, target names, lab hostnames, IP addresses, usernames, private paths, or raw ENEX paths;
- exact solution chains for a named box, module, exercise, or course lab;
- exploit recipes that reproduce a private lab compromise step by step;
- command blocks that retain target-specific values or walkthrough-specific sequencing.

These items may justify a `private-only` or `private-reference-only` boundary for the raw material. They do not justify throwing away the reusable educational value.

## Re-authoring standard

A public Obol output is acceptable when it is independently re-authored and generalized enough that it no longer functions as a copy, paraphrase, screenshot substitute, or solution key for the source.

Re-authored output should:

- use Obol's own language and structure;
- remove lab identifiers and private artifacts;
- replace exact target values with variables or generic placeholders;
- convert walkthrough order into decision logic, preconditions, and proof boundaries;
- teach the concept with synthetic examples where examples are useful;
- explain what the operator should prove, what remains only a lead, and what should happen next;
- bind the output to the real user-facing place where it helps, usually a Next Steps path point, tool card, Evidence analyzer, or report surface.

Light paraphrase is not enough. Swapping words, changing sentence order, or hiding target names while preserving the original course expression or solution flow is still copying.

## Private-only does not mean no value

`private-only` means useful raw source material exists but cannot itself be public. It should be used only after the agent has checked whether the durable lesson can be safely rewritten.

Good `private-only` audit reasons explain the boundary without leaking the source, for example:

```text
private-only: raw note is dominated by target-specific walkthrough sequence and identifiers; durable upload proof-boundary lesson was extracted into owner note-web-upload-proof-boundary.
```

```text
private-only: copied course prose and screenshot-heavy steps cannot be published; reusable troubleshooting model is already covered by owner path-file-inclusion-troubleshooting.
```

Bad reasons are vague and fail the audit standard:

```text
private-only
```

```text
not useful
```

```text
course material, skipped
```

## Tracking source

Do not use `CHANGELOG.md` to decide what has or has not been re-mined. CHANGELOG is release narrative only.

Live re-mining tracking belongs in:

- `data/product-hardening/note-progress-current.js`, especially `remining.auditRows`;
- Product Build Next, which exposes the current queue and recommended work package;
- the Product Hardening Dashboard, which renders re-mining progress, outcome counts, and red flags.

A note is not considered re-mined merely because a past changelog entry mentions its theme or packet. It is re-mined only when the live projection records the original-source reread and per-dimension outcomes required by [`NOTE-MINING-RUBRIC.md`](NOTE-MINING-RUBRIC.md).

## Validation

Run these before claiming a notes clarification or re-mining packet is complete:

```bash
node tools/validate-note-derivation-docs.js
node tools/validate-note-remining-audits.js
node tools/validate-notes-impact.js
node tools/validate-note-integration.js
```

The derivation docs validator protects this standard so future agents see the rule before CI surprises them.