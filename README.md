# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion and operations ledger for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands or exploits on your behalf. It helps organize evidence, recommend context-relevant next steps, preserve command/evidence history, and assemble reporting from what the operator actually did.

## Obol v2.0

v2 introduces a scoped evidence and activity model rather than treating the engagement as one global bag of facts.

- **Host/domain scoped state** — ports, services, facts, attempts, successes, and evidence stay attached to the target or domain where they were observed.
- **Evidence-ranked Path** — newly unlocked cards, service matches, current engagement phase, and prior attempts affect ranking. Finding severity does not dominate the working queue.
- **Unified evidence pipeline** — Intake, nmap ingest, and BloodHound/PlumHound ingest all recalculate newly applicable techniques through the same state engine.
- **Review-first Intake** — proposed facts and parameters remain visible for review before application. Already-established values render as applied state instead of disabled-looking controls.
- **Explicit outcomes** — when a card can establish several facts, the operator chooses which outcomes the evidence actually proves.
- **Historical activity ledger** — tried/succeeded progress is based on explicit activity records. Commands and evidence are snapshotted at the time of the action.
- **Report v2** — reports use those historical snapshots instead of reconstructing steps from current sidebar state. Secrets are redacted by default.
- **v1 migration** — an existing `obol-state-v1` workspace is migrated automatically into schema v2 on first load.
- **Sanitized exports** — Data view can export a redacted workspace for sharing without credential/hash material.
- **Conservative nmap facts** — parser distinguishes reachability evidence from stronger conclusions (for example, open TCP/2049 means `nfs.reachable`, not that NFS exports are confirmed).
- **Improved PlumHound CSV parsing** — RFC4180-aware CSV handling preserves quoted commas while extending the existing BloodHound JSON/ZIP workflow.

The existing 171-card methodology catalog, command option/preset system, wordlists, report metadata, universal signatures, and offline references remain available.

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

This repository is designed to serve directly from the repository root. Configure GitHub Pages to deploy from the `main` branch and `/ (root)`.

## Regression tests

The v2 state/parser/report regression suite lives at `tests/run-tests.js` and can be run with Node:

```bash
node tests/run-tests.js
```

The suite covers host-scoped fact isolation, negative prerequisites, newly-applicable calculation, explicit activity outcomes, v1 migration, sanitized exports, historical reporting/redaction, conservative NFS inference, stable option IDs, and RFC4180 CSV parsing.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
