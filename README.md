# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.2

v3.2 is a usability correction to the v3.0/v3.1 site redesign. v3.1 correctly promoted Nmap earlier in the workflow, but the interface then repeated the same concept too aggressively: Home contained a Nmap launchpad, Discover contained another Nmap launchpad, Evidence carried a dedicated Nmap bridge, and the workflow ribbon repeated navigation that already existed in the header.

v3.2 applies a **single-owner rule** to the interface: each major workflow has one obvious primary surface, while related pages consume the resulting state without advertising the same tool again.

The result is less tool-centric, less repetitive, and closer to how Obol is actually used during a lab.

### Primary navigation

The five primary destinations are now:

- **Home** — resume the current context and see only what needs attention
- **Targets** — manage host scope and launch discovery or baseline scanning when needed
- **Evidence** — review general tool output and structured evidence
- **Next Steps** — evidence-ranked methodology recommendations
- **Report** — proof readiness and reproducible reporting

The v3.1 label **Discover** returns to **Targets** because the page represents a persistent object in the workspace, not a single tool or action. Discovery remains an action available from Targets.

The **More** menu is reordered around frequency of use:

1. Planned Work
2. Workspace Search
3. Methodology
4. Tool Library
5. Evidence Lineage
6. Engagement Map
7. Guide
8. Workspace Data

This ordering is also inherited by the global Ctrl/Cmd+K navigation palette.

### Nmap has one primary home

Nmap remains first-class, but it is no longer repeated across the site.

**Targets owns the Nmap workflow.** A single **Scan / discover** action opens a focused modal that can:

- choose host discovery, quick TCP, full TCP, service/script, or common UDP profiles
- target an authorized IP, CIDR, or range
- control output basename, ports, timing, minimum rate, retries, reasons, service detection, default scripts, OS detection, and DNS resolution
- generate a copyable operator-run Nmap command
- accept pasted normal, grepable, XML, or host-discovery output
- apply the result through Obol's existing host/fact/context pipeline

The v3.1 `-sn` parser improvement is retained, so live hosts can still be created without open-port rows.

Home no longer embeds the Nmap builder. Evidence no longer displays a dedicated Nmap callout. General Evidence Intake still supports Nmap output through its normal source detection because Nmap remains valid evidence; it simply is not promoted as a second competing workflow.

### Targets is an inventory first

The Targets page now emphasizes the objects the operator is actually working on.

- the full inline Nmap launchpad is removed from the page
- a compact **Scan / discover** button opens the Nmap workflow only when needed
- the page shows target and scanned-target counts without turning scan status into a separate dashboard
- each target exposes a contextual **Scan** or **Rescan** action with the target IP prefilled
- scanned vs unscanned status remains visible on the card
- Name, Hostname, Domain, OS, and Notes editing is collapsed under **Edit target details** so host cards remain readable during normal use
- ports and key identity remain visible without opening the editor
- empty workspaces get a simple target-oriented empty state instead of a wall of scan controls

All existing host/context semantics remain intact. Moving controls into a collapsible section does not change their event handling or storage.

### Evidence owns evidence imports

Evidence Intake is restored to a general-purpose evidence surface.

- the v3.1 Nmap bridge banner is removed
- the paste placeholder is generic rather than enumerating one preferred tool
- **Analyze** becomes **Review evidence** to match the review-first semantics
- the source selector is labeled explicitly
- BloodHound import moves from Targets to Evidence, where structured graph data fits the information architecture better
- the artifact section is labeled **Extracted artifacts**

Nmap, NetExec, LDAP, terminal transcripts, and other supported text remain available through the existing intake parser. BloodHound continues to use the existing local parsing and evidence-update pipeline.

### Home becomes a resume dashboard, not a second tool shelf

v3.2 removes several layers of duplicated guidance from Home:

- no embedded Nmap launchpad
- no workflow ribbon duplicating the primary navigation
- no second working-context card when the active context is already visible in the header
- no separate **Suggested next move** card duplicating the stage-aware Continue action
- no large Quick Actions grid duplicating header navigation and the More menu

Home now concentrates on four things:

1. the stage-aware **Continue** action
2. compact workspace metrics
3. an **Attention** panel that appears only for unresolved items such as unscanned targets, broken network paths, proof gaps, or planned work
4. recent recorded activity

This makes the first screen useful both at the beginning of a lab and after several hours of accumulated state.

### Navigation and visual hierarchy cleanup

v3.2 removes UI elements that had started competing with each other:

- repeated workflow ribbons are suppressed because the primary navigation already expresses the site structure
- the release banner is removed from the persistent workspace shell
- the old tried/succeeded progress pill is removed from the header; progress remains available in workspace state and reporting
- page guidance becomes a quiet one-line introduction instead of a second highlighted navigation layer
- the context sidebar is labeled **Context details** with a simpler **Parameters** heading
- the main reading width is reduced so cards do not stretch unnecessarily on wide monitors
- non-interactive cards no longer receive strong hover emphasis
- target editing, scan controls, and evidence actions use clearer visual grouping
- mobile behavior, keyboard focus visibility, skip navigation, the context drawer, Ctrl/Cmd+K search, and report print behavior remain intact

The v3.1 dark green/gold aesthetic is retained, but visual emphasis is reserved for things the operator can actually act on.

### Connected behavior retained

v3.2 intentionally changes information architecture without cutting the underlying graph of functionality.

- Nmap results still create/merge hosts and attach service evidence.
- Nmap results still establish conservative reachability facts and initial-scan state.
- Scan evidence still recalculates Next Steps immediately.
- Host discovery without open ports remains supported.
- Target context still scopes facts, activities, artifacts, progress, and reports.
- BloodHound still feeds the same evidence-update model, now from the Evidence page.
- Existing browser-local v2/v3 workspaces coerce forward automatically.
- Existing routes remain valid, including `#/boxes` and `#/intake`.
- Advanced/reference sections remain available under More and through quick navigation/search.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Next Steps with information gain, downstream unlocks, workflow depth, coverage gaps, and explicit reachability relevance.
- Persistent operator Planned Work with priority, notes, done/deferred state, and report history.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- First-class typed artifacts and direct evidence-to-command handoffs.
- Producer/consumer artifact lineage with context-safe deduplication and cross-artifact dependency chains.
- Review-first typed-artifact and network-observation intake gates.
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- AD methodology decision map and MachineAccountQuota/RBCD readiness coverage.
- ANSI/prompt/terminal normalization and mixed-command transcript segmentation.
- Post-foothold interface, route, subnet, host, and service visibility modeling.
- Explicit direct/pivot reachability plus active/inactive/broken pivot lifecycle state.
- Finding/transition-specific report proof obligations.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Browser-local state and sanitized workspace export.

### To-Do - For Agents

Completed or materially advanced in v3.2:

- Remove duplicate Nmap surfaces from Home and Evidence while preserving all Nmap functionality.
- Return the primary page label from Discover to Targets and make discovery an action rather than an information-architecture category.
- Replace the permanently expanded Nmap launchpad with one focused Targets modal.
- Add per-target Scan/Rescan actions that prefill target context.
- Collapse rarely edited target metadata without breaking existing bindings.
- Move BloodHound import from Targets to Evidence.
- Simplify Home around Continue, metrics, unresolved attention, and recent activity.
- Remove repeated workflow ribbons, persistent release messaging, and redundant header progress UI.
- Reorder More and quick navigation around likely operator frequency.
- Reduce visual weight on explanatory and non-interactive surfaces.

Next priorities:

- Test v3.2 against real lab sessions before adding any new primary navigation concepts.
- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
- Refine multi-pass Nmap progression inside the single Targets scan workflow rather than creating new Nmap surfaces.
- Expand Intake normalization and extraction for more BloodHound, Certipy, NetExec module, Impacket, PEAS, web-fuzzer, database-client, and shell edge cases.
- Grow the transcript fixture corpus across Linux, Windows, AD, web, database, and pivoting sessions, including malformed/partial output.
- Improve lineage beyond card-level dependency inference by linking consumers to exact activity IDs when that evidence exists.
- Add richer graph navigation for multi-hop artifact chains and compromise-path review.
- Make reachability relevance more target-specific when multiple internal subnets/services exist in one engagement context.
- Continue pivot-state depth around source-interface identity, listener health notes, and route-specific troubleshooting history.
- Continue methodology depth around credential reuse, AD trusts, delegation, certificate paths, service-specific enumeration, and post-foothold evidence requirements.
- Expand proof-readiness templates for finding categories while keeping all screenshot-content checks operator-confirmed.
- Continue improving direct artifact bindings for commands whose option semantics cannot be inferred safely from labels/placeholders alone.

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
```

The v3.2 suite covers release-state initialization, entity-first primary navigation, More-menu ordering, target-oriented Home guidance, unscanned-target attention, preservation of the v3.1 Nmap builder/parser, single-owner UI wiring, v3.2 CSS/index order, and inherited sanitized-export redaction. GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.