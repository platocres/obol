'use strict';

const path=require('path');
const {loadCurrent}=require('./current-runtime');

const root=path.join(__dirname,'..');
const {C,lanes}=loadCurrent(root);
const projectModel=C.currentProjectModel||C.projectModel68||C.projectModel67||C.projectModel66;
const p=projectModel(C.newState(),lanes),state={
  total:p.buildNext.total,
  implementedQuality:p.quality.implementedQuality,
  mappedDelivery:p.quality.mappedDelivery,
  canonicalGaps:p.quality.canonicalGaps
};

if(state.implementedQuality!==0||state.mappedDelivery!==0){
  console.error('Release quality gate failed. Higher-priority delivery debt must be cleared before merge.');
  console.error(`- implemented-quality repairs: ${state.implementedQuality}`);
  console.error(`- mapped-delivery repairs: ${state.mappedDelivery}`);
  console.error(`- canonical gaps: ${state.canonicalGaps}`);
  process.exit(1);
}

console.log(`Release quality gate passed: 0 implemented-quality repairs, 0 mapped-delivery repairs, ${state.canonicalGaps} canonical gaps.`);
