# Tool Builder Build Queue

This file is the active Tool Builder build queue, not release history. Completed release batches must be removed as they land. Release history belongs in `CHANGELOG.md` and the matching `docs/vX.Y.md` release document.

## Queue lifecycle rule

- The first version heading in this file must always be the next unfinished Tool Builder batch.
- A batch that satisfies its acceptance proof is removed from this file and from the README active queue in the same PR that completes it.
- Do not retain completed version headings as context, milestones, or historical reference. Use `CHANGELOG.md` and release docs for that purpose.
- Focused release regression must fail when the just-completed batch or any older completed Tool Builder batch remains in the active queue.
- The Product Build Next/dashboard projection must describe only remaining Tool Builder work. Completed tool families may be mentioned only as completed-through metadata, never as pending scope.

The implementation rule is strict:

> Every implemented builder starts from the minimal valid command for the selected tool and mode, populated only with real collected target/material parameters or safe tool defaults. GUI fields and toggles may add flags, modes, filters, output handling, credentials, and escalation options onto that base. They must not manufacture fake credentials, placeholder hashes, or kitchen-sink commands.

> A tool is not fully implemented merely because Obol can generate its command. Every implemented tool must also have an Evidence-ingestion contract for the decision-relevant output that tool can produce, conservative fact extraction, failure/partial-result handling, and Next Steps movement or blocking where that Evidence changes what the operator should do next.

## Cross-build command and Evidence contract

For every implemented builder:

- The initial preview must be the minimal valid command for the selected tool/mode.
- Required target, credential, request, hash, ticket, certificate, or file material must be collected or autofilled from current target/workspace state before the command is valid.
- Missing required material must show a missing-field state, not a fake runnable command.
- Toggles and optional fields must be additive only.
- Placeholder values such as `user`, `domain.local`, `Password123!`, fake NT hashes, and fake `hashes.txt` must never make a command look valid.
- Output from the generated command returns through Evidence. Command generation is activity, not proof.
- Every builder mode that can produce decision-relevant output must name what the operator can paste back, what facts may be extracted, what remains only a lead, and what positive, negative, blocked, partial, or inconclusive output means.
- Evidence ingestion must be executable product behavior, not only prose in the builder. The tool must either have a dedicated analyzer/parser or cite an existing shared analyzer whose fixtures prove that tool/mode is actually recognized.
- Parsed output may advance, block, re-arm, or deprioritize Next Steps only from supported Evidence. Merely recognizing a command line, banner, listener startup, or tool invocation must not manufacture access, compromise, reachability, credential validity, or privilege.
- When a tool is primarily a launcher, listener, transfer helper, or transport, its Evidence contract must still recognize the useful state it owns, such as listener bound, client connected, file transferred, route/interface created, cleanup completed, or failure reason. Any deeper downstream fact must remain gated on the appropriate independent Evidence.
- An inventory record must not be promoted to `implemented` until command generation, live Tools rendering, Evidence ingestion, Next Steps handoff where applicable, cleanup/proof boundaries, and regression fixtures all exist.

This is the permanent Definition of Done for the modeled-tool backlog. The historical note-mining rubric already required terminal-output analyzers, Evidence expectations, and Path movement; these builds are completing the implementation work that remained modeled or queued after note mining ended.

## v10.06 - Shell, payload, privesc, and transfer helper batch

Purpose: turn common lab support tools into dependable command builders instead of scattered snippets.

Concrete work:

- Promote linpeas/winpeas launchers with download/serve/run modes and cleanup notes.
- Promote msfvenom with payload, LHOST/LPORT, format, encoder, architecture, output file, and handler-handoff fields.
- Promote msfconsole handler/resource-script generation without auto-execution.
- Promote nc and Penelope listener/shell helpers with explicit LHOST/LPORT and shell-upgrade notes.
- Promote common file-transfer helpers for Python HTTP server, wget/curl fetches, certutil, PowerShell web requests, and Impacket SMB server where appropriate.
- Implement or prove Evidence ingestion in the same build for helper-owned state: listener ready/failed, session received/lost, payload/handler match, transfer success/failure/integrity, privesc-enumeration signals, and cleanup. A listener or transfer alone must not imply code execution or privilege.

Acceptance proof:

- Builders generate minimal listener/payload/transfer commands from collected parameters.
- Dangerous or irreversible actions are not auto-run.
- Output/handler/proof expectations are explicit and backed by executable Evidence ingestion.
- Representative transcripts exercise positive, negative, partial, and cleanup states and the appropriate Next Steps routing.
- Commands remain copy/review only.
- Once this acceptance proof is green, remove v10.06 from this active queue and the README active queue in the same PR.

## v10.07 - Implemented-tool Evidence and cross-surface audit

Purpose: prove the completed builder batches are actually one operator system across Tools, Cards, Evidence, and Next Steps, and catch any older implemented builder that still lacks the full Evidence contract.

Concrete work:

- Audit every inventory item marked `implemented`, including builders completed before v10.06, and require executable Evidence-ingestion coverage or a specifically proven shared analyzer mapping.
- Ensure Path recommendations point to the correct builder route/mode when Evidence supports that next step.
- Ensure Cards use the same builder schema and do not duplicate a separate command model.
- Ensure every implemented tool exposes paste-back guidance that matches the parser/analyzer behavior actually shipped.
- Add a permanent validation matrix that fails when an implemented inventory record has no builder, no Evidence integration, no relevant Next Steps handoff, or unproved shared-parser coverage.
- Remove or collapse any old raw command examples that compete with the implemented builder.

Acceptance proof:

- Every `implemented` tool in the inventory has command, live-route, Evidence, proof-boundary, and regression coverage.
- A representative Evidence sample for each implemented tool family reaches the expected analyzer and produces conservative facts or activity state.
- A representative Evidence sample leads Path to the expected builder-backed next move where that tool owns a path transition.
- A representative Card shows the primary builder-backed command/action and a clear Evidence loop.
- Tools, Path, Card, and Evidence remain different surfaces over the same command/proof contract, not diverging implementations.
- When the audit is complete, remove v10.07 and close or replace the modeled-tool backlog with only genuinely unfinished follow-up work.