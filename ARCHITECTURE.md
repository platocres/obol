# OBOL System Architecture

This document explains how OBOL is structured and why. For the formal ranking, gating, and graph-utility architecture, read [RANKING.md](RANKING.md); for the Wittgensteinian contextual inference and parser architecture, read [INFERENCE.md](INFERENCE.md); and for the operator tour and DevTools privacy verification checklist, read [README.md](README.md).

---

## 1. Purpose & Core Engineering Principles

OBOL is a deterministic penetration-testing and certification-prep companion. The operator works in their own terminal; OBOL tracks what they have proven about each target host and domain, ranks the next commands worth running, maintains the multi-host credential and flag ledger, maps Active Directory attack paths, and assembles the deliverable report.

Five core principles govern every design decision:

- **Zero Command Execution**: OBOL generates commands for an operator to run externally in their own terminal. It never initiates network connections to target systems or executes commands on the operator's behalf.
- **Browser-Local Persistence (`IndexedDB`)**: Every engagement ledger, credential vault, captured flag, SharpHound `.zip` graph, and operator proof screenshot is stored locally inside the operator's browser (`IndexedDB`).
- **Stateless Zero-Retention Edge Evaluation**: Text parsing, graph ranking, and report document structure assembly execute in volatile memory on a stateless Cloudflare Worker (`/api/engine`) with zero database bindings (`D1`, `KV`, `R2`, or `Durable Objects`), zero cookies, zero LLM calls, and zero server-side persistence.
- **Conservative Evidence Boundaries**: Parsers never invent a fact. An open port is not a shell; a crackable hash is not a validated login. The engine only asserts what pasted tool output actually proves.
- **Accessibility by Default**: Colour is never the sole signal, surfaces are keyboard-reachable, the font floor is 11px, `prefers-reduced-motion` is honoured, and all 7 WCAG-AA themes scale from 4K displays down to 320px viewports.

---

## 2. The Core Hypergraph: Facts, Moves, and Goals

Everything in OBOL is a projection of one directed hypergraph:

```text
           requires_all / requires_any                 produces
    FACTS  --------------------------->   MOVES   ------------------->  FACTS
  (what you          (eligibility, the           (the facts a move          (new facts feed
   have proven)       move's in-edges)            mints when it lands,        the next moves)
                                                  its out-edges, honest)
```

- A **Fact** is one proposition the operator has proven about a target (`port:445`, `credential.available`, `ad.acl_lead`, `objective.root_flag`). Facts are the single source of truth.
- A **Move** is a methodology branch expressed as declarative data: it specifies the facts that make it eligible (`requires_all` / `requires_any`), the facts it mints when it succeeds (`produces`), and operational metadata (`phase`, `locus`, `priority`, `commands`, `report finding`).
- **Goals** are the terminal objectives worth reaching (local/root proof flags, `SYSTEM` / `root` / `Administrator`, `NTDS.dit` secrets, or Domain Admin control).

From this single hypergraph, OBOL computes the ranked next moves in the Cockpit (`#/path`), the lowest-cost dependable route to a goal, the attack-path DAG, the compromise chain, and the multi-profile report.

### Scale at a Glance

- **Methodology Catalog**: `19` move packs comprising **`370` moves** (`1,263` runnable command templates) with 100% 1:1 4-pillar Field Notes (`Goal`, `Syntax`, `Gotchas`, `Pivot`).
- **Parser & Inference Fleet**: **`18` parser modules** (`2,250+` bounded regex pattern matchers and `630+` fact-minting rules emitting **`290` distinct fact kinds** across `38` capability families, plus 45-atom Wittgensteinian contextual inference and causal entailment).
- **Reactive Error & Trap Doctors**: **`50` reactive `.fix-card` repair workflows** diagnosing Kerberos clock skew, SSH key permission traps, `searchsploit` PoC hazards (hardcoded Burp proxies, Python 2 syntax, C compile flags), TLS/NLA handshakes, and tunnel faults.
- **Study & Reference Content**: `37` complete practice box walkthroughs, `117` flag-annotated tools, and `13` on-host staging payloads across Windows, Linux, and Active Directory.
- **UI Routes**: `21` hash routes across `18` route modules.

---

## 3. Layered Architecture: Browser Client, Web Worker & Stateless Edge

```text
  +-------------------------------------------------------------------------+
  |  Browser UI Layer (assets/ui/*, DOM + IndexedDB, 100% Client-Side)      |
  |  shell - router - lazy loader - 21 routes - session splitter - store    |
  +-------------------------------------------------------------------------+
  |  Client-Side Web Worker & Local Engines (assets/engine/*)               |
  |  facts - phases - context - bloodhound (.zip Web Worker) - vfs - study  |
  +-------------------------------------------------------------------------+
  |  Stateless Edge Evaluation Worker (/api/engine, volatile RAM only)      |
  |  3-tier parser cascade - 7-tier CSR ranker - outcome classifier -       |
  |  findings & narrative composer - multi-profile report AST builder       |
  +-------------------------------------------------------------------------+
```

### 3.1 Browser-Local State & Strict Privacy Boundary

1. **Engagement Ledger (`IndexedDB`)**: Managed by `assets/ui/store.js`. Persists targets, facts, credentials, command history, and proof screenshots locally in the browser.
2. **Client-Side BloodHound Web Worker (`assets/engine/bloodhound.js` + `assets/engine/workers/bloodhound-worker.js`)**: Parses SharpHound `.zip` archives and BloodHound CE `.json` files 100% locally inside a browser Web Worker. No BloodHound archive or directory graph is ever transmitted over the network.
3. **Local Screenshot Byte Isolation (`assets/engine/cloud-bridge.js`)**: Before requesting report layout assembly from `/api/engine`, the client replaces embedded screenshot `data:image/...` URIs with lightweight placeholders (`__OBOL_LOCAL_SHOT_N__`) and stitches the binary image bytes back into the DOM/DOCX/HTML locally inside the browser.

### 3.2 Lazy Loader Groups (`assets/ui/lazy.js`)

The critical boot path loads the shell, `IndexedDB` store, context resolver, and primary routes (`#/home`, `#/targets`, `#/evidence`, `#/path`), while lazy-loading specialized workspaces on demand:

| Lazy Group | Purpose |
| :--- | :--- |
| `start` | Startup Hub (`#/start`), guided mini-lab simulator, and curated certification resources |
| `help` | 4-tab Help center, 7-chapter searchable Operator Manual (`#/help/manual`), and 32-term glossary |
| `study` / `studydata` | Learn mode (`#/study`), 11 methodology lanes, open-port playbooks, and 37 cold-box simulations |
| `tools` | 6-tab Tool Dock (`#/tools`), task stations, and 50+ flag-annotated command builders |
| `workbench` | 13 interactive offline studios (`#/workbench`) including Reverse Shells, Pivot & Tunnels, and CyberChef Lite |
| `library` / `stuck` | 5-lens Reference Library (`#/library`) and Stuck? dead-end diagnostic breakers |
| `domain` | Client-side JSZip, BloodHound graph engine (`bloodhound.js`), SVG renderer (`bhgraph.js`), and `#/domain` route |
| `report` | Multi-profile Report Studio (`#/report`) and client-side PDF / `.docx` / `.md` / `.html` exporters |
| `findings` | 5-tab Findings surface (`#/findings`): CVSS v3.1, ATT&CK v15 (`OBOL Scope`), NIST CSF 2.0, MITRE D3FEND, and CISA KEV |
| `cruise` / `playbooks` | Multi-hypothesis 5-stage bash pipeline generator (`#/cruise`) |

---

## 4. The UI Surfaces (`assets/ui/routes/`)

- **`#/start` (Startup Hub)**: New Engagement launcher, Resume card, 5 Practice Scenarios, interactive Mini-Lab Simulator, and certification playbooks (OSCP, CPTS, PNPT).
- **`#/path` (Cockpit)**:
  - **5-Tab Hero Operator Deck**:
    1. **`Flags & Proof`**: Copy-ready `local.txt` and `proof.txt` retrieval commands with inline `CMD` / `PS` toggles and `Educated Guess` vs `Verified Path` epistemic badges.
    2. **`Get On Host`**: Pre-filled interactive shell upgrades (`evil-winrm`, `impacket-psexec`, `impacket-wmiexec`, `xfreerdp`, `ssh`).
    3. **`Persistence & Accounts`**: Authorized lab access-maintenance helpers.
    4. **`Shares & File Transfer` (13-Payload Tool Stager)**: Interactive selector for 13 assessment binaries (`winPEASx64.exe`, `linpeas.sh`, `SharpHound.exe`, `ligolo-agent.exe`, `chisel`, `GodPotato.exe`, `PrintSpoofer64.exe`, `RunasCs.exe`, `Rubeus.exe`, `PowerView.ps1`, `mimikatz.exe`, `nc64.exe`, `pspy64`) with matched Kali HTTP/SMB server and target download cradles.
    5. **`Cred & AD Ops`**: Fast credential validation, Kerberoasting, AS-REP roasting, BloodHound collection, ACL abuse, and DCSync quick-actions.
  - **Ranked Move Cards**: Deterministic 7-tier Causal Frontier cards with `Because <prereq> -> expect <payoff>` hypotheses, progressive earned-token gating, Focus Mode toggle, and 4-pillar Field Notes.
- **`#/home` (Engagement Hub)**: Multi-host target roster (`All`, `Foothold / Creds`, `Owned`), per-host Attack Path cards, and the live Virtual Workspace file tree (`scans/`, `loot/`, `proof/`).
- **`#/domain` (BloodHound Domain Analyzer)**: Client-side SharpHound `.zip` / `.json` analyzer, 3 built-in AD forest/delegation topologies, `What-If` owned principal simulation, interactive multi-column SVG attack-path graph, and numbered hop commands with automatic intermediate identity handoff.
- **`#/findings` (5-Tab Offensive & Defensive Findings)**: Deduplicated findings with CVSS v3.1 vectors, Neon MITRE ATT&CK matrix (`OBOL Scope` and `Full Enterprise`), NIST CSF 2.0 compliance posture with `<details>` drill-downs (NIST 800-53, PCI-DSS v4.0, CIS v8, ISO 27001, OWASP), interactive 6-column MITRE D3FEND countermeasure matrix, and CISA KEV CVE tracking.
- **`#/report` (AST-Paginated Multi-Profile Report Studio)**: Live switching across **OffSec OSCP**, **HTB CPTS**, **TCM PNPT**, **Client Pentest**, and **Executive Brief** profiles, with Report Readiness Pre-Flight checks, secret redaction toggle, Authoring Studio prose overrides, and 1-click export to **PDF**, **`.docx`**, **`.md`**, and **`.html`**.

---

## 5. License

OBOL is made available under the **OBOL Source-Available Personal, Academic & Authorized Security Testing License** ([LICENSE](LICENSE)). Free for personal learning, academic research and university instruction, and authorized security assessments; commercial redistribution and competing hosted use are reserved.
