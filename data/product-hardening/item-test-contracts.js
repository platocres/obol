'use strict';
(function(root){
const contracts={
 'notes-conversion-rubric':{
  acceptance:['The notes-impact validator enforces that guidance-only is a justified exception: it exposes the mechanic-conversion ratio and the unjustified guidance-only backlog (modeled notes carrying neither a declared product mechanic nor an explicit guidance-only reason), requires at least one declared product mechanic, and ratchets the backlog against a frozen ceiling so new modeled notes can never raise it while notes-mechanic-backfill lowers it toward zero.'],
  validationCommands:['node tools/validate-notes-impact.js','node tools/scope-check.js','node tools/sync-product-build-next.js --check'],
  proofFiles:['tools/validate-notes-impact.js','data/product-hardening/notes-impact-current.js','docs/NOTES-IMPACT.md','README.md']
 },
 'cc-version-authority':{
  acceptance:['One stable current-release authority drives the live header, browser title, settings identity, report preview/footer metadata, export metadata, README current release, and Product Hardening Dashboard without changing the v8.8 workspace schema version.'],
  validationCommands:['node tools/validate-current-release.js','node tools/sync-current-release.js --check','node tests/run-v9.2-tests.js'],
  proofFiles:['data/current-release.js','assets/app-v8.8.js','assets/product-hardening-dashboard.js','product-hardening.html','README.md','tools/sync-current-release.js','tools/validate-current-release.js','tests/run-v9.2-tests.js']
 },
 'cc-asset-validation':{
  acceptance:['Every local asset reachable from Obol HTML entrypoints, the current runtime manifest, supported dynamic browser resource references, and CSS references resolves inside the repository; missing or repository-escaping references fail validation and release smoke CI.'],
  validationCommands:['node tools/validate-asset-references.js','node tools/release-smoke.js','node tests/run-v9.3-tests.js'],
  proofFiles:['tools/validate-asset-references.js','tools/release-smoke.js','tools/release-preflight.js','tests/run-v9.3-tests.js','docs/v9.3.md']
 },
 'cc-report-version':{
  acceptance:['Final generated report metadata and footer use the current product release from data/current-release.js, stale report-owned historical version labels are removed, workspace schema identity remains separate, and operator-provided evidence text is not rewritten.'],
  validationCommands:['node tools/validate-version-identity.js','node tools/validate-current-release.js','node tests/run-v9.4-tests.js'],
  proofFiles:['data/current-release.js','assets/app-v8.8.js','tools/validate-version-identity.js','tests/run-v9.4-tests.js','docs/v9.4.md']
 },
 'cc-link-contrast':{
  acceptance:['Current workspace and Product Hardening Dashboard links use stable dark-theme link and hover colors that meet at least WCAG AA 4.5:1 contrast against supported dark panel/background surfaces, with visible focus treatment that is not conveyed by color alone.'],
  validationCommands:['node tools/validate-accessibility-contract.js','node tests/run-v9.5-tests.js'],
  proofFiles:['assets/accessibility.css','assets/product-hardening-dashboard.css','tools/validate-accessibility-contract.js','tests/run-v9.5-tests.js','docs/visual-qa/contrast-focus.md','docs/v9.5.md']
 },
 'dash-product-foundation':{
  acceptance:['Product Hardening Dashboard renders quantified totals, Build Next, track ledger, full seeded work ledger, and private notes source status from queue data.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tests/run-v9.0-tests.js'],
  proofFiles:['product-hardening.html','assets/product-hardening-dashboard.js','assets/product-hardening-dashboard.css','data/product-hardening/product-hardening-queue.js','tests/run-v9.0-tests.js']
 },
 'readme-product-build-next':{
  acceptance:['README contains generated Product Build Next block with queue totals and highest-priority live items from product-hardening queue data.'],
  validationCommands:['node tools/sync-product-build-next.js --check','node tests/run-v9.0-tests.js'],
  proofFiles:['README.md','tools/sync-product-build-next.js','tests/run-v9.0-tests.js']
 },
 'runtime-current-entry':{
  acceptance:['index.html has one stable current browser runtime entrypoint that projects ordered styles and scripts from data/runtime-manifest.js, while tools/current-runtime.js consumes the same manifest for Node data/core loading instead of owning duplicate arrays.'],
  validationCommands:['node tools/validate-runtime-manifest.js','node tests/run-v9.6-tests.js'],
  proofFiles:['index.html','data/runtime-manifest.js','assets/runtime-current.js','tools/current-runtime.js','tools/validate-runtime-manifest.js','tests/run-v9.6-tests.js','docs/v9.6.md']
 },
 'runtime-css-consolidation':{
  acceptance:['The executable workspace runtime loads one stable non-versioned stylesheet owner from data/runtime-manifest.js. That owner is generated from the manifest-owned historical stylesheet list, imports every preserved fragment exactly once in the v9.5 cascade order, adds no competing rules of its own, and remains distinct from later request-count or bundling optimization work.'],
  validationCommands:['node tools/sync-current-styles.js --check','node tools/validate-runtime-manifest.js','node tools/validate-asset-references.js','node tests/run-v9.7-tests.js'],
  proofFiles:['data/runtime-manifest.js','assets/obol-current.css','tools/sync-current-styles.js','tools/validate-runtime-manifest.js','tools/release-preflight.js','tests/run-v9.7-tests.js','docs/v9.7.md']
 },
 'runtime-data-manifest':{
  acceptance:['The historical browser stylesheet/script order and Node current-runtime subsets are generated from one stable runtime manifest; index.html no longer hand-maintains versioned asset chains, and repository asset validation traverses every manifest-owned current and lazy asset.'],
  validationCommands:['node tools/validate-runtime-manifest.js','node tools/validate-asset-references.js','node tests/run-v9.6-tests.js'],
  proofFiles:['data/runtime-manifest.js','index.html','assets/runtime-current.js','tools/current-runtime.js','tools/validate-asset-references.js','tools/validate-runtime-manifest.js','tests/run-v9.6-tests.js']
 },
 'runtime-dashboard-owner':{
  acceptance:['Current project/product progress renders through one stable Product Hardening Dashboard owner. The v8.8 bridge delegates to assets/workflow-current.js, which embeds assets/product-hardening-dashboard.js, and no release-specific Home or Orange status panel competes with that owner in the live workflow.'],
  validationCommands:['node tools/validate-current-workflow.js','node tests/run-v9.8-tests.js'],
  proofFiles:['assets/workflow-current.js','assets/app-v8.8.js','assets/product-hardening-dashboard.js','data/runtime-manifest.js','tools/validate-current-workflow.js','tests/run-v9.8-tests.js','docs/v9.8.md']
 },
 'runtime-historical-equivalence':{
  acceptance:['A deterministic runtime equivalence gate snapshots the v9.5 ordered load contract, verifies current manifest counts and SHA-256 order fingerprints, proves manifest-backed Node initialization retains workspace schema v8.8, and runs permanently in Product Hardening preflight before historical owners may be removed.'],
  validationCommands:['node tools/validate-runtime-manifest.js','node tests/run-v9.6-tests.js'],
  proofFiles:['tests/fixtures/runtime-v9.5-load-order.json','data/runtime-manifest.js','tools/validate-runtime-manifest.js','tools/release-preflight.js','tests/run-v9.6-tests.js','docs/v9.6.md']
 },
 'runtime-lazy-load-plan':{
  acceptance:['The stable runtime manifest classifies deep surfaces by loading policy, removes route-local BloodHound/Evidence parser overlays, Nmap parser assets, report overlays, and tool-reference payloads from the default historical startup chain, and exposes route gates that load those assets on demand. Product Dashboard assets are no longer loaded on normal workspace startup. Shared methodology, lineage, and historical compatibility owners remain explicitly eager only where they are cross-route dependencies protected by the equivalence contract.'],
  validationCommands:['node tools/validate-runtime-loading.js','node tools/validate-runtime-manifest.js','node tools/validate-asset-references.js','node tests/run-v9.9-tests.js'],
  proofFiles:['data/runtime-manifest.js','assets/runtime-current.js','assets/app-v8.8.js','tools/validate-runtime-loading.js','tools/release-preflight.js','tests/run-v9.9-tests.js','docs/ARCHITECTURE.md','docs/v9.9.md']
 },
 'runtime-no-layer-rule':{
  acceptance:['Product-hardening releases do not create fake v9 runtime overlay files just to satisfy historical release shape assumptions.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tools/validate-release-pr.js --repo-only --release-version=9.0'],
  proofFiles:['tools/validate-product-hardening-queue.js','tools/validate-release-pr.js','tests/run-v9.0-tests.js']
 },
 'ux-home-user-first':{
  acceptance:['Home is rendered from engagement state and prioritizes the active context, known Evidence, queued operator intent, Evidence attention, best next move, blockers, recent activity, and report proof readiness without presenting product-build totals in its prime scan path.'],
  validationCommands:['node tools/validate-current-workflow.js','node tests/run-v9.8-tests.js'],
  proofFiles:['assets/workflow-current.js','assets/app-v8.8.js','tools/validate-current-workflow.js','tests/run-v9.8-tests.js','docs/UX-QUALITY.md','docs/v9.8.md']
 },
 'ux-build-metrics-collapse':{
  acceptance:['Product-hardening, Orange source-accounting, and release-build metrics are removed from Home and other prime workflow screens; those metrics remain discoverable in Product Dashboard while the normal workflow retains only engagement-state metrics.'],
  validationCommands:['node tools/validate-current-workflow.js','node tests/run-v9.8-tests.js'],
  proofFiles:['assets/workflow-current.js','assets/app-v8.8.js','assets/product-hardening-dashboard.js','tools/validate-current-workflow.js','tests/run-v9.8-tests.js','docs/UX-QUALITY.md']
 },
 'ux-build-next-top':{
  acceptance:['Dashboard top area presents progress figures and Product Build Next before detailed ledgers.'],
  validationCommands:['node tests/run-v9.0-tests.js'],
  proofFiles:['assets/product-hardening-dashboard.js','product-hardening.html']
 },
 'ux-nav-dashboard':{
  acceptance:['Product Dashboard is exposed as a clearly labeled secondary navigation destination while the five-item primary operator loop remains Home, Targets, Evidence, Next Steps, and Report.'],
  validationCommands:['node tools/validate-current-workflow.js','node tests/run-v9.8-tests.js'],
  proofFiles:['assets/workflow-current.js','assets/core-v3.0.js','tools/validate-current-workflow.js','tests/run-v9.8-tests.js','docs/v9.8.md']
 },
 'ux-path-clarity':{
  acceptance:['Next Steps exposes an explicit decision brief that makes the best next move, downstream unlock count, queued operator intent, and blocker count/detail visible together while preserving the existing evidence-ranked recommendation engine.'],
  validationCommands:['node tools/validate-current-workflow.js','node tests/run-v9.8-tests.js'],
  proofFiles:['assets/workflow-current.js','assets/core-v3.4.js','assets/app-v3.4.js','tools/validate-current-workflow.js','tests/run-v9.8-tests.js','docs/UX-QUALITY.md','docs/v9.8.md']
 },
 'ux-progressive-notes':{
  acceptance:['Normalized public field-note records use a stable typed data contract, are matched only to relevant card/tool/path context, render as collapsed expandable Field notes disclosure near the action context, remain absent when no relevant normalized guidance exists, and never require raw private ENEX content in the public repository.'],
  validationCommands:['node tools/validate-field-notes-ui.js','node tools/validate-asset-references.js','node tests/run-v9.10-tests.js'],
  proofFiles:['data/field-notes.js','assets/field-notes.js','assets/field-notes.css','assets/app-v8.8.js','tools/validate-field-notes-ui.js','tests/run-v9.10-tests.js','docs/NOTES-INTEGRATION.md','docs/UX-QUALITY.md','docs/v9.10.md']
 },
 'ux-mobile-density':{
  acceptance:['The current workspace and Product Hardening Dashboard remain usable at narrow-laptop, exam-split, tablet, and mobile widths: dense grids collapse before clipping, intentionally wide tabs and tables contain their own horizontal overflow, commands/forms/modals remain reachable, field-note disclosure stays anchored, and the page does not hide overflow globally to mask layout defects.'],
  validationCommands:['node tools/validate-responsive-layout.js','node tools/validate-asset-references.js','node tests/run-v9.11-tests.js'],
  proofFiles:['assets/responsive-current.css','assets/product-hardening-dashboard.css','assets/field-notes.css','assets/app-v8.8.js','tools/validate-responsive-layout.js','tests/fixtures/responsive-v9.11-viewports.json','docs/visual-qa/responsive-density.md','tests/run-v9.11-tests.js','docs/UX-QUALITY.md','docs/v9.11.md']
 },
 'ux-keyboard-focus':{
  acceptance:['Native controls and existing non-native interactive workspace surfaces expose a clearly visible focus-visible ring; card headers, state cards, phase/toggle chips, facts, progress/timer controls, and lane tabs are keyboard reachable and activate with Enter or Space; open modals receive dialog semantics, initial focus, contained Tab order, and focus restoration on close.'],
  validationCommands:['node tools/validate-accessibility-contract.js','node tests/run-v9.5-tests.js'],
  proofFiles:['assets/accessibility.css','assets/accessibility.js','assets/app-v8.8.js','tools/validate-accessibility-contract.js','tests/run-v9.5-tests.js','docs/visual-qa/contrast-focus.md','docs/v9.5.md']
 },
 'tb-schema':{
  acceptance:['A stable non-versioned Tool Builder schema defines typed fields, target/workspace autofill, execution context, credential-mode declarations, deterministic command tokens, Evidence expectations, manual-outcome boundaries, and report-lineage requirements; invalid or auto-executing builder definitions are rejected.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.12-tests.js'],
  proofFiles:['data/tool-builder-schema.js','tools/validate-tool-builder-platform.js','tests/run-v9.12-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.12.md']
 },
 'tb-renderer':{
  acceptance:['One generic browser renderer consumes Tool Builder schema records, applies context autofill, renders labeled accessible controls, generates a deterministic shell command preview with shell-safe quoting, supports copy-only operator handoff, and contains no command-execution primitive.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.12-tests.js'],
  proofFiles:['assets/tool-builder-current.js','data/tool-builder-schema.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.12-tests.js','docs/v9.12.md']
 },
 'tb-nmap':{
  acceptance:['Targets renders the canonical schema-driven Nmap launchpad with discovery/quick/full/service/UDP profiles, explicit port scope and custom-port override, timing/rate/retry/script/version/OS/reason/DNS/output controls, deterministic copy-only command generation, and preserved historical Nmap Evidence ingestion without creating a competing proof owner.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.13-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','assets/app-v3.1.js','assets/nmap-v3.1.js','tools/validate-tool-builder-platform.js','tests/run-v9.13-tests.js','docs/v9.13.md']
 },
 'tb-nxc':{
  acceptance:['Tool and relevant Card routes expose one schema-driven NetExec builder with explicit protocol, anonymous/password/NT-hash/Kerberos-cache authentication, target/domain/user context, common enumeration/roasting/dumping/execution-check actions, output controls, secret-safe inputs, and a strict Evidence proof boundary.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.14-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.14-tests.js','docs/v9.14.md']
 },
 'tb-hashcat':{
  acceptance:['Tool and relevant Card routes expose one schema-driven Hashcat builder that detects common structured lab hash shapes when confident, allows explicit mode confirmation, supports straight/mask attacks, wordlists, rules, workload, optimized kernels, output/show modes, and keeps recovered material unproven until reviewed and independently validated for access.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.14-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.14-tests.js','docs/v9.14.md']
 },
 'tb-john':{
  acceptance:['Tool and relevant Card routes expose one schema-driven John the Ripper builder with explicit common lab hash formats, wordlist/incremental/show actions, optional rules/rule set, fork/session/pot controls, workspace hash/wordlist autofill, deterministic shell-safe command generation, and an Evidence boundary that keeps recovered material unproven until reviewed and independently validated for access.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.15-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.15-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.15.md']
 },
 'tb-ffuf':{
  acceptance:['Tool and relevant Card routes expose one schema-driven ffuf builder with explicit FUZZ URL, wordlist, recursion/depth, extensions, match/filter controls, repeated headers, concurrency/rate, output handling, and reviewed-response Evidence boundaries.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.14-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.14-tests.js','docs/v9.14.md']
 },
 'tb-gobuster-ferox':{
  acceptance:['Tool and relevant Card routes expose one canonical schema-driven content-discovery builder shared by Gobuster and Feroxbuster. The builder uses a declared executable selector rather than user-controlled command text; covers Gobuster dir/vhost/dns modes plus Feroxbuster recursion/depth behavior; exposes target, wordlist, extensions, allow/filter status controls, response-size filters, repeated headers, threads, redirect/TLS/slash options, rate/output controls where supported; seeds the selected engine from the active tool route; and preserves the reviewed-Evidence proof boundary.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.16-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.16-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.16.md']
 },
 'tb-secretsdump':{
  acceptance:['Tool and relevant Card routes expose one schema-driven impacket-secretsdump builder with remote password, NT-hash, Kerberos-cache, and local-hive modes, explicit domain/user/target and DC scope controls, output handling, secret-safe fields, and proof boundaries that do not infer privilege or recovered credentials from command generation alone.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.14-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','tools/validate-tool-builder-platform.js','tests/run-v9.14-tests.js','docs/v9.14.md']
 },
 'tb-getnpusers':{
  acceptance:['Tool and relevant Card routes expose one schema-driven impacket-GetNPUsers builder with users-file and single-user sources, explicit no-pass/password/NT-hash/Kerberos-cache flows, domain/DC targeting, request and Hashcat/John output controls, deterministic copy-only generation, and an AS-REP handoff boundary that requires reviewed output before hash or credential claims.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.17-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','tests/run-v9.17-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.17.md']
 },
 'tb-getuserspns':{
  acceptance:['Tool and relevant Card routes expose one schema-driven impacket-GetUserSPNs builder with password, NT-hash, and Kerberos-cache auth, cross-trust target-domain/DC controls, list/request-all/request-user/request-machine modes, users-file, save/output, RC4/stealth/machine controls, deterministic copy-only generation, and a TGS cracking handoff that remains unproven until reviewed and independently validated.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.17-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','tests/run-v9.17-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.17.md']
 },
 'tb-evilwinrm':{
  acceptance:['Tool and relevant Card routes expose one schema-driven Evil-WinRM launcher with password, NT-hash, and Kerberos-ticket modes; target/user context; realm/ticket, SSL, port, scripts, executables, URL, SPN, and logging controls; explicit upload/download planning without auto-running interactive commands; deterministic copy-only generation; and an Evidence boundary that requires reviewed connection/output before access or transfer claims.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.17-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','data/product-hardening/work-packages.js','tests/run-v9.17-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.17.md']
 },
 'tb-certipy':{
  acceptance:['Tool and relevant Card routes expose one schema-driven Certipy builder with explicit find, req, auth, relay, shadow, and account workflows; password, NT-hash, Kerberos-cache, and certificate inputs where supported; target/DC/DNS context; mode-specific certificate/template/SAN/output controls; relay listener controls; shadow and account cleanup actions; deterministic copy-only command generation; and proof boundaries that require reviewed output before AD CS, certificate, credential, privilege, cleanup, or access claims.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.18-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','tests/run-v9.18-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.18.md']
 },
 'tb-sqlmap':{
  acceptance:['Tool and relevant Card routes expose one schema-driven sqlmap builder with URL and raw-request-file input modes; explicit parameter, method/body, cookie/header, level/risk, DBMS, technique, tamper, proxy, timing/retry, output/session, and conservative follow-up action controls; deterministic copy-only command generation; secret-safe request material; and proof boundaries that require reviewed returned output before injection, DBMS, schema/data-access, privilege, or compromise claims.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.19-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','tests/run-v9.19-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.19.md']
 },
 'tb-curl':{
  acceptance:['Tool and relevant Card routes expose one schema-driven curl builder with explicit URL and request method controls; repeated headers; cookie and request-body inputs; Basic, NTLM, and OAuth2 bearer authentication; proxy and optional proxy credentials; raw/binary and multipart upload modes; redirect, TLS, compression, timeout, output, response-header, status, verbose, and failure controls; deterministic copy-only command generation; secret-aware report lineage; and proof boundaries that require reviewed returned output before HTTP, authentication, transfer, or application-state claims.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.20-tests.js'],
  proofFiles:['data/tool-builders.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','assets/app-v8.8.js','data/product-hardening/product-hardening-queue.js','tests/run-v9.20-tests.js','docs/TOOL-BUILDER-COVERAGE.md','docs/v9.20.md']
 },
 'tb-tool-inventory-lock':{
  acceptance:['Every runnable tool identity observed in the current lane/card command corpus and tool registry resolves through one explicit stable inventory disposition. New tool identities fail validation until they are explicitly implemented, modeled, superseded, or rejected with rationale, and aliases normalize to one canonical identity.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.12-tests.js'],
  proofFiles:['data/tool-builder-inventory.js','data/tool-builder-schema.js','data/lanes.js','data/tools-v2.2.js','tools/validate-tool-builder-platform.js','tests/run-v9.12-tests.js','docs/TOOL-BUILDER-COVERAGE.md']
 },
 'notes-private-source-pointer':{
  acceptance:['Public Obol points future agents to platocres/obol-source-notes and preserves the private raw-note boundary.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tests/run-v9.0-tests.js'],
  proofFiles:['README.md','docs/NOTES-INTEGRATION.md','data/product-hardening/product-hardening-queue.js']
 },
 'notes-source-inventory':{
  acceptance:['Product-hardening queue accounts for 556 notes and 1326 embedded resources without committing raw ENEX files.'],
  validationCommands:['node tools/validate-product-hardening-queue.js','node tests/run-v9.0-tests.js'],
  proofFiles:['data/product-hardening/product-hardening-queue.js','tools/validate-product-hardening-queue.js','tests/run-v9.0-tests.js']
 },
 'perf-bundle-budget':{
  acceptance:['The runtime manifest carries a deterministic startup/deferred request budget tied to the frozen 327-script v9.5 compatibility baseline. Default workspace startup executes no more than 266 historical scripts and defers at least 61 route-local historical scripts; normal startup also avoids Product Dashboard queue/package/renderer assets. The budget is permanently validated so later releases cannot silently move deferred groups back into startup.'],
  validationCommands:['node tools/validate-runtime-loading.js','node tools/validate-runtime-manifest.js','node tests/run-v9.9-tests.js'],
  proofFiles:['data/runtime-manifest.js','assets/runtime-current.js','assets/app-v8.8.js','tools/validate-runtime-loading.js','tools/release-preflight.js','tests/run-v9.9-tests.js','docs/PRODUCT-HARDENING.md','docs/v9.9.md']
 },
 'qa-version-test':{
  acceptance:['A permanent deterministic version-identity gate proves browser title/header/settings, report metadata/footer normalization, README/dashboard release presentation, and sanitized export metadata consume the same current product release while preserving the v8.8 workspace schema identity.'],
  validationCommands:['node tools/validate-version-identity.js','node tools/validate-current-release.js','node tests/run-v9.4-tests.js'],
  proofFiles:['tools/validate-version-identity.js','tools/validate-current-release.js','tools/release-preflight.js','tests/run-v9.4-tests.js','data/current-release.js','assets/app-v8.8.js']
 },
 'qa-contrast-test':{
  acceptance:['A permanent deterministic accessibility validator calculates link/hover contrast against supported dark surfaces, verifies focus-visible and forced-colors contracts, verifies keyboard activation/modal focus management, and requires a screenshot-assisted visual QA checklist covering representative routes and viewport sizes.'],
  validationCommands:['node tools/validate-accessibility-contract.js','node tests/run-v9.5-tests.js'],
  proofFiles:['tools/validate-accessibility-contract.js','assets/accessibility.css','assets/accessibility.js','assets/product-hardening-dashboard.css','docs/visual-qa/contrast-focus.md','tests/run-v9.5-tests.js']
 },
 'qa-dashboard-sync':{
  acceptance:['Dashboard renderer consumes queue totals, track summary, Build Next, and notes repo data from one queue source.'],
  validationCommands:['node tests/run-v9.0-tests.js'],
  proofFiles:['assets/product-hardening-dashboard.js','data/product-hardening/product-hardening-queue.js']
 },
 'qa-asset-test':{
  acceptance:['Referenced scripts and stylesheets are validated so missing product-hardening assets fail CI.'],
  validationCommands:['node tools/validate-asset-references.js','node tests/run-v9.0-tests.js'],
  proofFiles:['tools/validate-asset-references.js','product-hardening.html','tests/run-v9.0-tests.js']
 },
 'qa-builder-contract-test':{
  acceptance:['A permanent Tool Builder contract gate validates every implemented builder against schema, rendering, command generation, Evidence expectations, manual-outcome boundaries, report lineage, inventory coverage, alias normalization, and the human-run no-execution rule. The gate includes a synthetic fixture so the platform is testable before representative builders are migrated.'],
  validationCommands:['node tools/validate-tool-builder-platform.js','node tests/run-v9.12-tests.js'],
  proofFiles:['tools/validate-tool-builder-platform.js','data/tool-builder-schema.js','data/tool-builder-inventory.js','assets/tool-builder-current.js','tests/run-v9.12-tests.js','tools/release-preflight.js','docs/v9.12.md']
 },
 'qa-release-contract-v9':{
  acceptance:['Release contract validator understands post-Orange product-hardening releases and protects against fake runtime overlays.'],
  validationCommands:['node tools/validate-release-pr.js --repo-only --release-version=9.0','node tests/run-v9.0-tests.js'],
  proofFiles:['tools/validate-release-pr.js','tests/run-v9.0-tests.js']
 }
};
const requiredForStatuses=['modeled','complete','superseded','rejected'];
root.OBOL_PRODUCT_HARDENING_TEST_CONTRACTS={version:'9.20.0',requiredForStatuses,contracts};
})(typeof window!=='undefined'?window:globalThis);