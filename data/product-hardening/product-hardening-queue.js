'use strict';
(function(root){
const tracks = [
  {
    "id": "critical-correctness",
    "label": "Critical correctness",
    "goal": "Fix defects that undermine trust in the app or generated reports.",
    "complete": 0,
    "total": 4
  },
  {
    "id": "architecture-runtime",
    "label": "Architecture / runtime",
    "goal": "Compact the sedimentary runtime without breaking historical behavior.",
    "complete": 0,
    "total": 10
  },
  {
    "id": "ui-ux",
    "label": "UI / UX repair",
    "goal": "Make the primary workflow user-first and keep build metrics in dashboard surfaces.",
    "complete": 0,
    "total": 8
  },
  {
    "id": "tool-builders",
    "label": "Tool GUI builders",
    "goal": "Every runnable tool/action gets a schema-driven GUI builder or explicit supersession.",
    "complete": 0,
    "total": 18
  },
  {
    "id": "credential-modes",
    "label": "Credential modes",
    "goal": "Credential-heavy builders expose clear password/hash/ticket/cert/key mode selection.",
    "complete": 0,
    "total": 14
  },
  {
    "id": "manual-outcomes",
    "label": "Manual outcomes",
    "goal": "Every executable action can be marked successful, failed, blocked, or skipped without corrupting proof.",
    "complete": 0,
    "total": 8
  },
  {
    "id": "notes-integration",
    "label": "Notes integration",
    "goal": "Atomize Brandon's HTB and OffSec source notes into normalized Obol guidance.",
    "complete": 0,
    "total": 556
  },
  {
    "id": "offline-performance",
    "label": "Offline / performance",
    "goal": "Use browser-native caching, storage, and worker features without install prompts.",
    "complete": 0,
    "total": 6
  },
  {
    "id": "testing-qa",
    "label": "Testing / visual QA",
    "goal": "Make broken assets, version drift, route failures, and contrast regressions hard to ship.",
    "complete": 0,
    "total": 8
  }
];
const items = [
  {
    "id": "cc-version-authority",
    "track": "critical-correctness",
    "status": "queued",
    "priority": 1,
    "label": "Create one version authority",
    "detail": "Header, title, settings, report preview, report footer, export metadata, README, and dashboard must consume one current-version source."
  },
  {
    "id": "cc-asset-validation",
    "track": "critical-correctness",
    "status": "queued",
    "priority": 2,
    "label": "Validate every referenced asset",
    "detail": "Parse HTML entrypoints and fail CI when any script, stylesheet, or static asset reference is missing."
  },
  {
    "id": "cc-report-version",
    "track": "critical-correctness",
    "status": "queued",
    "priority": 3,
    "label": "Normalize report version identity",
    "detail": "Generated report text and footers must not retain stale historical version strings."
  },
  {
    "id": "cc-link-contrast",
    "track": "critical-correctness",
    "status": "queued",
    "priority": 4,
    "label": "Fix dark-theme link contrast",
    "detail": "Dark-blue links on dark panels need readable contrast, hover, and focus states."
  },
  {
    "id": "dash-product-foundation",
    "track": "architecture-runtime",
    "status": "modeled",
    "priority": 5,
    "label": "Product Hardening Dashboard foundation",
    "detail": "v9.0 creates the single quantified dashboard and queue model for the product-hardening phase."
  },
  {
    "id": "readme-product-build-next",
    "track": "architecture-runtime",
    "status": "modeled",
    "priority": 6,
    "label": "Generated README Product Build Next",
    "detail": "README contains a generated product-hardening block fed from the same queue data as the dashboard."
  },
  {
    "id": "runtime-current-entry",
    "track": "architecture-runtime",
    "status": "queued",
    "priority": 7,
    "label": "Current runtime entrypoint",
    "detail": "Move toward one current browser entrypoint and one current Node loader boundary instead of expanding historical load arrays forever."
  },
  {
    "id": "runtime-css-consolidation",
    "track": "architecture-runtime",
    "status": "queued",
    "priority": 8,
    "label": "CSS ownership consolidation",
    "detail": "Collapse active styling into a small current set while preserving regressions for historical behavior."
  },
  {
    "id": "runtime-data-manifest",
    "track": "architecture-runtime",
    "status": "queued",
    "priority": 9,
    "label": "Asset manifest and generated load order",
    "detail": "Generate asset references from a manifest instead of hand-editing long script/link chains."
  },
  {
    "id": "runtime-dashboard-owner",
    "track": "architecture-runtime",
    "status": "queued",
    "priority": 10,
    "label": "Dashboard ownership consolidation",
    "detail": "Keep one dashboard owner for project/product progress and avoid release-specific competing status panels."
  },
  {
    "id": "runtime-historical-equivalence",
    "track": "architecture-runtime",
    "status": "queued",
    "priority": 11,
    "label": "Historical regression equivalence harness",
    "detail": "Before deleting old layers, prove current and historical observable contracts are unchanged."
  },
  {
    "id": "runtime-lazy-load-plan",
    "track": "architecture-runtime",
    "status": "queued",
    "priority": 12,
    "label": "Lazy-load deep engineering views",
    "detail": "Move heavy dashboard, methodology, tool library, lineage, and historical surfaces behind deliberate loading boundaries."
  },
  {
    "id": "runtime-no-layer-rule",
    "track": "architecture-runtime",
    "status": "modeled",
    "priority": 13,
    "label": "No new layered queue architecture",
    "detail": "Queue data is stable and non-versioned; releases update data instead of adding endless product-hardening-vX files."
  },
  {
    "id": "ux-home-user-first",
    "track": "ui-ux",
    "status": "queued",
    "priority": 20,
    "label": "Make Home user-first",
    "detail": "Home should prioritize active target, known facts, queued intent, evidence needing review, best next move, and proof readiness."
  },
  {
    "id": "ux-build-metrics-collapse",
    "track": "ui-ux",
    "status": "queued",
    "priority": 21,
    "label": "Move build metrics out of prime workflow",
    "detail": "Source accounting and product-hardening metrics belong in the dashboard/About surfaces, not the main box workflow."
  },
  {
    "id": "ux-build-next-top",
    "track": "ui-ux",
    "status": "modeled",
    "priority": 22,
    "label": "Keep Build Next near dashboard top",
    "detail": "Dashboard top must show quantified progress and the highest-priority live queue before detail ledgers."
  },
  {
    "id": "ux-nav-dashboard",
    "track": "ui-ux",
    "status": "queued",
    "priority": 23,
    "label": "Expose dashboard clearly in navigation",
    "detail": "Make the master dashboard easy to find from normal site navigation without cluttering the primary operator loop."
  },
  {
    "id": "ux-path-clarity",
    "track": "ui-ux",
    "status": "queued",
    "priority": 24,
    "label": "Improve Path clarity",
    "detail": "Path should make the best next move, unlocks, queued actions, and blockers obvious."
  },
  {
    "id": "ux-progressive-notes",
    "track": "ui-ux",
    "status": "queued",
    "priority": 25,
    "label": "Design contextual field-notes disclosure",
    "detail": "Notes should appear as expandable relevant context, not as a dumped notebook."
  },
  {
    "id": "ux-mobile-density",
    "track": "ui-ux",
    "status": "queued",
    "priority": 26,
    "label": "Review responsive density",
    "detail": "Check dashboard and builders on small screens, narrow laptops, and exam-like layouts."
  },
  {
    "id": "ux-keyboard-focus",
    "track": "ui-ux",
    "status": "queued",
    "priority": 27,
    "label": "Keyboard and focus pass",
    "detail": "Command builders, toggles, outcome controls, modals, and dashboard drilldowns need clear focus behavior."
  },
  {
    "id": "tb-schema",
    "track": "tool-builders",
    "status": "queued",
    "priority": 30,
    "label": "Define Tool Builder schema",
    "detail": "A data-driven schema must describe inputs, toggles, target autofill, credential modes, output options, evidence expectations, and report lineage."
  },
  {
    "id": "tb-renderer",
    "track": "tool-builders",
    "status": "queued",
    "priority": 31,
    "label": "Build generic Tool Builder renderer",
    "detail": "One renderer should power tool GUIs instead of custom JavaScript per tool."
  },
  {
    "id": "tb-nmap",
    "track": "tool-builders",
    "status": "queued",
    "priority": 32,
    "label": "Nmap GUI builder",
    "detail": "Targets view gets a canonical Nmap launchpad with toggles for ports, scripts, timing, output files, discovery, and canonical scan profiles."
  },
  {
    "id": "tb-nxc",
    "track": "tool-builders",
    "status": "queued",
    "priority": 33,
    "label": "NetExec / nxc builder hardening",
    "detail": "Use the existing nxc work as the pattern for credential-aware builders across the app."
  },
  {
    "id": "tb-hashcat",
    "track": "tool-builders",
    "status": "queued",
    "priority": 34,
    "label": "Hashcat builder with hash detection",
    "detail": "User can paste a hash, select/confirm type, and generate the correct minimal command plus optional rules/workload toggles."
  },
  {
    "id": "tb-john",
    "track": "tool-builders",
    "status": "queued",
    "priority": 35,
    "label": "John builder with format selection",
    "detail": "Support common lab formats and wordlist/rule toggles without requiring users to memorize format strings."
  },
  {
    "id": "tb-ffuf",
    "track": "tool-builders",
    "status": "queued",
    "priority": 36,
    "label": "ffuf builder",
    "detail": "Make URL, wordlist, recursion, extensions, filters, matchers, headers, and output explicit controls."
  },
  {
    "id": "tb-gobuster-ferox",
    "track": "tool-builders",
    "status": "queued",
    "priority": 37,
    "label": "gobuster / feroxbuster builders",
    "detail": "Directory/content enumeration builders need mode, extensions, status filters, threads, recursion, and output controls."
  },
  {
    "id": "tb-secretsdump",
    "track": "tool-builders",
    "status": "queued",
    "priority": 38,
    "label": "impacket-secretsdump builder",
    "detail": "Expose password/hash/kerberos/local auth modes, target/DC context, output handling, and proof boundaries."
  },
  {
    "id": "tb-getnpusers",
    "track": "tool-builders",
    "status": "queued",
    "priority": 39,
    "label": "GetNPUsers builder",
    "detail": "Support username sources, no-pass flow, DC/domain inputs, output file, and AS-REP hash handoff."
  },
  {
    "id": "tb-getuserspns",
    "track": "tool-builders",
    "status": "queued",
    "priority": 40,
    "label": "GetUserSPNs builder",
    "detail": "Support auth modes, request mode, target domain/DC, output file, and TGS cracking handoff."
  },
  {
    "id": "tb-evilwinrm",
    "track": "tool-builders",
    "status": "queued",
    "priority": 41,
    "label": "Evil-WinRM builder",
    "detail": "Expose password, NT hash, SSL, scripts, uploads/downloads, and target context cleanly."
  },
  {
    "id": "tb-certipy",
    "track": "tool-builders",
    "status": "queued",
    "priority": 42,
    "label": "Certipy builder",
    "detail": "AD CS workflows need mode-specific controls for find, req, auth, relay, shadow, account updates, and cleanup."
  },
  {
    "id": "tb-sqlmap",
    "track": "tool-builders",
    "status": "queued",
    "priority": 43,
    "label": "sqlmap builder",
    "detail": "Support request files, URL params, cookies, risk/level, DBMS hints, tamper scripts, and safe output handling."
  },
  {
    "id": "tb-curl",
    "track": "tool-builders",
    "status": "queued",
    "priority": 44,
    "label": "curl builder",
    "detail": "Headers, cookies, body, proxy, method, auth, uploads, and output options should be explicit toggles/fields."
  },
  {
    "id": "tb-chisel",
    "track": "tool-builders",
    "status": "queued",
    "priority": 45,
    "label": "chisel builder",
    "detail": "Expose client/server roles, reverse mode, SOCKS, remotes, ports, and cleanup guidance."
  },
  {
    "id": "tb-ssh-plink",
    "track": "tool-builders",
    "status": "queued",
    "priority": 46,
    "label": "SSH / plink tunnel builders",
    "detail": "Create guided local, remote, and dynamic forwarding builders with Windows/Kali execution context."
  },
  {
    "id": "tb-tool-inventory-lock",
    "track": "tool-builders",
    "status": "queued",
    "priority": 47,
    "label": "Generate complete tool-builder inventory",
    "detail": "Derive the full tool/action list and require a modeled, superseded, or rejected disposition for every runnable tool."
  },
  {
    "id": "cred-schema",
    "track": "credential-modes",
    "status": "queued",
    "priority": 50,
    "label": "Credential Material schema",
    "detail": "Represent passwords, hashes, tickets, certificates, keys, cookies, and tokens as first-class typed materials."
  },
  {
    "id": "cred-password",
    "track": "credential-modes",
    "status": "queued",
    "priority": 51,
    "label": "Password mode controls",
    "detail": "Standard username/password inputs and escaping rules across all relevant builders."
  },
  {
    "id": "cred-ntlm",
    "track": "credential-modes",
    "status": "queued",
    "priority": 52,
    "label": "NT hash and LM:NT mode controls",
    "detail": "Correct flags for tools that support pass-the-hash or LM:NT pair input."
  },
  {
    "id": "cred-netntlm",
    "track": "credential-modes",
    "status": "queued",
    "priority": 53,
    "label": "NetNTLMv1/v2 detection",
    "detail": "Pasted challenge-response hashes should route to appropriate cracking builders and modes."
  },
  {
    "id": "cred-kerberos-hashes",
    "track": "credential-modes",
    "status": "queued",
    "priority": 54,
    "label": "Kerberos TGS / AS-REP detection",
    "detail": "Identify common TGS and AS-REP hash shapes and select correct cracking modes."
  },
  {
    "id": "cred-mscache2",
    "track": "credential-modes",
    "status": "queued",
    "priority": 55,
    "label": "MSCache2 mode support",
    "detail": "Support domain cached credential hash workflows."
  },
  {
    "id": "cred-ccache-kirbi",
    "track": "credential-modes",
    "status": "queued",
    "priority": 56,
    "label": "ccache / kirbi controls",
    "detail": "Ticket-based builders should expose KRB5CCNAME, ticket conversion, and service-use expectations."
  },
  {
    "id": "cred-pfx-cert",
    "track": "credential-modes",
    "status": "queued",
    "priority": 57,
    "label": "PFX / certificate controls",
    "detail": "Certificate auth workflows need PFX/password, cert/key, UPN/domain/DC, and output lineage controls."
  },
  {
    "id": "cred-ssh-key",
    "track": "credential-modes",
    "status": "queued",
    "priority": 58,
    "label": "SSH key controls",
    "detail": "Support identity file paths, passphrase notes, target user, ports, and tunnel workflows."
  },
  {
    "id": "cred-cookie-token",
    "track": "credential-modes",
    "status": "queued",
    "priority": 59,
    "label": "Cookie / token controls",
    "detail": "Web tooling should expose cookies, bearer tokens, API keys, headers, and secret-redaction boundaries."
  },
  {
    "id": "cred-hash-routing",
    "track": "credential-modes",
    "status": "queued",
    "priority": 60,
    "label": "Paste hash and route builder",
    "detail": "A pasted hash should produce likely type, compatible builders, and minimum command suggestions."
  },
  {
    "id": "cred-validation-boundary",
    "track": "credential-modes",
    "status": "queued",
    "priority": 61,
    "label": "Credential validation proof boundary",
    "detail": "Recovered material remains candidate material until an independent validation action proves access."
  },
  {
    "id": "cred-report-redaction",
    "track": "credential-modes",
    "status": "queued",
    "priority": 62,
    "label": "Credential report redaction consistency",
    "detail": "Reports and exports must keep secrets redacted unless explicitly included."
  },
  {
    "id": "cred-cross-tool-handshake",
    "track": "credential-modes",
    "status": "queued",
    "priority": 63,
    "label": "Credential handoff between tools",
    "detail": "Cracked or captured material should populate compatible builders without forcing manual re-entry."
  },
  {
    "id": "manual-schema",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 70,
    "label": "Manual Outcome schema",
    "detail": "Define success, failed, blocked, skipped, and tried as workflow states separate from proof states."
  },
  {
    "id": "manual-ui",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 71,
    "label": "Manual Outcome UI controls",
    "detail": "Cards should offer Mark successful, Mark failed, Mark blocked, and Mark skipped beside paste-output review."
  },
  {
    "id": "manual-success-unlocks",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 72,
    "label": "Manual success unlocks next steps",
    "detail": "A user-declared success can unlock expected next actions while carrying a needs-evidence-for-report badge."
  },
  {
    "id": "manual-failure-triage",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 73,
    "label": "Manual failure triage",
    "detail": "Failure outcomes should support reasons like auth failed, timeout, no results, syntax issue, blocked, and not vulnerable."
  },
  {
    "id": "manual-proof-report",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 74,
    "label": "Report proof handling for manual assertions",
    "detail": "Manual assertions must be visible in reports as unproven until supporting Evidence is attached."
  },
  {
    "id": "manual-queue-interaction",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 75,
    "label": "Queue interaction for manual outcomes",
    "detail": "Queued human intent should survive dynamic Path reordering and outcome changes."
  },
  {
    "id": "manual-tests",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 76,
    "label": "Manual outcome regression tests",
    "detail": "Tests must prove manual success advances workflow but does not create report-ready proof."
  },
  {
    "id": "manual-all-cards",
    "track": "manual-outcomes",
    "status": "queued",
    "priority": 77,
    "label": "Manual outcome coverage for all executable actions",
    "detail": "Every runnable card must have an outcome disposition or explicit supersession."
  },
  {
    "id": "notes-private-source-pointer",
    "track": "notes-integration",
    "status": "modeled",
    "priority": 80,
    "label": "Private notes source pointer",
    "detail": "Public Obol points future agents to private repo platocres/obol-source-notes for raw ENEX material."
  },
  {
    "id": "notes-source-inventory",
    "track": "notes-integration",
    "status": "modeled",
    "priority": 81,
    "label": "Notes source inventory",
    "detail": "Private source repo currently accounts for 556 notes across HTB Penetration Tester and OffSec PEN-200 exports."
  },
  {
    "id": "notes-enex-extraction",
    "track": "notes-integration",
    "status": "queued",
    "priority": 82,
    "label": "ENEX extraction pipeline",
    "detail": "Use private source repo scripts to extract note metadata and candidates into normalized Obol-safe records."
  },
  {
    "id": "notes-atomization-schema",
    "track": "notes-integration",
    "status": "queued",
    "priority": 83,
    "label": "Note atomization schema",
    "detail": "Each note must yield candidate lessons, tool bindings, path bindings, troubleshooting, evidence, report guidance, or a terminal rejection."
  },
  {
    "id": "notes-field-panel",
    "track": "notes-integration",
    "status": "queued",
    "priority": 84,
    "label": "Contextual field-notes panel",
    "detail": "Add expandable relevant field notes at path/tool points without cluttering the operator workflow."
  },
  {
    "id": "notes-tool-influence",
    "track": "notes-integration",
    "status": "queued",
    "priority": 85,
    "label": "Notes influence tool builders",
    "detail": "Note-derived command variants and failure lessons should become toggles, modes, or guidance in relevant builders."
  },
  {
    "id": "notes-path-gap-influence",
    "track": "notes-integration",
    "status": "queued",
    "priority": 86,
    "label": "Notes influence Path gaps",
    "detail": "If notes reveal realistic actions missing from the path, add modeled path improvements rather than storing passive notes only."
  },
  {
    "id": "notes-disposition-burn-down",
    "track": "notes-integration",
    "status": "queued",
    "priority": 87,
    "label": "Burn down all 556 note dispositions",
    "detail": "Every note must end modeled, superseded, rejected, or private-reference-only with rationale."
  },
  {
    "id": "perf-service-worker",
    "track": "offline-performance",
    "status": "queued",
    "priority": 90,
    "label": "Quiet service worker caching",
    "detail": "Improve repeat-load and offline behavior without prompting users to install anything."
  },
  {
    "id": "perf-indexeddb",
    "track": "offline-performance",
    "status": "queued",
    "priority": 91,
    "label": "IndexedDB workspace storage",
    "detail": "Support durable larger local workspaces, multiple engagements, and cached indexes while remaining browser-local."
  },
  {
    "id": "perf-workers",
    "track": "offline-performance",
    "status": "queued",
    "priority": 92,
    "label": "Web Workers for heavy tasks",
    "detail": "Move evidence parsing, search indexing, and report generation off the UI thread."
  },
  {
    "id": "perf-bundle-budget",
    "track": "offline-performance",
    "status": "queued",
    "priority": 93,
    "label": "Bundle and request budget",
    "detail": "Reduce request count and parse cost from the current historical-load chain."
  },
  {
    "id": "perf-update-notice",
    "track": "offline-performance",
    "status": "queued",
    "priority": 94,
    "label": "Non-intrusive update notice",
    "detail": "When cached app updates are available, notify users without install nagging."
  },
  {
    "id": "perf-storage-migration",
    "track": "offline-performance",
    "status": "queued",
    "priority": 95,
    "label": "Workspace storage migration safety",
    "detail": "Any storage refactor must preserve existing browser-local workspaces and sanitized exports."
  },
  {
    "id": "qa-playwright-smoke",
    "track": "testing-qa",
    "status": "queued",
    "priority": 100,
    "label": "Playwright browser smoke tests",
    "detail": "Open core routes, fail on console errors, and capture screenshots for Home, Targets, Evidence, Next Steps, Report, and Dashboard."
  },
  {
    "id": "qa-version-test",
    "track": "testing-qa",
    "status": "queued",
    "priority": 101,
    "label": "Version identity test",
    "detail": "Assert title, header, settings, report preview, report footer, and export metadata agree."
  },
  {
    "id": "qa-contrast-test",
    "track": "testing-qa",
    "status": "queued",
    "priority": 102,
    "label": "Contrast and focus checks",
    "detail": "Automated and screenshot-assisted checks should catch invisible links and weak focus states."
  },
  {
    "id": "qa-dashboard-sync",
    "track": "testing-qa",
    "status": "modeled",
    "priority": 103,
    "label": "Dashboard and README sync validation",
    "detail": "v9.0 adds validation that README Product Build Next and dashboard totals come from the same queue data."
  },
  {
    "id": "qa-asset-test",
    "track": "testing-qa",
    "status": "modeled",
    "priority": 104,
    "label": "Asset reference validation",
    "detail": "v9.0 adds an asset reference checker to stop dead script/style tags from shipping."
  },
  {
    "id": "qa-builder-contract-test",
    "track": "testing-qa",
    "status": "queued",
    "priority": 105,
    "label": "Tool builder contract tests",
    "detail": "Every implemented builder must satisfy schema, rendering, command, evidence, manual outcome, and report-lineage checks."
  },
  {
    "id": "qa-notes-ledger-test",
    "track": "testing-qa",
    "status": "queued",
    "priority": 106,
    "label": "Notes ledger coverage tests",
    "detail": "The note-integration ledger must preserve source counts and terminal dispositions until all 556 notes are resolved."
  },
  {
    "id": "qa-release-contract-v9",
    "track": "testing-qa",
    "status": "modeled",
    "priority": 107,
    "label": "v9.0 release-contract tests",
    "detail": "v9.0 protects the new product-hardening governance model and keeps Orange completion denominators closed."
  }
];
const definitionOfDone = {
  "requiredFields": [
    "acceptance",
    "test_plan",
    "validation_commands",
    "required_tests",
    "proof_files",
    "risk",
    "status_notes"
  ],
  "advanceRule": "Any item moved beyond queued must carry item-specific acceptance and test proof. Implemented, tested, and complete items must name the tests or validators that prove the change.",
  "advancedStatuses": [
    "modeled",
    "implemented",
    "tested",
    "complete",
    "superseded",
    "rejected"
  ],
  "testBearingStatuses": [
    "implemented",
    "tested",
    "complete"
  ]
};
const itemDefinitionsOfDone = {
  "dash-product-foundation": {
    "acceptance": [
      "Product Hardening Dashboard foundation has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data.",
      "The standalone product-hardening dashboard consumes queue totals, track summaries, Build Next, and notes source data."
    ],
    "test_plan": "Protect dash-product-foundation with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "data/product-hardening/product-hardening-queue.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "readme-product-build-next": {
    "acceptance": [
      "Generated README Product Build Next has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data.",
      "The README Product Build Next block remains generated and synchronized."
    ],
    "test_plan": "Protect readme-product-build-next with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "data/product-hardening/product-hardening-queue.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "runtime-no-layer-rule": {
    "acceptance": [
      "No new layered queue architecture has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data.",
      "Product-hardening releases must not add fake v9 runtime overlay files."
    ],
    "test_plan": "Protect runtime-no-layer-rule with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "data/product-hardening/product-hardening-queue.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "ux-build-next-top": {
    "acceptance": [
      "Keep Build Next near dashboard top has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data.",
      "The dashboard keeps Build Next near the top before detail ledgers."
    ],
    "test_plan": "Protect ux-build-next-top with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "data/product-hardening/product-hardening-queue.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "notes-private-source-pointer": {
    "acceptance": [
      "Private notes source pointer has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data.",
      "Public Obol points to platocres/obol-source-notes without committing raw ENEX."
    ],
    "test_plan": "Protect notes-private-source-pointer with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "data/product-hardening/product-hardening-queue.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "notes-source-inventory": {
    "acceptance": [
      "Notes source inventory has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data.",
      "The private note inventory stays at 556 notes and 1,326 embedded resources until a deliberate source update."
    ],
    "test_plan": "Protect notes-source-inventory with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "data/product-hardening/product-hardening-queue.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "qa-dashboard-sync": {
    "acceptance": [
      "Dashboard and README sync validation has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data."
    ],
    "test_plan": "Protect qa-dashboard-sync with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/sync-product-build-next.js --check",
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/sync-product-build-next.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "tools/sync-product-build-next.js",
      "README.md",
      "product-hardening.html",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "qa-asset-test": {
    "acceptance": [
      "Asset reference validation has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data."
    ],
    "test_plan": "Protect qa-asset-test with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-asset-references.js",
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-asset-references.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "tools/validate-asset-references.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  },
  "qa-release-contract-v9": {
    "acceptance": [
      "v9.0 release-contract tests has a durable queue disposition.",
      "The queue/dashboard/README governance remains generated from stable product-hardening data."
    ],
    "test_plan": "Protect qa-release-contract-v9 with product-hardening queue validation and the v9 regression suite.",
    "validation_commands": [
      "node tools/validate-release-pr.js --repo-only --release-version=9.0",
      "node tools/validate-product-hardening-queue.js",
      "node tests/run-v9.0-tests.js"
    ],
    "required_tests": [
      "tools/validate-release-pr.js",
      "tools/validate-product-hardening-queue.js",
      "tests/run-v9.0-tests.js"
    ],
    "proof_files": [
      "tools/validate-release-pr.js",
      "tests/run-v9.0-tests.js",
      "docs/v9.0.md"
    ],
    "risk": "Changing this item can weaken the v9 product-hardening foundation or let future agents drift without CI failure.",
    "status_notes": "Modeled in v9.0 as part of the post-Orange product-hardening foundation."
  }
};

for (const item of items) {
  if (itemDefinitionsOfDone[item.id]) Object.assign(item, itemDefinitionsOfDone[item.id]);
}

const notes = {
  privateRepo: 'platocres/obol-source-notes',
  sources: [
    {id:'htb-penetration-tester',title:'HTB - Penetration Tester.enex',notes:352,resources:859,sha256:'ceeab3da0770ecd3709bcd2693b7a26a6390ad45c5bbada0234079e6eb2ff06f'},
    {id:'offsec-pen-200',title:'OffSec PEN-200.enex',notes:204,resources:467,sha256:'c02bf5958f2bf2aaa690b20e0a497b70eb83a8fc4276d2f1b52e11592e89acb1'}
  ]
};

function pct(a,b){return b?Math.round((a/b)*100):0;}
function trackSummary(){return tracks.map(t=>{const modeled=items.filter(i=>i.track===t.id&&i.status==='modeled').length;return Object.assign({},t,{pct:pct(t.complete,t.total),modeled});});}
function totals(){const complete=tracks.reduce((n,t)=>n+t.complete,0);const total=tracks.reduce((n,t)=>n+t.total,0);return{complete,total,pct:pct(complete,total),queued:items.filter(i=>i.status==='queued').length,modeled:items.filter(i=>i.status==='modeled').length,notes:notes.sources.reduce((n,s)=>n+s.notes,0),resources:notes.sources.reduce((n,s)=>n+s.resources,0)};}
function buildNext(limit){return items.slice().sort((a,b)=>a.priority-b.priority).filter(i=>i.status==='queued').slice(0,limit||8);}
root.OBOL_PRODUCT_HARDENING={version:'9.0.0',contractVersion:'9.0.1',phase:'Product Hardening Queue Foundation',tracks,items,definitionOfDone,itemDefinitionsOfDone,notes,trackSummary,totals,buildNext};
})(typeof window!=='undefined'?window:globalThis);
