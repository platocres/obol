# Tool Builder Coverage

Tool Builder Coverage is the v9 product-hardening queue for giving every runnable tool/action a GUI command builder or an explicit terminal disposition.

## Goal

Every relevant point on the Path should expose the right tool through a context-aware GUI. The base command should perform the minimum useful action. Optional behavior belongs in clear toggles, switches, selectors, and fields.

## Stable platform owners

v9.12 establishes the reusable platform and v9.13 begins concrete migrations:

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

## Inventory lock

Every runnable tool identity observed in the current lane/card corpus and tool registry must resolve to one explicit inventory disposition in `data/tool-builder-inventory.js`:

- `implemented` - a schema-driven builder exists and passes the permanent contract;
- `modeled` - the tool is known and remains queued for builder work;
- `superseded` - another modeled tool/surface replaces it, with rationale;
- `rejected` - a GUI builder is intentionally inappropriate, with rationale.

Aliases normalize to one canonical identity. New command/tool data must fail validation until the inventory is updated deliberately. This prevents runnable tools from silently appearing outside builder coverage accounting.

An `implemented` inventory record that points at a Product Hardening queue item must resolve to a registered concrete builder with the same stable item ID. The permanent platform validator enforces this so inventory status cannot get ahead of actual builder ownership.

## Representative priority builders

The v9 queue seeds representative builders first so the generic schema covers the hard shapes before the full inventory is burned down:

- Nmap - **implemented in v9.13**
- NetExec / nxc
- Hashcat
- John
- ffuf
- gobuster / feroxbuster
- impacket-secretsdump
- impacket-GetNPUsers
- impacket-GetUserSPNs
- Evil-WinRM
- Certipy
- sqlmap
- curl
- chisel
- SSH / plink

### Nmap migration boundary

The v9.13 Nmap builder preserves the existing discovery-first profile behavior for host discovery, quick TCP, full TCP, service/default-script, and top-UDP scans. Targets now receives the schema-driven builder from `data/tool-builders.js` through the generic renderer, with explicit port-scope/custom-port, timing, rate/retry, script/version/OS/reason/DNS, and output controls.

The historical Nmap parser and paste/intake path remain compatibility owners for Evidence ingestion. The new form mirrors its values into that path rather than inventing a second Evidence or target-discovery implementation. Those historical intake owners should only be retired after equivalent Evidence behavior is consolidated and independently regression-protected.

The next highest-priority representative migration is NetExec / nxc. It should use the same stable owners while exercising credential-mode behavior rather than adding another custom renderer.

## Architecture rule

Do not write a bespoke mini-app for every tool. Build one schema-driven renderer and feed it structured tool-builder data.
