'use strict';

(function initActionableCardContractV966(root) {
  const WAVE = 'v9.66-actionable-card-contract';
  const PROOF_FILE = 'data/product-hardening/actionable-card-contract-v9.66.js';
  const ACTIONABLE_IDS = Object.freeze([
    'credential-dump-proof-chain',
    'web-proxy-transform-proof-chain',
    'web-client-controls',
    'web-authz-boundaries',
    'encoded-parameter-review',
    'tool-generated-http-review',
    'pass-the-hash-proof-chain',
    'pth-remote-exec-artifacts',
    'pth-token-filtering-check',
    'burp-intruder-fuzzing-workflow',
    'fuzzer-payload-position-review',
    'fuzzer-result-delta-review',
  ]);

  function freezeList(list) { return Object.freeze((list || []).slice()); }
  function freezeObject(value) { return Object.freeze(value || {}); }
  function unique(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function liveCard(id) {
    if (!id) return null;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : [];
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    return null;
  }
  function copyList(list) { return Array.isArray(list) ? list.slice() : []; }

  const OVERLAYS = freezeObject({
    'credential-dump-proof-chain': freezeObject({
      actionType: 'terminal',
      title: 'Credential Dump Proof Chain',
      operatorGoal: 'Turn a dump/parser/crack lead into scoped, defensible credential evidence without treating secrets as proof by themselves.',
      commands: freezeList([
        freezeObject({ tool: 'pypykatz', run: 'pypykatz lsa minidump {{dump_file}}', useWhen: 'You have a Windows LSASS minidump or copied dump artifact and need to classify reusable material offline.', expected: 'Logon sessions plus concrete material classes such as NT hash, Kerberos ticket, DPAPI, or cleartext candidate.' }),
        freezeObject({ tool: 'hashcat', run: 'hashcat -m 1000 {{hashes_file}} {{wordlist}} --username --status', useWhen: 'You have NT hash material that should be tested offline before reuse.', expected: 'Recovered candidate count or explicit exhausted status, with raw secrets kept out of report text.' }),
        freezeObject({ tool: 'nxc', run: 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', useWhen: 'Validate one local-account hash against one SMB target.', expected: 'Authentication result scoped to host, user, protocol, and local/domain context.' }),
      ]),
      expectedEvidence: freezeList(['dump artifact path or transfer proof', 'parser output showing material class', 'crack or no-crack status', 'one scoped authentication result', 'cleanup state for sensitive dump material']),
      failureModes: freezeList(['parser output shows sessions but no reusable material', 'hash cracks but target service rejects it', 'hash works on SMB but not WinRM', 'dump file remains on target or staging host']),
      nextSteps: freezeList(['Validate only one host/protocol next', 'Move to PtH card only after material class is known', 'Record cleanup before reporting']),
    }),
    'web-proxy-transform-proof-chain': freezeObject({
      actionType: 'gui-workflow',
      operatorGoal: 'Use Burp/ZAP/CyberChef to mutate one request variable at a time, then prove whether the server behavior actually changed.',
      guiSteps: freezeList(['Capture the original request in Proxy history.', 'Send it to Repeater before changing anything.', 'Identify exactly one control, cookie, parameter, header, or encoded value to mutate.', 'Decode only as far as needed and record the transform order.', 'Change one inner value.', 'Rebuild encodings in reverse order.', 'Replay the request.', 'Compare status, headers, and response body against the original request.', 'Paste both request/response summaries back into Evidence.']),
      commands: freezeList([
        freezeObject({ tool: 'curl', run: 'curl -i -s -k -X {{method}} {{url}} -H {{header}} --data-binary {{body}}', useWhen: 'Reproduce the proxy replay in a terminal after the request is understood.', expected: 'Same response class/body delta seen in the proxy.' }),
      ]),
      expectedEvidence: freezeList(['original request', 'single changed field', 'decode/re-encode order', 'replayed response body comparison', 'server-side effect or explicit no-impact result']),
      failureModes: freezeList(['only the client changed', 'response length changed but body is the same template', 'encoding order was not preserved', 'multiple variables changed at once']),
      nextSteps: freezeList(['Move to authz review if a permission boundary changed', 'Move to encoded parameter review if transform order is unclear', 'Keep as field note if no server behavior changes']),
    }),
    'web-client-controls': freezeObject({
      actionType: 'gui-workflow',
      operatorGoal: 'Decide whether a disabled/hidden/readonly browser control is just UI guidance or an actual backend authorization failure.',
      guiSteps: freezeList(['Open DevTools or intercept the request in Burp/ZAP.', 'Record the original disabled, hidden, readonly, or locally validated control.', 'Modify only that control or its request value.', 'Submit once.', 'Compare the server response body and state change against the unmodified request.', 'Name the object, action, user, and permission boundary tested.']),
      commands: freezeList([
        freezeObject({ tool: 'curl', run: 'curl -i -s -k {{url}} -H "Cookie: {{cookie}}" --data-binary "{{param}}={{mutated_value}}"', useWhen: 'Re-test the same control mutation outside the browser.', expected: 'Server accepts, rejects, or ignores the changed value in a way that can be reported.' }),
      ]),
      expectedEvidence: freezeList(['original control state', 'mutated request value', 'server response body', 'named authorization boundary', 'single-object/single-action scope']),
      failureModes: freezeList(['front-end changes but server ignores the value', 'server returns generic redirect/error', 'test crosses destructive or broad scope']),
      nextSteps: freezeList(['Escalate to web authorization boundary only after backend effect is visible', 'Otherwise keep it as request-shaping evidence']),
    }),
    'web-authz-boundaries': freezeObject({
      actionType: 'gui-workflow',
      operatorGoal: 'Prove or disprove that a request mutation crosses a real server-side permission boundary.',
      guiSteps: freezeList(['Pick one identity, object, and action.', 'Replay the allowed baseline request.', 'Replay the mutated or lower-privileged request.', 'Compare body, status, redirect target, and stored state.', 'Avoid destructive actions unless the lab explicitly allows them.', 'Record exactly what boundary changed.']),
      commands: freezeList([
        freezeObject({ tool: 'curl', run: 'curl -i -s -k {{url}} -H "Cookie: {{low_priv_cookie}}"', useWhen: 'Check whether a lower-privileged identity can read or trigger the same object/action.', expected: 'Clear allow/deny/body difference tied to one object and one identity.' }),
      ]),
      expectedEvidence: freezeList(['baseline identity response', 'mutated identity response', 'object/action named', 'body or state delta', 'safe scope statement']),
      failureModes: freezeList(['status differs but content is not protected', 'object is public', 'same account/session was accidentally reused']),
      nextSteps: freezeList(['Move to reporting only when the permission boundary is named and reproducible', 'Otherwise return to request shaping or parameter review']),
    }),
    'encoded-parameter-review': freezeObject({
      actionType: 'gui-workflow',
      operatorGoal: 'Work encoded cookies/parameters without losing the transform chain or inventing impact from a decode trick.',
      guiSteps: freezeList(['Copy the original encoded value.', 'Decode one layer at a time in CyberChef/Burp Decoder/ZAP Encoder.', 'Write down each transform in order.', 'Change the smallest meaningful inner value.', 'Apply encodings in reverse order.', 'Replay with the rebuilt value.', 'Compare body and server state with the original request.']),
      commands: freezeList([
        freezeObject({ tool: 'python3', run: 'python3 - <<\'PY\'\nimport base64, urllib.parse\nvalue = {{encoded_value!r}}\nprint(urllib.parse.unquote(value))\nPY', useWhen: 'Quickly inspect a URL/base64-style value while preserving a reproducible transform note.', expected: 'Decoded layer that can be recorded without exposing raw secrets in the report.' }),
      ]),
      expectedEvidence: freezeList(['original value redacted if sensitive', 'decode order', 'mutation point', 'reverse encode order', 'response comparison']),
      failureModes: freezeList(['changed the wrong layer', 'automatic proxy encoding changed the payload', 'server rejected malformed rebuilt value']),
      nextSteps: freezeList(['Move to web proxy transform proof when replay works', 'Move to authz only when protected behavior changes']),
    }),
    'tool-generated-http-review': freezeObject({
      actionType: 'terminal-and-gui',
      operatorGoal: 'Proxy a tool through Burp/ZAP so debugging is based on the real HTTP it emitted, not guesses about what the tool probably did.',
      guiSteps: freezeList(['Start Burp/ZAP and confirm the listener port.', 'Configure the tool to use the proxy.', 'Run one narrow request.', 'Inspect method, path, Host header, cookies, body, TLS behavior, and redirect handling.', 'Replay the captured request manually before changing modules or payloads.']),
      commands: freezeList([
        freezeObject({ tool: 'curl', run: 'curl -x http://127.0.0.1:8080 -k -i {{url}}', useWhen: 'Verify the proxy path and capture a simple request.', expected: 'Request appears in Burp/ZAP with the intended host/path/headers.' }),
        freezeObject({ tool: 'sqlmap', run: 'sqlmap -r {{request_file}} --proxy=http://127.0.0.1:8080 --batch', useWhen: 'Capture generated SQLMap traffic for a known request file.', expected: 'Generated payloads visible in the proxy so false assumptions can be corrected.' }),
        freezeObject({ tool: 'ffuf', run: 'ffuf -x http://127.0.0.1:8080 -u {{url}}/FUZZ -w {{wordlist}} -mc all', useWhen: 'Capture a small ffuf run for path/header/body verification.', expected: 'Requests visible in proxy with the expected path and Host handling.' }),
      ]),
      expectedEvidence: freezeList(['tool command with proxy option', 'captured HTTP request', 'manual replay result', 'difference between intended and emitted request']),
      failureModes: freezeList(['tool bypassed proxy', 'wrong Host header or scheme', 'redirect/cookie handling differs from browser', 'module payload is sent to wrong path']),
      nextSteps: freezeList(['Fix tool configuration only after captured HTTP explains the mismatch', 'Switch to manual replay if module assumptions are wrong']),
    }),
    'pass-the-hash-proof-chain': freezeObject({
      actionType: 'terminal',
      operatorGoal: 'Validate hash-based auth narrowly and record whether success is auth-only, admin-capable, or remote-execution-capable.',
      commands: freezeList([
        freezeObject({ tool: 'nxc', run: 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', useWhen: 'Check one local-account hash against SMB.', expected: 'Successful or failed SMB auth scoped to one host and one account.' }),
        freezeObject({ tool: 'nxc', run: 'nxc winrm {{target}} -u {{user}} -H {{hash}}', useWhen: 'Check WinRM only when port 5985/5986 is in scope and reachable.', expected: 'WinRM auth result separate from SMB result.' }),
        freezeObject({ tool: 'evil-winrm', run: 'evil-winrm -i {{target}} -u {{user}} -H {{hash}}', useWhen: 'Try shell only after scoped WinRM auth is plausible.', expected: 'Interactive shell or clear auth/authorization failure.' }),
      ]),
      expectedEvidence: freezeList(['hash material class', 'local/domain scope', 'host and protocol', 'auth result', 'privilege/admin marker if present']),
      failureModes: freezeList(['valid hash but wrong local/domain scope', 'SMB works but WinRM fails', 'auth success without admin rights', 'lockout/noisy retry risk']),
      nextSteps: freezeList(['Move to remote-exec artifacts only after admin/execution evidence', 'Move to token filtering check on scoped failure']),
    }),
    'pth-remote-exec-artifacts': freezeObject({
      actionType: 'terminal',
      operatorGoal: 'Separate hash authentication from the artifacts created by remote command execution.',
      commands: freezeList([
        freezeObject({ tool: 'impacket-psexec', run: 'impacket-psexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', useWhen: 'SMB admin path is in scope and you need remote command execution proof.', expected: 'Service creation/start, shell, and cleanup artifacts recorded.' }),
        freezeObject({ tool: 'impacket-wmiexec', run: 'impacket-wmiexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', useWhen: 'Compare WMI execution when service creation is blocked or too noisy.', expected: 'Command execution result and process/artifact evidence.' }),
      ]),
      expectedEvidence: freezeList(['remote execution method', 'service/process/share artifact', 'command output or shell proof', 'cleanup status']),
      failureModes: freezeList(['authentication succeeds but service creation fails', 'ADMIN$ unavailable', 'artifact left behind', 'shell proves different host than expected']),
      nextSteps: freezeList(['Record cleanup before reporting', 'If execution fails, move to token filtering/scope check']),
    }),
    'pth-token-filtering-check': freezeObject({
      actionType: 'terminal',
      operatorGoal: 'Troubleshoot hash auth failures without turning it into broad noisy retrying.',
      commands: freezeList([
        freezeObject({ tool: 'nxc', run: 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', useWhen: 'Re-check whether a local account requires local-auth scoping.', expected: 'Different result confirms scope mismatch or local account behavior.' }),
        freezeObject({ tool: 'nxc', run: 'nxc smb {{target}} -u {{user}} -H {{hash}} --shares', useWhen: 'Auth works but admin capability is unclear.', expected: 'Share access boundary without assuming command execution.' }),
      ]),
      expectedEvidence: freezeList(['exact failure string', 'account scope', 'protocol tested', 'admin/share boundary', 'token filtering hypothesis']),
      failureModes: freezeList(['wrong domain/local context', 'remote UAC/token filtering', 'service blocked', 'credential lockout risk']),
      nextSteps: freezeList(['Try one narrower scope correction', 'Stop broad retries when policy/scope explains failure']),
    }),
    'burp-intruder-fuzzing-workflow': freezeObject({
      actionType: 'gui-workflow',
      operatorGoal: 'Run a short, contextual Burp/ZAP fuzzing pass that produces replayable candidates instead of a giant unreviewed result list.',
      guiSteps: freezeList(['Capture a representative request in Proxy history.', 'Send it to Intruder or ZAP Fuzzer.', 'Clear automatic positions.', 'Mark one path segment, parameter value, header, or cookie value.', 'Use Sniper for one position.', 'Load a small contextual list first.', 'Record payload processing and encoding settings.', 'Run the attack.', 'Sort by Status, Length, Words, or Lines.', 'Send outliers to Repeater and compare bodies manually.']),
      commands: freezeList([
        freezeObject({ tool: 'ffuf', run: 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fs {{baseline_size}}', useWhen: 'Switch to CLI when the list is broad or Burp Community throttling makes the proxy fuzzer impractical.', expected: 'Small candidate set after filtering baseline noise.' }),
        freezeObject({ tool: 'gobuster', run: 'gobuster dir -u {{url}} -w {{wordlist}} -x {{extensions}}', useWhen: 'Directory/page fuzzing with known extension guesses.', expected: 'Candidate paths with status/size to replay manually.' }),
      ]),
      expectedEvidence: freezeList(['request target', 'payload position', 'wordlist source', 'processing/encoding settings', 'top outliers', 'manual Repeater replay']),
      failureModes: freezeList(['left multiple positions selected accidentally', 'payload encoding changed expected syntax', 'result list is too large to review', 'only size changed but body is generic']),
      nextSteps: freezeList(['Replay candidates before reporting', 'Switch to CLI for broad sweeps', 'Move to result-delta review for triage']),
    }),
    'fuzzer-payload-position-review': freezeObject({
      actionType: 'gui-workflow',
      operatorGoal: 'Make sure the fuzzer is mutating the intended thing and nothing else.',
      guiSteps: freezeList(['Clear all payload markers.', 'Select only one intended insertion point.', 'Name the tested hypothesis.', 'Choose the attack type that matches the number of positions.', 'Preview at least one generated request.', 'Save the original request and generated example.']),
      commands: freezeList([
        freezeObject({ tool: 'ffuf', run: 'ffuf -u {{url_with_FUZZ}} -w {{wordlist}} -mc all', useWhen: 'Translate a single payload position into a repeatable CLI test.', expected: 'Generated requests mutate exactly the FUZZ location.' }),
      ]),
      expectedEvidence: freezeList(['original request', 'marked position', 'attack type', 'example generated request', 'wordlist/payload source']),
      failureModes: freezeList(['default markers left in the request', 'wrong attack type for multiple positions', 'payload in path when target is parameter or header', 'generated request malformed']),
      nextSteps: freezeList(['Proceed to fuzzing workflow only after the generated request looks right', 'Fix position before interpreting any result deltas']),
    }),
    'fuzzer-result-delta-review': freezeObject({
      actionType: 'terminal-and-gui',
      operatorGoal: 'Turn status/length/word-count outliers into manually reviewed candidates, or discard them as noise.',
      guiSteps: freezeList(['Sort fuzzer results by status and length/words.', 'Identify the smallest interesting candidate set.', 'Send each outlier to Repeater.', 'Compare body against baseline 404/deny/error templates.', 'Open only safe candidate paths/actions.', 'Record why each kept candidate matters.']),
      commands: freezeList([
        freezeObject({ tool: 'curl', run: 'curl -i -s -k {{candidate_url}}', useWhen: 'Replay a candidate path without proxy UI.', expected: 'Response body proves real content, redirect, auth boundary, or generic noise.' }),
        freezeObject({ tool: 'ffuf', run: 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fw {{baseline_words}}', useWhen: 'Filter a repeated sweep after identifying baseline word-count noise.', expected: 'Fewer candidates that still need manual replay.' }),
      ]),
      expectedEvidence: freezeList(['baseline response class', 'candidate status/length/words', 'manual replay response body', 'kept/discarded rationale']),
      failureModes: freezeList(['treating length alone as impact', 'wildcard route causes false positives', 'redirect to login counted as discovery', 'not replaying candidates manually']),
      nextSteps: freezeList(['Move found paths to enumeration only after body review', 'Tune filters when wildcard/error templates dominate']),
    }),
  });

  function applyOverlay(card, overlay) {
    if (!card || !overlay) return false;
    card.actionType = overlay.actionType;
    card.operatorGoal = overlay.operatorGoal;
    card.commands = freezeList(copyList(overlay.commands));
    card.guiSteps = freezeList(copyList(overlay.guiSteps));
    card.expectedEvidence = freezeList(copyList(overlay.expectedEvidence));
    card.failureModes = freezeList(copyList(overlay.failureModes));
    card.nextSteps = freezeList(copyList(overlay.nextSteps));
    card.referenceOnly = false;
    card.actionabilityV966 = freezeObject({ proof: PROOF_FILE, wave: WAVE, status: 'actionable-next-step' });
    const expected = unique(copyList(card.expected).concat(copyList(overlay.expectedEvidence)));
    card.expected = freezeList(expected);
    const tools = unique(copyList(card.tools).concat(copyList(overlay.commands).map((cmd) => cmd.tool)).filter(Boolean));
    if (tools.length) card.tools = freezeList(tools);
    return true;
  }

  function install() {
    const patched = [];
    const missing = [];
    for (const id of ACTIONABLE_IDS) {
      const card = liveCard(id);
      if (!card) { missing.push(id); continue; }
      if (applyOverlay(card, OVERLAYS[id])) patched.push(id);
    }
    const failures = validate().failures.concat(missing.map((id) => 'missing live card for actionability overlay: ' + id));
    root.OBOL_ACTIONABLE_CARD_CONTRACT_V966 = freezeObject({ wave: WAVE, proof: PROOF_FILE, status: failures.length ? 'partial' : 'live-integrated', patched: freezeList(patched), missing: freezeList(missing), failures: freezeList(failures), cardIds: ACTIONABLE_IDS });
    return root.OBOL_ACTIONABLE_CARD_CONTRACT_V966;
  }

  function validate() {
    const failures = [];
    for (const id of ACTIONABLE_IDS) {
      const card = liveCard(id);
      if (!card) { failures.push(id + ' has no live card'); continue; }
      const hasTerminal = Array.isArray(card.commands) && card.commands.length && card.commands.every((cmd) => cmd && cmd.tool && cmd.run && cmd.useWhen && cmd.expected);
      const hasGui = Array.isArray(card.guiSteps) && card.guiSteps.length >= 4;
      if (!hasTerminal && !hasGui && !card.referenceOnly) failures.push(id + ' is path-visible but has no terminal command or concrete GUI workflow');
      if (!Array.isArray(card.expectedEvidence) || card.expectedEvidence.length < 3) failures.push(id + ' lacks expectedEvidence operators can paste back');
      if (!Array.isArray(card.failureModes) || card.failureModes.length < 2) failures.push(id + ' lacks failureModes for stuck-state decisions');
      if (!Array.isArray(card.nextSteps) || card.nextSteps.length < 2) failures.push(id + ' lacks nextSteps guidance');
      if (card.referenceOnly) failures.push(id + ' is referenceOnly but still in actionable note-derived route set');
    }
    return freezeObject({ failures: freezeList(failures), checked: ACTIONABLE_IDS.length });
  }

  const first = install();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => { const result = install(); tries += 1; if (result.status !== 'live-integrated' && tries < 180 && schedule) schedule(attempt, 50); };
    if (first.status !== 'live-integrated' && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') { window.addEventListener('hashchange', attempt); window.addEventListener('focus', attempt); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = freezeObject({ WAVE, PROOF_FILE, ACTIONABLE_IDS, OVERLAYS, install, validate });
})(typeof window !== 'undefined' ? window : globalThis);
