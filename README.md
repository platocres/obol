# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.3

v2.3 focuses on turning evidence into useful next actions. It retains the v2.2 maneuver-first methodology, tool fallback model, service-depth tracking, compromise-chain reporting, and evidence-readiness checks while tightening the day-to-day lab workflow.

### Evidence intake that carries forward

- Forest-style Nmap output now enriches the host record from script/service evidence, including computer name, FQDN/domain context, and detailed OS text when present.
- NetExec LDAP `--users` output is distilled into a clean username artifact instead of remaining opaque terminal text.
- LDIF `sAMAccountName` and `userPrincipalName` fields are also distilled into usernames.
- Common AD noise such as HealthMailbox, `SM_` service-mailbox objects, machine accounts, Guest, DefaultAccount, and krbtgt is filtered from generated user lists.
- Applying reviewed username artifacts establishes `ad.user_list`, so Path can immediately rank username-driven AD follow-ups rather than leaving the list disconnected from methodology state.
- Intake can **Download + use as userlist**, saving `users.txt` and setting the shared `userlist` parameter to that filename for command builders.

### Command Builder v2.3

v2.3 expands practical switch coverage beyond the v2.2 NetExec/fuzzer work while keeping controls grouped by operator intent.

- Nmap: host discovery, DNS behavior, open-only/reason output, timing profiles, retry/rate controls, and `-oA` evidence output.
- ldapsearch: simple bind, clean LDIF, scope, paging, bind DN, and password prompting.
- curl: redirects, TLS handling, headers, cookies, response output, verbosity, and time limits.
- Hydra: tasks, waits, first-success behavior, TLS, verbosity, and output files.
- Hashcat and John: workload/rules/formats/status/show/output controls.
- Responder: interface, analyze-only mode, verbosity, and common response modules.
- SNMP tools: version/community/input/output/timeout controls.
- Evil-WinRM: SSL, port, scripts/executables directories, and session logging.
- WhatWeb, smbclient, and rpcclient receive additional practical controls as well.

The real switch remains visible beside its human-readable label. Advanced controls can stay hidden until needed. Generated commands remain operator-run and are snapshotted into activity history when recorded.

### Scripts library UX

The offline script library remains part of Obol under **Tools → Scripts**.

- Search scripts by name, category, description, or use case.
- Each script exposes its **when**, **where**, and **how** guidance alongside the code.
- One-click copy is available directly from the script card.
- Scripts remain parameter-aware through Obol placeholders and are never executed by the application.

### v2.2 foundations retained

- Maneuvers, not redundant tool implementations, are the methodology/coverage unit.
- NetExec remains preferred where it is the strongest consolidated implementation, with practical alternatives when a tool is missing.
- Tool/runtime and transport failures remain inconclusive rather than incorrectly refuting a maneuver.
- Path uses evidence relevance, downstream unlocks, service/workflow depth, and prior activity to rank next actions.
- Reporting includes executive/technical narrative, reproducible attack history, compromise chains, remediation context, secret redaction, OSCP mode, and per-target evidence/screenshot readiness.
- All state remains local to the browser unless explicitly exported.

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from `main` and `/ (root)`.

## Regression tests

```bash
node tests/run-tests.js
node tests/run-v2.1-tests.js
node tests/run-v2.2-tests.js
node tests/run-v2.3-tests.js
```

The v2.3 suite specifically covers release-state migration, Forest-style Nmap host enrichment, NetExec/LDIF username distillation, artifact-to-`ad.user_list` handoff, and representative command-builder switch coverage. GitHub Actions runs all regression suites on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
