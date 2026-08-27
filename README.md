# Obol — Offensive Box Operations Ledger

A static, offline-capable study companion and operations ledger for OSCP-style labs, Active Directory practice, and CTFs. Pure HTML/CSS/JS — no backend, no build step, no network calls. All data lives in your browser's localStorage.

**Human-run commands only.** Obol never executes anything for you — every command is copy → paste into your own terminal → paste results back. Deliberately exam-legal and keeps you learning the commands.

## What it does

- **171 technique cards across 12 lanes** — recon, web (incl. full manual SQLi methodology), poisoning/relay, AD, cracking, Linux & Windows privesc (incl. potato family + PrintNightmare), pivoting, shells/tooling, database, cloud, objectives. Each card: the *why*, exact manual commands with your parameters pre-filled, GUI option switches, expected output, failure branches, defender's note.
- **Nmap Command Builder** — one card builds any scan: presets for each engagement moment (first contact / canonical / deep dive / UDP / vuln sweep / AD enumeration / post-foothold pivot), the full switch panel (-sV/-sC/-A/-O/-Pn, -T2–T5, port selection, output), and 19 NSE script chips with plain-English tooltips that highlight when they match your ingested services.
- **Methodology Map** — the engagement lifecycle as a board: every phase, its lanes, and live per-lane progress.
- **Nmap ingest** — paste -oN/-oG/-oX output to auto-populate the box tracker and light up applicable cards. Mines domain/hostname, OS, SMB signing, and Kerberos clock skew straight into your parameters.
- **⬡ Intake (universal paste)** — paste output from *any* tool (auto-detect, or pick nmap / nxc / kerbrute / Responder / secretsdump / roast / ldapsearch / hydra). A review screen proposes facts (which narrow your Path), clean users/hashes/creds artifact lists, and param suggestions — apply in one click, then see exactly which cards just unlocked. Reachable from the nav, from Boxes, and from every card's evidence box.
- **Service-scoped workflow** — Stuck? and Lanes default to cards relevant to the services your scan actually found (one click to see everything). Output-handoff commands on list-producing cards format results into the next step's input files.
- **BloodHound / PlumHound ingest** — drop SharpHound/CE zips, JSONs, or `--csv` exports → attack-path findings, copyable target lists (kerberoast / AS-REP / DCSync), auto-filled domain params.
- **Tools armory** — every command grouped by tool, plus pinned references: wordlists, hash converters, repos, copy/paste scripts, and the Exploit Workshop (fixing & cleaning downloaded PoCs, incl. backdoor checks).
- **Box tracker** — hosts, creds with provenance, flags, attack-path summaries.
- **Path view** — your current position, what the last intake unlocked, everything applicable (matched to your scan by default), and next-step branches from failures.
- **Report generator** — two modes: standard client-style findings (severity, MITRE ATT&CK, CVE correlation, NIST SP 800-53 + CWE remediation references) and OSCP exam mode (per-target sections, reproducible steps, proof checklist, submission rules).
- **Exam/lab timer** (countdown or stopwatch), engagement parameters with example values, workspace export/import, mobile-friendly responsive layout, fully offline.

## Run it locally

Open `index.html` in any browser. No server, no dependencies, no internet required.

## Host it on GitHub Pages

1. Create a new GitHub repository (e.g. `obol`).
2. Put this folder's contents at the repo root — `index.html` must be at the top level (alternatively, put everything in a `docs/` folder; Pages can serve from there too).
   ```
   git init && git add -A && git commit -m "Obol v1.5"
   git remote add origin git@github.com:<you>/obol.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source: "Deploy from a branch"**, branch `main`, folder `/ (root)`. Save.
4. Wait ~1 minute. Your site is live at `https://<you>.github.io/obol/`.

## Legal / ethics

Obol is a study companion for labs and authorized engagements only. It contains references to offensive techniques; use it only on systems you are authorized to test (OSCP labs, HTB, your own environment, or a signed engagement scope).
