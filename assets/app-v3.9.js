// Obol v3.9 UI overlay — Evidence coverage transparency, broader transcript intent, and current-version presentation.
'use strict';
(function(){
function version39(){return 'v'+String(C.VERSION||'3.9.0').replace(/\.0$/,'');}
function syncVersion39(){const v=version39(),tag=document.querySelector('.tagline');if(tag)tag.textContent='Offensive Box Operations Ledger · '+v;document.title='Obol '+v+' — Offensive Box Operations Ledger';}
const PROFILE_ROWS39=[
 ['Impacket Kerberos','GetNPUsers / GetUserSPNs / getTGT','Roast hashes and saved tickets only when explicit output proves them.'],
 ['Impacket secrets','secretsdump / DCSync selectors','NTLM or krbtgt facts only from canonical hash rows.'],
 ['Impacket execution','psexec / wmiexec / smbexec / atexec','Maps command intent; SYSTEM/foothold facts require explicit SYSTEM output.'],
 ['PEASS-ng','linPEAS / winPEAS','Maps local-enumeration intent only; scanner text never implies root or SYSTEM.'],
 ['SQLmap','post-confirmation SQLi workflow','SQLi is supported only when the tool explicitly identifies an injectable parameter or backend DBMS.'],
 ['Inherited AD tooling','NetExec / Certipy / Rubeus','Keeps v3.5-v3.8 command-intent and conservative outcome handling.']
];
function familyLabel39(id){return({'impacket-asrep':'Impacket AS-REP','impacket-kerberoast':'Impacket Kerberoast','impacket-tgt':'Impacket TGT','impacket-secretsdump':'Impacket secretsdump','impacket-remote-exec':'Impacket remote exec','peas-linux':'linPEAS','peas-windows':'winPEAS','sqlmap':'SQLmap','certipy':'Certipy','rubeus':'Rubeus','netexec':'NetExec'})[id]||id;}
function coveragePanel39(){
 const rows=C.evidenceCoverageSummary39?C.evidenceCoverageSummary39(state,ctx()):[],open=state.ui&&state.ui.evidence39&&state.ui.evidence39.showCoverage!==false;
 return '<section class="card evidence-coverage39"><div class="card-body"><div class="coverage-head39"><div><span class="v39-kicker">Transcript coverage</span><h3>Evidence intent coverage</h3><p class="hint">v3.9 recognizes more high-confidence operator commands without turning generic tool output into unsupported findings. Classification and outcome proof are separate decisions.</p></div><label class="coverage-toggle39"><input type="checkbox" id="coverage-toggle39"'+(open?' checked':'')+'> show details</label></div>'+(open?'<div class="coverage-grid39">'+PROFILE_ROWS39.map(r=>'<div class="coverage-row39"><b>'+esc(r[0])+'</b><code>'+esc(r[1])+'</code><span>'+esc(r[2])+'</span></div>').join('')+'</div><div class="coverage-history39"><b>Recorded in this context</b>'+(rows.length?'<div>'+rows.map(r=>'<span><strong>'+esc(familyLabel39(r.family))+'</strong> '+r.total+' activity'+(r.total===1?'':'ies')+' · '+r.success+' supported</span>').join('')+'</div>':'<p class="empty">No covered tool-family activities are recorded in the active context yet.</p>')+'</div>':'')+'</div></section>';
}
function bindCoverage39(){const t=$('#coverage-toggle39');if(t)t.onchange=()=>{C.ensure39&&C.ensure39(state);state.ui.evidence39.showCoverage=t.checked;save();viewIntake();};}
function decorateEvidence39(){if(!(location.hash||'').startsWith('#/intake'))return;const v=$('#view');if(!v||v.querySelector('.evidence-coverage39'))return;C.ensure39&&C.ensure39(state);const sub=v.querySelector('.subtitle'),anchor=sub||v.querySelector('h2');if(anchor)anchor.insertAdjacentHTML('afterend',coveragePanel39());else v.insertAdjacentHTML('afterbegin',coveragePanel39());bindCoverage39();}
const oldIntake39=viewIntake;viewIntake=function(){oldIntake39();decorateEvidence39();syncVersion39();};
const oldGuide39=viewGuide;viewGuide=function(){oldGuide39();const v=$('#view');if(v&&!v.querySelector('.release39'))v.insertAdjacentHTML('afterbegin','<div class="card release39"><div class="card-body"><h3>v3.9 focus</h3><p>v3.9 expands Evidence transcript coverage for Impacket Kerberos, secretsdump, remote execution, PEASS-ng, and SQLmap while keeping proof conservative. Mixed operator sessions are segmented by command intent, and the Evidence page now explains which tool families can create automatic claims versus classification-only activity.</p></div></div>');syncVersion39();};
const oldRoute39=route;route=function(){oldRoute39();setTimeout(()=>{decorateEvidence39();syncVersion39();},0);setTimeout(()=>{decorateEvidence39();syncVersion39();},90);};
window.addEventListener('hashchange',()=>setTimeout(()=>{decorateEvidence39();syncVersion39();},100));setTimeout(()=>{try{C.ensure39&&C.ensure39(state);if(window.OBOL_INTAKE_V39&&window.OBOL_INTAKE_V39.repairWorkspace39)window.OBOL_INTAKE_V39.repairWorkspace39(state,LANES);save();}catch(e){}decorateEvidence39();syncVersion39();},130);
})();
