# Obol Experience Revamp — Build Plan & Context

> **Purpose of this document.** This is the working brief for a multi-build effort to
> level up obol's aesthetics, information architecture, command ergonomics, and overall
> UX — inspired by [`anshu19981/Pentestcheatsheet`](https://github.com/anshu19981/Pentestcheatsheet)
> (a.k.a. "RedConsole"). Point Claude at this file to resume any build with full context.
> **This is not the README** — the README is reserved for other tooling. Keep planning here.
>
> _Maintained by Claude. Last updated: 2026-09-11._

---

## 0 · How to use this doc

- Each build below is self-contained: **what / why / files / acceptance criteria / notes**.
- To start or resume a build, tell Claude the **one-liner** listed for it (see §6).
- Update the **Status** table (§5) at the end of each build.
- Decisions already locked with the owner are in §2 — don't re-litigate them without a nudge.

---

## 1 · Vision

Turn obol from a strong-but-utilitarian operator ledger into a tool that is both **beautiful
and faster to operate**. Two tracks:

1. **Aesthetic track** — a multi-skin theme engine (cyberpunk / matrix / CRT / neon / light)
   with glow and motion graphics. Skins are opt-in personality; the operator picks their world.
2. **Ergonomics track** — borrow RedConsole's information architecture and command-access
   ideas so the right command is one keystroke away, and reference becomes repeatable action.

The owner likes: glowing + motion graphics, matrix/cyberpunk aesthetics, multiple selectable
skins, and strong command organization + a multi-command builder.

---

## 2 · Locked decisions

- **Ship all five skins** (see §4, Build 1): Obol Classic, Ghostwire, Amber Phosphor, Neon Noir, Recon Daylight.
- **Motion = full-effect, opt-out.** Signature motion runs by default; a global **FX toggle**
  lets operators kill it, and everything still auto-disables under `prefers-reduced-motion`.
- **Additive architecture.** New work ships as **new owner files loaded last** (the pattern
  `accessibility.css` already uses) — never scattered edits across the versioned history.
- **README is off-limits** for this effort; plan and track here instead.

### Governance note (one-open-PR rule)
- obol's `tools/validate-open-pr-uniqueness.js` permits **one open release/product-hardening PR
  at a time**. As of 2026-09-11, **PR #237** (v10.18 credential/cracking Tool Builder burn-down)
  holds that slot, and the earlier planning-doc PR **#238 was closed** for that reason.
- **The owner granted this UX effort a standing exception**: it ships as **plain feature PRs**
  (no version token / release sections in the title or body), which are *not* classified as
  release/product-hardening PRs and therefore do not trip the uniqueness check. Keep titles
  feature-shaped (e.g. "Skin Engine (Build 1)"), never "Obol vX.Y…".

---

## 3 · Context you'll need (so you don't re-derive it)

### 3.1 obol architecture (as of v10.17)
- Single-page, offline, browser-based **offensive operator console** ("Offensive Box Operations Ledger").
- Assets live in `assets/`. `index.html` loads a **versioned runtime manifest**
  (`data/runtime-manifest.js` + `assets/runtime-current.js`) that writes ~75 cascading CSS
  layers (`obol.css` → `obol-current.css`) and a long JS chain in a fixed historical order.
- **`assets/runtime-current.js`** is the loader: `writeStyles()` / `writeScripts()`, a boot
  guard (`armBootGuard`, 12s deadline → `data-obol-boot="failed"`), and lazy route bundles.
- **Palette is fully tokenized** as CSS variables in `:root` (in `obol.css` and re-declared in
  `obol-current.css`): `--bg --panel --panel2 --border --fg --dim --accent --accent2 --danger
  --info --mono`. **This is why skins are cheap** — override tokens, touch no components.
- **`assets/accessibility.css`** loads last as a "stable owner": focus rings, `forced-colors`
  support, and a `prefers-reduced-motion` block that zeroes transitions/animations. Mirror this
  loading pattern for new owners.
- **`assets/accessibility.js`** adds ARIA roles / keyboard-button behavior via a MutationObserver.
  New interactive controls should get `role`/`tabindex`/`aria-pressed` to match.
- Header DOM (in `index.html`): `.brand > .coin + h1(OBOL) + .tagline`, `nav[data-nav]`,
  `#progress` pill, `#timer`. Sidebar `#sidebar` has `#params`, `#facts-list`, `#fact-input`.
  Main is `#view`. A good skin picker + ⌘K launcher live in the header.

### 3.2 RedConsole feature inventory (the inspiration)
- **735+ commands / 32 sections / 3 tiers**: *OSCP+ Core* (Recon, Web, API, Shells, Linux/Win
  PrivEsc, Tunneling, File Transfer, BOF, Cloud, Pivoting, OSINT, Wireless), *Active Directory*
  (AD Recon/Attacks/Lateral, Persistence, ADCS, Post-Exploit/Loot), *OSEP/Advanced* (Evasion,
  Injection, C2, VBA/Office, Deserialization, Binary, Containers/K8s, LOLBAS/GTFOBins, Password,
  Hash Cracking). Plus a **Methodology** phase spine (Setup→Recon→Foothold→PrivEsc→AD/Lateral→Loot→Reporting).
- **Variables bar** (RHOST/LHOST/LPORT/URL/USER/PASS/DOMAIN/DC-IP/HASH) auto-fills every command.
- **Ctrl+K instant search** across all commands.
- **Playbook Builder (⛓)** — add commands from any section into a chain, reorder, **export a
  logged `.sh`**. Reference → repeatable automation.
- **Stateful Attack Plan** — detects target profile; tickable milestones (User list → Valid
  creds → Shell → Local Admin → Domain Admin); pasting tool output into the **Loot Parser**
  auto-advances it.
- **Per-command**: ★ favorites, 📝 notes, ✔ done-tracking + progress bars, **copy history**.
- **One-click cred retarget** — click a looted cred, whole console re-fills to it.
- **Cred Reuse Matrix**, **Target Intel panel**, slide-in mobile drawer.
- Flow spine: **Variables → Autopilot → Loot Parser → Attack Plan → Pivot Kit → Report**.
- obol already has seeds of several: params (=variables), path/next-steps (=attack plan),
  intake (=loot parser), report, nmap parsing, methodology, dashboard. Gains are in **wiring +
  ergonomics**, not net-new capability.

### 3.3 Interactive showcase (reference build)
- Live 5-skin mock of obol's console: **https://claude.ai/code/artifact/968fd9bd-51ca-483c-a5ba-4b9ca2528a5a**
- Source snapshot: `scratchpad/obol-skins.html` (ephemeral; the artifact URL is canonical).
- Demonstrates: token-per-skin engine, header picker, FX toggle (`0`), matrix rain canvas,
  CRT scanline-roll + flicker, neon glow-pulse, switch sweep, wordmark scramble on change,
  auto-fill command + copy, cred reuse matrix. Use it as the visual/UX target for Build 1.

---

## 4 · Builds

### Build 1 — Skin Engine 🎨  `[status: DONE — 2026-09-11]`
**What:** Ship the five-skin theme engine into real obol.
**Why:** Highest delight-per-risk; validated visually in the showcase.
**Shipped as two inline blocks in `index.html`** (a `<style id="obol-themes">` in `<head>`
after `writeStyles()`, and a `<script id="obol-themes-js">` at end of `<body>` after
`writeScripts()`):
- **CSS:** `:root` glow/grid token defaults + `html[data-skin="matrix|crt|neon|recon"]`
  overrides of the existing color tokens + additive glow on existing chrome (no-op when
  `--glow` is transparent) + decorative-layer rules + `html.obol-fx` signature motion +
  `@media(prefers-reduced-motion)` guard.
- **JS:** injects the header skin picker + FX toggle, sets `data-skin` on `<html>` before first
  paint, `localStorage` persistence (`obol-skin`, `obol-fx`), matrix-rain canvas manager,
  keyboard (`1`–`5`, `[` `]`, `0`), ARIA (`aria-pressed`/`aria-checked`/menu roles), switch sweep.
  Exposes `window.OBOL_THEMES` for later builds/tests. Fully wrapped so it can never block boot.

**Integration decisions (deviations from original plan):**
1. Loaded via `index.html`, **not** the runtime manifest — the effective runtime stylesheet is a
   single generated `obol-current.css` snapshot (guarded by a style-equivalence validator) and
   the manifest's lazy machinery is app-triggered; inline application guarantees the skin at
   **first paint** (no flash; the boot gate hides `body` until commit) and stays out of the
   manifest/validator contracts. `current-boot` only asserts token *presence* in `index.html`.
2. **Inlined rather than two separate owner files** — the browser-smoke `requestBudget` proof
   sits at ceiling for every route (targets 93, evidence 90, report/dashboard 84…), so two extra
   file requests overflow it (`targets: 95 > 93`). Inlining adds **zero** requests, keeping the
   consolidation proof intact without weakening it. Future builds that need their own files must
   budget for the added requests or inline likewise.

**Verified (headless Chromium + governance gates):** boot commits (`data-obol-boot="ready"`);
default `--accent` unchanged (`#58d68d`); Ghostwire overrides apply (`--accent:#00ff66`,
`body` bg `rgb(0,5,2)`); rain layer present + running; app renders into `#view`; skin persists
across reload; picker survives navigation across all routes; **zero console errors**. Passing:
`validate-asset-references`, `validate-runtime-loading`, `validate-current-boot`,
`validate-responsive-layout`, `validate-accessibility-contract`.
_(Pre-existing, unrelated: `scope-check` is red on a clean checkout via a `v9.99` queue assertion.)_
**Skins & signature motion (full-effect, opt-out):**
| Skin | Ground | Accent | Accent2 | Danger | Motion |
|---|---|---|---|---|---|
| Obol Classic | `#0d1117` | `#58d68d` | `#e8b54a` | `#e05c5c` | none (baseline) |
| Ghostwire | `#000502` | `#00ff66` | `#ffffff` | `#ff2d2d` | matrix rain + coin breathe |
| Amber Phosphor | `#0a0700` | `#ffb000` | `#ffe6b0` | `#ff5b3b` | scanline roll + flicker |
| Neon Noir | `#0a0616` | `#ff2fb9` | `#21e6ff` | `#ff4d6a` | glow pulse + grid wash |
| Recon Daylight | `#e9edf1` | `#0f7a52` | `#b3630b` | `#c0392b` | none (light) |
**Acceptance:** skins switch instantly with no component-CSS edits; choice persists across
reload; rain/glow/scanlines only run when FX on **and** motion allowed; boot guard still commits
first paint; focus rings + forced-colors still pass; picker is keyboard-operable.
**Notes:** set `data-skin` on `<html>` (not a wrapper) so all layers inherit tokens. Rain canvas
is `position:fixed;z-index:0;pointer-events:none`, sized to viewport, cleared when inactive.

### Build 2 — ⌘K Command Palette  `[status: DONE — 2026-09-11]`
**What:** Command-aware ⌘K palette: fuzzy search across obol's full command library + nav,
Enter copies the command with `{{var}}` placeholders filled, or jumps to a section.
**Why:** Single highest ergonomic payoff (RedConsole's core move).
**Key discovery:** obol already had a **nav-only** Ctrl+K palette (`openPalette30`, in
`obol-app-current.js`) that searches pages/workspace but cannot search or copy commands. Build 2
**supersedes** it rather than duplicating: a capture-phase `keydown` handler intercepts Ctrl/⌘+K
before the old bubble-phase handler (and a capture-phase click handler re-points the
`#quick-open30`/`#home-search30` triggers), so only the new palette opens.
**Shipped inline in `index.html`** (`<style id="obol-palette">` + `<script id="obol-pal-js">`),
zero added requests, theme-aware via obol tokens:
- Indexes **nav** (`header nav a[href^="#"]`) + **commands** from `window.OBOL_LANES`
  (27 lanes → 1404 commands) and `window.OBOL_SCRIPTS` (lazy-loaded via
  `OBOL_RUNTIME_LOADER.loadGroup('toolReferenceData')` on open).
- **Variable substitution** reads live sidebar `[data-param]` inputs and fills `{{key}}`
  placeholders on copy (unmatched placeholders are left visible).
- Keyboard: `↑`/`↓` select, `Enter` copy/navigate, `Esc` close; `role=dialog`/`listbox`/`option`
  + `aria-selected`; toast on copy; exposes `window.OBOL_PALETTE`.
**Verified (headless Chromium):** Ctrl+K opens the new palette and the old one stays suppressed;
nav search navigates; command search returns hits (34 for "kerberoast"); copy fills `{{target}}`
from a param input with no raw placeholder left; **responsive** — panel fits at 380/768/1440 with
no body overflow and fits height; repo smoke passes (budget unchanged, zero console errors); all
five workspace gates pass.
**Scoring note:** results rank by "all query tokens present, earliest + prefix wins"; the
no-match sentinel is `-Infinity` (filtered with `isFinite`) so negative match scores are kept.

### Build 3 — Playbook Builder ⛓  `[status: planned]`
**What:** The multi-command chainer the owner flagged. Add commands from any surface → reorder →
export an executable, logged `.sh` with variables substituted.
**Why:** Converts obol from reference into repeatable automation; pairs with existing params.
**Files:** `assets/playbook.css` + `assets/playbook.js` (owner). Reuse existing export/report
plumbing where possible.
**Acceptance:** add/remove/reorder steps; live preview with substituted variables; export downloads
a runnable `.sh` (shebang + `set -x`/tee logging); state persists per engagement.

### Build 4 — Cred Reuse Matrix + One-Click Retarget  `[status: planned]`
**What:** Credentials × hosts grid (✓/✗/ADM); clicking a cred re-fills USER/PASS/HASH/DOMAIN and
retargets the console. Leverages obol's fact/param/AD-pivoting model.
**Files:** `assets/cred-matrix.css` + `assets/cred-matrix.js` (owner).
**Acceptance:** matrix renders from logged creds/hosts; click retargets params + toasts; admin
cells visually distinct; keyboard-operable cells.

### Build 5 — Evidence → Kill-Chain → Next-Command Loop  `[status: planned]`
**What:** Wire the flow so parsing evidence visibly advances the kill chain and lights up the next
recommended command — closing RedConsole's Variables→Loot→Plan→Report loop.
**Why:** Biggest UX payoff; makes the tool feel alive. Do last (touches the most surfaces).
**Acceptance:** logging a fact/parse result advances the relevant phase chip and surfaces the next
step without a manual refresh; no regressions to intake/path/report.

---

## 5 · Status tracker

| # | Build | Status | Shipped in | Notes |
|---|---|---|---|---|
| — | Interactive showcase | ✅ done | artifact v2 | 5 skins + FX toggle + motion |
| 1 | Skin Engine | ✅ done | branch `claude/nice-wright-0u29oe` | picker + 5 skins + rain + FX; validated in-browser |
| 2 | ⌘K Command Palette | ✅ done | branch `claude/nice-wright-0u29oe` | command search + copy-with-vars; supersedes nav-only palette; responsive |
| 3 | Playbook Builder | ⬜ planned | — | |
| 4 | Cred Reuse Matrix + retarget | ⬜ planned | — | |
| 5 | Evidence→kill-chain loop | ⬜ planned | — | |

---

## 6 · One-liner index (how to direct the next build)

Give Claude any of these:

- **`Review docs/EXPERIENCE-REVAMP.md and start Build 1 (Skin Engine).`**  ← the next build
- `Review docs/EXPERIENCE-REVAMP.md and start Build 2 (Command Palette).`
- `Review docs/EXPERIENCE-REVAMP.md and start Build 3 (Playbook Builder).`
- `Review docs/EXPERIENCE-REVAMP.md and start Build 4 (Cred Matrix).`
- `Review docs/EXPERIENCE-REVAMP.md and start Build 5 (Evidence loop).`
