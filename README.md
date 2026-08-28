# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.2

v2.2 builds on the scoped evidence model from v2.0 and the evidence-intelligence/reporting work from v2.1. The focus is practical lab flow: deeper methodology, interchangeable tool implementations, easier command customization, Kali-aware tool help, stronger state transitions, and better report evidence readiness.

### Maneuver-first methodology

- The methodology unit is the **maneuver**, not the tool used to perform it.
- Multiple implementations of the same maneuver do not inflate or punish methodology coverage.
- Existing cards with multiple tools are resolved through a common preference layer.
- New depth cards cover SMB deep enumeration, web source/JavaScript/backup review, upload validation, Linux/Windows credential hunting, and post-foothold network baselines.
- Workflow and service-depth views show how deeply the relevant surface has actually been explored.

### Preferred tools and practical fallbacks

- Obol prefers the strongest practical implementation that is not marked missing.
- **NetExec (`nxc`) receives an explicit preference boost** for SMB/LDAP/WinRM/RDP/MSSQL and other supported network-service workflows where it is a strong consolidated choice.
- Alternatives such as `smbclient`, `enum4linux-ng`, `rpcclient`, `smbmap`, `ffuf`, `feroxbuster`, `gobuster`, and direct protocol tools remain available.
- Missing a preferred tool never blocks the maneuver; Obol promotes the next usable implementation.
- Tool availability is local browser state and can be changed at any time.

### Kali-aware tool environment

Obol assumes a normal Kali build unless the operator records an exception.

- Tools are tagged as expected/common on Kali or optional/external.
- **I don't have this tool** opens install/verification help and official project links.
- Tool help provides copyable package-install commands where a Kali package exists.
- The Tools → Environment view lets the operator review or override availability without maintaining an inventory up front.
- Obol never runs the install command itself.

Examples currently encoded in the registry include NetExec (`sudo apt install netexec`), Nmap, ffuf, feroxbuster, enum4linux-ng, smbclient, ldap-utils, Evil-WinRM, Certipy, BloodHound tooling, Chisel, Ligolo-ng, Hashcat, and others.

### Command Builder v2.2

- Existing card option switches are preserved and normalized into a reusable semantic command-builder UI.
- Controls are grouped by intent such as Enumeration, Authentication, Performance, Network, Filtering, Discovery, and Output.
- Human-readable labels sit next to the real switch so the UI teaches both intent and syntax.
- Advanced switches can be hidden during normal use and exposed when needed.
- NetExec commands gain common global controls including threads, timeout, jitter, DNS server, logging, verbose/debug output, plus SMB-specific enumeration controls where applicable.
- Web fuzzers gain reusable tuning/output controls.
- Semantic presets can select switches without depending on fragile numeric option positions.
- Exact generated commands are still snapshotted into activity history for reporting.

### Evidence, state, and Intake improvements

- v2.1 supported/refuted/inconclusive knowledge is retained.
- Tool/runtime failures such as `command not found` are treated as **inconclusive**, not as proof that the underlying hypothesis is false.
- Transport failures are similarly prevented from killing a methodology branch when the test itself was not valid.
- Terminal Intake adds conservative recognition for sudo enumeration, NOPASSWD, SUID/capability evidence, Windows privilege output, local listeners, interfaces/routes, RPC user enumeration, LDAP naming contexts, SMB share access, and common web-content discovery output.
- Material state transitions are tagged separately from routine activity: credential, foothold, privilege, domain, lateral-movement, and new-network visibility.

### Path, Stuck, and coverage

- Path keeps v2.1 information-gain/downstream-unlock ranking.
- Relevant coverage now reports **maneuver** coverage rather than command/tool count.
- Service depth highlights shallow SMB, web, LDAP/Kerberos, privilege-escalation, and other workflows.
- Active workflows expose individual steps as new, tried, or succeeded.
- Existing Stuck analysis continues to use coverage gaps, untested credentials, contradictions, repeated dead ends, and high-information next steps.

### Report v2.2

Reporting remains a first-class end goal.

- v2.1 executive summaries, target context, findings, attack-path history, remediation, defensive notes, references, secret redaction, and OSCP mode remain intact.
- **Compromise Chains** now separate material state transitions from routine enumeration so the successful path is easier to explain and reproduce.
- Per-target **Evidence and Screenshot Readiness** combines automatically verifiable ledger evidence with explicit operator screenshot checkboxes.
- Screenshot readiness tracks initial-access evidence, privilege evidence, and proof/local evidence when applicable.
- Report readiness warnings surface missing screenshot items alongside existing missing-command/evidence/confidence checks.
- Manual screenshot state is stored locally with the workspace and is included in the report-generation state model.

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Regression tests

```bash
node tests/run-tests.js
node tests/run-v2.1-tests.js
node tests/run-v2.2-tests.js
```

The v2.2 suite covers Kali tool assumptions, explicit missing-tool overrides, NetExec preference/fallback behavior, semantic NXC switches, maneuver-vs-tool semantics, service-depth counting, inconclusive missing-tool Intake behavior, post-foothold network evidence, material transition history, report screenshot readiness, compromise-chain output, and workflow depth.

GitHub Actions runs all three suites on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
