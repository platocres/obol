## v9.55 — Product-hardening release for the Notes Impact and Source Re-mining package

- `ad-sharphound-collection-review`
- `ad-bloodhound-edge-proof-review`
- `ad-domain-share-secret-triage`
- `ad-kerberoast-proof-boundary`
- `pivot-reachability-map-review`
- `pivot-socks-proof-chain`
- `pivot-traffic-confirmation`
- `winrm-lateral-validation`
- SharpHound collection is a scoped graph snapshot, not proof that a BloodHound path is exploitable.
- BloodHound edges become proof tasks with a required identity, right, target object, and cleanup boundary.
- Domain shares produce access, file, and candidate-secret facts separately.
- Kerberoasting separates SPN discovery, TGS capture, offline cracking, and validated service access.
- Pivoting separates route discovery, tunnel-up state, scan-through behavior, traffic confirmation, and authenticated internal service use.
- WinRM validation separates credential validity from useful lateral Windows control.
- Path and Lanes card previews now show `Open card` and `Add evidence` actions instead of hiding evidence entry behind a silent click-through.
- No fake card fallback rendering.
- No developer-facing route explanation boxes.
- No source-mining provenance shown as operator card copy.
- Every command has a useful explanation, not a generic authorization warning.
- Card-originated evidence remains card-scoped through Intake.
- OS-scoped local privilege cards remain separated from cross-platform AD and pivot cards.

## v9.54 — Begins Linux privilege-escalation source re-mining from the complete sequential private-note packets

- Added the first Linux privilege-escalation re-mining batch to the current note-progress projection without claiming raw Git LFS access from this agent runtime.
- Re-read four already-reviewed Linux privilege-escalation sources from the complete packet fallback and published per-note, per-dimension audit rows for service-footprint review, user-trail secret hunting, cron execution chains, and sudo authorization.
- Queued concrete public-safe product gaps for Linux terminal-output analyzers: process/traffic secret observations, user-trail secret extraction, cron proof-chain reconstruction, sudo `-l` interpretation, Hydra credential-validation builder support, and credential-pattern wordlist generation.
- Preserved existing Linux Field Notes and Orange-derived path bindings additively rather than replacing the v9.50 Linux packet or publishing private recipe material.
- Added `tests/run-v9.54-tests.js` to assert the expanded 19-row re-mining projection, complete-packet lineage, allowed negative-proof outcomes, and the permanent audit validator.
