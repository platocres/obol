# Note Mining Rubric

This is the operating rubric for turning Brandon's private source notes into public-safe Obol product improvements. It exists because earlier notes work too often stopped at a rewritten Field Note and a counter update. That is not enough.

## Current priority

Until the re-mining queue is complete, the next notes work is **not** fresh note mining. The next notes work is to re-mine every note that has already been reviewed, modeled, marked private-reference-only, superseded, rejected, or otherwise analyzed under the older rubric.

Re-mining means returning to the original private source note and reading it again from scratch under this expanded rubric. Do not merely inspect the existing public Field Note, prior rationale, previous disposition, or already-created output IDs. Those records are useful context, but they are not the source.

## Full-spectrum extraction checklist

For every source note reviewed or re-mined, the agent must explicitly consider every product surface below.

| Surface | Required question |
| --- | --- |
| Path guidance | Which exact Next Steps point, branch, blocker, unlock, or decision rule does this note improve? |
| Tool cards | Does this note imply a new tool card or a major improvement to an existing card? |
| GUI switches and modes | Does this note contain a useful option, preset, mode, toggle, credential mode, output flag, safety warning, or execution context that belongs in a builder GUI? |
| Scripts and one-liners | Does this note contain reusable Bash, PowerShell, Python, SQL, curl, ffuf, nmap, grep, awk, Impacket, NetExec, Metasploit, chisel, plink, SSH, cracking, parsing, cleanup, or verification command material? |
| Command templates | Can the command material be generalized into a public-safe template with variables, defaults, required inputs, optional switches, and expected output? |
| Terminal-output analyzers | Can Obol analyze pasted output from this tool or technique and move the operator further down the path? |
| Evidence expectations | What output proves a fact, what remains only a lead, and what proof boundary must be preserved? |
| Path movement logic | Given successful, failed, blocked, partial, or inconclusive output, what should the app recommend next? |
| Lesson box | Should the relevant path point expose a collapsible study box explaining why this step matters and how to think about it? |
| Examples | Can private examples be rewritten into public-safe synthetic examples that teach the durable idea without copying targets, flags, screenshots, or course text? |
| Troubleshooting | What failure modes, false positives, syntax issues, environmental blockers, or alternative checks should be captured? |
| Cleanup and rollback | Does the note imply cleanup commands, restoration steps, or warnings about state-changing actions? |
| Report guidance | Does this note change what Obol should record in notes, commands, Evidence summaries, remediation, or final reports? |
| Product gaps | Does the note reveal something Obol cannot yet model, parse, generate, explain, or display? |
| Private-only boundary | Which parts must remain private because they are lab-specific, copied course material, flags, targets, screenshots, exploit recipes, or raw walkthrough substance? |

A note can produce more than one output. Agents must not pick one comfortable category and stop when the source clearly supports more.

## Tool-card extraction contract

When a source note implies a useful tool, the reviewer must decide whether to add a new tool card, update an existing one, or record a concrete product gap. A tool-card candidate should capture:

- tool name and purpose;
- where it belongs in the path;
- execution context such as Kali, Windows, target-local shell, pivoted shell, or proxy-routed session;
- required inputs;
- optional switches, modes, presets, and output controls;
- credential material modes such as password, hash, ticket, certificate, key, cookie, or token;
- generated command template;
- expected output and parser/analyzer hints;
- proof boundary and report-readiness rules;
- failure modes and troubleshooting checks;
- cleanup or restoration guidance;
- public-safe rewritten lesson text;
- tests or proof refs needed for the builder/analyzer/path change.

If the tool already exists, the note should update the existing card rather than create a duplicate. If the note implies a missing switch or analyzer, the output is a product mechanic, not merely a Field Note.

## Scripts and one-liners are first-class outputs

Reusable command material must be extracted deliberately. Public Obol may include rewritten, generalized, variable-based command templates and one-liners when they are useful in authorized labs and do not expose private course substance.

Do not publish raw private commands when they contain lab targets, flags, credentials, screenshots, copied walkthrough text, private paths, or exploit-recipe specificity. Rewrite the durable command pattern into an Obol-owned template and explain the inputs.

If no reusable command material is added from a modeled note, the note's audit record must say that scripts and one-liners were reviewed and why nothing was added, such as already-covered builder behavior, lab-specific recipe material, unsafe automation scope, or private-only content.

## Expandable lesson boxes

Every important path point should eventually be able to expose a focused, collapsible lesson box. A lesson box is not a notebook dump. It should be a public-safe, rewritten teaching aid that explains:

- why the operator is at this point in the path;
- what the technique is trying to prove or disprove;
- how to think about the inputs and expected output;
- common mistakes and false positives;
- what to do when the result is positive, negative, partial, or confusing;
- public-safe examples derived from the private notes without copying private wording or lab identifiers.

Field Notes are the delivery mechanism, but the expected product behavior is contextual education attached to the relevant path or tool point.

## Additive Orange baseline rule

The Orange-derived methodology path is the baseline. Note mining and note re-mining are additive unless a separate, explicit migration item authorizes a structural replacement and proves equivalence.

Agents must not delete, narrow, or replace an original Orange mind-map path item during note mining. When notes add value, agents should:

- attach rewritten guidance to the appropriate existing path point;
- add a child step or adjacent branch;
- improve an existing tool card;
- add a missing tool card;
- add GUI switches or modes;
- add analyzer expectations for pasted output;
- add lesson content;
- add troubleshooting, cleanup, or report guidance;
- record a product gap when implementation does not fit the current pass.

If a note appears to contradict an existing path item, preserve the baseline and add context, constraints, or a decision rule. Do not remove the original path item as part of notes work.

## Re-mining audit record

Every re-mined source note should leave an explicit audit record that answers, at minimum:

- original source note ID;
- previous disposition and output IDs, if any;
- re-mining wave or packet;
- whether the original note was re-read from source;
- path nodes considered;
- tool cards considered or changed;
- GUI switches, modes, and presets considered or changed;
- scripts and one-liners considered or added;
- terminal-output analyzer behavior considered or added;
- Evidence, report, troubleshooting, cleanup, and lesson outputs considered or added;
- product changes declared with proof refs;
- product gaps filed;
- public-safe rewritten outputs;
- private-only material retained privately;
- rationale for guidance-only or private-only decisions.

A previous terminal disposition is not enough. The re-mining pass must explain what the expanded rubric found when the original source was reviewed again.

## Completion rule

The re-mining queue is not complete until every already-reviewed source note has been re-mined from the original private source and every audit dimension above is either implemented, explicitly queued as a product gap, or explicitly ruled out with a substantive reason.

Only then should fresh pending-note packets resume as the main notes work.