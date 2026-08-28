# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, command-building assistant, and report-writing aid for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands, installs tools, or exploits targets. It helps the operator decide what to try, build the command, preserve what happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.4

The direction from v2.0 through v2.3 has been consistent: move Obol from a catalog of offensive commands toward an evidence-aware operator workspace. v2.0 introduced scoped state and historical evidence, v2.1 added methodology intelligence and report readiness, v2.2 separated maneuvers from tool implementations and deepened command building, and v2.3 improved evidence distillation and artifact handoffs.

v2.4 closes another gap in that loop: **Path can tell you what is strongest now, but the operator also needs a durable place to decide what they actually intend to work next.**

### Persistent operator Queue

- Adds a first-class **Queue** between Path and Report.
- Path remains algorithmic and dynamic; Queue preserves human intent even when new evidence changes rankings.
- Add any expanded technique card to Queue with one click.
- Queue entries are scoped to the active host/domain so work does not bleed across targets.
- Each item has high/normal/low priority plus an operator note for the hypothesis, reason, or expected signal.
- Queue can mark work planned, done, or deferred.
- A successful activity automatically completes matching planned queue work for the same context.
- Queue also surfaces the current highest-ranked evidence-grounded Path actions that are not already planned.

### Evidence → artifact → command handoffs

v2.3 introduced a clean user-list handoff. v2.4 extends the same workflow to hashes:

- Distilled users can be downloaded as `users.txt` and assigned to the shared `userlist` parameter.
- Distilled hashes can now be downloaded as `hashes.txt` and assigned to the shared `hashfile` parameter.
- Command builders can immediately consume those shared paths without manually re-entering them.

### Reporting the human decision trail

Obol already distinguishes successful material state transitions from routine activity. v2.4 now also preserves the operator planning trail:

- Reports include an **Operator Work Queue** section when queue history exists.
- Completed and deferred work can retain the operator note that explains why it mattered.
- This remains separate from the successful compromise chain so planned or abandoned ideas are not misrepresented as wins.

### Foundations retained

- Host/domain-scoped facts, evidence, activity, credentials, and progress.
- Supported/refuted/inconclusive knowledge semantics.
- Evidence-ranked Path with information gain, downstream unlocks, workflow depth, and coverage gaps.
- Maneuver-first methodology with preferred tools and practical fallbacks.
- Kali-aware install/verification help without executing anything.
- Semantic command builders with grouped controls, presets, and optional advanced switches.
- Nmap host/OS/domain enrichment and LDAP/NetExec username distillation.
- Offline script library with filtering and contextual guidance.
- Compromise-chain reporting, secret redaction, OSCP mode, and evidence/screenshot readiness.
- Browser-local state and sanitized workspace export.

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
```

The v2.4 suite covers current release-state migration, context-scoped queue behavior, duplicate planning updates, automatic queue completion on recorded success, defer/reopen behavior, and report inclusion of the operator decision trail. GitHub Actions runs all regression suites on `main`, release branches, and pull requests.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.