const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {validate,configFor,fileHash,local}=require('./lib/builder-implementation.cjs');
const {validateRender}=require('./lib/render-validation.cjs');
const {sourceSnapshot,sameSnapshot,validateReview}=require('./lib/builder-evidence.cjs');
async function generate(root,slug,{checkOnly=false}={}){
 if(!/^[a-z0-9-]+$/.test(slug||''))throw new Error('Slug inválido');
 const base=`leads/${slug}/redesign`,errors=[],read=file=>{try{return JSON.parse(fs.readFileSync(local(root,file),'utf8'));}catch{errors.push(`Evidência ausente/inválida: ${file}`);return null;}};
 let implementation;try{implementation=await validate(root,slug,'implemented',{stamp:!checkOnly});errors.push(...implementation.errors);}catch(e){errors.push(e.message);}
 const plan=read(`${base}/implementation-plan.json`),planReceipt=read(`${base}/implementation-plan.validation.json`),build=read(`${base}/build-evidence.json`),review=read(`${base}/visual-review.json`);
 let render;try{render=await validateRender(root,slug);errors.push(...render.errors);}catch(e){errors.push(e.message);render={passed:false,inspected:[]};}
 try{
  const {ClientConfigSchema}=await import(pathToFileURL(local(root,'src/clients/schema.ts')).href);
  ClientConfigSchema.parse(await configFor(root,slug));
 }catch(e){errors.push(`Configuração inválida: ${e.message}`);}
 if(!build?.passed||build.exitCode!==0||!build.schemaValid)errors.push('Build válido não registrado');
 if(!sameSnapshot(build?.sourceHashes,sourceSnapshot(root,slug)))errors.push('Build anterior ao código/assets atuais');
 if(build) for(const [file,digest] of [[build.logPath,build.logSha256],[build.htmlPath,build.htmlSha256]]){
  try{if(fileHash(root,file)!==digest)errors.push(`Evidência de build mudou: ${file}`);}catch{errors.push(`Evidência de build ausente: ${file}`);}
 }
 errors.push(...validateReview(root,slug,review,render));
 const result={schemaVersion:2,slug,status:errors.length?'NEEDS_BUILDER_CORRECTION':'READY_FOR_DEMO',generatedAt:new Date().toISOString(),passed:errors.length===0,errors,
  priorities:['Personalização e adequação ao cliente/ramo','Primeira dobra e qualidade visual','Identidade, conteúdo e assets reais','Fidelidade ao 2A','Responsividade/build','Integrações posteriores'],
  implementation:{planPath:`${base}/implementation-plan.json`,components:plan?.sections?.map(s=>({id:s.id,action:s.action,path:s.outputPath,reason:s.reason})),referenceApplications:plan?.implementationEvidence,previousFingerprint:planReceipt?.previousFingerprint||null,fingerprint:implementation?.fingerprint,comparisons:implementation?.comparisons},
  evidence:{build:`${base}/build-evidence.json`,render:`${base}/render-evidence.json`,visualReview:`${base}/visual-review.json`},renderValidation:render,
  qualitativeReview:review?.status||'pending',removedUnsupportedClaims:review?.copyAudit?.removedFromPrevious||plan?.removedUnsupportedClaims||[],reviewedAbsentClaims:review?.copyAudit?.requestedTermsAlreadyAbsent||[],upstreamCorrections:plan?.upstreamCorrections||[],productionPending:plan?.productionPending||[],
  limitations:['O gate verifica rastreabilidade e atualidade; o julgamento estético e factual depende da inspeção registrada pelo agente.','Prontidão da demonstração não comprova desempenho comercial, produção ou envio ao cliente.']};
 if(!checkOnly){fs.mkdirSync(local(root,base),{recursive:true});fs.writeFileSync(local(root,`${base}/builder-handoff.json`),JSON.stringify(result,null,2));}
 return result;
}
module.exports={generate};
if(require.main===module){const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];generate(path.resolve(__dirname,'..'),slug,{checkOnly:args.includes('--check-only')}).then(r=>{console.log(JSON.stringify({slug:r.slug,status:r.status,errors:r.errors},null,2));if(!r.passed)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});}
