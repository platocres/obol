# Note Mining Rubric

This is the operating rubric for turning Brandon's private source notes into public-safe Obol product improvements. It exists because earlier notes work too often stopped at a rewritten Field Note and a counter update. That is not enough.

## Current priority

Until the re-mining queue is complete, the next notes work is **not** fresh note mining. The next notes work is to re-mine every note that has already been reviewed, modeled, marked private-reference-only, superseded, rejected, or otherwise analyzed under the older rubric.

Re-mining means returning to the original private source note and reading it again from scratch under this expanded rubric. Do not merely inspect the existing public Field Note, prior rationale, previous disposition, or already-created output IDs. Those records are useful context, but they are not the source.

## Derivation standard

Extract the value fully. Do not copy the expression.

Agents must use the private source notes as source knowledge and mine them aggressively for durable educational and product value: methodology, decision logic, proof boundaries, failure modes, troubleshooting, cleanup, report guidance, command patterns, tool behavior, path movement, analyzer opportunities, lesson-box material, and product gaps.

Public Obol must contain Obol-owned outputs. That means new wording, generalized concepts, synthetic examples, variable-based command templates, and product behavior that stands on its own without exposing or mimicking the private note. Light paraphrase is not enough. Swapping words, reordering sentences, or removing obvious target names while preserving the source's expression or solution flow is still copying.

`private-only` is a boundary for raw/private source substance, not a discard bucket for reusable lessons. Before marking a dimension `private-only`, the agent must check whether the durable idea can be re-authored into public-safe path guidance, tool cards, GUI controls, command templates, analyzers, lesson boxes, troubleshooting, cleanup, report guidance, or a product gap.

See [`NOTE-DERIVATION-STANDARD.md`](NOTE-DERIVATION-STANDARD.md) for the full standard.

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
| Examples | Can private examples be rewritten into public-safe synthetic examples that teach the durable idea without copying targets, flags, screenshots, course text, or walkthrough flow? |
| Troubleshooting | What failure modes, false positives, syntax issues, environmental blockers, or alternative checks should be captured? |
| Cleanup and rollback | Does the note imply cleanup commands, restoration steps, or warnings about state-changing actions? |
| Report guidance | Does this note change what Obol should record in notes, commands, Evidence summaries, remediation, or final reports? |
| Product gaps | Does the note reveal something Obol cannot yet model, parse, generate, explain, or display? |
| Private-only boundary | Which raw/private parts must remain private because they are lab-specific, copied source expression, flags, targets, screenshots, credentials, exploit recipes, or walkthrough substance? What durable lesson can still be re-authored safely? |

A note can produce more than one output. Agents must not pick one comfortable category and stop when the source clearly supports more.

## Actual Next Steps path requirement

A note-derived tool, script, one-liner, analyzer, lesson, or path branch is not fully productized if it lives only in an isolated data table, hidden registry, loose documentation page, dashboard-only list, or disconnected code path.

When re-mining finds a useful addition for the operator workflow, the agent must wire it into the actual user-visible Next Steps / Orange path surface so Brandon can open the Obol website, go to Next Steps, and see the relevant tool, explanation, action, analyzer, or lesson at the appropriate point in the path.

Valid additive destinations include:

- an existing Next Steps path point with added tool, script, analyzer, or lesson context;
- a child step beneath an existing Orange-derived path point;
- an adjacent branch connected to the relevant Orange-derived path point;
- an existing tool card shown by that path point;
- a new tool card that is discoverable from that path point;
- an Evidence analyzer that accepts pasted output from the tool or command and updates the path recommendation;
- a contextual lesson box rendered from that path or tool point.

Do not park note-derived capabilities somewhere else and call them done. The public dashboard may track the output, but the operator-facing path must expose it when it is relevant.

## Tool-card extraction contract

When a source note implies a useful tool, the reviewer must decide whether to add a new tool card, update an existing one, or record a concrete product gap. A tool-card candidate should capture:

- tool name and purpose;
- where it belongs in the actual Next Steps / Orange path surface;
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

If no reusable command material is added from a modeled note, the note's audit record must say that scripts and one-liners were reviewed and why nothing was added, such as already-covered builder behavior, lab-specific recipe material, unsafe automation scope, or private-only content whose reusable pattern has already been extracted elsewhere.

If reusable command material is added, it must be wired into the actual Next Steps path context where an operator would need it. A script output that exists only as a Field Note, code registry, or dashboard metric is incomplete unless the relevant path/tool point exposes it.

## Expandable lesson boxes

Every important path point should eventually be able to expose a focused, collapsible lesson box. A lesson box is not a notebook dump. It should be a public-safe, rewritten teaching aid that explains:

- why the operator is at this point in the path;
- what the technique is trying to prove or disprove;
- how to think about the inputs and expected output;
- common mistakes and false positives;
- what to do when the result is positive, negative, partial, or confusing;
- public-safe examples derived from the private notes without copying private wording, lab identifiers, or solution flow.

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

## No disposable wrapper or layer shortcut

Do not implement note-mining, dashboard, path, tool, Evidence, or report work by adding a temporary wrapper, overlay, release-specific patch layer, or parallel registry when the stable current owner can be updated directly.

Product-hardening work should strengthen current owners and reduce future consolidation debt. New wrappers are allowed only when a documented migration boundary proves they are temporary, names the owner they will replace, and adds validation that prevents the wrapper from becoming another sedimentary layer.

## Negative finding proof

Agents must prove negative findings, not just say "nothing found."

For every extraction dimension in the full-spectrum checklist, the audit record must end in exactly one of these outcomes:

- `added` means the product change was implemented and, when operator-facing, wired into the actual Next Steps / Orange path surface.
- `covered` means the capability was already covered by an existing Obol owner, and the audit cites the exact path, tool, analyzer, report, or workflow owner ID.
- `queued` means the capability was not implemented in this pass but was filed as a concrete product gap or queue item, and the audit cites that queue item ID.
- `private-only` means useful raw/private material exists but cannot itself be public; the audit gives a public-safe reason and, when durable value was extracted elsewhere, cites the rewritten owner or explains why no additional public-safe output remains.
- `not-applicable` means the source was re-read and the dimension genuinely does not apply; the audit gives a short reason.
- `blocked` means the reviewer cannot decide from the available public-safe context; the audit names the blocker and the next required action.

A blank entry, omitted dimension, generic "none," generic "no change," or vague "not useful" statement is not valid negative proof.

Negative proof must be specific enough that a future agent can return to the same original source note and challenge the decision. The goal is not impossible omniscience. The goal is reproducible audit work that makes lazy misses visible.

`tools/validate-note-remining-audits.js` enforces the published re-mining projection. Run it before claiming a note re-mining packet is complete. This release permits an empty `auditRows` list only because it creates the schema before actual source re-mining resumes; future re-mining rows must publish per-note, per-dimension outcomes that pass the validator.

## Re-mining audit record

Every re-mined source note should leave an explicit audit record that answers, at minimum:

- original source note ID;
- previous disposition and output IDs, if any;
- re-mining wave or packet;
- whether the original note was re-read from source;
- path nodes considered;
- actual Next Steps path node updated, child step added, adjacent branch added, or product gap filed;
- tool cards considered or changed;
- GUI switches, modes, and presets considered or changed;
- scripts and one-liners considered or added;
- terminal-output analyzer behavior considered or added;
- Evidence, report, troubleshooting, cleanup, and lesson outputs considered or added;
- per-dimension negative finding proof using `added`, `covered`, `queued`, `private-only`, `not-applicable`, or `blocked`;
- existing owner IDs for `covered` decisions and queue item IDs for `queued` decisions;
- product changes declared with proof refs;
- product gaps filed;
- public-safe rewritten outputs;
- private-only material retained privately;
- rationale for guidance-only or private-only decisions;
- confirmation that reusable educational value was extracted or cited as already covered before anything was marked private-only;
- confirmation that Orange-derived path items were preserved additively;
- confirmation that no disposable wrapper/layer shortcut was introduced.

A previous terminal disposition is not enough. The re-mining pass must explain what the expanded rubric found when the original source was reviewed again.

## Completion rule

The re-mining queue is not complete until every already-reviewed source note has been re-mined from the original private source and every audit dimension above is implemented, cited as already covered by an existing owner, explicitly queued as a product gap, marked private-only with a reason, marked not-applicable with a reason, or marked blocked with the next action.

Only then should fresh pending-note packets resume as the main notes work.
