# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v4.4

v4.4 is the **Orange decision-path integration** release.

v4.2 gave Obol a canonical Orange Cyberdefense 2025.03 Active Directory denominator, and v4.3 reconciled that denominator against live methodology. v4.4 takes the next step required by the README North Star: the Orange data now materially improves **Next Steps** and helps lead the operator through the mindmap's decision path as evidence is recorded.

The release remains advisory and human-run. Orange guidance never creates facts, never marks success, never makes a technique applicable, never hides fallback methodology, and never overrides reachability, evidence, or the existing Kali/Windows execution-context model.

### Orange decision stages

The canonical mappings are now grouped into a deliberately small engagement progression:

1. **Identify the environment**
2. **Obtain or validate credentials**
3. **Map authenticated AD**
4. **Test control paths**
5. **Move with proven access**
6. **Deepen host control**
7. **Assess domain-level control**
8. **Document persistence options**

This is not a forced linear script. The Orange map branches, and Obol keeps its normal prerequisite/evidence engine authoritative. The stage model provides a bounded progression signal so the canonical data can inform the recommendation queue without replacing it.

### Per-context progress

Successful mapped activity now advances an Orange decision stage only inside the active host/domain context.

The progress model also uses a conservative fact floor so reviewed/imported evidence can place the operator appropriately even when the evidence did not originate from an expanded methodology card.

Examples include:

- domain/scan evidence → identify the environment
- validated credential or ticket material → obtain/validate credentials
- graph/attack-path facts → authenticated mapping
- control-path/certificate facts → control-path testing
- foothold/lateral facts → movement
- admin/SYSTEM facts → host control
- NTDS/krbtgt facts → domain-level control

Another host's activity never advances the current context.

### Next Steps ranking now uses Orange path context

Mapped cards receive only a small **positive** ranking signal when they fit the current Orange stage:

- current stage → continuation boost
- immediately next stage → strongest Orange-path boost
- one stage beyond → small future-branch boost
- earlier or much later stages → no negative penalty

This means Orange can help choose between several already-valid recommendations while the normal evidence, prerequisites, information gain, workflow depth, reachability, pivot state, prior activity, and operator execution side remain authoritative.

### Next Steps UI

Next Steps now includes an **Orange 2025.03 decision path** panel showing:

- the current decision stage
- the next stage
- evidence-grounded canonical directions that already map to live Obol cards
- recent successful mapped activity in the active context
- a clear reminder that Orange path context is advisory only

Recommendations that receive an Orange boost show the reason and magnitude.

Canonical project gaps are not presented as user actions until Obol has a real mapped workflow for them.

### Home and card provenance

Home shows the active context's current Orange decision stage alongside the existing project-completion card.

Mapped methodology cards show both:

- their v4.3 canonical Orange provenance
- their v4.4 Orange decision stage

This keeps project coverage, engagement guidance, and actual methodology traceable to the same canonical source.

### Coverage remains strict

v4.4 improves engagement guidance without pretending that guidance work implemented new Orange techniques.

The live project-coverage baseline therefore remains:

- **42 / 127 canonical sections fully implemented**
- **39 partial**
- **46 explicit gaps**
- **0 stale implemented mappings**
- **33% fully implemented**
- **64% represented**

### v4.4 regression focus

The v4.4 suite locks:

- unchanged Orange 2025.03 source commit, tree SHA, and permanent North Star
- unchanged 42 implemented / 39 partial / 46 gap / 0 stale project baseline
- representative card-to-decision-stage assignments
- active-context isolation
- successful mapped activity advancing the decision stage
- current/next-stage positive ranking signals
- no Orange applicability gate or negative penalty
- decision queue containing only live applicable mapped cards
- `nextStepsOverview34` decision-path payload
- coexistence with the Kali/Windows execution-context model
- Next Steps, Home, card-provenance, and Guide UI wiring
- release/index/workflow/README wiring
- inherited sanitized-export secret redaction

See `docs/v4.4.md` for the decision-stage contract and future-agent guidance.

## Obol v4.3

v4.3 is the **canonical reconciliation and cracking-contract audit** release.

v4.2 established a durable 127-section Orange Cyberdefense 2025.03 Active Directory denominator. v4.3 reviews that denominator against the methodology that already exists in Obol, repairs the stale RBCD mapping exposed by v4.2, recognizes mature workflows that the first canonical pass under-counted, and expands the Active Directory Hashcat reference with audited current modes.

The pinned Orange source snapshot remains immutable in `data/orange-ad-2025.03.js`. Current-release coverage changes live in `data/methodology-v4.3.js`. This preserves a reproducible v4.2 historical baseline while allowing later releases to improve live mappings without rewriting the source inventory.

### v4.3 live coverage

After reconciliation:

- **42 / 127 canonical sections fully implemented**
- **39 partial**
- **46 explicit gaps**
- **0 stale implemented mappings**
- **33% fully implemented**
- **64% represented** when implemented and partial coverage are combined

Compared with the validated v4.2 live baseline, v4.3 adds **17 fully implemented sections**, removes **16 gaps**, clears the **1 stale mapping**, raises strict completion by **13 percentage points**, and raises represented coverage by **14 percentage points**.

A substantial part of that gain is reconciliation of functionality that already existed in Obol, not a claim that seventeen brand-new offensive techniques were invented in this release.

### RBCD stale mapping repaired

v4.2 correctly detected that the canonical RBCD section referenced a nonexistent legacy `rbcd` card ID.

v4.3 maps the canonical Resource-Based Constrained Delegation workflow to the real Obol implementation:

- `ad-machine-account-quota-v25` for readiness and machine-account preconditions
- `delegation-abuse` for the delegation workflow
- `getst-impersonation` for the S4U payoff and ticket handoff

The retained v4.1 tool-choice audit is repaired at the same time, so current coverage now has **zero stale implemented mappings**.

### Existing methodology reconciled into the canonical ledger

The canonical ledger now recognizes existing Obol workflows for:

- domain-controller and domain identification
- authenticated SCCM reconnaissance
- GPP / MS14-025 credential recovery
- MSSQL movement and linked-server paths
- trust enumeration
- Golden Ticket persistence
- database quick-win paths across MSSQL, MySQL, and PostgreSQL

Broad source branches remain partial when one existing card does not truthfully implement the whole Orange branch. Authenticated historical vulnerabilities, detection-only Zerologon, persistence-oriented ACL lifecycle, and SCCM PXE cracking are examples where v4.3 deliberately refuses to inflate the percentage.

### Active Directory Hashcat mode audit

The existing `hashcat-modes` methodology card is expanded into an audited Active Directory cracking reference.

v4.3 explicitly covers:

- LM — mode `3000`
- NTLM — mode `1000`
- NetNTLMv1 / ESS — mode `5500`
- NetNTLMv2 — mode `5600`
- Kerberos TGS RC4 / etype 23 — mode `13100`
- Kerberos TGS AES128 / etype 17 — mode `19600`
- Kerberos TGS AES256 / etype 18 — mode `19700`
- Kerberos AS-REP RC4 / etype 23 — mode `18200`
- MSCache2 / DCC2 — mode `2100`
- TimeRoast / MS SNTP — mode `31300`
- SCCM PXE AES128 — mode `19850`, retained as **partial** because the practical path depends on a dedicated external SCCM Hashcat module/fork rather than a stock Hashcat installation

This also corrects the common stale mapping of NetNTLMv1 to raw-NTLM mode `1000`; the audited NetNTLMv1 mode is `5500`.

### Coverage provenance and release delta are visible

v4.3 keeps the v4.2 completion percentage surfaces and adds release context:

- Methodology shows a **v4.3 canonical reconciliation** panel before the full canonical ledger
- Home shows the current percentage plus the number of fully implemented sections gained since the validated v4.2 baseline
- the persistent Orange AD header badge carries the release delta in its tooltip
- mapped methodology-card pages show their Orange 2025.03 canonical mapping count
- Guide includes the v4.3 release focus

Canonical card provenance is attached to live methodology cards so the percentage remains traceable to actual workflows rather than becoming a disconnected project metric.

### Kali / Windows execution metadata continues to deepen

v4.3 keeps the existing `operatorSurface40` execution-context contract and adds explicit high-confidence metadata to reconciled workflows. Hashcat, NetExec, Nmap, Impacket, sccmhunter, smbclient, and gpp-decrypt paths are identified as Kali-side where appropriate; native trust commands such as `nltest` and PowerView remain Windows-side; neutral commands stay neutral.

No competing execution-context system is introduced.

### v4.3 regression focus

The v4.3 suite locks:

- unchanged Orange 2025.03 source commit, tree SHA, and permanent North Star
- the 42 implemented / 39 partial / 46 gap / 0 stale live baseline
- 33% complete and 64% represented calculations
- exact v4.2-to-v4.3 coverage delta
- RBCD stale-mapping repair against live cards
- reconciled DC, SCCM, GPP, MSSQL, trust, Golden Ticket, and database mappings
- deliberately partial broad/risky source branches
- audited Hashcat mode contracts and the external-module PXE exception
- explicit execution-side metadata on reconciled commands
- retained v4.1 tool-audit consistency
- Methodology, Home, card-provenance, and Guide UI wiring
- release/index/workflow/README wiring
- inherited sanitized-export secret redaction

See `docs/v4.3.md` for the full reconciliation record and future-agent guidance.

## Obol v4.2

v4.2 is the **canonical Orange snapshot and completion-accounting** release.

v4.1 created an auditable Orange coverage ledger, but its percentage was still based on the subset of Orange branches that had already been entered into that ledger. v4.2 fixes that limitation by pinning the complete Orange Cyberdefense 2025.03 Active Directory textual methodology structure inside Obol and making that local snapshot the completion denominator.

### Canonical local Orange snapshot

The source of truth is now:

`data/orange-ad-2025.03.js`

It is pinned to Orange Cyberdefense `ocd-mindmaps` commit:

`6d16ca0d1434875e0617f2f3cfa825fad0bc7d7e`

and the upstream AD source-tree SHA:

`51b414fc0c0a1a4414e86986ec5e2b5225a6d698`

The manifest normalizes all **17 methodology-bearing AD Markdown files** plus the supporting `conf.yml` and `authors.md` source records. It stores source blob hashes, pinned source links, normalized section identities, Obol mappings, and explicit coverage state without copying the upstream command corpus verbatim.

The canonical denominator contains **127 canonical methodology sections**.

### v4.2 completion baseline

At the validated v4.2 baseline:

- **25 / 127 canonical sections fully implemented**
- **39 partial**
- **62 explicit gaps**
- **1 stale implemented mapping** surfaced by live card validation
- **20% fully implemented**
- **50% represented** when implemented and partial coverage are combined

The completion percentage counts only live `implemented` sections. Partial coverage and stale mappings do not inflate the number.

### Completion percentage is easy to see

The current Orange AD completion percentage is now visible in several places:

- a persistent **Orange AD percentage badge** in the application header on every route
- a dedicated Orange AD coverage card on **Home**
- the full canonical coverage ledger in **Methodology**

Methodology also shows the denominator, represented percentage, pinned upstream commit, AD tree identifier, per-source-file counts, source links, filters, and canonical gap queue.

### Future agents do not need to reopen the visual map for routine accounting

Future work should read `data/orange-ad-2025.03.js` first, then apply the latest methodology coverage overlays such as `data/methodology-v4.3.js` and `data/methodology-v4.4.js`.

The normal workflow is now:

`pinned Orange manifest → current coverage/path overlays → canonical coverage → priority gaps → implementation → coverage update`

A future agent only needs to revisit upstream Orange when refreshing the pinned snapshot, implementing a specific branch that needs exact upstream detail, checking whether upstream changed, or resolving a source-integrity mismatch.

### Full source-container coverage

The canonical methodology inventory includes ACL / ACE abuse, AD CS, admin credential extraction, authenticated enumeration, hash cracking, Kerberos delegation, domain-admin endgame, authenticated historical vulnerabilities, lateral movement, Windows low-access privilege escalation, low-hanging / quick-compromise paths, relay / man-in-the-middle, no-credential enumeration, domain persistence, SCCM, domain and forest trusts, and valid-user / no-password paths.

### v4.2 regression focus

The v4.2 suite locks the historical source snapshot and its validated baseline so later coverage overlays cannot silently rewrite what v4.2 measured.

See `docs/v4.2.md` for implementation details and the original future-agent workflow.

## Obol v4.1

v4.1 is the **methodology coverage and audit** release. It works directly from the v4.0 README requirement to create infrastructure that keeps track of how much of the Orange Cyberdefense 2025.03 Active Directory mindmap has actually been implemented, what is only partially represented, and what still remains.

The release does not add another primary navigation destination. The existing **Methodology** surface owns the coverage ledger.

v4.1 introduced explicit implemented / partial / gap / stale-mapping accounting, structured keep / supplement / replace / review tool decisions, and the first audited execution-side metadata for Orange-mapped commands. v4.2 through v4.4 retain those tool-review and execution-metadata layers while using the full canonical source inventory as the completion denominator.

## Obol v4.0

v4.0 is the **execution-context** release. It works directly from the earlier README requirement to make sure the Path considers whether a user is **operating from Kali or from a Windows host** on any given step of the path.

Each active host/domain context can record **Either**, **Kali**, or **Windows host**. The choice influences a small Next Steps ranking signal and command guidance without becoming a methodology prerequisite.

v4.0 introduced Kali / Windows / target-local / neutral command classification, highlighted compatible implementations, preserved opposite-side fallbacks, snapshotted operator planning mode and command execution side on new activity history, and added **Operator Execution Context** provenance to generated reports.

## Obol v3.9

v3.9 expanded **Evidence normalization** and high-confidence **activity-intent** coverage for Impacket Kerberos, secretsdump/DCSync, Impacket remote execution, PEASS-ng, and SQLmap while keeping command classification separate from outcome proof.

Explicit roast hashes, saved Kerberos tickets, canonical secretsdump rows, and explicit SYSTEM remote-execution output can establish only the corresponding proven facts. Weak banners or startup text do not create compromise state.

The Evidence page also gained intent-coverage transparency, and v3.9 added another full-session transcript regression spanning PEAS, SQLmap, and Impacket.

## Obol v3.8

v3.8 added pivot operational state including source-interface context, **listener health**, bounded path history, transition-aware compromise-path summaries, transition-specific Report proof checks, and another mixed full-session regression.

## Obol v3.7

v3.7 added **target-specific reachability**, pivot verification freshness, conservative consumer activity-ID repair, **multi-hop** compromise paths, artifact neighborhoods, and broader full-session regression coverage.

## Obol v3.6

v3.6 introduced the first-class Rubeus workbench and connected Rubeus command building to Methodology, Evidence, historical commands, and lineage.

The v3.5 backlog explicitly said **AS-REP Roasting mentions Rubeus** for Windows but lacked a real interface; v3.6 closed that gap.

Rubeus outcome inference remains conservative, and **exact-command lineage** is repaired only when one normalized command match exists in the same context.

## Obol v3.5

v3.5 is the field-tested Evidence and Report release that corrected overloaded-tool **activity classification**, repaired proven Anonymous LDAP outcomes, retained **Evidence normalization**, consolidated Report, made screenshot proof explicitly external, added rendered/PDF export, and strengthened lineage repair. Its remaining priorities included **multi-hop** navigation and broader transcript handling.

## Obol v3.4

v3.4 is the **decision-first** Next Steps release. It made the recommendation queue the center of the page, surfaced target/reachability context, preserved technical diagnostics, and carried the **exact activity-ID** from methodology-card Evidence handoff when available. Its future priorities included stronger **transcript** classification and deeper **pivot** handling.

## Current information architecture

Primary navigation remains intentionally small:

- **Home** — resume the current context and see unresolved attention
- **Targets** — manage target scope and launch the single Nmap discovery/scan workflow
- **Evidence** — review terminal/tool output and structured imports
- **Next Steps** — prioritized, evidence-grounded work for the active context
- **Report** — proof readiness and reproducible reporting

The **More** menu contains Planned Work, Workspace Search, Methodology, Tool Library, Evidence Lineage, Engagement Map, Guide, and Workspace Data.

### Nmap remains single-owner

Targets owns Nmap. Scan output applies through the existing host/fact/context pipeline and can create or merge hosts, attach ports/services, establish conservative reachability facts, update active context, and recalculate Next Steps.

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
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, reachability relevance, execution-context relevance, and a bounded Orange decision-path signal.
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
- Per-context Kali/Windows operator execution state, command-side guidance, and activity execution provenance.
- Orange 2025.03 methodology coverage ledger with explicit implemented / partial / gap accounting.
- Tool-review records that compare Orange source tooling to Obol-preferred workflows.
- Audited explicit execution metadata for high-confidence Orange-mapped commands.
- Canonical, version-pinned Orange 2025.03 AD methodology snapshot with a stable 127-section completion denominator.
- Current-release coverage overlays that reconcile the immutable source snapshot without destroying historical baselines.
- Persistent Home/header visibility for the Orange AD fully implemented percentage and release delta.
- Live card-level Orange canonical provenance.
- Audited Active Directory Hashcat mode reference with external-module exceptions kept explicit.
- Per-context Orange decision-stage progress derived from recorded activity and reviewed facts.
- Orange-mapped Next Steps guidance that can boost an already-applicable card without manufacturing applicability or success.

## To-Do — for future agents

North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Create infrastructure to keep up with how much of the Orange Cyber Defense mind map and its decision path and tools has been fully implemented and how much remains to be implemented within Obol.
- Consider whether the tools from the Orange Cyber Defense mind map are actually the best, most user friendly tools and if they are not, add better tools to the path.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.
- Make sure the path considers whether a user is operating from Kali or from a Windows host on any given step of the path.
- Make sure that the data being integrated from the Orange Cyber Defense mind map is improving "Next Steps" and that as users complete each step they are being properly led down the mind map's decision path.

Completed or materially advanced in v4.4:

- Convert canonical Orange card provenance into an engagement-facing decision-stage model.
- Add per-context Orange progress derived from successful mapped activity and conservative fact floors.
- Feed Orange decision-stage context into Next Steps as a small positive ranking signal only.
- Keep applicability, evidence, reachability, information gain, workflow depth, pivot state, and the Kali/Windows execution model authoritative.
- Add an evidence-grounded canonical recommendation queue containing only live applicable Obol cards.
- Add current/next Orange decision-stage visibility to Next Steps and Home.
- Add decision-stage provenance to mapped methodology-card pages.
- Preserve the strict v4.3 42/39/46/0 coverage baseline rather than inflating project completion for guidance-only work.
- Preserve the Orange North Star and all README requirements exactly.

Next priorities:

- Continue working from `C.mindmapPriorityGaps42(LANES)` after all current methodology overlays have loaded rather than reconstructing Orange coverage manually.
- Expand SCCM beyond reconnaissance into credential recovery, relay, takeover, execution, cleanup, and post-exploitation branches.
- Expand domain persistence beyond Golden Ticket into Silver Ticket, DSRM, Skeleton Key, Custom SSP, Golden Certificate, Diamond/Sapphire tickets, DCShadow, and persistence-specific ACL lifecycle.
- Deepen trust abuse beyond enumeration and MSSQL linked-server paths.
- Address Windows low-access AppLocker bypass, UAC bypass, and Kerberos-relay branches.
- Deepen partial AD CS, relay, coercion, delegation, ACL, certificate-movement, and authenticated-enumeration sections until they can truthfully move to implemented.
- Expand Kerberos relay handling without treating generic NTLM relay coverage as equivalent.
- Add authenticated historical-vulnerability workflows only where they remain useful, current enough for training, and safe to present accurately.
- Expand Evidence normalization and full-session transcript fixtures for newly reconciled workflows as their command/output contracts mature.
- Replace more execution-side inference with explicit command metadata as methodology audits progress.
- Continue validating Rubeus and other fast-moving command contracts against current upstream releases when tool behavior changes.
- When Orange upstream changes, refresh the pinned manifest deliberately and review denominator changes instead of silently drifting.
- Continue exact activity-ID lineage, multi-hop target/chronology improvements, pivot troubleshooting depth, and proof-readiness templates where stronger evidence supports them.
- Keep the v4 information architecture simple. New functionality should not automatically become a new primary navigation destination.

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
node tests/run-v4.0-tests.js
node tests/run-v4.1-tests.js
node tests/run-v4.2-tests.js
node tests/run-v4.3-tests.js
node tests/run-v4.4-tests.js
```

The v3.4 suite locks the decision-first Next Steps redesign. The v3.5 suite covers field-observed Evidence classification, proof semantics, Report cleanup/export, Evidence normalization, and lineage repair. The v3.6 suite adds Rubeus workbench/state coverage, Kerberos command intent and conservative outcome inference, S4U integration, exact-command lineage, workflow handoffs, North Star retention, and inherited secret redaction. The v3.7 suite adds target-specific reachability, pivot freshness, consumer lineage repair, multi-hop compromise paths, artifact neighborhoods, and mixed full-session regression coverage. The v3.8 suite adds pivot operational history, listener-health ranking semantics, transition-aware compromise summaries, transition proof templates, and another mixed full-session fixture. The v3.9 suite adds broader Impacket/PEASS-ng/SQLmap activity intent, conservative explicit outcome proof, Evidence coverage summaries, and a mixed PEAS + SQLmap + Impacket full-session regression. The v4.0 suite adds per-context operator execution state, platform-aware Path signals, command-side guidance, historical execution provenance, and release wiring. The v4.1 suite adds the Orange methodology coverage ledger, tool-review accounting, explicit execution metadata auditing, and live card-reference validation. The v4.2 suite adds the version-pinned canonical Orange AD source inventory, stable completion denominator, snapshot-integrity validation, and persistent completion visibility. The v4.3 suite adds live canonical reconciliation, RBCD stale-mapping repair, audited AD Hashcat modes, release-delta accounting, and card-level Orange provenance. The v4.4 suite adds context-safe Orange decision-stage progress, Next Steps ranking signals, canonical recommendation queues, and engagement-facing decision-path UI.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.