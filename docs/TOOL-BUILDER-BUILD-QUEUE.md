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

> Third-party GUI tools, such as Burp Suite, use the same rule in handoff form: the first preview must be the minimal guided workflow for the selected mode, populated only with real supplied or Evidence-derived state and safe defaults. Extra behavior is added through explicit controls. Obol guides the human operator, but does not control the GUI.

> A tool is not fully implemented merely because Obol can generate its command. Every implemented tool must also have an Evidence-ingestion contract for the decision-relevant output that tool can produce, conservative fact extraction, failure/partial-result handling, and Next Steps movement or blocking where that Evidence changes what the operator should do next.

## Cross-build command and Evidence contract

For every implemented builder:

- The initial preview must be the minimal valid command for the selected tool/mode. For third-party GUI tools, the initial preview must be the minimal guided handoff for the selected workflow/mode.
- Required target, credential, request, hash, ticket, certificate, callback, listener, transfer, or file material must be collected or autofilled from current target/workspace/Evidence-derived state before the command is valid.
- Missing required material must show a missing-field state, not a fake runnable command.
- Toggles and optional fields must be additive only.
- Placeholder values such as `user`, `domain.local`, `Password123!`, fake NT hashes, and fake `hashes.txt` must never make a command look valid. Lab-looking placeholders such as `10.10.10.10` and `10.10.14.9` are blocked the same way unless they came from actual workspace or parsed Evidence state.
- Output from the generated command returns through Evidence. Command generation is activity, not proof.
- Output from a guided third-party workflow returns through Evidence. Handoff generation is activity, not proof.
- Every builder mode that can produce decision-relevant output must name what the operator can paste back, what facts may be extracted, what remains only a lead, and what positive, negative, blocked, partial, or inconclusive output means.
- Evidence ingestion must be executable product behavior, not only prose in the builder. The tool must either have a dedicated analyzer/parser or cite an existing shared analyzer whose fixtures prove that tool/mode is actually recognized.
- Parsed output may advance, block, re-arm, or deprioritize Next Steps only from supported Evidence. Merely recognizing a command line, banner, listener startup, tool invocation, GUI workflow step, Scanner alert, proxy capture, or request replay must not manufacture access, compromise, reachability, credential validity, exploitability, or privilege.
- When a tool is primarily a launcher, listener, transfer helper, transport, or third-party GUI handoff, its Evidence contract must still recognize the useful state it owns, such as listener bound, client connected, file transferred, route/interface created, proxy capture, request/response captured, scanner issue recorded, manual verification completed, or failure reason. Any deeper downstream fact must remain gated on the appropriate independent Evidence.
- An inventory record must not be promoted to `implemented` until command generation, live Tools rendering, Evidence ingestion, Next Steps handoff where applicable, cleanup/proof boundaries, and regression fixtures all exist. Third-party GUI tools satisfy the command-generation part of this rule with guided handoff generation instead of fake GUI automation.

This is the permanent Definition of Done for modeled-tool work. The historical note-mining rubric already required terminal-output analyzers, Evidence expectations, and Path movement. v10.08 completed the **Implemented-tool Evidence and cross-surface audit**, but it did not close the full modeled-tool backlog because many inventory records still remain `modeled`.

## Completed modeled-tool burn-down slices

Completed slices live here only as current handoff metadata so the active queue stays honest while the modeled backlog is burned down:

- **v10.09 web discovery/scanning slice** completed WhatWeb, Nikto, httpx, wfuzz, and ZAP with schema-driven builders, minimum viable commands, supplied/Evidence-derived prefill, additive controls, executable Evidence ingestion, conservative proof boundaries, and regression coverage.
- **v10.10 Burp Suite guided GUI workflow slice** completed the first-class Burp Suite guided Tool Builder for proxy setup, browser proxying, target scope, sitemap capture, Repeater, Intruder, Scanner triage, raw request/response import handoffs, executable Burp Evidence ingestion, conservative proof boundaries, and regression coverage without pretending Obol can control the Burp GUI.
- **v10.15 network and host discovery slice** completes masscan, Rustscan, naabu, fping, and nbtscan with schema-driven builders, minimum viable commands, supplied/Evidence-derived prefill, additive controls, executable network discovery Evidence ingestion, conservative proof boundaries, and regression coverage.

The next modeled-tool build is **v10.15** for this PR. After it lands, the active queue remains the same backlog name, but the network/host discovery slice must not be treated as pending anymore.

## Active Tool Builder batches

### Remaining modeled tool implementation backlog

Implement or explicitly supersede/reject every inventory record that still reports `modeled`. Do not mark a tool `implemented` just because it has prose, appears on a card, or can be approximated by a generic command snippet.

Representative remaining groups include:

- **Network and host discovery:** ping-style helpers and adjacent probe tools not covered by the v10.15 network and host discovery slice.
- **SMB, LDAP, DNS, SNMP, and AD enumeration:** enum4linux legacy coverage where not superseded, BloodHound collectors, rpcclient, dnsrecon, dig, nslookup, snmpwalk, onesixtyone, windapsearch, ldapdomaindump, and related directory/query tooling.
- **Web discovery, scanning, and request helpers:** nuclei, wpscan, browser/request utilities, and any remaining web tooling not already covered by curl, ffuf, Gobuster/feroxbuster, sqlmap, WhatWeb, Nikto, httpx, wfuzz, ZAP, or the Burp Suite guided GUI workflow.
- **Remote execution and lateral movement:** Impacket psexec, wmiexec, smbexec, dcomexec, atexec, mssqlclient, runas/cmdkey, Windows service/task helpers, RDP/VNC clients, and PowerShell/cmd launchers.
- **Credential capture, relay, roasting, and cracking helpers:** ntlmrelayx, mitm6, coercion tools, medusa, o365spray, hash-identification/conversion tools, John/Hashcat helper formats, and credential-routing utilities not already implemented.
- **Tunneling, pivoting, and transport helpers:** SSH/plink/chisel follow-through where inventory still reports modeled, sshuttle, socat, proxychains, rpivot, ptunnel-ng, socks-over-RDP, dnscat2, and transport cleanup/check commands.
- **Privilege-escalation and local-enumeration helpers:** pspy, searchsploit, PE/PowerShell/Linux helper scripts, systeminfo/wesng, sudo, icacls/accesschk, procmon/procdump, GodPotato/fodhelper/UAC/service-path helpers, and local exploit proof boundaries.
- **Cloud, container, database, and service-specific tooling:** aws, awslocal, kubectl, docker/lxc, mysql, psql, redis-cli, odat, IPMI tooling, and service-specific enumeration/abuse utilities.
- **Exploit PoC and CVE helpers:** named CVE scripts and PoC wrappers must be modeled as controlled operator-reviewed builders with strong proof boundaries, not as magic exploit execution.

Acceptance for each promoted tool:

- A schema-driven builder exists and renders on the live Tools surface.
- The first preview is the minimum viable command or guided third-party handoff for the selected mode.
- Parameters pre-populate only from supplied workspace state, parsed Evidence state, collected material, or safe defaults.
- Optional flags, modes, filters, output paths, cleanup, and riskier behaviors are explicit GUI controls or toggles.
- Missing required values stay missing instead of being replaced with fake runnable placeholders.
- Evidence ingestion recognizes the tool's decision-relevant output, including success, failure, partial, blocked, inconclusive, and cleanup states.
- Evidence can move, block, re-arm, or deprioritize the Next Steps path only when the parsed output actually proves that move.
- The tool has clear proof boundaries and report/cleanup guidance.
- Regression fixtures prove command or handoff generation, prefill behavior, placeholder refusal, Evidence ingestion, and Path movement where applicable.

v10.08's implemented-builder audit remains permanent and must keep passing while this remaining modeled-tool backlog is burned down.
