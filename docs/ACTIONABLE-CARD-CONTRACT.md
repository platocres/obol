# Actionable card contract

Obol cards that appear in the Next Steps path are lab actions with educational context attached. They are not abstract reminders, implementation notes, or mined-note summaries pretending to be steps.

A note-derived card is useful only when the operator can answer these questions from the card itself:

- What command or terminal-driven tool action do I run next?
- What variables do I fill in?
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
The note adds a distinct operator action with concrete terminal command templates and supporting lesson context.

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
Concrete command or terminal-driven tool command
Variable placeholders
Why this command is being run
What output proves or narrows
What to paste back
Success meaning
Failure meaning
Next path movement
Lesson / field-note context
Cleanup or reporting caveat when relevant
```

Primary cards must include at least one concrete runnable command template. GUI workflows for tools such as Burp Suite, ZAP, BloodHound, CyberChef, browser DevTools, or Metasploit may support a card, but they do not replace the command requirement for a primary Next Steps card.

If no real command can be generated, the output must be merged into an existing command-bearing card, published as field notes, attached to an analyzer, used as report/cleanup guidance, or deleted.

It must also define expected evidence to paste back, failure modes, next-step guidance, path state it produces, and evidence/analyzer facts that make it relevant.

## Educational context rule

Cards should teach. A good card explains why the tool matters, what the command is trying to accomplish, what the output means, and how the note-derived lesson applies at this point in the lab.

That lesson is supporting context, not the card's reason to exist. A lesson-only, checklist-only, proof-boundary-only, or methodology-only contribution belongs in field notes or analyzer guidance unless it is attached to a command-bearing card.

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
Configure the tool proxy.
Run one narrow request through a copyable command or explicit tool command.
Inspect method, path, Host header, cookies, body, TLS, and redirects.
Replay the captured request manually.
Paste the captured HTTP and replay result into Evidence.
Use the lesson box to understand why emitted HTTP matters more than tool assumptions.
```

That useful action should still live in the most appropriate card. If the durable lesson is only a sub-step of another workflow, merge it into that workflow instead of creating a duplicate path stop.

## UI regression rule

Current card UI must look like normal Obol card UI. Do not show implementation labels such as release cleanup banners, patch panels, stabilizer messages, source-mining provenance, route-repair copy, dashboard accounting notes, `UNKNOWN` tool rows, blank recommended implementations, or copy explaining why a UI component exists.

A direct card route is not enough. The card must either be a retained primary action card or resolve into the retained parent card where its content now belongs.

## CI gate

`tools/validate-actionable-next-step-cards.js` enforces this for current note-derived cards. `tools/validate-card-action-spine-v9.71.js` blocks primary note-derived cards without command spines and prevents lesson-only cards, `UNKNOWN` tool rows, and methodology-gap UI copy from returning. `tools/validate-note-card-disposition-reconciliation.js` protects the kept/merged/demoted distinction and prevents the visible v9.67 patch-panel pattern from returning. The route gate and path-placement gate still matter, but neither one proves usefulness by itself.
