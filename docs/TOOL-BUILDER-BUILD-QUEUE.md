# Tool Builder Build Queue

This queue exists so the modeled-tool backlog does not turn into vague "add more tools" work. The implementation rule is now strict:

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

## v10.03 - Minimal-command hygiene and implemented-builder audit

Purpose: stop existing implemented builders from generating garbage before adding more modeled tools.

Concrete work:

- Add shared renderer/compiler hygiene that strips fake fallback credentials and placeholder hash material.
- Audit the current implemented builders for minimal base commands.
- Make Nmap start from the selected scan-mode base, such as `nmap -sn <target>` for discovery.
- Make curl start from `curl <url>`.
- Make sqlmap start from `sqlmap -u <url>` or `sqlmap -r <request-file>` without default risk/level/batch clutter.
- Make Gobuster/Ferox start from engine + mode + target + wordlist, then add filters/recursion/output only from controls.
- Make Hashcat require real hash material and start from mode + hash/file + selected attack material.
- Make NetExec/nxc scrub fake credentials and fall back to explicit anonymous/null-session mode when no real credential material exists.
- Make credential-required builders such as secretsdump, GetUserSPNs, and Evil-WinRM refuse placeholder credentials rather than generating fake valid commands.

Acceptance proof:

- `tests/run-v10.03-tests.js` proves representative minimal commands and additive toggles.
- Current-product regression runs v10.03 tests.
- Browser smoke remains green so the Tools route still renders builders, accessories, modes, and collapsed legacy examples.
- v10.03 is the command-hygiene boundary only; later batches must audit these already-implemented builders against the stronger Evidence-ingestion Definition of Done rather than assuming command generation alone made them complete.

## v10.04 - Pivot and remote-access first builder batch

Purpose: implement the next most important modeled/pivot tools without disturbing the v10.01 Tools/Path/Card/Evidence contract.

Concrete work:

- Promote Ligolo-ng from modeled to implemented with modes for proxy, agent, tunnel interface, route add, listener, and route proof.
- Ship Ligolo-ng Evidence ingestion in the same build for proxy startup, agent connection/session state, interface/route state, tunnel/listener state, connectivity outcomes, failures, and cleanup. Route or session recognition must not silently become reachability.
- Audit and harden chisel against the minimal-command rule if gaps remain.
- Audit chisel Evidence ingestion so server/client startup, listener state, remote/SOCKS establishment, connectivity, failure, and teardown are recognized and correctly gated.
- Audit and harden SSH/plink tunnel builders against the same minimal-command rule.
- Audit SSH/plink Evidence ingestion so authentication, forwarding-listener creation, forwarding failure, connectivity-through-tunnel, and teardown remain separate proof states.
- Keep proxychains as an accessory/proof companion unless a full builder is clearly justified, but ensure proxied command output can still be ingested by the underlying tool analyzer and route proof logic.

Acceptance proof:

- Direct `#/tools/ligolo-ng` route renders an implemented builder first.
- The minimal Ligolo-ng command for each mode is valid with only required inputs.
- Route-proof and cleanup commands are additive, visible, and Evidence-bound.
- Representative Ligolo-ng, chisel, and SSH/plink transcripts are ingested into Evidence and produce conservative activity/fact state that moves or blocks the relevant pivot Next Steps.
- Legacy examples remain collapsed.

## v10.05 - Authentication and enumeration builder batch

Purpose: implement tools that commonly decide whether credentials or low-noise service probes are usable.

Concrete work:

- Promote Hydra to implemented with SSH, FTP, SMB, RDP, HTTP GET, HTTP POST form, and basic-auth modes.
- Promote Kerbrute to implemented with user enumeration, password spray, and password brute-force modes.
- Promote smbclient/smbmap or split them cleanly if one shared builder becomes confusing.
- Promote enum4linux-ng and ldapsearch as enumeration builders with minimal target/domain/base-DN commands first.
- Keep Responder as either an implemented capture/listener builder or an explicitly modeled listener backlog item with clear proof boundaries.
- For every promoted tool, implement or prove Evidence ingestion for each decision-relevant mode in the same build. Credential validity, enumeration discoveries, lockout/error conditions, share access, LDAP findings, captured authentication, and negative results must remain distinct facts.

Acceptance proof:

- Each builder starts with a minimal valid selected-mode command.
- Username/password/list parameters are required only when that mode actually needs them.
- Rate, thread, timeout, output, and module/escalation options are additive toggles.
- Evidence paste-back guidance names the exact output needed for Path/Card decisions.
- Representative positive, negative, blocked, partial, and ambiguous transcripts are analyzed conservatively and produce the expected Next Steps movement or non-movement.

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

## v10.07 - Implemented-tool Evidence and cross-surface audit

Purpose: prove the completed builder batches are actually one operator system across Tools, Cards, Evidence, and Next Steps, and catch any older implemented builder that still lacks the full Evidence contract.

Concrete work:

- Audit every inventory item marked `implemented`, including the builders that predate v10.04, and require executable Evidence-ingestion coverage or a specifically proven shared analyzer mapping.
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
