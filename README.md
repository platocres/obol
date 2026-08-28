# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.1

v3.1 is a website usability and workflow release built on the v3.0 information architecture. The main correction is simple: Nmap is not merely another evidence source after a target already exists. It is often how the operator discovers the hosts and services that define the target set in the first place.

The release therefore moves Nmap into the beginning of the workflow, connects discovery output directly to host/context creation, and gives the site a more deliberate visual hierarchy without changing Obol's human-run execution model.

### Discovery-first workflow

The five primary destinations remain intentionally compact, but the second destination is now **Discover** instead of **Targets**:

- **Home** — resume the engagement and start discovery quickly
- **Discover** — build Nmap discovery/scan commands, ingest results, and manage known targets
- **Evidence** — review general pasted tool output and preserved artifacts
- **Next Steps** — evidence-ranked methodology recommendations
- **Report** — proof readiness and report output

Reference and advanced sections remain under **More**: Engagement Map, Methodology, Tool Library, Planned Work, Workspace Search, Evidence Lineage, Guide, and Workspace Data.

The workflow ribbon now expresses the real early-lab sequence more clearly:

`Discover → Evidence → Decide → Execute → Document`

### First-class Nmap launchpad

Home and Discover now expose the same connected Nmap workflow rather than hiding Nmap behind a secondary target-management button.

The launchpad can build operator-run commands for:

- host discovery
- quick TCP scanning
- full TCP scanning
- service/version plus default-script scanning
- common UDP scanning

The builder supports meaningful scan controls including:

- authorized IP / CIDR / range target specification
- output basename using `-oA`
- optional custom port scope
- timing profile
- minimum packet rate
- retry limit
- port-state reasons
- service version detection
- default scripts
- OS detection
- optional DNS resolution

The generated command is copyable, but Obol still never executes it.

### Discovery output creates real Obol targets

The Nmap launchpad is connected to the existing evidence pipeline. After the operator runs the command, pasted Nmap output is parsed and applied through the same host/fact/context model that powers Path and reporting.

This means scan ingestion can:

- create newly discovered hosts
- preserve hostnames when present
- attach open ports and service information to the correct host
- establish conservative service-reachability facts
- carry domain/OS enrichment forward when Nmap exposes it
- mark the host as having initial scan evidence
- make the first discovered host the active working context
- immediately affect evidence-ranked Next Steps

Known target cards now show whether each target has baseline scan evidence.

### Nmap host discovery no longer requires open ports

Earlier parser behavior favored service scans: a host generally needed at least one open-port row before it became a parsed host.

v3.1 extends the Nmap layer so live hosts from `-sn`/host-discovery output are retained even when no port rows exist. Normal, grepable, and XML discovery output can therefore establish host context before service enumeration begins.

This is important to the website flow because Discover can now genuinely be the first step instead of pretending the operator already knows every host.

### Smarter Home resume behavior

The Home dashboard now understands discovery state:

- an empty workspace points to **Run host discovery**
- a manually added host with no evidence points to **Scan this target**
- scanned/evidence-rich contexts continue into the existing Path, queue, and reporting logic

The Home view also exposes a compact Nmap launchpad directly below the resume action, so a new engagement can begin without navigating through several conceptual layers first.

### Evidence remains general-purpose

Nmap is promoted earlier, but **Evidence Intake** remains the place for general tool output and continues to support Nmap pastes as well.

Evidence Intake now includes a visible bridge back to Discover so the relationship is clear:

- Discover is where host/network discovery starts
- Evidence is where arbitrary tool output is reviewed and distilled

The underlying review-first evidence semantics are unchanged.

### Visual and interaction refinement

v3.1 also makes the website feel more intentional without treating styling as an isolated skin pass.

The new visual hierarchy follows functional importance:

- discovery gets a prominent launchpad with generated-command and paste-result sections
- known targets are visually separated from discovery controls
- scanned vs unscanned target state is visible on target cards
- generated commands use a dedicated high-contrast surface
- scan controls collapse naturally on smaller screens
- Home/Discover cards use stronger depth, spacing, and state emphasis
- the existing green/gold Obol palette is retained but used more deliberately
- responsive layouts preserve the discovery workflow on narrow screens

The v3.0 accessibility improvements remain in place: keyboard focus visibility, skip navigation, mobile bottom navigation, collapsible/off-canvas parameters, and report print behavior.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Path with information gain, downstream unlocks, workflow depth, coverage gaps, and explicit reachability relevance.
- Persistent operator Queue with priority, notes, done/deferred state, and report history.
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

Completed or materially advanced in v3.1:

- Move Nmap to the beginning of the user workflow instead of treating it only as later evidence intake.
- Add an integrated Nmap launchpad to Home and Discover.
- Connect Nmap command generation, pasted output, host creation, port/service evidence, context selection, and Path recalculation.
- Retain live hosts from host-discovery scans even when no port rows exist.
- Add scan-aware Home resume guidance and scanned/unscanned target state.
- Clarify the relationship between Discover and general Evidence Intake.
- Improve visual hierarchy, spacing, command surfaces, responsive scan controls, and target-state presentation.

Next priorities:

- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
- Continue refining the Nmap launchpad around multi-pass scan progression and target-specific follow-up without duplicating methodology cards.
- Add specialized builders for remaining multi-step scripts where real runtime choices exist.
- Expand Intake normalization and extraction for more BloodHound, Certipy, NetExec module, Impacket, PEAS, web-fuzzer, database-client, and shell edge cases.
- Grow the transcript fixture corpus across Linux, Windows, AD, web, database, and pivoting sessions, including malformed/partial output.
- Improve lineage beyond card-level dependency inference by linking consumers to exact activity IDs when that evidence exists.
- Add richer graph navigation for multi-hop artifact chains and compromise-path review.
- Make reachability relevance more target-specific when multiple internal subnets/services exist in one engagement context.
- Continue pivot-state depth around source-interface identity, listener health notes, and route-specific troubleshooting history.
- Continue methodology depth around credential reuse, AD trusts, delegation, certificate paths, service-specific enumeration, and post-foothold evidence requirements.
- Expand proof-readiness templates for finding categories while keeping all screenshot-content checks operator-confirmed.
- Continue improving direct artifact bindings for commands whose option semantics cannot be inferred safely from labels/placeholders alone.
- Keep the v3 information architecture simple as features grow; new features should not automatically become new primary navigation items.

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
```

The v3.1 suite covers release-state initialization, discovery-first navigation, scan-aware resume logic, Nmap command profiles, port-scope overrides, `-sn` host retention, preservation of service-scan parsing, v3.1 Home/Discover wiring, index order, and inherited sanitized-export redaction. GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.