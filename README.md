# Obol — Offensive Box Operations Ledger

Obol is a static, offline-capable study companion, methodology ledger, and report-writing assistant for OSCP-style labs, Active Directory practice, and CTFs. It is plain HTML/CSS/JavaScript with no backend, no build step, and no telemetry. All engagement state stays in the browser unless you explicitly export it.

**Human-run commands only.** Obol never executes commands or exploits. It helps the operator decide what to try, preserve what actually happened, understand what remains unknown, and turn the historical ledger into a reproducible report draft.

## Obol v2.1

v2.1 builds on the scoped v2 state model and makes the methodology, Intake, next-step engine, and reporting significantly more evidence-aware.

### Terminal-aware Intake

- Paste whole Kali/bash, PowerShell, or cmd sessions rather than only isolated tool output.
- Obol recognizes commands by comparing them with the actual command templates in the methodology cards.
- Recognized execution is proposed as **tried**.
- A card is only proposed as **succeeded** when the output contains a strong card-specific or generic success signal.
- Every inferred progress change is reviewable before it is applied.
- Re-pasting the same terminal action is fingerprinted so it is not imported twice.
- Terminal evidence can also derive high-confidence facts such as root/SYSTEM identity, SMB shares, NFS exports, administrative credential validation, and foothold state.
- Quick observations let the operator record supported, refuted, or inconclusive state when evidence comes from screenshots or visual inspection rather than parseable text.

### Methodology graph and next-step intelligence

- Cards are treated as hypotheses/tests in a graph: prerequisites support a test, outcomes create state, and those outcomes can unlock downstream cards.
- Path ranking now incorporates evidence relevance, information gain, downstream unlock potential, current phase, relevant-coverage gaps, newly unlocked techniques, and penalties for repeated unsuccessful attempts.
- Open hypotheses show what remains testable, already tested, weakened, or blocked.
- Relevant methodology coverage is context-sensitive. Techniques for services that are not present do not count against the target.
- The **I'm Stuck** audit looks for shallow lanes, untested credentials, repeated dead ends, contradictory evidence, missing privilege-escalation baselines, and the highest-information untried steps.
- Credentials are first-class objects with per-service validation campaigns across reachable SMB, WinRM, RDP, SSH, LDAP, Kerberos, database, and other services.

### Better state semantics

- Positive facts remain scoped to the host/domain where they were established.
- A separate knowledge ledger can preserve **supported**, **refuted**, **inconclusive**, and **unknown** observations instead of flattening every result into a boolean.
- Contradictory observations are preserved rather than silently overwriting history.
- Activity records preserve whether a result was operator-entered or inferred from Intake, plus confidence, reason, exact command snapshot, and evidence excerpt.

### Report v2.1

Reporting remains a first-class goal of Obol.

- Standard reports now include an executive summary, target context, assessment narrative, findings, reproducible attack path, explored-but-unconfirmed avenues, relevant methodology coverage, identities/credential appendix, and report-readiness checks.
- Findings include affected target, technique, evidence confidence, description, impact, reproduction command, evidence, remediation, detection notes, and mapped references when metadata exists.
- OSCP mode organizes activity target-by-target and phase-by-phase while preserving historical commands and evidence.
- A report-readiness gate flags successful cards without evidence, missing command snapshots, low-confidence terminal-inferred successes, missing explicit outcome facts, incomplete target metadata, and privileged state that lacks an explicit root/SYSTEM transition in activity history.
- Known credential secrets are redacted from historical commands and evidence by default, not only from the credential table.
- Coverage and unresolved methodology gaps are included as internal draft aids so the operator can see whether testing/report evidence is incomplete before export.

### v2 foundations retained

- Host/domain-scoped facts and activity.
- Unified evidence update pipeline for Intake, Nmap, and BloodHound/PlumHound.
- Explicit outcome selection for multi-outcome cards.
- Historical command/evidence snapshots.
- v1 workspace migration into schema v2.
- Sanitized workspace exports.
- Conservative Nmap inference such as `nfs.reachable` rather than falsely assuming exports exist.
- RFC4180-aware PlumHound CSV parsing.
- The existing 171-card methodology catalog, command presets/options, wordlists, scripts, report metadata, and offline references.

## Run locally

Open `index.html` in a browser. No server or package install is required.

## GitHub Pages

The repository is designed to serve directly from the repository root. Configure GitHub Pages to deploy from `main` and `/ (root)`.

## Regression tests

Run the v2 regression suite:

```bash
node tests/run-tests.js
```

Run the additional v2.1 intelligence/Intake/report tests:

```bash
node tests/run-v2.1-tests.js
```

The v2.1 suite covers knowledge-state preservation, methodology unlocks, relevant coverage, terminal command recognition, conservative tried/succeeded inference, duplicate terminal imports, report-quality checks, secret redaction in historical commands, and stuck-analysis credential gaps.

## Legal / ethics

Obol is intended for authorized labs, training, CTFs, exam preparation, and engagements where you have permission to test. It contains offensive-security references and commands; use them only within authorized scope.
