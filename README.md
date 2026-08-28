# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.9

v3.9 advances the Evidence normalization, activity-intent, and full-session regression priorities carried forward from v3.8.

The release keeps the v3 information architecture small and deepens the existing **Evidence** owner rather than creating a new page. It adds broader high-confidence transcript handling for Impacket Kerberos, secretsdump, Impacket remote execution, PEASS-ng, and SQLmap while preserving the rule that command classification and evidence proof are separate decisions.

### Broader Impacket intent coverage

Evidence now recognizes additional operator command families and maps them to the methodology activity they actually represent:

- `impacket-GetNPUsers` / `GetNPUsers.py` → **AS-REP Roasting**
- `impacket-GetUserSPNs` / `GetUserSPNs.py` → **Kerberoasting**
- `impacket-getTGT` / `getTGT.py` → **Kerberos tickets**
- `impacket-secretsdump` → **Credential Dumping**
- secretsdump with `-just-dc`, `-just-dc-user`, or `-just-dc-ntlm` → **DCSync**
- `impacket-psexec`, `impacket-wmiexec`, `impacket-smbexec`, and `impacket-atexec` → **Authenticated Remote Execution**

The generic matcher remains available for everything else. v3.9 only overrides activity intent when the command family is specific enough to be safer than a fuzzy match.

### Conservative Impacket outcomes

Recognizing a command does not make it successful.

v3.9 only promotes the new Impacket activities when explicit output proves the corresponding state:

- `$krb5asrep$` → `kerberos.asrep_hash`
- `$krb5tgs$` → `kerberos.tgs_hash`
- explicit saved `.ccache` / `.kirbi` ticket output → `kerberos.ticket`
- canonical secretsdump hash rows → `hash.ntlm`
- a canonical `krbtgt` DCSync row → `hash.krbtgt`
- explicit `NT AUTHORITY\SYSTEM` remote-execution output can establish the Windows foothold/SYSTEM state

Startup banners, SMB dialect messages, tool versions, or merely launching a command remain attempts rather than findings.

### PEASS-ng without privilege inflation

Common linPEAS and winPEAS command shapes now map to the existing `linux-enum` and `windows-enum` methodology cards.

That mapping is intentionally classification-only. PEASS-ng output is broad and heuristic. Scanner headings, colored warnings, or interesting-looking lines do not automatically establish root, SYSTEM, or a working privilege-escalation path. The operator still validates the concrete lead and records the validating action separately.

### SQLmap evidence handling

The existing `sqlmap-automation` methodology card is now recoverable from pasted terminal sessions.

When SQLmap explicitly reports that a parameter appears injectable or identifies the backend DBMS, Evidence can establish `web.sqli_confirmed`. It does **not** automatically establish database credentials, command execution, a shell, or a webshell.

This keeps the post-confirmation SQLmap workflow useful in labs without letting one parser string invent downstream compromise state.

### Mixed-session transcript segmentation

v3.9 adds supplemental command segmentation for the new tool families. Large copied terminal sessions can contain PEAS, SQLmap, and Impacket commands in one paste; Obol now separates those command/output blocks before activity repair.

The v3.5 NetExec/Certipy intent layer and the v3.6 Rubeus layer remain in force, so a mixed transcript can preserve multiple distinct methodology activities instead of collapsing into whichever card happens to score highest generically.

### Evidence intent coverage transparency

The Evidence page now includes an **Evidence intent coverage** panel.

It explains which tool families have explicit high-confidence profiles and what they are allowed to claim automatically. It also summarizes covered historical tool families already recorded in the active context.

That transparency is deliberate: the operator should be able to see why a pasted transcript can create one fact but not another.

### v3.9 regression focus

The v3.9 suite covers:

- current v3.9 state/version coercion
- Impacket AS-REP and Kerberoast intent plus explicit hash proof
- Impacket TGT acquisition plus explicit ticket proof
- secretsdump versus DCSync intent separation
- canonical NTLM / krbtgt outcome inference
- Impacket remote-execution classification without weak-output privilege inflation
- linPEAS and winPEAS classification-only behavior
- SQLmap explicit SQLi confirmation without shell/credential overclaiming
- a mixed full-session PEAS + SQLmap + Impacket transcript
- Evidence coverage summaries by active context
- release/index/workflow/README wiring
- inherited sanitized-export secret redaction

See `docs/v3.9.md` for release-specific implementation notes and remaining priorities.

## Obol v3.8

v3.8 advances the pivot-state, compromise-path, proof-readiness, and full-session regression priorities carried forward from v3.7.

- **Reachability & pivot lifecycle** gained source-interface identity, listener health, and bounded operational history.
- **Next Steps** began adjusting pivot-backed confidence using listener health as well as verification freshness.
- **Evidence Lineage** gained transition-aware multi-hop compromise summaries when exact activity lineage exists.
- **Report** gained additional automatic proof requirements for foothold, privilege, objective, and operational network transitions.

An active pivot is not treated as equally trustworthy forever. Listener health can be unknown, healthy, degraded, or down, and operational checks remain separate from lifecycle state. Recording a listener down does not silently mark the path broken.

The Reachability workspace keeps a lightweight pivot operations journal with source-interface, listener/route notes, health checks, verification timestamps, and history.

Transition-aware compromise paths only label a hop when producer/consumer lineage points to one exact activity. Ambiguous hops remain methodology links rather than guesses.

The v3.8 proof templates require recorded outcome facts for foothold, privilege, and objective transitions, and an operationally verified path for network transitions. Manual screenshot proof remains external and operator-confirmed.

## Obol v3.7

v3.7 advances multi-host planning, target-specific reachability, lineage depth, and full-session regression coverage.

Service-level recommendations now retain the concrete observed destination addresses they apply to. Next Steps surfaces those **Grounded targets**, and pivot verification freshness distinguishes fresh, aging, stale, unverified, broken, and inactive state.

Evidence Lineage gained bounded, cycle-safe **multi-hop** compromise paths and upstream/downstream artifact neighborhoods. Consumer activity lineage can recover an exact activity-ID only when card, context, and timestamp correlation are unique; ambiguous cases remain unresolved.

The first broader full-session transcript regression combined anonymous NetExec LDAP enumeration with Rubeus AS-REP roasting and verified that only the Rubeus activity established the roast hash.

## Obol v3.6

v3.6 introduced the first-class **Rubeus workbench** in Tool Library and connected it to Methodology, Evidence, historical command snapshots, and lineage.

The v3.5 backlog explicitly said **AS-REP Roasting mentions Rubeus** for Windows but lacked a real interface; v3.6 closed that gap.

The workbench covers AS-REP Roast, Kerberoast, Ask TGT, Pass the Ticket, and S4U / Delegation with action-specific controls. Rubeus output inference remains conservative: roast hashes can establish their matching hash facts, strong ticket output can establish `kerberos.ticket`, and ticket acquisition never automatically establishes `access.admin`.

Exact-command producer lineage is repaired only when one normalized command match exists in the same context. Ambiguous matches remain unresolved.

## Obol v3.5

v3.5 is the field-tested Evidence and Report release that corrected overloaded-tool **activity classification**, repaired proven Anonymous LDAP outcomes, removed stale Evidence implementation callouts, consolidated Report around one activity-grounded proof model, made screenshot proof explicitly external and transition-aware, added rendered/PDF report export, and introduced conservative lineage repair for older intake/network producers.

The release kept **Evidence normalization** behavior while moving the historical implementation detail out of the active Evidence UI. Its remaining priorities explicitly included richer transcript coverage, more exact lineage, multi-hop compromise navigation, reachability depth, and broader proof-readiness.

## Obol v3.4

v3.4 is the **decision-first** Next Steps release. It makes the recommendation queue the center of the page, surfaces active target/service/reachability context, keeps deep diagnostics under Technical context & controls, and carries the **exact activity-ID** from methodology-card evidence handoff when available.

Its future-agent priorities included stronger transcript classification, more exact lineage, pivot depth, and multi-hop evidence navigation.

## Current information architecture

Primary navigation remains intentionally small:

- **Home** — resume the current context and see unresolved attention
- **Targets** — manage target scope and launch the single Nmap discovery/scan workflow
- **Evidence** — review terminal/tool output and structured imports
- **Next Steps** — prioritized, evidence-grounded work for the active context
- **Report** — proof readiness and reproducible reporting

The **More** menu contains Planned Work, Workspace Search, Methodology, Tool Library, Evidence Lineage, Engagement Map, Guide, and Workspace Data.

### Nmap remains single-owner

Targets owns Nmap. The focused scan modal supports host discovery, quick TCP, full TCP, service/script scans, common UDP, target/range input, output basename, custom ports, timing, minimum rate, retry limits, state reasons, version detection, default scripts, OS detection, and DNS resolution.

Normal, grepable, XML, and host-discovery output applies through the existing host/fact/context pipeline. Scan results can create or merge hosts, attach ports/services, establish conservative reachability facts, update the active context, and recalculate Next Steps.

### Command behavior remains explicit

The v3.3 command audit remains in force:

> **The base command performs the minimum useful action for the maneuver. Optional enumeration, scope, performance, filtering, authentication, and output behavior belongs in explicit semantic controls unless that action is the maneuver itself.**

Anonymous LDAP remains the clearest example:

```bash
nxc ldap {{target}} -u '' -p ''
```

Optional users, active users, exports, groups, computers, DCs, SID, password policy, fine-grained policy, and base-DN behavior remain explicit controls rather than silent defaults.

## Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, and reachability relevance.
- Persistent Planned Work with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- v3.3 command-behavior contracts and Tool Library audit classification.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- Typed artifacts and direct evidence-to-command handoffs.
- Artifact lineage with context-safe deduplication and cross-artifact dependency chains.
- Review-first typed-artifact and network-observation intake gates.
- ANSI/prompt/terminal normalization and mixed-command transcript segmentation.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Browser-local state and sanitized workspace export.
- Rubeus workbench with methodology/Evidence integration and conservative Kerberos outcome inference.
- Exact-command producer activity lineage repair with ambiguity preservation.
- Target-specific reachability ranking with verification freshness.
- Multi-hop compromise-path and artifact-neighborhood navigation.
- Conservative consumer activity-ID repair.
- Pivot source-interface and listener-health operational state with bounded history.
- Transition-aware compromise-path summaries when exact activity lineage exists.
- Transition-specific automatic proof templates for foothold, privilege, objective, and network activity.
- High-confidence Impacket, PEASS-ng, and SQLmap Evidence intent profiles with conservative outcome proof.
- Evidence intent coverage transparency in the active Evidence workflow.

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.

Completed or materially advanced in v3.9:

- Expand high-confidence Evidence activity-intent coverage to Impacket Kerberos, secretsdump/DCSync, Impacket remote execution, PEASS-ng, and SQLmap.
- Keep command classification separate from outcome proof so weak startup text does not create compromise facts.
- Add canonical Impacket roast, ticket, NTLM, and krbtgt evidence handling.
- Add linPEAS/winPEAS classification without automatic privilege inflation.
- Add SQLmap SQLi confirmation without automatically claiming database credentials or shells.
- Add mixed-session segmentation for the new tool families while retaining inherited NetExec, Certipy, and Rubeus handling.
- Add an Evidence intent coverage panel explaining automatic-claim boundaries.
- Add another broader full-session regression spanning PEAS, SQLmap, and Impacket.
- Preserve the v3 single-owner information architecture and Orange Cyberdefense mindmap North Star.

Next priorities:

- Continue validating Rubeus command contracts against current upstream releases as CLI behavior evolves.
- Expand Rubeus ticket/delegation transcript fixtures and additional Kerberos workflows where they map cleanly to the methodology.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds.
- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction and activity-intent fixtures for more NetExec, Certipy, Impacket edge cases, web fuzzers, database clients, and shell output, including malformed and partial transcripts.
- Grow full-session regression fixtures across Linux, Windows, AD, web, database, and pivoting workflows so classification and outcome inference are tested as complete operator sessions rather than isolated strings.
- Continue exact activity-ID lineage through producer/consumer paths where stronger command or activity correlation becomes available.
- Deepen multi-hop compromise-path summaries with conservative target context and transition chronology where exact evidence supports it.
- Continue pivot troubleshooting depth with route-specific checks, source-interface context, and listener history without inferring state that the operator did not record.
- Expand proof-readiness templates for additional finding/transition types while keeping screenshot-content checks operator-confirmed and external.
- Keep the v3 information architecture simple. New functionality should not automatically become a new primary navigation destination.

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
node tests/run-v2.4-tests.js
node tests/run-v2.5-tests.js
node tests/run-v2.6-tests.js
node tests/run-v2.7-tests.js
node tests/run-v2.7-hardening-tests.js
node tests/run-v2.8-tests.js
node tests/run-v2.9-tests.js
node tests/run-v3.0-tests.js
node tests/run-v3.1-tests.js
node tests/run-v3.2-tests.js
node tests/run-v3.3-tests.js
node tests/run-v3.4-tests.js
node tests/run-v3.5-tests.js
node tests/run-v3.6-tests.js
node tests/run-v3.7-tests.js
node tests/run-v3.8-tests.js
node tests/run-v3.9-tests.js
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, Evidence normalization, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture. The v3.9 suite adds broader Impacket/PEASS-ng/SQLmap activity intent, conservative explicit outcome proof, Evidence coverage summaries, and a mixed PEAS + SQLmap + Impacket full-session regression.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
