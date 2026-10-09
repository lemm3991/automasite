const fs=require('fs'),sharp=require('sharp');
const {validate}=require('./lib/prospector-evidence.cjs');
const {read,inside,write}=require('./lib/source-evidence.cjs');
async function audit(root,slug){const report=await validate(root,slug),file='leads/'+slug+'/referencias/download-handoff.json',handoff=read(root,file);for(const [key,p] of Object.entries(handoff.filesMap.screenshots)){try{const meta=await sharp(inside(root,p)).metadata();if(!meta.width||!meta.height||(key.startsWith('mobile')&&meta.width!==390))report.errors.push('Captura inválida: '+p);}catch{report.errors.push('Captura ausente: '+p);}}report.passed=!report.errors.length;handoff.status=report.passed?'READY_FOR_ART_DIRECTION':'NEEDS_FACTUAL_REVIEW';handoff.auditReport=report;write(root,file,handoff);return report;}
module.exports={audit};
if(require.main===module){const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];audit(process.cwd(),slug).then(r=>{console.log(JSON.stringify(r,null,2));if(!r.passed)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});}
