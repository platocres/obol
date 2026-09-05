# Actionable card contract

Obol cards that appear in the Next Steps path are lab actions with educational context attached. They are not abstract reminders, implementation notes, or mined-note summaries pretending to be steps.

A note-derived card is useful only when the operator can answer these questions from the card itself:

- What do I run, click, configure, or inspect next?
- What variables, target values, files, or tool settings do I fill in?
- Why am I using this tool at this point in the lab?
- What evidence do I paste back into Obol?
- What does success look like?
- What does failure or inconclusive output mean?
- What path/card should I move to next?

## Default mining rule

A source note does not automatically become a card.

Most note-mined material should enrich an existing Orange-map card as collapsible field notes, gotchas, evidence expectations, troubleshooting notes, tool-usage tips, lesson boxes, or report wording guards.

Create a new Next Steps card only when the note contains a distinct operator action that is not already represented by an existing card.

## Required disposition before publishing

Before a note-derived contribution reaches the user-visible path, classify it explicitly:

```text
KEEP AS CARD
The note adds a distinct operator action with a concrete command-line spine, GUI-tool spine, or both, plus supporting lesson context.

MERGE INTO EXISTING CARD
The note improves a pre-existing Orange-map or retained note-derived card.

DEMOTE TO FIELD NOTE
The note is useful context, proof nuance, troubleshooting, cleanup, or report guidance but not a standalone action.

DELETE OR REPLACE
The note-derived output is generic, redundant, misleading, or only exists because a previous release made a weak card.
```

Do not fix a weak card by hiding blank sections or adding a second visible corrective panel above it. The fix must be integrated into the normal shared card structure or the card must be merged, demoted, or deleted.

## Required shape for path-visible cards

Every note-derived card that can appear in Next Steps must have a real action spine:

```text
Situation / trigger
Concrete command-line action, GUI-tool workflow, or both
Variable placeholders and tool settings
Why this step now
What output or UI state proves or narrows
What to paste back
Success meaning
Failure meaning
Next path movement
Lesson / field-note context
Cleanup or reporting caveat when relevant
```

Primary cards should prefer terminal commands when the action can be expressed safely and clearly from the terminal. They must also support GUI-first tools when the GUI is the best, clearest, or only realistic tool for the job.

Burp Suite, OWASP ZAP, BloodHound, CyberChef, browser DevTools, Metasploit consoles, and similar GUI or interactive tools may absolutely be first-class card actions. When a card is GUI-first, it must provide a concrete click/configure/inspect/export workflow, the exact settings or fields the operator must touch, and the evidence the user should paste back into Obol. A vague GUI reminder is not enough.

If no real command-line or GUI-tool action can be generated, the output must be merged into an existing action-bearing card, published as field notes, attached to an analyzer, used as report/cleanup guidance, or deleted.

It must also define expected evidence to paste back, failure modes, next-step guidance, path state it produces, and evidence/analyzer facts that make it relevant.

## Why-now rule

Every primary card should eventually receive a `why now` pass. The goal is not provenance. The goal is to explain why this command or GUI workflow appears at this exact point in the lab.

Good why-now guidance is concrete and path-aware:

```text
Why this step now
You have a domain, a Windows foothold, and credential context, but you have not mapped AD relationships yet. Run this collection step now so shares, SPNs, sessions, ACLs, and graph edges become evidence-backed next-step candidates instead of guesses.
```

Bad why-now guidance is internal filler:

```text
Why this now: fills an unresolved methodology gap in this context.
```

The first version belongs on the card. The second version belongs nowhere in the operator UI.

## Educational context rule

Cards should teach. A good card explains why the tool matters, what the command or GUI workflow is trying to accomplish, what the output means, and how the note-derived lesson applies at this point in the lab.

That lesson is supporting context, not the card's reason to exist. A lesson-only, checklist-only, proof-boundary-only, or methodology-only contribution belongs in field notes or analyzer guidance unless it is attached to an action-bearing card.

## Reference-only material

Pure concepts belong in field notes, not primary Next Steps cards.

A `referenceOnly` card may exist only outside the primary recommendation flow. Do not use `referenceOnly` to satisfy a Product Build Next note-mining item.

## Bad card smell

This is not enough:

```text
Capture generated HTTP before debugging a tool.
```

This is useful:

```text
Start Burp or ZAP.
Configure the browser/tool proxy.
Capture one narrow request.
Mark the payload position or replay the request in the proper tool view.
Inspect method, path, Host header, cookies, body, TLS, redirects, and response behavior.
Replay or export the evidence.
Paste the captured HTTP and replay result into Evidence.
Use the lesson box to understand why emitted HTTP matters more than tool assumptions.
```

That useful action should still live in the most appropriate card. If the durable lesson is only a sub-step of another workflow, merge it into that workflow instead of creating a duplicate path stop.

## UI regression rule

Current card UI must look like normal Obol card UI. Do not show implementation labels such as release cleanup banners, patch panels, stabilizer messages, source-mining provenance, route-repair copy, dashboard accounting notes, `UNKNOWN` tool rows, blank recommended implementations, or copy explaining why a UI component exists.

Operator-facing why-now guidance is allowed and encouraged when it explains the current facts, missing proof, produced facts, or path dependency that makes the step useful now. It must not say the card exists because of a release, source-mining batch, methodology gap, route guard, or documentation cleanup.

A direct card route is not enough. The card must either be a retained primary action card or resolve into the retained parent card where its content now belongs.

## CI gate

`tools/validate-actionable-next-step-cards.js` enforces this for current note-derived cards. `tools/validate-card-action-spine-v9.71.js` blocks primary note-derived cards without a concrete command-line or GUI-tool action spine and prevents lesson-only cards, `UNKNOWN` tool rows, and methodology-gap UI copy from returning. `tools/validate-note-card-disposition-reconciliation.js` protects the kept/merged/demoted distinction and prevents the visible v9.67 patch-panel pattern from returning. The route gate and path-placement gate still matter, but neither one proves usefulness by itself.
