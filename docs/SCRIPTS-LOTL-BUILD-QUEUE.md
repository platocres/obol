# Scripts + LOTL build queue (private working queue — NOT the README handoff)

> **This file is an internal, agent-only build queue for the Scripts / LOTL initiative.**
> It is deliberately kept out of the README Product Build Next block and the generated
> queue owners so it does not pollute the public handoff. The owner (Brandon /
> `platocres`) does not read this to plan; **Claude reads this to resume work.**
>
> **HOW TO RESUME:** tell Claude *"read `docs/SCRIPTS-LOTL-BUILD-QUEUE.md` and continue
> the next unfinished build."* Claude then reads this file top-to-bottom, checks the
> **Status ledger**, and executes the next `PENDING` build as its own versioned release
> PR. Do the highest build that is `PENDING`; do not skip.

This is not referenced by `tools/sync-product-build-next.js`, the README generator, or
any queue validator. It is plain documentation. Keep it that way — if a validator ever
starts requiring docs to be README-linked, link it under a neutral heading, but never
feed these builds into the generated Product Build Next block.

---

## Why this initiative exists (owner's ask, 2026-09-10)

The owner asked for five things, in their words, condensed:

1. **The scripts collection has no visible usage instructions.** Fix that first.
2. **Add LOTL / OSCP-exam-safe alternatives** to tools that violate OSCP rules on
   automated exploitation (sqlmap is the canonical example; also Metasploit-beyond-one-use,
   automatic exploit chains, mass tooling).
3. Scripts should **receive parameters collected from targets** (IP, domain, lhost…),
   pre-populated into the script body **just like a tool builder does**.
4. Scripts should have **easy GUI toggles** to adjust the command/one-liner where it
   makes sense, **just like a tool**.
5. Scripts should be **proposable on the Next Steps path** as warranted; the path should
   **offer an exam-safe / LOTL alternative** when it would otherwise recommend a
   rule-breaking tool; and **script output pasted into Evidence should advance the path**.

Constraints the owner set: split into multiple **versioned** builds (advance the site
version every build), queue them here (not the README), keep enough resume context, and
open release PRs as needed (granted). One open release/product-hardening PR at a time
(project rule). Do **not** mine more notes yet — work only with the scripts already in
`data/scripts.js` until the owner asks for more.

---

## Ground-truth findings (so a cold resume doesn't re-investigate)

### The scripts data already exists and is rich
- `data/scripts.js` → `window.OBOL_SCRIPTS`: ~20 scripts. Each has
  `{id, cat, name, lang, desc, when, where, how, code}`. `code` uses `{{placeholder}}`
  tokens (`{{lhost}}`, `{{lport}}`, `{{target}}`, `{{base_dn}}`, `{{user}}`,
  `{{domain}}`, `{{port}}`, `{{interface}}`). Several are already LOTL (LDAPSearch vs
  BloodHound/PowerView; PowerShell `Test-NetConnection` port sweep vs nmap-on-target;
  `certutil` LOLBIN cradle).
- `data/scripts-v2.5.js` → attaches contextual **builder profiles** to 10 scripts as
  `s.builder25` and exports `window.OBOL_SCRIPT_BUILDERS_V25`. Each profile:
  `{controls:[{type:'toggle'|'radio'|'arg', id, label, default, options?, placeholder?}],
  build:(baseCode, params, builderState) => string}`. This is the GUI-toggle engine —
  it already exists and rebuilds the command from toggles + engagement params.
- Both files load at **operator startup** (`data/runtime-manifest.js` line ~62, `domain`
  bundle) and in the route-lazy `toolReferenceData` bundle, so `OBOL_SCRIPTS` (with
  `builder25`) and `OBOL_SCRIPT_BUILDERS_V25` are present on the Tools route.

### Core helpers already exposed on `C` (`assets/obol-core-current.js` ~L676–705)
- `C.scriptBuilderState(state, id, profile)` → normalizes/returns
  `{selected:{}, radio:{}, args:{}}` for a script's builder, seeding defaults.
- `C.updateScriptBuilder(state, id, patch)` → merges `{selected?, radio?, args?}`.
- `C.referencedParams(text)` → array of `{{param}}` names referenced in code.
- `C.coerceState(raw)` / `C.newState()` → build/upgrade a workspace state object.
- `C.VERSION` → workspace schema id (NOT the product release).

### Engagement state / parameter source
- The app persists workspace state to `localStorage['obol-state-v2']` (const `LS_V2` in
  `assets/obol-app-current.js`), coerced via `C.coerceState`.
- Params live at `state.params` (e.g. `state.params.target`, `.lhost`, `.domain`).
  `base_dn` is derived from `domain` when absent: `domain.split('.').map(p=>'DC='+p).join(',')`.
- When the user edits sidebar params on `#/tools*`, the app calls `route()` → repaint, so
  a Tools-route re-render picks up fresh params. localStorage is the shared source of truth.

### The regression the owner felt
- The **live Tools route owner** is `assets/tools-library-current.js`. Its
  `renderScripts()` (was ~L90) rendered only `name + desc + code` — it **threw away
  when/where/how, the param trail, and the `builder25` GUI toggles.**
- The **full** renderer still exists in the frozen app owner
  `assets/obol-app-current.js` (functions `scriptCode25`, `scriptControls25`,
  `paramTrail25`, and the `viewTools` `__scripts` override ~L740–819) and its historical
  source `assets/app-v2.5.js`. Build A ports that experience into the current owner.
- Script CSS classes (`.script-card`, `.script-usage`, `.script-builder25`,
  `.script-control`, `.script-paramtrail`, `.script-toolbar`) exist in
  `assets/obol-current.css`, so restored markup is already styled.

### Path / Evidence architecture (for builds C & D)
- Next Steps path owner: `assets/operator-route-current.js`; ranking model comes from
  `C.nextStepsOverview34(...)`. Cards live in `OBOL_LANES`; cards carry
  `prereq`/`produces`/`lane`/`commands`/`expected`/`onFailure`. Tools get proposed via
  card commands (`cmd.tool`). Scripts currently have none of this metadata.
- Evidence ingestion: `assets/obol-app-current.js intakeAnalyze(text, mode)` uses
  `window.OBOL_SIGNATURES` (regex rules → facts/params) and `OBOL_NMAP`. Tool builders
  ingest via `assets/tool-builder-evidence-current.js`
  (`OBOL_TOOL_BUILDER_EVIDENCE_CURRENT.analyzeForBuilder(id, text)` → `{state, outcomeFacts}`)
  and reconnect to card owners (see `tests/run-v10.05-tests.js`). Scripts need the same
  shape: paste-back expectations + an analyzer (own or shared) producing conservative facts.

### Release mechanics (every build is a versioned release)
- Bump `data/current-release.js` (`version` `10.0.X`, `label` `v10.0X`).
- Run: `node tools/sync-current-release.js --write`, `node tools/sync-current-changelog.js --write`,
  `node tools/sync-product-build-next.js --write`. Author `docs/v10.0X.md` (`# Obol v10.0X`,
  `## What changed`) BEFORE the changelog sync.
- Add `tests/run-v10.0X-tests.js`; **demote** the previous `tests/run-v10.0(X-1)-tests.js`
  off live-current assertions (version-agnostic). `tools/validate-historical-tests.js`
  catches hard-coded current tokens.
- Validate: `node tools/scope-check.js` (inner loop), then the release/preflight chain.
  Required PR checks: `full-historical-regression` + `browser-smoke`. Merge only on a
  green exact head.

### Tool Builder ↔ site-version decoupling (done in Build A — remember this)
- The pending Tool Builder batches used to be labeled `v10.06`/`v10.07`, i.e. 1:1 with
  the site version. Build A **decouples** them (named batches, no `v10.0x` heading) so the
  Scripts/LOTL track can advance the site version without colliding. If you re-add
  Tool Builder batches later, keep them label-named, not site-versioned.

---

## The build plan

Each build = one release PR = one site-version bump. Keep them small and independently
green. Acceptance criteria are the Definition of Done; write item tests to match.

### Build A — Restore script guidance rendering + param pre-fill + GUI toggles  ·  site v10.06
**Owner ask covered:** #1, #3, #4.
- Rewrite `renderScripts()` in `assets/tools-library-current.js` to render, per script:
  category, `when`/`where`/`how`, an **engagement-values param trail** (each referenced
  `{{param}}` + its current value from `state.params`, "not set" when empty), the
  `builder25` **GUI controls** (toggles/radios/args) when present, and the compiled code
  (params filled; builder-adjusted when a profile exists) with a Copy button.
- Read state from `localStorage['obol-state-v2']` via `C.coerceState`; persist builder
  control changes with `C.updateScriptBuilder` + write back; live-rebuild the code block.
- Fill `{{param}}` from `state.params` with `base_dn` derivation; leave `{{param}}` visible
  when unset so it reads as a template, not a broken command.
- Decouple pending Tool Builder batches from site-version labels (README Tool Builder
  queue, `docs/TOOL-BUILDER-BUILD-QUEUE.md`, `data/product-hardening/tool-builder-backlog-current.js`).
- Demote `tests/run-v10.05-tests.js` structural/roadmap assertions to durable forms.
- Add `tests/run-v10.06-tests.js`, `docs/v10.06.md`; run all three syncs.
- **Acceptance:** on `#/tools/__scripts`, a script shows when/where/how + param trail +
  (where a profile exists) working toggles that change the previewed command; params from
  the workspace pre-fill the code; copy works; no raw stripped list remains.

### Build B — LOTL / exam-safe metadata + library facet  ·  next site version
**Owner ask covered:** #2 (data + surfacing).
- Add metadata to scripts (in `data/scripts.js` or a small stable companion owner):
  `execMode` (`kali`|`target`|`pivot`), `examSafe` (bool), `substitutesFor` (array of tool
  ids it replaces, e.g. LDAPSearch → `['bloodhound-python','netexec']`, PS port sweep →
  `['nmap']`, and a NEW manual-SQLi checklist script → `['sqlmap']`), and a short
  `examSafeReason`.
- Author the missing exam-safe substitute scripts the owner cares about, at minimum a
  **manual SQLi / LOTL SQL-injection checklist** standing in for `sqlmap` (union/error/
  boolean/time steps, `--os-shell`-equivalent manual path, evidence to capture), plus any
  obvious gaps (nmap→bash `/dev/tcp` sweep, wget/curl LOLBIN transfer variants). Public-safe,
  variable-ized, with when/where/how.
- Add a **Scripts / LOTL facet + exam-safe badge** to the Scripts library UI, and a
  workspace **exam-safe mode** flag in state (default off) so Build C can consume it.
- **Acceptance:** scripts carry `substitutesFor`/`examSafe`; a manual-SQLi script exists
  and is labeled a sqlmap substitute; the library can filter to exam-safe/LOTL.

### Build C — Scripts on the Next Steps path + exam-safe substitution offer  ·  next site version
**Owner ask covered:** #5 (path proposal + substitution).
- Give path-relevant scripts `prereq`/`produces`/`lane` metadata and a resolvable route
  (script-card or reuse `#/card`/`#/tools`), so `operator-route-current.js` can propose
  them by evidence state — additively, never replacing Orange cards.
- When the ranked path would surface a restricted tool (sqlmap, etc.) AND exam-safe mode
  is on (or always, as an inline offer), render the `substitutesFor` script as the
  exam-safe alternative next to it.
- **Acceptance:** a relevant script appears on `#/path` when its prereqs are met; a
  restricted-tool recommendation shows its LOTL substitute; Orange baseline cards intact.

### Build D — Evidence ingestion from script output  ·  next site version
**Owner ask covered:** #5 (evidence advances the path).
- For each decision-relevant script, define paste-back expectations + an analyzer (own,
  or a proven mapping onto `OBOL_SIGNATURES` / `OBOL_TOOL_BUILDER_EVIDENCE_CURRENT`) that
  produces **conservative** facts (recognizing a command ≠ success; see
  `docs/PROOF-CONTRACT.md`). Card-scoped Intake so script output preserves its source and
  recalculates Next Steps.
- **Acceptance:** pasting representative positive/negative/blocked/partial script output
  produces the expected conservative facts and path movement/non-movement; no fact is
  manufactured from mere command recognition.

### Build E (optional) — cross-surface audit + polish  ·  next site version
- Ensure Tools/Card/Path/Evidence stay one model over scripts; collapse any stripped/legacy
  script views; add a validator that fails if a script claims `examSafe`/`substitutesFor`
  without the required fields, or a path-proposed script lacks prereq/produces.

---

## Status ledger  (update this every build — this is what "resume" reads first)

| Build | Site ver | State | PR | Notes |
| --- | --- | --- | --- | --- |
| A | v10.06 | IN PROGRESS | — | script rendering + param prefill + toggles; TB-batch decoupling |
| B | (next) | PENDING | — | LOTL/exam-safe metadata + manual-SQLi substitute + facet |
| C | (next) | PENDING | — | scripts on Next Steps path + substitution offer |
| D | (next) | PENDING | — | Evidence ingestion for script output |
| E | (next) | PENDING | — | optional cross-surface audit + validator |

When a build merges, set its row to DONE with the PR number and the exact head SHA, and
flip the next row to IN PROGRESS when you start it.
