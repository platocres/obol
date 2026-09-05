# Note mining actionability rule

This is the practical rule for future source-note mining agents.

Do not turn a note into a standalone Next Steps card just because the note contains a good idea.

## First choice: enrich existing cards

When a note explains a trick, warning, gotcha, interpretation detail, tool limitation, or reporting boundary, attach it to the most relevant existing Orange-map card as one of these:

- field note
- stuck-state hint
- expected evidence note
- failure-mode explanation
- tool usage tip
- report wording guard

## New card threshold

Create a new card only when the note contains a distinct operator action that is missing from the current path.

A new card must tell the operator:

```text
Run or click this.
Fill these placeholders.
Paste this evidence back.
Success looks like this.
Failure usually means this.
Move to this next state/card.
```

If it cannot do that, it is not a Next Steps card.

## GUI tools count, but only when concrete

Burp Suite, ZAP, BloodHound, Nessus, CyberChef, and similar tools do not need terminal commands, but their cards still need concrete steps.

Bad:

```text
Use Burp to inspect the request.
```

Good:

```text
Capture request in Proxy history.
Send it to Repeater.
Clear all Intruder positions.
Mark only the parameter value.
Load a small wordlist.
Run the attack.
Sort by Length and Words.
Replay outliers in Repeater.
Paste the original request, selected position, top outlier rows, and replayed response body into Evidence.
```

## Validation

The actionability gate is `tools/validate-actionable-next-step-cards.js`.

The route gate and path-placement gate still matter, but neither one proves usefulness by itself.
