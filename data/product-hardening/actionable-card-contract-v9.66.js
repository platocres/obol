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
  function laneList() { return Array.isArray(root.OBOL_LANES) ? root.OBOL_LANES : Array.isArray(root.LANES) ? root.LANES : []; }
  function liveCard(id) {
    if (!id) return null;
    if (root.CARDS && root.CARDS[id]) return root.CARDS[id];
    const lanes = laneList();
    for (const lane of lanes) for (const card of lane.cards || []) if (card && card.id === id) return card;
    if (typeof root.liveCardById === 'function') { try { const found = root.liveCardById(id); if (found) return found; } catch (_err) {} }
    return null;
  }
  function uniq(list) { return Array.from(new Set((list || []).filter(Boolean))); }
  function cmd(tool, run, useWhen, expected) { return freezeObject({ tool, run, useWhen, expected }); }
  function overlay(actionType, operatorGoal, commands, guiSteps, expectedEvidence, failureModes, nextSteps) {
    return freezeObject({ actionType, operatorGoal, commands: freezeList(commands), guiSteps: freezeList(guiSteps), expectedEvidence: freezeList(expectedEvidence), failureModes: freezeList(failureModes), nextSteps: freezeList(nextSteps) });
  }
  const OVERLAYS = freezeObject({
    'credential-dump-proof-chain': overlay('terminal', 'Classify dump/parser output, extract credential material safely, and validate only one scoped target before treating anything as access.', [
      cmd('pypykatz', 'pypykatz lsa minidump {{dump_file}}', 'Parse an LSASS minidump offline.', 'Concrete material classes such as NT hash, Kerberos, DPAPI, or cleartext candidate.'),
      cmd('hashcat', 'hashcat -m 1000 {{hashes_file}} {{wordlist}} --username --status', 'Test NT hashes offline before reuse.', 'Recovered/exhausted status without raw secrets in report text.'),
      cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Validate one hash against one SMB target.', 'Host/user/protocol-scoped auth result.')
    ], [], ['dump artifact path or transfer proof', 'parser material class', 'crack/no-crack status', 'one scoped auth result', 'cleanup state'], ['sessions but no reusable material', 'hash cracks but target rejects it', 'dump left behind'], ['move to PtH only after material class is known', 'record cleanup before reporting']),
    'web-proxy-transform-proof-chain': overlay('gui-workflow', 'Mutate one request variable at a time, preserve transform order, then prove whether server behavior changed.', [cmd('curl', 'curl -i -s -k -X {{method}} {{url}} -H {{header}} --data-binary {{body}}', 'Reproduce the proxy replay in a terminal.', 'Same response class/body delta seen in proxy.')], ['capture original request', 'send to Repeater', 'pick one field to mutate', 'decode one layer at a time', 'change one inner value', 'rebuild encodings in reverse order', 'replay and compare body'], ['original request', 'single changed field', 'decode/re-encode order', 'response body comparison'], ['multiple variables changed at once', 'body unchanged despite length delta', 'encoding order lost'], ['move to authz review only after backend effect', 'return to encoded parameter review if transform order is unclear']),
    'web-client-controls': overlay('gui-workflow', 'Decide whether a disabled, hidden, readonly, or locally validated control is only UI guidance or a backend authorization bug.', [cmd('curl', 'curl -i -s -k {{url}} -H "Cookie: {{cookie}}" --data-binary "{{param}}={{mutated_value}}"', 'Retest the same control mutation outside the browser.', 'Server accepts, rejects, or ignores the changed value.')], ['record original control state', 'modify one value in DevTools or proxy', 'submit once', 'compare server response body/state', 'name identity/object/action boundary'], ['original control state', 'mutated request', 'server response body', 'named authorization boundary'], ['server ignores value', 'generic redirect/error only', 'destructive action attempted'], ['escalate to authz boundary only with backend effect', 'otherwise keep as request-shaping evidence']),
    'web-authz-boundaries': overlay('gui-workflow', 'Prove whether one identity can perform one object/action outside its allowed permission boundary.', [cmd('curl', 'curl -i -s -k {{url}} -H "Cookie: {{low_priv_cookie}}"', 'Replay as the lower-privileged or alternate identity.', 'Clear allow/deny/body difference tied to one object.')], ['choose one identity/object/action', 'replay allowed baseline', 'replay lower-privileged/mutated request', 'compare status/body/state', 'avoid destructive actions', 'record boundary crossed'], ['baseline response', 'mutated identity response', 'object/action name', 'body or state delta'], ['same session reused accidentally', 'object is public', 'status differs but content not protected'], ['report only when boundary is reproducible', 'otherwise return to request-shaping/parameter review']),
    'encoded-parameter-review': overlay('gui-workflow', 'Work encoded cookies or parameters without losing the transform chain or mistaking a decode trick for impact.', [cmd('python3', 'python3 - <<\'PY\'\nimport base64, urllib.parse\nvalue = {{encoded_value!r}}\nprint(urllib.parse.unquote(value))\nPY', 'Quickly inspect a URL/base64-style layer.', 'Decoded layer that can be recorded and rebuilt.')], ['copy original encoded value', 'decode one layer at a time', 'write each transform in order', 'mutate smallest inner value', 'encode in reverse order', 'replay rebuilt value', 'compare body/state'], ['original redacted value', 'decode order', 'mutation point', 'reverse encode order', 'response comparison'], ['wrong layer changed', 'proxy auto-encoding changed payload', 'server rejected malformed value'], ['move to proxy transform proof after replay works', 'move to authz only when protected behavior changes']),
    'tool-generated-http-review': overlay('terminal-and-gui', 'Proxy tool traffic through Burp/ZAP so debugging is based on emitted HTTP, not guesses.', [
      cmd('curl', 'curl -x http://127.0.0.1:8080 -k -i {{url}}', 'Verify proxy capture with a simple request.', 'Request appears in Burp/ZAP with intended host/path.'),
      cmd('sqlmap', 'sqlmap -r {{request_file}} --proxy=http://127.0.0.1:8080 --batch', 'Capture generated SQLMap traffic for a known request.', 'Payloads are visible in proxy.'),
      cmd('ffuf', 'ffuf -x http://127.0.0.1:8080 -u {{url}}/FUZZ -w {{wordlist}} -mc all', 'Capture a small fuzzer run for path/header/body verification.', 'Requests visible in proxy with expected path and Host handling.')
    ], ['start Burp/ZAP listener', 'configure tool proxy', 'run one narrow request', 'inspect method/path/headers/body', 'manual replay before changing assumptions'], ['tool command with proxy option', 'captured HTTP request', 'manual replay result', 'intended-vs-emitted difference'], ['tool bypassed proxy', 'wrong scheme/Host header', 'redirect/cookie handling differs'], ['fix tool config after captured HTTP explains mismatch', 'switch to manual replay if module assumptions are wrong']),
    'pass-the-hash-proof-chain': overlay('terminal', 'Validate hash-based auth narrowly and record whether the result is auth-only, admin-capable, or execution-capable.', [cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Check one local-account hash against SMB.', 'SMB auth result scoped to host/account.'), cmd('nxc', 'nxc winrm {{target}} -u {{user}} -H {{hash}}', 'Check WinRM only when reachable and in scope.', 'WinRM auth result separate from SMB.'), cmd('evil-winrm', 'evil-winrm -i {{target}} -u {{user}} -H {{hash}}', 'Try shell only after WinRM auth is plausible.', 'Shell or clear auth/authorization failure.')], [], ['hash material class', 'local/domain scope', 'host/protocol', 'auth result', 'privilege marker'], ['wrong local/domain scope', 'SMB works but WinRM fails', 'auth success without admin'], ['move to remote-exec artifacts only after admin/execution evidence', 'move to token filtering on scoped failure']),
    'pth-remote-exec-artifacts': overlay('terminal', 'Separate hash authentication from services, files, processes, and shells created by remote execution.', [cmd('impacket-psexec', 'impacket-psexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', 'SMB admin path is in scope and execution proof is needed.', 'Service creation/start, shell, and cleanup artifacts.'), cmd('impacket-wmiexec', 'impacket-wmiexec {{domain}}/{{user}}@{{target}} -hashes :{{hash}}', 'Compare WMI when service creation is blocked/noisy.', 'Command output and process/artifact evidence.')], [], ['execution method', 'service/process/share artifact', 'command output or shell proof', 'cleanup status'], ['auth succeeds but service creation fails', 'ADMIN$ unavailable', 'artifact left behind'], ['record cleanup before reporting', 'if execution fails, check token filtering/scope']),
    'pth-token-filtering-check': overlay('terminal', 'Troubleshoot PtH failures without turning one scoped miss into noisy broad retrying.', [cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --local-auth', 'Check whether local-auth scope changes the result.', 'Different result confirms local/domain mismatch.'), cmd('nxc', 'nxc smb {{target}} -u {{user}} -H {{hash}} --shares', 'Auth works but admin capability is unclear.', 'Share boundary without assuming execution.')], [], ['exact failure string', 'account scope', 'protocol tested', 'admin/share boundary'], ['wrong domain/local context', 'remote UAC/token filtering', 'service blocked'], ['try one narrower scope correction', 'stop broad retries when policy/scope explains failure']),
    'burp-intruder-fuzzing-workflow': overlay('gui-workflow', 'Run a short contextual proxy fuzzer pass that produces replayable candidates instead of an unreviewed result pile.', [cmd('ffuf', 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fs {{baseline_size}}', 'Switch to CLI for broad or throttled sweeps.', 'Small candidate set after baseline filtering.'), cmd('gobuster', 'gobuster dir -u {{url}} -w {{wordlist}} -x {{extensions}}', 'Directory/page fuzzing with extension guesses.', 'Candidate paths with status/size to replay.')], ['capture representative request', 'send to Intruder/ZAP Fuzzer', 'clear automatic positions', 'mark one path/param/header/cookie value', 'use Sniper for one position', 'load small contextual list', 'record encoding/processing', 'sort by Status/Length/Words', 'replay outliers'], ['request target', 'payload position', 'wordlist source', 'processing/encoding settings', 'top outliers', 'manual replay'], ['multiple positions left selected', 'payload encoding changed syntax', 'result list too large', 'length-only hit'], ['replay before reporting', 'switch to CLI for broad sweeps']),
    'fuzzer-payload-position-review': overlay('gui-workflow', 'Make sure the fuzzer mutates the intended request part and nothing else.', [cmd('ffuf', 'ffuf -u {{url_with_FUZZ}} -w {{wordlist}} -mc all', 'Translate one payload position into repeatable CLI form.', 'Generated requests mutate exactly the FUZZ location.')], ['clear all markers', 'select one insertion point', 'name the tested hypothesis', 'choose matching attack type', 'preview a generated request', 'save original and generated example'], ['original request', 'marked position', 'attack type', 'generated example', 'payload source'], ['default markers left behind', 'wrong attack type', 'payload in wrong request part'], ['fix position before interpreting deltas', 'proceed to fuzzing after generated request looks right']),
    'fuzzer-result-delta-review': overlay('terminal-and-gui', 'Turn status/length/word-count outliers into manually reviewed candidates or discard them as noise.', [cmd('curl', 'curl -i -s -k {{candidate_url}}', 'Replay a candidate outside the fuzzer.', 'Response body proves content, redirect, boundary, or noise.'), cmd('ffuf', 'ffuf -u {{url}}/FUZZ -w {{wordlist}} -mc all -fw {{baseline_words}}', 'Filter a repeated sweep after baseline word-count noise is known.', 'Smaller candidate set requiring manual replay.')], ['sort by status and length/words', 'pick smallest interesting candidate set', 'send outliers to Repeater', 'compare against baseline templates', 'open only safe candidates', 'record keep/discard rationale'], ['baseline response class', 'candidate status/length/words', 'manual replay body', 'kept/discarded rationale'], ['length treated as impact', 'wildcard route false positives', 'login redirect counted as discovery'], ['move found paths to enumeration after body review', 'tune filters when templates dominate']),
  });
  function replaceCard(original, updated) {
    if (!original || !updated) return updated || original;
    let replaced = false;
    const lanes = laneList();
    for (const lane of lanes) {
      if (!Array.isArray(lane.cards)) continue;
      const index = lane.cards.findIndex((entry) => entry === original || entry && entry.id === original.id);
      if (index >= 0) { try { lane.cards[index] = updated; replaced = true; } catch (_err) {} }
    }
    if (root.CARDS && original.id) { try { root.CARDS[original.id] = updated; replaced = true; } catch (_err) {} }
    return replaced ? updated : original;
  }
  function mutableCard(card) {
    if (!card) return card;
    try { if (Object.isExtensible(card)) return card; } catch (_err) { return card; }
    return replaceCard(card, Object.assign({}, card));
  }
  function safeAssign(card, key, value) { try { card[key] = value; return true; } catch (_err) { return false; } }
  function apply(card, data) {
    if (!card || !data) return false;
    const target = mutableCard(card);
    const expected = freezeList(uniq(Array.isArray(target.expected) ? target.expected.concat(data.expectedEvidence) : data.expectedEvidence));
    const tools = freezeList(uniq((Array.isArray(target.tools) ? target.tools : []).concat((data.commands || []).map((entry) => entry.tool))));
    safeAssign(target, 'actionType', data.actionType);
    safeAssign(target, 'operatorGoal', data.operatorGoal);
    safeAssign(target, 'commands', data.commands);
    safeAssign(target, 'guiSteps', data.guiSteps);
    safeAssign(target, 'expectedEvidence', data.expectedEvidence);
    safeAssign(target, 'failureModes', data.failureModes);
    safeAssign(target, 'nextSteps', data.nextSteps);
    safeAssign(target, 'referenceOnly', false);
    safeAssign(target, 'actionabilityV966', freezeObject({ wave: WAVE, proof: PROOF_FILE, status: 'actionable-next-step' }));
    safeAssign(target, 'expected', expected);
    safeAssign(target, 'tools', tools);
    return true;
  }
  function validate() {
    const failures = [];
    for (const id of ACTIONABLE_IDS) {
      const card = liveCard(id);
      if (!card) { failures.push(id + ' has no live card'); continue; }
      const hasCommands = Array.isArray(card.commands) && card.commands.length && card.commands.every((entry) => entry && entry.tool && entry.run && entry.useWhen && entry.expected);
      const hasGui = Array.isArray(card.guiSteps) && card.guiSteps.length >= 4;
      if (!hasCommands && !hasGui) failures.push(id + ' lacks commands or concrete GUI workflow');
      if (!Array.isArray(card.expectedEvidence) || card.expectedEvidence.length < 3) failures.push(id + ' lacks expected evidence');
      if (!Array.isArray(card.failureModes) || card.failureModes.length < 2) failures.push(id + ' lacks failure modes');
      if (!Array.isArray(card.nextSteps) || card.nextSteps.length < 2) failures.push(id + ' lacks next-step guidance');
      if (card.referenceOnly) failures.push(id + ' is referenceOnly but path-visible');
    }
    return freezeObject({ failures: freezeList(failures), checked: ACTIONABLE_IDS.length });
  }
  function install() {
    const patched = [];
    const missing = [];
    for (const id of ACTIONABLE_IDS) {
      const card = liveCard(id);
      if (!card) { missing.push(id); continue; }
      if (apply(card, OVERLAYS[id])) patched.push(id);
    }
    const failures = validate().failures.concat(missing.map((id) => 'missing live card for actionability overlay: ' + id));
    root.OBOL_ACTIONABLE_CARD_CONTRACT_V966 = freezeObject({ wave: WAVE, proof: PROOF_FILE, status: failures.length ? 'partial' : 'live-integrated', patched: freezeList(patched), missing: freezeList(missing), failures: freezeList(failures), cardIds: ACTIONABLE_IDS });
    return root.OBOL_ACTIONABLE_CARD_CONTRACT_V966;
  }
  const packet = freezeObject({ WAVE, PROOF_FILE, ACTIONABLE_IDS, OVERLAYS, install, validate });
  root.OBOL_ACTIONABLE_CARD_CONTRACT_PACKET_V966 = packet;
  const first = install();
  if (typeof window !== 'undefined') {
    let tries = 0;
    const schedule = typeof window.setTimeout === 'function' ? window.setTimeout.bind(window) : null;
    const attempt = () => { const result = install(); tries += 1; if (result.status !== 'live-integrated' && tries < 180 && schedule) schedule(attempt, 50); };
    if (first.status !== 'live-integrated' && schedule) schedule(attempt, 0);
    if (typeof window.addEventListener === 'function') { window.addEventListener('hashchange', attempt); window.addEventListener('focus', attempt); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = packet;
})(typeof window !== 'undefined' ? window : globalThis);
