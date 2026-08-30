# Obol Changelog

This file is the release-history entry point for Obol. Detailed history through v7.6 is preserved verbatim in [`docs/CHANGELOG-through-v7.6.md`](docs/CHANGELOG-through-v7.6.md). Future build work should review this changelog together with the current README before changing architecture or methodology.

The README is intentionally reserved for current project purpose, architecture, permanent requirements, a compact summary of only the latest three releases, and forward priorities.

## v7.7 — no-credentials source-depth completion

- Atomized the pinned `no_creds.md` methodology family into thirty-one meaningful source-fidelity units spanning network/service discovery, DC discovery, DNS zone transfer, anonymous/guest SMB, anonymous LDAP, username enumeration, Kerberos username validation, LLMNR/NBT-NS/mDNS listening, DHCPv6 poisoning, ARP interception, unauthenticated PetitPotam coercion, PXE/NAA recovery, and TimeRoast.
- Modeled twenty-nine units end to end and retained two explicit superseded source outcomes: the deprecated Nmap `-sP` spelling in favor of the modern discovery workflow, and the redundant Bettercap DHCPv6 alternative in favor of the narrower mitm6 path.
- Reused mature Nmap, DC-identification, DNS, SMB, LDAP, Kerberos-user-enumeration, MITM-listener, PXE, and TimeRoast owners while adding focused v7.7 owners for DHCPv6 poisoning, targeted ARP interception/Pcredz capture, and unauthenticated PetitPotam coercion.
- Preserved strict separation between discovery, listener/poison state, inbound authentication, captured hash or credential material, coercion, relay, authenticated access, execution, administrator/SYSTEM context, privilege, and cleanup/restoration.
- Advanced only `no_creds.poisoning` and `no_creds.coerce`, the two `no_creds.md` parents still partial in the frozen v6.2 source-depth baseline. Historical no-credential canonical completions retain their original milestones while gaining complete atomic accounting.
- Raised canonical methodology from **118 implemented / 9 partial / 0 gaps / 0 stale** to **120 implemented / 7 partial / 0 gaps / 0 stale**, **94% fully implemented**, and **100% represented**.
- Expanded source inventory from **7/17** to **8/17** methodology files atomized, from **25/34** to **27/34** frozen partial baselines decomposed, and from **118/118** to **149/149** currently inventoried atomic units fidelity-complete.
- Reduced the live Build Next queue from **9** to **7** broad source-inventory/decomposition items and moved the active priority into `lat_move.md`, with zero implemented-quality, mapped-delivery, canonical-gap, or inventoried-fidelity debt.
- Advanced the stable current projection through `C.projectModel77(...)`, `C.currentProjectModel(...)`, and `C.currentNorthStarDashboard(...)`, retained the overview-first Dashboard owner, and added no no-op Dashboard metadata layer.
- Added v7.7 browser/runtime wiring, no-credential terminal Evidence interpretation, current-project documentation, README synchronization, source-wave UI summary, sanitized-export version migration, future-safe v7.6 regression coverage, and a dedicated v7.7 regression suite under the exact-head release workflow.

## Earlier releases

The complete release record from v7.6 backward is preserved without edits in [`docs/CHANGELOG-through-v7.6.md`](docs/CHANGELOG-through-v7.6.md).
