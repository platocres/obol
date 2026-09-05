# Actionable card contract

Obol cards that appear in the Next Steps path are not allowed to be abstract reminders.

A note-derived card is useful only when the operator can answer these questions from the card itself:

- What do I run or click next?
- What variables do I fill in?
- What evidence do I paste back into Obol?
- What does success look like?
- What does failure mean?
- What path/card should I move to next?

## Default mining rule

A source note does not automatically become a card.

Most note-mined material should enrich an existing Orange-map card as collapsible field notes, gotchas, evidence expectations, troubleshooting notes, tool-usage tips, or report wording guards.

Create a new Next Steps card only when the note contains a distinct operator action that is not already represented by an existing card.

## Required disposition before publishing

Before a note-derived contribution reaches the user-visible path, classify it explicitly:

```text
KEEP AS CARD
The note adds a distinct operator action with commands or concrete GUI workflow.

MERGE INTO EXISTING CARD
The note improves a pre-existing Orange-map or retained note-derived card.

DEMOTE TO FIELD NOTE
The note is useful context, proof nuance, troubleshooting, cleanup, or report guidance but not a standalone action.

DELETE OR REPLACE
The note-derived output is generic, redundant, misleading, or only exists because a previous release made a weak card.
```

Do not fix a weak card by adding a second visible corrective panel above it. The fix must be integrated into the normal shared card structure or the card must be merged/demoted.

## Required shape for path-visible cards

Every note-derived card that can appear in Next Steps must have at least one of these:

- copyable terminal command templates, or
- concrete GUI/tool workflow steps for non-terminal tools such as Burp Suite, ZAP, BloodHound, Nessus, or CyberChef.

It must also define expected evidence to paste back, failure modes, next-step guidance, path state it produces, and evidence/analyzer facts that make it relevant.

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
Run one narrow request.
Inspect method, path, Host header, cookies, body, TLS, and redirects.
Replay the captured request manually.
Paste the captured HTTP and replay result into Evidence.
```

That useful action should still live in the most appropriate card. If the durable lesson is only a sub-step of another workflow, merge it into that workflow instead of creating a duplicate path stop.

## UI regression rule

Current card UI must look like normal Obol card UI. Do not show implementation labels such as release cleanup banners, patch panels, stabilizer messages, source-mining provenance, route-repair copy, or dashboard accounting notes in the operator card body.

A direct card route is not enough. The card must either be a retained primary action card or resolve into the retained parent card where its content now belongs.

## CI gate

`tools/validate-actionable-next-step-cards.js` enforces this for current note-derived cards. `tools/validate-note-card-disposition-reconciliation.js` protects the kept/merged/demoted distinction and prevents the visible v9.67 patch-panel pattern from returning. The route gate and path-placement gate still matter, but neither one proves usefulness by itself.
