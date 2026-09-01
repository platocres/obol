# Tool Builder Coverage

Tool Builder Coverage is the v9 product-hardening queue for giving every runnable tool/action a GUI command builder or an explicit terminal disposition.

## Goal

Every relevant point on the Path should expose the right tool through a context-aware GUI. The base command should perform the minimum useful action. Optional behavior belongs in clear toggles, switches, selectors, and fields.

## Stable platform owners

v9.12 establishes the reusable platform before representative builders are migrated:

- `data/tool-builder-schema.js` owns the stable builder data contract and registry helpers;
- `assets/tool-builder-current.js` owns generic accessible rendering, context autofill, shell-safe command generation, and copy-only operator handoff;
- `data/tool-builder-inventory.js` owns explicit runnable-tool dispositions and alias normalization;
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

## Inventory lock

Every runnable tool identity observed in the current lane/card corpus and tool registry must resolve to one explicit inventory disposition in `data/tool-builder-inventory.js`:

- `implemented` - a schema-driven builder exists and passes the permanent contract;
- `modeled` - the tool is known and remains queued for builder work;
- `superseded` - another modeled tool/surface replaces it, with rationale;
- `rejected` - a GUI builder is intentionally inappropriate, with rationale.

Aliases normalize to one canonical identity. New command/tool data must fail validation until the inventory is updated deliberately. This prevents runnable tools from silently appearing outside builder coverage accounting.

## Representative priority builders

The v9 queue seeds representative builders first so the generic schema covers the hard shapes before the full inventory is burned down:

- Nmap
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

After the v9.12 platform milestone, the next representative package begins with the existing Nmap command-builder behavior. Migrate behavior into the generic schema without losing presets, dynamic switches, context-aware suggestions, output handling, or existing regression coverage.

## Architecture rule

Do not write a bespoke mini-app for every tool. Build one schema-driven renderer and feed it structured tool-builder data.
