# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.0

v3.0 is a usability-focused release. The underlying evidence, methodology, reachability, lineage, and reporting model from v2.9 remains intact, but the website shell is reorganized around the way an operator actually moves through a lab: choose a target, ingest evidence, decide what to do next, execute manually, and document the result.

### Workflow-first navigation

The previous header exposed a dozen destinations at the same visual level. v3.0 reduces the primary navigation to five clear workflow destinations:

- **Home** — resume the engagement and see what needs attention
- **Targets** — hosts, domains, ports, flags, and target metadata
- **Evidence** — Intake and evidence review
- **Next Steps** — evidence-ranked Path recommendations
- **Report** — proof readiness and report output

Advanced/reference destinations remain one click away in a **More** menu: Engagement Map, Methodology, Tool Library, Planned Work, Workspace Search, Evidence Lineage, Guide, and Workspace Data.

A compact workflow ribbon reinforces the mental model:

`Target → Evidence → Decide → Execute → Document`

### Home dashboard

A new Home view gives the site a useful landing page instead of dropping the operator into a feature view without context.

Home shows:

- the active working context
- a stage-aware **Continue** action
- target, evidence, planned-work, and report-readiness totals
- the strongest evidence-grounded next recommendation
- direct / pivot / observed network visibility
- broken pivot count
- recent recorded activity
- quick links to common tasks

The suggested resume action is conservative and state-driven. For example, a new workspace points to target setup, a scoped target with no evidence points to Intake, incomplete proof obligations point to Report, and queued work points back to Planned Work.

### Clearer terminology and page guidance

The website now uses more immediately understandable labels in the shell:

- Boxes → **Targets**
- Intake → **Evidence Intake**
- Path → **Next Steps**
- Queue → **Planned Work**
- Lanes → **Methodology**
- Data → **Workspace Data**

Each major page gets a short **What this is for** explanation. This keeps Obol's specialized concepts without requiring a new user to decode the vocabulary before using the site.

### Faster navigation

v3.0 adds a global quick navigation/search palette available from the header or with **Ctrl/Cmd+K**.

The palette can:

- jump directly to any Obol section
- search the active context using the existing workspace search index
- open matching facts, artifacts, activities, cards, and commands

### Context and sidebar usability

The active working context is now visible in the header at all times. Clicking it opens the parameters/facts panel.

The left parameter/fact sidebar can be collapsed on desktop to give dense methodology and command cards more room. On smaller screens it becomes an off-canvas panel instead of permanently consuming horizontal space.

### Responsive and accessibility improvements

- five-item bottom navigation on smaller screens
- larger, clearer touch targets
- keyboard-visible focus states
- skip-to-workspace link
- improved main-content width and spacing for readability
- responsive Home metrics, workflow ribbon, activity list, and quick actions
- preserved print behavior for reports

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

Completed or materially advanced in v3.0:

- Reduce top-level navigation overload and group the site around the operator workflow.
- Add a real landing/resume dashboard.
- Keep the active working context visible globally.
- Make the parameters/facts sidebar collapsible and mobile-friendly.
- Add global quick navigation/search and keyboard access.
- Add page-level explanatory guidance and clearer user-facing terminology.
- Improve responsive navigation, focus visibility, and basic accessibility.

Next priorities:

- Continue the switch-coverage audit for long-tail tools, but only add controls that materially change operator intent or scope.
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
```

The v3.0 suite covers release-state initialization, the simplified navigation model, stage-aware Home guidance, context-scoped workspace overview counts, v3 shell wiring, and inherited sanitized-export redaction. GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
