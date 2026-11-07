## v13.1 - Multi-Host Campaign Generalization, Cross-Target Credential Reuse, 3-Stage Exploit-DB Adapter & 50 Reactive Doctors (2026-11)

Completed the multi-cohort Generalization and Multi-Host Campaign expansion across 390+ diverse lab, certification, and multi-domain Active Directory scenarios, introducing cross-target credential reuse projection, the 3-stage closed-loop Exploit-DB (`searchsploit`) auto-adapter, zero-CVE custom binary and disclosed web-source triage, and CSR hypergraph ranker acceleration.

- **Multi-Target Reuse & Pivot Projection (`#/home`, `#/path`, `#/domain`):**
  - Projects credentials, NTLM hashes, and SSH keys recovered on `host:A` onto scanned `host:B` strictly as unvalidated reuse hypotheses (`credential.reuse_candidate`, `unvalidatedOnTarget: true`) without fabricating `credential.validated` or `foothold.*`.
  - Isolates machine-bound LAPS secrets (`targetBinding`) and `domain:`-scoped gMSA hashes so local administrator passwords never cross-pollinate unrelated hosts.
  - Synthesizes `tunnel.reachable_via_pivot` across dual-homed CIDRs and ARP neighbors, and adds SharpHound v5 multi-domain forest parity with multi-column SVG attack-path rendering.
- **3-Stage Closed-Loop Exploit-DB (`searchsploit`) Auto-Adapter & 50 Reactive Repair Doctors:**
  - Subtracts stock OS/service banners, ranks non-DoS `searchsploit` PoCs by semantic version alignment while conserving single-host framework budgets, and parses `searchsploit -x` source code to bind CLI/constant parameters.
  - Warns pre-flight on leftover author Burp proxies (`exploit.hazard_burp_proxy`), Python 2 syntax (`exploit.hazard_py2`), and C compilation flags (`exploit.hazard_c_compile`).
  - Expands reactive `.fix-card` Error & Trap Doctors from `39` to **`50`** automated repair workflows.
- **Zero-CVE Custom Binary & Disclosed Web-Source Triage:**
  - Subtracts stock Linux and Windows OS baselines to isolate non-standard privileged SUID, cron, and service binaries (`privesc.custom_binary`) as well as disclosed `.git` repositories, Composer v1/v2 manifests, and LFI source files (`web.source_disclosed`, `web.manifest_disclosed`).
  - Automatically detects relative `system()` / `Process.Start()` `PATH` hijacks, writable `.so` / `.dll` imports, hardcoded connection strings, and dangerous web sinks.
- **Parser Fleet, Playbook & CSR Ranker Acceleration:**
  - Expanded 3-tier parser, shape, and Wittgensteinian inference coverage to **`18` parser modules** emitting **`290` exact fact kinds**.
  - Expanded the methodology catalog from `355` moves to **`370` moves (`1,263` runnable commands, `100.0%` authored 4-pillar Field Notes)** across `19` packs.
  - Accelerated hypergraph ranking by **`~20x`** via Compressed Sparse Row (CSR) adjacency indexing and memoized frontier evaluation.

## v13.0 - Causal Frontier Ranker, Wittgensteinian Inference, 355-Move Corpus & Hero Operator Deck (2026-10)

This release completed the architectural upgrade of OBOL's deterministic intelligence pipeline, expanding the curriculum to 355 moves across 19 packs, introducing the 3-tier Wittgensteinian Contextual Inference Engine and the 7-tier Causal Frontier & Bayesian Utility Ranker, and adding the 5-tab Hero Operator Deck, Startup Hub (`#/start`), Offline Workbench (`#/workbench`), 5-lens Library (`#/library`), and Operator Manual (`#/help/manual`).

- **Move Pack & Corpus Expansion:** Expanded from 237 moves to **355 moves across 19 packs** (`1,923` commands), 37 full end-to-end practice walkthroughs, 376 study fixture keys, 100% 4-pillar Field Notes, and 117 flag-annotated tools.
- **3-Tier Wittgensteinian Contextual Inference (`INFERENCE.md`):** Combines Tier 1 tool-signature extractors, Tier 2 structural shape matchers, and Tier 3 atomic co-occurrence families (`7A-7H`), dynamic 2D table/KV geometry, shell prompt telemetry, and causal entailment.
- **7-Tier Causal Frontier & Bayesian Utility Ranker (`RANKING.md`):** Replaced the legacy 4-tier ranker with a 7-tier (`Tier 5..-1`) Causal Frontier model, identity- and service-scoped target-profile multipliers, attempt outcome classification and dry-probe dampening, Access Epoch tracking, and terminal loop detection.
- **Cockpit 5-Tab Hero Operator Deck (`#/path`):**
  - **Flags & Proof (`Flag Capture`):** Self-locating one-liner enumeration commands surfaced first; explicit `Educated Guess` vs `Ready - Verified Path` epistemic badges on direct flag read commands; inline `CMD` / `PS` shell toggles on dual-shell commands; and one-shot combined User + Root on-host proof capture.
  - **Get On Host & Persistence & Accounts:** Instant lane switching for Evil-WinRM, xfreerdp (with `/pth` Pass-the-Hash), WMI/PsExec/SMBExec admin shells, remote WinRM/RDP unlock sequences, and 2-step authorized lab access maintenance.
  - **Shares & File Transfer (`SMB & Shares` & `Tool Stager`):** Dynamic Remote (Kali -> Target) vs Local (On Target) command mode toggles, live SMB GET/PUT path builder, and the 13-payload **Tool Stager** (`winpeas`, `linpeas`, `pspy`, `ligolo`, `chisel`, `sharphound`, `mimikatz`, `rubeus`, `godpotato`, `printspoofer`, `certify`, `powerview`, `nc64` / `RunasCs`) with per-tool staging cards and bulk cradle generation.
  - **Cred & AD Ops (`Cred & Hash Ops` & `AD & Domain Ops`):** Evidence-aware gating badges (`Kerberoastable SPNs confirmed` vs `Requires valid domain credentials - no SPNs confirmed yet`, AS-REP roast readiness, outbound ACL/BloodHound status, and multi-protocol `nxc` credential validation) plus clean `net user /domain` boilerplate filtering.
- **Startup Hub (`#/start`), Offline Workbench (`#/workbench`), 5-Lens Library (`#/library`), & Operator Manual (`#/help/manual`):** Added the `#/start` engagement setup and curated certification resource hub, expanded the client-side Workbench, expanded `#/library`, and added the 7-chapter Operator Manual, 32-term Glossary, and cross-tab search on `#/help`.

## v12.9 - No Learner Left Stranded: Trap Doctors, Two-Flag Capture Model & Workflow Preferences

- **Trap-Doctor Tier:** Detects classic lab and exam environmental walls from pasted output and surfaces a gated fix-or-guidance card: SSH `id_rsa` permission/format rejections, Kerberos clock skew (`KRB_AP_ERR_SKEW`), NTLM disabled, account lockout / must-change-password, CRLF "bad interpreter", `sudo: no tty`, AMSI blocks, Potato / `SeImpersonate` build mismatches, rate-limit / WAF throttling, hashcat format mismatches, egress-blocked payloads, SMB-signing-required relay targets, quiet Responder captures, "host seems down" ping blocks, and DNS name-resolution misses.
- **Two-Objective Flag Hunt:** Capturing the user flag (`objective.local_flag`) and capturing the root/proof flag (`objective.root_flag`) are tracked as independent objectives so grabbing `local.txt` never hides the remaining `proof.txt` objective.
- **Endgame Objective Pull:** Bounded objective pull keeps reachable, uncaptured flags at the top of the frontier without collapsing goal distance for remaining targets.
- **Per-Engagement Workflow Preferences:** Added optional *Balanced*, *Flags first, pivot last*, and *Map the network early* workflow preferences.

## v12.8 - Phased Two-Machine Pivot Wizard & Symptom-First Troubleshooter

- **Two-Machine Connection Wizard:** Phased, machine-labelled guides for `Ligolo-ng`, `Chisel`, `SSH -D`, `sshuttle`, and `dnscat2` covering Kali preparation, staging the agent binary onto the compromised host, opening the tunnel, verification checkpoints, and cleanup.
- **Symptom-First Pivot Troubleshooter:** Interactive diagnostic flow (`OBOL.pivotDoctor`) across six tunnel failure symptom sets that highlights the root-cause line from pasted output and provides a copy-ready fix.
- **Expanded Route & Interface Parsers:** Recognizes Linux `ip a` / `ip route`, `ifconfig`, Windows `ipconfig`, `netstat -rn`, and `route print` alongside `chisel`, `ligolo-ng`, and `sshuttle` connection banners.

## v12.7 - Evidence-Driven Vulnerability Fingerprint Matching

- **Vulnmatch Recognizer:** Reads pasted service/version banners, `CHANGELOG` lines, CVE strings, and Nmap vuln-script verdicts to mint conservative `vuln.<name>` candidate leads that wire directly into matching service and application exploit modules.

## v12.6 - 30/30 Gold-Standard Known-Exploit Modules

- **Promoted 23 Additional Known-Exploit Modules:** Added full teaching surfaces, 4-pillar field notes, and decision-map wiring across network service RCEs (`vsftpd 2.3.4`, `ProFTPD mod_copy`, `Samba usermap_script`, `SMBGhost`, `BlueKeep`), web app CVEs (`Shellshock`, `Heartbleed`, `Drupalgeddon2`, `phpMyAdmin`, `Webmin`), app-platform RCEs (`Apache OFBiz`, `Cacti`, `Zabbix`, `Splunk`, `Text4Shell`), niche services (`FreeSWITCH`, `JDWP`, `Usermin`, `Aerospike`, `WiFi Mouse`), and Linux local escalations (`DirtyCow`, `DirtyPipe`, `Baron Samedit`).

## v12.5 - Service DACL Abuse, Named-Pipe Impersonation & SSH Port Forwarding

- **Three New Methodology Modules:** Added Windows `SERVICE_CHANGE_CONFIG` service DACL abuse, Windows named-pipe token impersonation, and SSH local/remote port forwarding (`-L` / `-R`) with full field notes and Atlas scenarios.

## v12.4 - Beyond-Exam Cloud, AD & Web Modules

- **Zero Dead-Text Placeholders:** Converted all remaining static `<angle-bracket>` command placeholders across the move catalog into fillable `{{token}}` inputs.
- **Eleven New Modules:** Added Windows patch-gap / kernel-CVE exploitation, SCCM Network Access Account extraction, vhost-to-content-discovery handoff, Windows UAC bypass and COM hijack, Linux wildcard injection and writable `systemd` unit abuse, GraphQL introspection and broken authorization, Active Directory Certifried (`CVE-2022-26923`), Azure IMDS managed-identity token theft via SSRF, and DNS tunneling for egress-restricted hosts.
