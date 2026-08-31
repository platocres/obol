# Tool Builder Coverage

Tool Builder Coverage is the v9 product-hardening queue for giving every runnable tool/action a GUI command builder or an explicit terminal disposition.

## Goal

Every relevant point on the Path should expose the right tool through a context-aware GUI. The base command should perform the minimum useful action. Optional behavior belongs in clear toggles, switches, selectors, and fields.

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

## Representative priority builders

The v9.0 queue seeds representative builders first so the generic schema covers the hard shapes before the full inventory is burned down:

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

## Architecture rule

Do not write a bespoke mini-app for every tool. Build one schema-driven renderer and feed it structured tool-builder data.
