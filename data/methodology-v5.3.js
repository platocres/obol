// Obol v5.3 methodology overlay — repair implemented canonical delivery debt without changing canonical status.
(function(root){
'use strict';
const lanes=root.OBOL_LANES||[],M45=root.OBOL_METHODOLOGY_V45,M47=root.OBOL_METHODOLOGY_V47;
if(!M45)throw new Error('Obol methodology-v4.5 is required before methodology-v5.3.js');
function card(id){for(const l of lanes)for(const c of l.cards||[])if(c.id===id)return c;return null;}
function setSurfaces(c,fn){if(!c)return 0;let added=0;for(const [i,cmd] of (c.commands||[]).entries()){if(cmd.operatorSurface40)continue;const s=fn(cmd,i);if(!s)continue;cmd.operatorSurface40=s;cmd.operatorSurface53Source='audited-v5.3';added++;}return added;}
const profiles={
 'smb-anon-enum':{family:'anonymous-smb',source:'v5.3',proof:'explicit anonymous share enumeration output',claims:['smb.reachable','smb.shares']},
 'dns-enum':{family:'dns-zone-transfer',source:'v5.3',proof:'explicit successful AXFR records and transfer completion',claims:['dns.zone','ad.host_map']},
 'kerberos-tickets':{family:'kerberos-ticket-hygiene',source:'v5.3',proof:'explicit saved or listed Kerberos ticket cache',claims:['kerberos.tickets']},
 'laps-read':{family:'laps-read',source:'v5.3',proof:'explicit readable LAPS password value',claims:['credential.candidate','credential.plaintext']},
 'windows-enum':{family:'windows-local-enum',source:'v5.3',proof:'explicit privilege-escalation lead in local enumeration output',claims:['privesc.leads']},
 'seimpersonate':{family:'seimpersonate-system-proof',source:'v5.3',proof:'explicit NT AUTHORITY\\SYSTEM execution output',claims:['access.system']},
 'dpapi-secrets':{family:'dpapi-credential-recovery',source:'v5.3',proof:'explicit decrypted credential fields',claims:['credential.candidate','credential.plaintext']},
 'stored-credentials':{family:'windows-stored-credentials',source:'v5.3',proof:'explicit saved credential target or non-empty stored password field',claims:['credential.candidate','credential.plaintext']}
};
const before={},repaired=[],surfaceAdds={};
for(const id of Object.keys(profiles)){
 const c=card(id);if(!c||!c.orange44)continue;
 before[id]={evidenceReady:!!c.evidence45,commands:(c.commands||[]).length,explicit:(c.commands||[]).filter(x=>!!x.operatorSurface40).length};
 c.evidence45={...profiles[id]};M45.profiles[id]={...profiles[id]};if(!M45.profileCardIds.includes(id))M45.profileCardIds.push(id);
 if(c.report47){c.report47.evidenceProfile=true;c.report47.evidenceFamily=profiles[id].family;c.report47.evidenceSource='v5.3';c.report47.claims=[...(profiles[id].claims||[])];}
 if(M47&&Array.isArray(M47.contracts)){const r=M47.contracts.find(x=>x.cardId===id);if(r){r.evidenceProfile=true;r.evidenceFamily=profiles[id].family;r.evidenceSource='v5.3';r.claims=[...(profiles[id].claims||[])];}}
 repaired.push(id);
}
surfaceAdds['smb-anon-enum']=setSurfaces(card('smb-anon-enum'),()=> 'kali');
surfaceAdds['dns-enum']=setSurfaces(card('dns-enum'),()=> 'kali');
surfaceAdds['kerberos-tickets']=setSurfaces(card('kerberos-tickets'),()=> 'kali');
surfaceAdds['laps-read']=setSurfaces(card('laps-read'),(cmd,i)=>i===0?'kali':'windows');
surfaceAdds['windows-enum']=setSurfaces(card('windows-enum'),()=> 'target');
surfaceAdds['seimpersonate']=setSurfaces(card('seimpersonate'),()=> 'target');
surfaceAdds['dpapi-secrets']=setSurfaces(card('dpapi-secrets'),(cmd,i)=>i===0?'target':i===3?'windows':'kali');
surfaceAdds['stored-credentials']=setSurfaces(card('stored-credentials'),()=> 'target');
for(const id of repaired){const c=card(id);c.deliveryRepair53={source:'v5.3',profile:profiles[id].family,executionAdds:surfaceAdds[id]||0,canonicalKeys:(c.orange43||[]).map(x=>x.key)};}
root.OBOL_METHODOLOGY_V53={version:'5.3.0',profiles,repairedCardIds:repaired,before,surfaceAdds,source:'v5.2 Build next implemented-quality debt priority'};
})(typeof window!=='undefined'?window:globalThis);
