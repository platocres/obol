# Tool Builder Build Queue

This file is the active Tool Builder build queue, not release history. Completed release batches must be removed as they land. Release history belongs in `CHANGELOG.md` and the matching `docs/vX.Y.md` release document.

## Queue lifecycle rule

- The first unfinished batch in this file must always be the next active Tool Builder batch.
- A batch that satisfies its acceptance proof is removed from this file and from the README active queue in the same PR that completes it.
- Do not retain completed version headings as context, milestones, or historical reference. Use `CHANGELOG.md` and release docs for that purpose.
- Focused release regression must fail when the just-completed batch or any older completed Tool Builder batch remains in the active queue.
- The Product Build Next/dashboard projection must describe only remaining Tool Builder work. Completed tool families may be mentioned only as completed-through metadata, never as pending scope.

The implementation rule is strict:

> Every implemented builder starts from the minimal valid command for the selected tool and mode, populated only with real collected target/material parameters, parsed Evidence/workspace parameters, or safe tool defaults. GUI fields and toggles may add flags, modes, filters, output handling, credentials, and escalation options onto that base. They must not manufacture fake credentials, placeholder hashes, fake targets, or kitchen-sink commands.

> A tool is not fully implemented merely because Obol can generate its command. Every implemented tool must also have an Evidence-ingestion contract for the decision-relevant output that tool can produce, conservative fact extraction, failure/partial-result handling, and Next Steps movement or blocking where that Evidence changes what the operator should do next.

## Cross-build command and Evidence contract

For every implemented builder:

- The initial preview must be the minimal valid command for the selected tool/mode.
- Required target, credential, request, hash, ticket, certificate, callback, listener, transfer, or file material must be collected or autofilled from current target/workspace/Evidence-derived state before the command is valid.
- Missing required material must show a missing-field state, not a fake runnable command.
- Toggles and optional fields must be additive only.
- Placeholder values such as `10.10.10.10`, `10.10.14.9`, `user`, `domain.local`, `Password123!`, fake NT hashes, and fake `hashes.txt` must never make a command look valid.
- Output from the generated command returns through Evidence. Command generation is activity, not proof.
- Every builder mode that can produce decision-relevant output must name what the operator can paste back, what facts may be extracted, what remains only a lead, and what positive, negative, blocked, partial, or inconclusive output means.
- Evidence ingestion must be executable product behavior, not only prose in the builder. The tool must either have a dedicated analyzer/parser or cite an existing shared analyzer whose fixtures prove that tool/mode is actually recognized.
- Parsed output may advance, block, re-arm, or deprioritize Next Steps only from supported Evidence. Merely recognizing a command line, banner, listener startup, or tool invocation must not manufacture access, compromise, reachability, credential validity, or privilege.
- When a tool is primarily a launcher, listener, transfer helper, or transport, its Evidence contract must still recognize the useful state it owns, such as listener bound, client connected, file transferred, route/interface created, cleanup completed, or failure reason. Any deeper downstream fact must remain gated on the appropriate independent Evidence.
- An inventory record must not be promoted to `implemented` until command generation, live Tools rendering, Evidence ingestion, Next Steps handoff where applicable, cleanup/proof boundaries, and regression fixtures all exist.

This is the permanent Definition of Done for modeled-tool work. The historical note-mining rubric already required terminal-output analyzers, Evidence expectations, and Path movement; the v10.03-v10.08 releases completed the implementation work that remained modeled or queued after note mining ended.

## Active Tool Builder batches

No active Tool Builder implementation batches remain in this queue.

The modeled Tool Builder implementation backlog closed in v10.08 after the implemented-tool Evidence and cross-surface audit. Future Tool Builder work should enter through a new concrete Product Build Next item with its own acceptance proof instead of reopening this completed backlog.
