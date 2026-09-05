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

## CI gate

`tools/validate-actionable-next-step-cards.js` enforces this for current note-derived cards. The older route and path-placement validators still matter, but they are not sufficient by themselves.
