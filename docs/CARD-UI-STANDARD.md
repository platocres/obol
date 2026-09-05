# Obol card UI standard

Cards are for operators working a lab, not for agents explaining implementation decisions.

## User-facing rule

A user-visible primary card should answer the operator's immediate questions:

- What situation does this help with?
- What evidence makes the card relevant?
- What command, GUI workflow, or interactive tool check should I run?
- What variables, target values, files, or tool settings do I fill in?
- Why are we using this tool at this point in the lab?
- What does each command or GUI step prove or narrow down?
- What does success look like?
- What should I do when the command fails or the tool output is inconclusive?
- What facts does this card produce for the next path step?
- What detection, cleanup, or reporting caveat matters?

Do not render implementation artifacts in card UI. Forbidden user-facing artifacts include owner names, runtime plumbing, route fallback explanations, startup index details, dashboard accounting notes, source-mining provenance, release bookkeeping, methodology-gap labels, or copy explaining why a UI component exists.

A visible `why now` section is not an implementation artifact when it explains the lab state. It should tell the operator why the current facts, missing proof, or next path dependency make this command or GUI workflow useful right now.

## Action spine rule

A primary Next Steps card must have an action spine. The action spine is the concrete command-line action, GUI-tool workflow, or interactive tool procedure that advances the lab. Lessons, note summaries, background, and field notes are encouraged, but they must explain the action spine rather than replace it.

Terminal commands are preferred when they are the clearest way to express the action. GUI-first tools are first-class when they are the best or only practical way to do the job. Burp Suite, OWASP ZAP, BloodHound, CyberChef, browser DevTools, Metasploit consoles, and similar tools may anchor primary cards when the card gives real click/configure/inspect/export steps and tells the user what evidence to paste back.

A card with no concrete command-line action and no concrete GUI/tool workflow is not a cleaner card after blank sections are hidden. It is not a primary card. Merge it into an existing card, demote it to field notes, attach it to an analyzer, or delete it.

Blank implementation blocks, `UNKNOWN` tool labels, empty recommended/alternative tool rows, and release/provenance language are release-blocking UI defects.

## Why-now UI rule

Every primary card should be able to explain why it is showing now. This should be concise, operator-facing, and grounded in path state.

Good why-now copy names one or more of these:

- the current fact or evidence that made the card relevant
- the proof boundary that is still missing
- the command, GUI workflow, or tool action that can resolve that boundary
- the produced fact or next path decision the operator gets from running it

Examples:

```text
Why this step now
You have HTTP upload behavior, but you have not proven storage, reachability, interpretation, or execution. Run these checks now to separate upload acceptance from real impact.
```

```text
Why this step now
You have domain context and credentials. Collect AD graph and command output now so shares, SPNs, sessions, ACLs, and group paths become evidence-backed leads instead of guesses.
```

Bad why-now copy is vague or internal:

```text
Why this now: fills an unresolved methodology gap in this context.
```

That filler should fail review. The feature should not be removed.

## Command and GUI explanation rule

Every command shown on a card needs a useful explanation. Every GUI or interactive tool step shown on a card also needs a useful explanation. The explanation should describe what the action is for and how to interpret the output or UI state. Boilerplate warnings are not enough.

Good command explanations sound like this:

```text
Lists full process command lines and filters for credential-like terms or service clients. This is useful for spotting secrets passed as arguments and for identifying which service account or daemon owns the clue.
```

Good GUI explanations sound like this:

```text
Send the captured request to Burp Repeater, change only the candidate parameter, and compare status, length, redirects, and body text against the baseline. This proves whether the server accepted the change instead of only proving that the browser let you edit a field.
```

Weak explanations sound like this:

```text
Only run this when authorized. Save output as evidence.
```

Authorization, scope, and candidate-material warnings still matter, but they belong in the card hypothesis, failure routing, defender view, report guidance, or engagement banner. They should not replace the per-action explanation.

## Evidence flow rule

Every real card needs an obvious evidence path. A card that asks the user to run a command or perform a GUI/tool workflow must let the user paste output on the card and send that output to Intake with the originating card ID preserved.

The command-based required flow is card → paste command output → `Analyze pasted evidence` → Intake shows the source card → reviewed evidence applies as `card:<card-id>:intake:<mode>` → Path recalculates from that card-scoped evidence. GUI-first cards follow the same proof shape with exported tool evidence, copied request/response text, screenshots converted to text where appropriate, or manual notes that name the exact tool view and result.

Generic `intake:<mode>` is acceptable only when the user opens Intake directly. Evidence launched from a card must not lose the card source. Tests should fail if a source-mined or current-owner card has an action spine but no evidence textarea, no analyze action, no tried/succeeded controls, or no card-scoped Intake source.

Card previews in Path and Lanes must not hide evidence entry behind a silent click-through. A collapsed card should show an explicit `Open card` action and an explicit `Add evidence` action. `Add evidence` must preserve the card ID in Intake even when the user has not opened the expanded card yet. Expanded cards still need the full textarea plus `Analyze pasted evidence` flow.

## OS routing rule

Linux-only and Windows-only local privilege cards must be gated by the target operating system. Linux-only cards require Linux foothold or Linux OS evidence. Windows-only cards require Windows foothold or Windows OS evidence. Metadata like `os:['linux']` or `os:['windows']` is not decorative; the Path view must use it to keep Linux and Windows local privilege recommendations separated.

Cross-platform credential cards can remain service/evidence gated, but local privilege cards must not appear merely because a generic `privesc.leads` fact exists on the wrong operating system.

## Layout rule

Do not hide useful command blocks behind awkward scaffolding. Do not hide useful GUI workflow blocks behind awkward scaffolding either. Labels such as `Tool action stack`, `Raw legacy commands`, `Current builders stay up front`, and similar implementation-shaped copy should not appear in operator card UI. Use plain labels such as `Commands`, `Commands and checks`, `Guided builder`, or `Tool workflow`.

Card pages must not be rewritten into a separate tool-stack layout after the shared card renderer runs. Route decorators may improve styling or add genuinely useful controls, but they must not move the card's primary commands into a collapsed legacy section, hide GUI steps that are the primary action spine, hide the only actionable checks, or replace per-action explanations with implementation scaffolding.

A Direct card route is acceptable only when it renders the same shared card UI a user would expect from the normal path: title, hypothesis, gates, produced facts, why-now guidance, commands or GUI workflow with explanations, failure routing, defender/reporting context, queue controls, tried/succeeded controls, intake evidence, evidence textarea, execution context, implementation selection, and educational field notes.

Current-owner or dynamically inserted cards must register into the shared card index, or the card route must resolve them from the live lane model before rendering. A fake fallback that imitates a card but skips normal controls is not acceptable.
