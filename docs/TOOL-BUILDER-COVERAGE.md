# Tool Builder Coverage

Tool Builder Coverage is the v9 product-hardening queue for giving every runnable tool/action a GUI command builder or an explicit terminal disposition.

## Goal

Every relevant point on the Path should expose the right tool through a context-aware GUI. The base command should perform the minimum useful action. Optional behavior belongs in clear toggles, switches, selectors, and fields.

## Stable platform owners

v9.12 establishes the reusable platform, v9.13 begins concrete migration with Nmap, v9.14 proves the platform across credential-aware, cracking, content-discovery, and credential-dump command shapes, v9.15 extends cracking with John the Ripper, v9.16 proves one canonical schema record can safely represent closely related executables without adding another renderer, and v9.17 extends the same stable platform across a paired Impacket Kerberos-roasting package plus an independent WinRM remote-access builder:

- `data/tool-builder-schema.js` owns the stable builder data contract and registry helpers;
- `assets/tool-builder-current.js` owns generic accessible rendering, context autofill, shell-safe command generation, and copy-only operator handoff;
- `data/tool-builder-inventory.js` owns explicit runnable-tool dispositions and alias normalization;
- `data/tool-builders.js` owns concrete schema-driven builder definitions;
- `tools/validate-tool-builder-platform.js` is the permanent contract and inventory gate.

These are stable non-versioned owners. Do not add a release-specific Tool Builder mini-runtime or build a bespoke renderer for each tool.

## Required dimensions

A complete tool builder should define:

- minimum usable command;
- path/context bindings;
- target and workspace autofill;
- execution context where relevant, such as Kali or Windows host;
- credential modes where relevant;
- optional toggles and switches;
- output file controls;
- Evidence expectations;
- manual outcome behavior;
- cleanup/restoration guidance when relevant;
- report lineage;
- tests.

The schema deliberately keeps command generation separate from execution. Obol may assemble, explain, preview, and copy a command. The operator still runs it externally. A generated command or manually declared outcome is not report-ready proof without supporting Evidence.

The v9.13 schema permits a choice to intentionally emit no CLI argument. This is a generic representation for modes where selecting an option means omitting a flag rather than invoking tool-specific compiler code.

v9.14 extends the same stable schema without changing its version identity. Builders may declare conditional visibility and requiredness, conditional command tokens, repeated values such as one `-H` per header, and concatenated shell-safe positional values such as `domain/user:password@target`. Those capabilities are generic and reusable. They exist because representative real tools require them, not as tool-specific compiler branches.

v9.16 adds another generic command-model shape without changing the stable schema or renderer version: `command.executable` may be a declared selector that maps a schema field to a fixed set of safe executable literals. This lets one canonical builder represent closely related sibling tools such as Gobuster and Feroxbuster while preventing free-form executable text from becoming a command. The schema validates the declaration and the renderer resolves only one of its fixed choices.

The generic renderer scopes field element IDs by builder ID so multiple builders may coexist on one card without duplicate DOM IDs. Conditional fields update in place as the operator changes modes. The browser bridge mounts implemented builders in the existing Tools view and on relevant Card surfaces while Targets retains its dedicated canonical Nmap placement and historical Nmap Evidence ingestion compatibility. For shared builders, the bridge may seed a declared mode from the active inventory-backed tool route while leaving the schema and renderer generic.

## Inventory lock

Every runnable tool identity observed in the current lane/card corpus and tool registry must resolve to one explicit inventory disposition in `data/tool-builder-inventory.js`:

- `implemented` - a schema-driven builder exists and passes the permanent contract;
- `modeled` - the tool is known and remains queued for builder work;
- `superseded` - another modeled tool/surface replaces it, with rationale;
- `rejected` - a GUI builder is intentionally inappropriate, with rationale.

Aliases normalize to one canonical identity. New command/tool data must fail validation until the inventory is updated deliberately. This prevents runnable tools from silently appearing outside builder coverage accounting.

An `implemented` inventory record that points at a Product Hardening queue item must resolve to a registered concrete builder with the same stable item ID. Multiple sibling tools may deliberately point to one shared canonical builder when that relationship is explicit in inventory and the builder itself contains only declared executable choices. The permanent platform validator enforces the queue and registration boundary.

## Representative priority builders

The v9 queue seeds representative builders first so the generic schema covers the hard shapes before the full inventory is burned down:

- Nmap - **implemented in v9.13**
- NetExec / nxc - **implemented in v9.14**
- Hashcat - **implemented in v9.14**
- John - **implemented in v9.15**
- ffuf - **implemented in v9.14**
- gobuster / feroxbuster - **implemented in v9.16**
- impacket-secretsdump - **implemented in v9.14**
- impacket-GetNPUsers - **implemented in v9.17**
- impacket-GetUserSPNs - **implemented in v9.17**
- Evil-WinRM - **implemented in v9.17**
- Certipy
- sqlmap
- curl
- chisel
- SSH / plink

### Nmap migration boundary

The v9.13 Nmap builder preserves the existing discovery-first profile behavior for host discovery, quick TCP, full TCP, service/default-script, and top-UDP scans. Targets receives the schema-driven builder from `data/tool-builders.js` through the generic renderer, with explicit port-scope/custom-port, timing, rate/retry, script/version/OS/reason/DNS, and output controls.

The historical Nmap parser and paste/intake path remain compatibility owners for Evidence ingestion. The new form mirrors its values into that path rather than inventing a second Evidence or target-discovery implementation. Those historical intake owners should only be retired after equivalent Evidence behavior is consolidated and independently regression-protected.

### v9.14 representative migration boundary

v9.14 closes the rest of the original Representative Tool Builder Set:

- **NetExec / nxc** covers SMB, LDAP, WinRM, FTP, and MSSQL protocol selection; anonymous, password, NT-hash, and Kerberos-cache auth shapes; common enumeration, roasting, BloodHound, LAPS, dump, and execution-check actions; and output/DNS/local-auth/continue controls.
- **Hashcat** accepts a hash or hash file, detects several common lab hash shapes, lets the operator confirm the hash mode, and builds straight or mask attacks with wordlist, rule, workload, optimized-kernel, output, and `--show` controls.
- **ffuf** covers URL/FUZZ placement, wordlists, recursion/depth, extensions, match/filter controls, repeated headers, threads, rate, and output.
- **impacket-secretsdump** covers remote password, pass-the-hash, Kerberos-cache, and local-hive modes, plus DC-only scoping and output handling.

### v9.15 John migration boundary

v9.15 adds **John the Ripper** as the next canonical cracking builder. The builder exposes common lab formats directly, including NT/NTLM, raw MD5/SHA1, md5crypt, sha512crypt, bcrypt, MSCache2, NetNTLMv1/v2, Kerberos AS-REP, and Kerberos TGS. Operators can select wordlist, incremental, or `--show` behavior, optionally enable John rules or a named rule set, and set fork workers, session name, and pot file without memorizing format or option strings.

The builder uses the same `workspace.hashfile` and `workspace.wordlist` context boundary as the existing cracking surfaces, and it is mounted automatically by the existing inventory-driven Tools/Card bridge once the John inventory record is implemented. No John-specific renderer, route, or runtime layer is introduced.

As with Hashcat, a selected format, generated command, or manual cracked outcome is only workflow activity. Reviewed cracking output is required before a recovered secret is treated as Evidence, and independent validation remains required before claiming working access.

### v9.16 Gobuster / Feroxbuster migration boundary

v9.16 completes `tb-gobuster-ferox` with one shared canonical content-discovery builder. Gobuster and Feroxbuster remain separate runnable inventory identities, but both point to the same queue item and schema record because they share the same user problem and control surface. The active Tool/Card route seeds which declared executable the builder opens with.

**Gobuster** exposes `dir`, `vhost`, and `dns` modes; URL/domain targeting; wordlist; directory extensions; allow or filter status codes; response-length filtering; repeated headers; threads; redirects/TLS handling; trailing-slash and expanded-output controls where applicable; and output file handling.

**Feroxbuster** exposes target and wordlist; repeated extension/status/size filters; repeated headers; threads; recursion on/off and depth; redirects/TLS/trailing-slash controls; rate limiting; and output file handling.

The executable selector is not a shell field. The only valid choices are fixed schema declarations for `gobuster` and `feroxbuster`; unknown selections fail generation. This keeps the shared-builder convenience inside the same no-execution and shell-safety boundary as the rest of the platform.

A generated discovery command, request count, or manually declared finding remains workflow activity. Discovered paths, hosts, subdomains, and response facts require reviewed tool output in Evidence before they become report-ready.

### v9.17 Kerberos roasting and WinRM boundaries

v9.17 completes three builders in the same stable Tool Builder implementation pass, but it does **not** classify Evil-WinRM as a Kerberos-roasting tool.

`data/product-hardening/work-packages.js` groups only **impacket-GetNPUsers** and **impacket-GetUserSPNs** as `kerberos-roast-builders`. They share the same Impacket/Kerberos problem space: domain and DC context, request/output controls, roast material, cracking handoff, and the same proof boundary between a captured ticket/hash and independently validated access.

**impacket-GetNPUsers** supports users-file and single-user sources; no-pass, password, NT-hash, and Kerberos-cache flows; domain, DC IP, and DC hostname context; request mode; Hashcat/John output format; and AS-REP output files. The users-file flow defaults to the upstream no-password pattern. Saved `$krb5asrep$` material is a cracking candidate, not a recovered credential or access fact.

**impacket-GetUserSPNs** supports password, NT-hash, and Kerberos-cache authentication; optional cross-trust target domains; list, request-all, request-user, and request-machine modes; optional users files; saved TGS hashes/tickets; RC4, stealth, and machine-only controls; and DC IP/hostname context. Saved `$krb5tgs$` material is reviewed Evidence for a roastable service ticket, not proof that a password was cracked or that service access works.

**Evil-WinRM** is a separate Windows remote-access builder. It supports password, NT-hash, and Kerberos-ticket/ccache launchers; target and username context; realm, ticket, SSL, port, WinRM URL, SPN, scripts directory, executables directory, and session logging controls. Its password and NT-hash modes are first-class, not secondary Kerberos variants. Upload/download fields are explicit post-connect planning only. They are not appended to the launcher and Obol never drives the interactive shell.

The three implementations rely on the existing conditional fields, shell-safe concatenation, and ordinary field/toggle/choice tokens. v9.17 therefore does not add a new schema version, generic renderer capability, or runtime layer.

The existing command cards remain useful readable references. When a card contains an implemented tool, the current bridge adds the canonical builder near that card rather than deleting historical guidance or creating a second proof model. Generated commands still flow through the same human-run boundary and must return to Evidence before report-ready facts exist.

The next highest-priority Tool Builder migration after v9.17 is **Certipy**. It should remain mode-driven and schema-based, with AD CS request/authentication/relay/shadow/account operations separated cleanly enough that cleanup and proof boundaries stay explicit.

## Architecture rule

Do not write a bespoke mini-app for every tool. Build one schema-driven renderer and feed it structured tool-builder data.