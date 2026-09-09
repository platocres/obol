# Tool Builder Build Queue

This queue exists so the modeled-tool backlog does not turn into vague "add more tools" work. The implementation rule is now strict:

> Every implemented builder starts from the minimal valid command for the selected tool and mode, populated only with real collected target/material parameters or safe tool defaults. GUI fields and toggles may add flags, modes, filters, output handling, credentials, and escalation options onto that base. They must not manufacture fake credentials, placeholder hashes, or kitchen-sink commands.

## Cross-build command contract

For every implemented builder:

- The initial preview must be the minimal valid command for the selected tool/mode.
- Required target, credential, request, hash, ticket, certificate, or file material must be collected or autofilled from current target/workspace state before the command is valid.
- Missing required material must show a missing-field state, not a fake runnable command.
- Toggles and optional fields must be additive only.
- Placeholder values such as `user`, `domain.local`, `Password123!`, fake NT hashes, and fake `hashes.txt` must never make a command look valid.
- Output from the generated command still returns through Evidence. Command generation is activity, not proof.

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

- Promote Ligolo-ng from modeled to implemented with modes for proxy, agent, tunnel interface, route add, listener, and route proof.
- Audit and harden chisel against the minimal-command rule if gaps remain.
- Audit and harden SSH/plink tunnel builders against the same minimal-command rule.
- Keep proxychains as an accessory/proof companion unless a full builder is clearly justified.

Acceptance proof:

- Direct `#/tools/ligolo-ng` route renders an implemented builder first.
- The minimal Ligolo-ng command for each mode is valid with only required inputs.
- Route-proof and cleanup commands are additive, visible, and Evidence-bound.
- Legacy examples remain collapsed.

## v10.05 - Authentication and enumeration builder batch

Purpose: implement tools that commonly decide whether credentials or low-noise service probes are usable.

Concrete work:

- Promote Hydra to implemented with SSH, FTP, SMB, RDP, HTTP GET, HTTP POST form, and basic-auth modes.
- Promote Kerbrute to implemented with user enumeration, password spray, and password brute-force modes.
- Promote smbclient/smbmap or split them cleanly if one shared builder becomes confusing.
- Promote enum4linux-ng and ldapsearch as enumeration builders with minimal target/domain/base-DN commands first.
- Keep Responder as either an implemented capture/listener builder or an explicitly modeled listener backlog item with clear proof boundaries.

Acceptance proof:

- Each builder starts with a minimal valid selected-mode command.
- Username/password/list parameters are required only when that mode actually needs them.
- Rate, thread, timeout, output, and module/escalation options are additive toggles.
- Evidence paste-back guidance names the exact output needed for Path/Card decisions.

## v10.06 - Shell, payload, privesc, and transfer helper batch

Purpose: turn common lab support tools into dependable command builders instead of scattered snippets.

Concrete work:

- Promote linpeas/winpeas launchers with download/serve/run modes and cleanup notes.
- Promote msfvenom with payload, LHOST/LPORT, format, encoder, architecture, output file, and handler-handoff fields.
- Promote msfconsole handler/resource-script generation without auto-execution.
- Promote nc and Penelope listener/shell helpers with explicit LHOST/LPORT and shell-upgrade notes.
- Promote common file-transfer helpers for Python HTTP server, wget/curl fetches, certutil, PowerShell web requests, and Impacket SMB server where appropriate.

Acceptance proof:

- Builders generate minimal listener/payload/transfer commands from collected parameters.
- Dangerous or irreversible actions are not auto-run.
- Output/handler/proof expectations are explicit.
- Commands remain copy/review only.

## v10.07 - Path/Card/Evidence builder handoff pass

Purpose: make the improved builders useful outside direct Tools browsing.

Concrete work:

- Ensure Path recommendations point to the correct builder route/mode when Evidence supports that next step.
- Ensure Cards use the same builder schema and do not duplicate a separate command model.
- Ensure tool output parsers or Evidence review hints are present for the newly implemented builders.
- Remove or collapse any old raw command examples that compete with the implemented builder.

Acceptance proof:

- A representative Evidence sample leads Path to the expected builder-backed next move.
- A representative Card shows the primary builder-backed command/action and a clear Evidence loop.
- Tools, Path, and Card remain different surfaces over the same command/proof contract, not three diverging implementations.
