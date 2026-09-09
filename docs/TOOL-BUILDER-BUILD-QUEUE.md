# Tool Builder Build Queue

This queue exists so the modeled-tool backlog does not turn into vague "add more tools" work. The implementation rule is now strict:

> Every implemented builder starts from the minimal valid command for the selected tool and mode, populated only with real collected target/material parameters or safe tool defaults. GUI fields and toggles may add flags, modes, filters, output handling, credentials, and escalation options onto that base. They must not manufacture fake credentials, placeholder hashes, or kitchen-sink commands.

A builder is not complete merely because it generates a good command. Tool promotion is Evidence-integrated work: the same build must define what output comes back, what that output can and cannot prove, and how Obol reviews it when the result should affect Path/Card state.

## Cross-build command contract

For every implemented builder:

- The initial preview must be the minimal valid command for the selected tool/mode.
- Required target, credential, request, hash, ticket, certificate, or file material must be collected or autofilled from current target/workspace state before the command is valid.
- Missing required material must show a missing-field state, not a fake runnable command.
- Toggles and optional fields must be additive only.
- Placeholder values such as `user`, `domain.local`, `Password123!`, fake NT hashes, and fake `hashes.txt` must never make a command look valid.
- Output from the generated command still returns through Evidence. Command generation is activity, not proof.

## Cross-build Evidence contract

For every implementation batch:

- The builder must name the exact output the operator should paste back into Evidence for the selected action.
- The builder must state a conservative proof boundary. Startup, configuration, discovery, listener creation, route creation, artifact creation, or a recognized command never silently become access, reachability, execution, privilege, or cleanup facts.
- When tool output should influence Path/Card facts, the same build must reuse or extend the current Evidence analyzer/review owner. Do not park parser work for a later release and do not add a parallel Evidence model when an existing owner already fits.
- Analyzer facts must distinguish observed setup/activity from proven outcomes. For example, a tunnel starting is not the same thing as a service being reachable through it.
- Regression proof must include positive recognition and negative no-false-proof cases. A startup-only fixture must not produce a stronger reachability/access/execution/privilege fact.
- Stateful tools must include cleanup expectations. Listener, route, interface, session, process, firewall-rule, file, or other teardown state is separately proven.
- If a tool does not need a dedicated parser, the build must still provide precise Evidence review hints and document why existing generic/service-specific Evidence is sufficient.

v10.07 is therefore a cross-surface handoff and consistency audit. It is not the first place newly implemented builders receive Evidence support.

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

## v10.04 - Pivot and remote-access first builder batch

Purpose: implement the next most important modeled/pivot tools without disturbing the v10.01 Tools/Path/Card/Evidence contract.

Concrete work:

- Promote Ligolo-ng from modeled to implemented with modes for proxy, agent, certificate fingerprint, interface create, route add, tunnel start, listener add/list/stop, and route/interface review.
- Audit and harden chisel against the minimal-command rule so server host/port and optional transport behavior are not emitted until selected.
- Audit and harden SSH/plink tunnel builders against the same minimal-command rule so `-N`, failure handling, batch behavior, bind policy, compression, and host-key options remain explicit additions.
- Keep proxychains as a companion/proof utility for SOCKS-producing chisel/SSH workflows rather than manufacturing a standalone builder with no distinct operator value. Ligolo-ng uses routed TUN access for its normal path.
- Extend the existing v9.91 pivot/tunnel Evidence owner for Ligolo-ng instead of creating another analyzer. Recognize transport, interface/route setup, tunnel startup, listener state, and cleanup as observed state only.
- Require a separate service-specific connectivity result before any tunnel setup can support reachability. `Agent joined`, `Interface created!`, `Route created.`, `Starting tunnel`, or `Listener created` never prove that an internal host/service is reachable.

Acceptance proof:

- Direct `#/tools/ligolo-ng` route renders an implemented builder first.
- The minimal Ligolo-ng command for each mode is valid with only required inputs.
- Ligolo-ng TLS/fingerprint, SOCKS-bootstrap, route, tunnel, listener, and cleanup controls are additive.
- Chisel and SSH/plink minimal previews omit optional default clutter and add it only through explicit controls.
- The existing pivot Evidence analyzer recognizes representative Ligolo-ng setup/listener/cleanup output.
- Startup-only Ligolo-ng Evidence produces only observed/setup facts and never a proven reachability/access fact.
- A separate service-specific connectivity sample remains required to establish connectivity state through the pivot.
- Legacy examples remain collapsed.

## v10.05 - Authentication and enumeration builder batch

Purpose: implement tools that commonly decide whether credentials or low-noise service probes are usable.

Concrete work:

- Promote Hydra to implemented with SSH, FTP, SMB, RDP, HTTP GET, HTTP POST form, and basic-auth modes.
- Promote Kerbrute to implemented with user enumeration, password spray, and password brute-force modes.
- Promote smbclient/smbmap or split them cleanly if one shared builder becomes confusing.
- Promote enum4linux-ng and ldapsearch as enumeration builders with minimal target/domain/base-DN commands first.
- Keep Responder as either an implemented capture/listener builder or an explicitly modeled listener backlog item with clear proof boundaries.
- In the same build, extend/reuse Evidence review for authentication acceptance/refusal, enumerated users/shares/directory material, captured challenge-response material, listener state, and cleanup where applicable.

Acceptance proof:

- Each builder starts with a minimal valid selected-mode command.
- Username/password/list parameters are required only when that mode actually needs them.
- Rate, thread, timeout, output, and module/escalation options are additive toggles.
- Evidence paste-back guidance names the exact output needed for Path/Card decisions.
- Authentication attempts never become credential-valid/access facts without explicit supporting output, and listener startup never becomes capture proof.

## v10.06 - Shell, payload, privesc, and transfer helper batch

Purpose: turn common lab support tools into dependable command builders instead of scattered snippets.

Concrete work:

- Promote linpeas/winpeas launchers with download/serve/run modes and cleanup notes.
- Promote msfvenom with payload, LHOST/LPORT, format, encoder, architecture, output file, and handler-handoff fields.
- Promote msfconsole handler/resource-script generation without auto-execution.
- Promote nc and Penelope listener/shell helpers with explicit LHOST/LPORT and shell-upgrade notes.
- Promote common file-transfer helpers for Python HTTP server, wget/curl fetches, certutil, PowerShell web requests, and Impacket SMB server where appropriate.
- In the same build, add/reuse Evidence review for listener binding, session establishment, identity/privilege output, file-transfer completion, artifact presence, and cleanup without inferring stronger outcomes from generated files or started listeners.

Acceptance proof:

- Builders generate minimal listener/payload/transfer commands from collected parameters.
- Dangerous or irreversible actions are not auto-run.
- Output/handler/proof expectations are explicit and analyzable where they can change workflow facts.
- Payload generation does not prove execution; listener startup does not prove a shell; downloaded/uploaded artifact presence does not prove execution or privilege.
- Commands remain copy/review only.

## v10.07 - Path/Card/Evidence builder handoff audit

Purpose: verify that the Evidence-integrated builders shipped in v10.04-v10.06 behave as one product across direct Tools browsing, Path recommendations, Card actions, and Evidence review.

Concrete work:

- Ensure Path recommendations point to the correct builder route/mode when Evidence supports that next step.
- Ensure Cards use the same builder schema and do not duplicate a separate command model.
- Audit that every newly implemented builder already has its required Evidence analyzer/review hints from its implementation build; fix only integration gaps rather than deferring an entire parser backlog here.
- Verify observed/setup facts and proven outcome facts stay distinct across Tools, Card, Path, Evidence, and Report.
- Remove or collapse any old raw command examples that compete with the implemented builder.

Acceptance proof:

- A representative Evidence sample leads Path to the expected builder-backed next move.
- A representative Card shows the primary builder-backed command/action and a clear Evidence loop.
- Every v10.04-v10.06 builder has a same-build Evidence contract and no outstanding deferred parser requirement.
- Tools, Path, Card, Evidence, and Report remain different surfaces over the same command/proof contract, not diverging implementations.