# Same-surface Gap Parking Guard

Same-surface gap parking is forbidden.

When source re-mining or Product Build work uncovers useful follow-up work, the agent must decide whether it is buildable inside the current pass before adding it to Product Build Next.

## Build it now

Build it now when all of these are true:

- it belongs to the same ownership area already being edited;
- it lands on the same live route, card, dashboard, tool, analyzer, report, or runtime surface;
- the source boundary is already understood;
- the implementation can be tested by the current release test strategy;
- there is no real blocker beyond convenience, uncertainty, or wanting to keep the PR small.

A queue item is not a parking lot for work the agent simply chose not to finish.

## Evidence ingestion is part of the build

For Obol, a command, tool card, proof control, analyzer, or path item is not meaningfully built until pasted Evidence can use its output.

Any built item that tells the operator to run a command, choose a proof mode, validate credentials, classify output, or record cleanup must also define how Evidence ingestion handles the resulting pasted terminal output, browser-observation text, or proof note.

The minimum Evidence contract is:

- identify the card or control that owns the pasted output;
- emit a conservative activity for the relevant card;
- emit only the outcome facts that the pasted output actually proves;
- keep secrets, tokens, cookies, keys, flags, and target-specific values redacted;
- move Next Steps forward only on supported facts, not vibes;
- include release tests that paste representative output and assert the resulting activities and facts.

Static cards, command templates, GUI controls, or dashboard rows without Evidence ingestion are incomplete unless the PR explicitly proves that no pasted output is expected from that item.

## Valid reasons to queue instead

Queue a finding only when the PR can name a real blocker:

- it crosses into a different subsystem or ownership area;
- it requires private-source review that has not been completed;
- it changes parser, migration, storage, or runtime behavior with a materially larger blast radius;
- it depends on another item landing first;
- it cannot be made public-safe without a separate derivation pass;
- it would require a different validation setup than the current release can honestly run.

Every queued finding must carry the blocker reason and the owning future surface. Vague phrases such as `future UI pass`, `later analyzer work`, or `follow-up item` are not enough.

## Completion rule

A source lane or queue item is not complete if it leaves buildable same-surface work behind as a new queued item.

For a lane to close, the PR must either:

- build the same-surface item now and mark it complete with proof; or
- explicitly prove why the item is not same-surface, not safe, not testable, or not source-ready.

If the built item affects commands, tools, proof controls, analyzers, or path movement, the PR must also prove Evidence ingestion for pasted output before claiming completion.

## PR review check

Reviewers should reject any release that says a lane is complete while the PR also adds same-surface queued gaps that could have been built in the same pass.

Reviewers should also reject any release that adds a command/tool/control/analyzer surface but does not explain and test what pasted Evidence output does with that surface.

The right default is simple: build the thing, wire Evidence ingestion, prove it, update the queue, and only then call the lane complete.
