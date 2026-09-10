'use strict';
(function(root){
const completedTools=Object.freeze(['WhatWeb','Nikto','httpx','wfuzz','ZAP']);
const remainingGroups=Object.freeze([
 'network/host discovery',
 'DNS/SNMP/AD collectors',
 'remote execution and lateral movement',
 'credential relay/capture helpers',
 'pivot transports',
 'privilege-escalation helpers',
 'cloud/container/database/service tooling',
 'controlled CVE/PoC wrappers'
]);
root.OBOL_TOOL_BUILDER_WEB_SCAN_V1009=Object.freeze({
 version:'v10.09',
 item:'post-notes-tool-builder-implementation-backlog',
 completedSlice:'web discovery/scanning modeled-tool burn-down',
 completedTools,
 remainingGroups,
 contract:'Each promoted web tool has schema-driven minimum viable command generation, supplied/Evidence-derived prefill, additive controls, executable Evidence ingestion, conservative proof boundaries, and regression coverage. The broader modeled Tool Builder backlog remains active.'
});
})(typeof window!=='undefined'?window:globalThis);
