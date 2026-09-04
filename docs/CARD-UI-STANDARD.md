# Obol card UI standard

Cards are for operators working a lab, not for agents explaining implementation decisions.

## User-facing rule

A user-visible card should answer the operator's immediate questions:

- What situation does this help with?
- What evidence makes the card relevant?
- What commands or checks should I run?
- What does each command prove or narrow down?
- What does success look like?
- What should I do when the command fails or the output is inconclusive?
- What facts does this card produce for the next path step?
- What detection, cleanup, or reporting caveat matters?

Do not render implementation artifacts in card UI. Forbidden user-facing artifacts include owner names, runtime plumbing, route fallback explanations, startup index details, dashboard accounting notes, source-mining provenance, release bookkeeping, or copy explaining why a UI component exists.

## Command explanation rule

Every command shown on a card needs a useful explanation. The explanation should describe what the command is for and how to interpret the output. Boilerplate warnings are not enough.

Good command explanations sound like this:

```text
Lists full process command lines and filters for credential-like terms or service clients. This is useful for spotting secrets passed as arguments and for identifying which service account or daemon owns the clue.
```

Weak command explanations sound like this:

```text
Only run this when authorized. Save output as evidence.
```

Authorization, scope, and candidate-material warnings still matter, but they belong in the card hypothesis, failure routing, defender view, report guidance, or engagement banner. They should not replace the per-command explanation.

## Layout rule

Do not hide the only useful command block behind awkward scaffolding. Labels such as `Tool action stack`, `Raw legacy commands`, `Current builders stay up front`, and similar implementation-shaped copy should not appear in operator card UI. Use plain labels such as `Commands`, `Commands and checks`, or `Guided builder`.

## Direct card route rule

A direct card route is acceptable only when it renders the same kind of operator-facing content a user would expect from the normal path: title, hypothesis, gates, produced facts, commands with explanations, failure routing, and defender/reporting context.
