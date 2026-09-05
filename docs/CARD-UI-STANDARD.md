# Obol card UI standard

Cards are for operators working a lab, not for agents explaining implementation decisions.

## User-facing rule

A user-visible primary card should answer the operator's immediate questions:

- What situation does this help with?
- What evidence makes the card relevant?
- What commands or terminal-driven tool checks should I run?
- What variables do I fill in?
- Why are we using this tool at this point in the lab?
- What does each command prove or narrow down?
- What does success look like?
- What should I do when the command fails or the output is inconclusive?
- What facts does this card produce for the next path step?
- What detection, cleanup, or reporting caveat matters?

Do not render implementation artifacts in card UI. Forbidden user-facing artifacts include owner names, runtime plumbing, route fallback explanations, startup index details, dashboard accounting notes, source-mining provenance, release bookkeeping, methodology-gap labels, or copy explaining why a UI component exists.

## Action spine rule

A primary Next Steps card must have an action spine. The action spine is the concrete command or terminal-driven tool action that advances the lab. Lessons, note summaries, background, and field notes are encouraged, but they must explain the command spine rather than replace it.

A card with no runnable command template is not a cleaner card after blank sections are hidden. It is not a primary card. Merge it into an existing card, demote it to field notes, attach it to an analyzer, or delete it.

Blank implementation blocks, `UNKNOWN` tool labels, empty recommended/alternative tool rows, and release/provenance language are release-blocking UI defects.

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

## Evidence flow rule

Every real card needs an obvious evidence path. A card that asks the user to run a command must let the user paste output on the card and send that output to Intake with the originating card ID preserved.

The required flow is card → paste command output → `Analyze pasted evidence` → Intake shows the source card → reviewed evidence applies as `card:<card-id>:intake:<mode>` → Path recalculates from that card-scoped evidence.

Generic `intake:<mode>` is acceptable only when the user opens Intake directly. Evidence launched from a card must not lose the card source. Tests should fail if a source-mined or current-owner card has commands but no evidence textarea, no analyze action, no tried/succeeded controls, or no card-scoped Intake source.

Card previews in Path and Lanes must not hide evidence entry behind a silent click-through. A collapsed card should show an explicit `Open card` action and an explicit `Add evidence` action. `Add evidence` must preserve the card ID in Intake even when the user has not opened the expanded card yet. Expanded cards still need the full textarea plus `Analyze pasted evidence` flow.

## OS routing rule

Linux-only and Windows-only local privilege cards must be gated by the target operating system. Linux-only cards require Linux foothold or Linux OS evidence. Windows-only cards require Windows foothold or Windows OS evidence. Metadata like `os:['linux']` or `os:['windows']` is not decorative; the Path view must use it to keep Linux and Windows local privilege recommendations separated.

Cross-platform credential cards can remain service/evidence gated, but local privilege cards must not appear merely because a generic `privesc.leads` fact exists on the wrong operating system.

## Layout rule

Do not hide useful command blocks behind awkward scaffolding. Labels such as `Tool action stack`, `Raw legacy commands`, `Current builders stay up front`, and similar implementation-shaped copy should not appear in operator card UI. Use plain labels such as `Commands`, `Commands and checks`, or `Guided builder`.

Card pages must not be rewritten into a separate tool-stack layout after the shared card renderer runs. Route decorators may improve styling or add genuinely useful controls, but they must not move the card's primary commands into a collapsed legacy section, hide the only actionable checks, or replace per-command explanations with implementation scaffolding.

A Direct card route is acceptable only when it renders the same shared card UI a user would expect from the normal path: title, hypothesis, gates, produced facts, commands with explanations, failure routing, defender/reporting context, queue controls, tried/succeeded controls, intake evidence, evidence textarea, execution context, implementation selection, and educational field notes.

Current-owner or dynamically inserted cards must register into the shared card index, or the card route must resolve them from the live lane model before rendering. A fake fallback that imitates a card but skips normal controls is not acceptable.
