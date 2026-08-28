# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, evidence reviewer, planning workspace, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. The live site is served at `https://platocres.github.io/obol/`.

It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. Engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, creates pivots, scans targets, or exploits systems. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v3.5

v3.5 is a field-tested Evidence and reporting release built from a real v3.4 workspace rather than a synthetic UI review. The initial Targets → Nmap → Evidence → Next Steps loop was working well, but live use exposed three connected problems: a stale v2.5 implementation note leaking into Evidence, terminal activity classification assigning an LDAP enumeration command to the wrong methodology card, and a Report page that stacked several generations of readiness UI while implying screenshot capabilities Obol does not actually have.

v3.5 fixes those problems at the state, parser, lineage, reporting, and presentation layers instead of only reskinning them.

### Evidence stays focused on evidence

The inherited **“v2.5 normalization”** callout is removed from the active Evidence UI. ANSI/prompt/terminal normalization still happens in the intake pipeline; the implementation detail simply no longer occupies permanent page space.

The current Evidence page remains centered on:

- source selection
- terminal/tool output review
- explicit fact/artifact/activity proposals
- operator approval before state changes
- structured imports such as BloodHound

Normalization remains functional and testable without being advertised as a historical release note.

### Terminal activity classification follows command intent

A real v3.4 workspace showed this command being recorded as **Identify the Domain Controller and Domain** even though it came from **Anonymous LDAP Enumeration**:

```bash
nxc ldap 10.129.95.210 -u '' -p '' --users --users-export "users.txt"
```

v3.5 adds a command-intent correction layer for overloaded tools. High-confidence selectors now disambiguate the methodology action before activity is recorded. The first pass covers the ambiguous families that matter most in current workflows, including:

- NetExec LDAP enumeration, AS-REP roasting, Kerberoasting, BloodHound collection, and LAPS
- NetExec SMB relay-list generation, secrets dumping, remote execution, and RID enumeration
- BloodHound Python collection
- Certipy find/request/auth flows

For Anonymous LDAP Enumeration specifically, successful output can now attach the activity outcomes that the evidence actually proves, including anonymous bind and user-list establishment. This prevents the report ledger from saying a command “succeeded but no explicit outcome facts were selected” when the reviewed output already proved those outcomes.

The generic v2.1 terminal matcher remains as the fallback. v3.5 only overrides it when command intent is specific enough to be safer than the generic best-match score.

### Report becomes one coherent workspace

The old Report page had accumulated multiple overlapping systems: report-quality warnings, per-target readiness, finding proof readiness, mode controls, and a raw Markdown preview. v3.5 replaces the active page with one report workspace driven by the same historical activities, evidence, lineage, and proof state.

The page now has:

- one workspace-level proof-readiness summary
- one successful-activity proof list instead of three competing readiness panels
- Standard and OSCP draft modes with an explanation of what the mode changes
- secrets-off-by-default export behavior
- a rendered report preview plus exact Markdown-source view
- direct Markdown download
- a first-class **Export PDF** action using the browser print/PDF flow
- a report-focused print stylesheet so the PDF contains the rendered report rather than the surrounding application chrome

### Screenshot semantics are explicit

Obol still does not take screenshots, store image files, or inspect screenshot contents.

v3.5 changes screenshot readiness from a generic requirement on every success to a transition-aware external-proof requirement. A screenshot checkbox appears only when the recorded activity represents a material foothold, privilege, or objective transition that genuinely needs operator-confirmed proof.

The UI labels this **Proof screenshot recorded externally** and explains exactly what it means.

Routine enumeration evidence with a preserved command and evidence snapshot no longer fails readiness just because an unrelated screenshot checkbox was never checked.

### Report preview is useful before export

The report generator still produces Markdown as the portable source format, but v3.5 adds a local renderer for the structures Obol emits: headings, paragraphs, tables, lists, blockquotes, inline code, code blocks, and separators.

That rendered document is the PDF print surface. The Markdown source remains one click away for exact review or editing in another tool.

The report-generator footer and proof wording are also normalized to the current Obol release rather than leaking old v2.1 text into v3.x exports.

### Exact lineage repair for older intake paths

v3.4 began attaching exact activity IDs when evidence was distilled directly from a methodology card. The field-tested workspace showed another gap: network-derived typed artifacts created during terminal intake could be timestamp-adjacent to the activity they came from while still carrying an empty activity ID.

v3.5 adds a conservative repair pass. A legacy intake/network producer receives an exact activity ID only when:

- producer and activity share the same context
- their timestamps are within five seconds
- exactly one activity satisfies that correlation window

Ambiguous cases remain untouched. This advances exact lineage without replacing uncertainty with a guess.

### Next Steps remains decision-first

The v3.4 Next Steps redesign remains intact. The live LDAP test successfully unlocked AS-REP Roasting, password-spray and wordlist work, demonstrating that the Evidence → ranked recommendation loop is functioning as intended.

v3.5 does not loosen or rewrite the ranking model merely because the surrounding workflow was improved. Target-specific reachability scoring across more complex multi-host/internal-network contexts remains a separate future priority.

## Obol v3.4

v3.4 is a planning and information-hierarchy release centered on **Next Steps**.

The underlying Path engine has accumulated useful intelligence since v2.1: information gain, downstream unlocks, methodology coverage, credential campaigns, workflow depth, internal-network observations, explicit reachability, pivot lifecycle, and reachability-aware ranking. The problem was presentation. The page stacked nearly every supporting model above the actual recommendation list, then rendered the recommendations as visually weak legacy cards with rank circles and long “why now” strings.

That made the most important page feel like a diagnostic dump instead of a working queue.

v3.4 changes the hierarchy without changing the human-run model or discarding the underlying intelligence.

### Decision-first Next Steps

The page now starts with one obvious **Best next move**.

That recommendation shows:

- the recommendation title
- active host/domain context
- service context when known
- the evidence-grounded reason it is ranked highly
- compact signals for newly unlocked work, information gain, downstream unlocks, prior attempts, planning state, and reachability influence
- a direct action to open the methodology card
- a direct action to add it to Planned Work

The operator no longer has to scroll past coverage charts, workflow maps, network models, pivot controls, hypothesis lists, and credential campaigns before seeing what Obol actually recommends.

### Recommendation queue

The remaining recommendations use a dedicated planner layout rather than the legacy collapsed-card presentation.

Each row now has:

- a stable priority number
- methodology area
- title
- active target context
- tried/untried state
- concise reason for the ranking
- structured ranking signals
- reachability explanation when it materially affected the score
- Open and Plan actions

The planner supports lightweight filtering by methodology area and state:

- all states
- untried only
- tried before
- planned only

The existing **show all applicable** behavior remains available as the clearer **Include broader applicable techniques** control.

Filters only change presentation. They do not mutate evidence, ranking inputs, activity history, or the ledger.

### Decision context instead of dashboard sprawl

Supporting intelligence is still available, but it no longer competes with the recommendation queue.

A compact **Decision context** panel summarizes:

- relevant methodology coverage
- fact and typed-artifact counts
- direct and pivot reachability
- broken and active-unverified paths
- open hypotheses
- credential-validation gaps
- Planned Work count
- the latest evidence update when it belongs to the active context

The detailed legacy panels remain intact under **Technical context & controls**:

- methodology coverage
- service/workflow depth
- AD decision map
- internal network visibility
- reachability and pivot lifecycle
- reachability-aware Path signals
- credential validation campaigns
- open hypotheses
- latest-evidence delta

This keeps the powerful diagnostic controls without letting them bury the work queue.

### Target and reachability context is visible per recommendation

v3.4 makes the active scope explicit on each recommendation. When a recommendation has service-specific reachability influence, the UI surfaces that influence directly rather than requiring the operator to infer it from a separate reachability panel.

This materially advances the README priority around target-specific reachability presentation while preserving the conservative rule from v2.8/v2.9: observed-only internal targets do not become reachable by inference, and only explicit active paths can produce reachability boosts.

The ranking algorithm itself remains conservative and unchanged in this release.

### Exact activity-ID lineage handoff

v2.7 already supported an `activityId` in artifact producer lineage, but card-to-Evidence handoff did not consistently populate it.

v3.4 now uses the exact latest activity ID when card evidence is sent into Evidence Intake. Typed artifacts distilled from that handoff can therefore retain an exact activity relationship when one exists, instead of relying only on card/context inference.

Card-level fallback behavior remains for older workspace data and evidence that genuinely has no activity ID.

This advances the README lineage priority without breaking existing workspaces.

### Version consistency

Current-version presentation is now treated as release state rather than a one-off string.

v3.4 updates:

- document title
- header tagline
- Home workspace label
- Guide current-version copy
- Workspace Data current-version copy
- report download filenames
- full/sanitized workspace export filenames
- static index wiring

The v3.4 shell overrides the stale v3.2 Home label from the inherited overlay and derives the visible workspace version from the current core version.

Historical release cards and historical regression layers keep their original version names when they are describing that historical layer.

### Workflow terminology cleanup

The active methodology still contained a few stale navigation references from the pre-v3 information architecture, such as **Boxes → Ingest nmap scan** and **Boxes → Ingest BloodHound**.

v3.4 rewrites those active user-facing references to the current owners:

- Nmap discovery/scanning → **Targets → Scan / discover**
- BloodHound import → **Evidence → Import BloodHound**

This is a copy overlay only. The underlying cards and commands remain the same.

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

Tool Library families continue to be classified as reusable contracts, dedicated builders, card-specific, or reviewed card-specific.

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
- Offline script library with filtering, contextual guidance, builders, and one-click copy.
- AD methodology decision map and MachineAccountQuota/RBCD readiness coverage.
- ANSI/prompt/terminal normalization and mixed-command transcript segmentation.
- Post-foothold interface, route, subnet, host, and service visibility modeling.
- Explicit direct/pivot reachability plus active/inactive/broken pivot lifecycle state.
- Finding/transition-specific report proof obligations.
- Strong negative-evidence semantics for tool failure, inconclusive results, service rejection, and true refutation.
- Browser-local state and sanitized workspace export.

## To-Do — for future agents
North Star:
- This project is modeling its design off of the Orange Cyber Defense mind map: https://orange-cyberdefense.github.io/ocd-mindmaps/img/mindmap_ad_dark_classic_2025.03.excalidraw.svg
- Never remove this section from the readme, and never update the link to the Orange Cyber Defense mind map or this north star section.
- Always be checking the mind map and how it compares to where the project is at.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds and improve upon it.

Completed or materially advanced in v3.5:

- Remove stale release-layer implementation callouts from the active Evidence experience while retaining normalization behavior.
- Correct terminal activity classification for high-confidence overloaded-tool command intent, including the real Anonymous LDAP user-enumeration workflow observed during v3.4 testing.
- Repair proven Anonymous LDAP activity outcomes so reporting and history agree with reviewed evidence.
- Replace stacked Report readiness generations with one activity-grounded proof model.
- Make screenshot readiness explicitly external and transition-aware instead of a blanket requirement on enumeration success.
- Add rendered report preview and report-focused browser PDF export while keeping Markdown as the portable source format.
- Repair exact activity-ID lineage for uniquely correlated legacy network/intake producers.
- Keep the v3.4 decision-first Next Steps layout and ranking semantics intact while improving the workflow around it.

Next priorities:

- AS-REP Roasting mentions Rubeus for windows but has no interface for the user. This needs to be fixed, and Rubeus as a tool needs all of the toggles relevant to crafting commands for that tool.
- Make sure the Orange Defense Mindmap for 2025 is being fully implemented, gather data from it for use in this and future builds.
- Continue validating command contracts against current upstream CLI help when tool versions change.
- Expand Evidence normalization/extraction and activity-intent fixtures for more NetExec, Certipy, Impacket, PEAS, web-fuzzer, database-client, and shell output edge cases, including malformed and partial transcripts.
- Grow full-session regression fixtures across Linux, Windows, AD, web, database, and pivoting workflows so classification and outcome inference are tested as complete operator sessions rather than isolated strings.
- Continue exact activity-ID lineage through producer/consumer paths that cannot yet be correlated conservatively.
- Add richer multi-hop artifact and compromise-path navigation.
- Make reachability ranking itself more target-specific when multiple internal subnets, hosts, and same-service observations coexist in one engagement context.
- Continue pivot-state depth around source-interface identity, listener health notes, route-specific troubleshooting history, and verification freshness.
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
```

The v3.4 suite continues to lock the decision-first Next Steps redesign. The v3.5 suite adds current-version coercion, field-observed LDAP activity classification, activity outcome repair, transition-aware report proof requirements, exact lineage repair, Evidence cleanup, rendered/PDF Report wiring, current-version presentation, and inherited sanitized-export redaction.

GitHub Actions runs the complete regression chain on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
