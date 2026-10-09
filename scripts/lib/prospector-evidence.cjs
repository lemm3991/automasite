const fs=require('node:fs');
const {collectSources,read,write,inside,digest,validateFacts,allowedFacts,evidenceErrors,assertFresh}=require('./source-evidence.cjs');
const {classifyCandidate,validateAssetReview,paletteCandidates}=require('./asset-evidence.cjs');
function operationalErrors(bundle,review) {
 const errors=[],criteria=review?.operationalCriteria||[],facts=allowedFacts(review||{}),ids=new Set(facts.map(f=>f.id));
 if(!review?.niche||!review?.audience||!review?.businessModelReason)errors.push('Contexto operacional não avaliado');
 if(criteria.length<3)errors.push('Matriz operacional específica ausente');
 let total=0;
 for(const c of criteria) {
  if(!c.label||!c.reason||!c.finding||!c.factIds?.length||c.factIds.some(id=>!ids.has(id)))errors.push(`Critério sem contexto factual: ${c.label}`);
  errors.push(...evidenceErrors(bundle,c.evidence));
  if(!Number.isFinite(c.weight)||c.weight<=0||!Number.isFinite(c.score)||c.score<0||c.score>10)errors.push(`Peso/nota inválido: ${c.label}`);total+=c.weight||0;
 }
 if(Math.abs(total-1)>0.001)errors.push('Pesos operacionais devem somar 1');
 for(const finding of review?.elementClaims||[]) {
  const page=bundle.pages.find(p=>p.id===finding.pageId);
  const list={form:page?.forms,field:page?.forms.flatMap(f=>f.fields),cta:page?.links,section:page?.sections}[finding.kind];
  if(!list?.some(e=>e.selector===finding.selector))errors.push(`Elemento inexistente: ${finding.kind} ${finding.selector}`);
 }
 return errors;
}
async function prepare(root,params) {
 const slug=params.slug,base=`leads/${slug}`,ref=`${base}/referencias`;
 const sources=await collectSources(root,slug);write(root,`${ref}/source-evidence.json`,sources);
 const manifest=read(root,`${ref}/assets-manifest.json`);
 manifest.schemaVersion=2;
 for(const a of manifest.assets){a.classification=classifyCandidate(a);a.category=a.classification.category;a.sha256=digest(fs.readFileSync(inside(root,`public/${a.localPublicPath.replace(/^\//,'')}`)));}
 const reviewFile=`${ref}/source-review.json`,assetFile=`${ref}/asset-review.json`;
 const review=fs.existsSync(inside(root,reviewFile))?read(root,reviewFile):null;
 const assets=fs.existsSync(inside(root,assetFile))?read(root,assetFile):{assets:[]};
 const errors=review?[...validateFacts(sources,review),...operationalErrors(sources,review)]:['NEEDS_FACTUAL_REVIEW'];
 errors.push(...validateAssetReview(root,manifest,assets));
 for(const a of manifest.assets){const inspection=assets.assets.find(r=>r.path===a.localPublicPath&&r.sha256===a.sha256);if(inspection){a.category=inspection.category;a.classification={...inspection,status:'verified'};}}
 write(root,`${ref}/assets-manifest.json`,manifest);
 write(root,`${ref}/palette-candidates.json`,await paletteCandidates(root,sources,manifest,assets));
 const facts=errors.length?[]:allowedFacts(review),first=kind=>facts.find(f=>f.kind===kind)?.value||'';
 const entities=[...new Set(facts.filter(f=>f.kind==='address').map(f=>f.entityId))];
 const primary=review?.primaryEntityId;
 if(primary&&!facts.some(f=>f.entityId===primary))errors.push('Unidade principal desconhecida');
 if(entities.length>1&&(!primary||!review.primaryEntityReason))errors.push('Múltiplas unidades: justificar entidade principal');
 const businessValue=kind=>facts.find(f=>f.kind===kind&&f.entityId===primary)?.value||((entities.length<=1)?first(kind):'');
 const opportunity=errors.length?null:Math.round(review.operationalCriteria.reduce((sum,c)=>sum+c.weight*c.score,0)*10)/10;
 const lead={slug,name:params.name||first('name'),url:params.url,niche:params.niche||review?.niche||'unconfirmed',searchContext:{city:params.city||'',state:params.state||''},city:businessValue('city'),state:businessValue('state'),scores:{opportunity},main_gap:errors.length?'Avaliação factual pendente':review.operationalCriteria.filter(c=>c.score>=5).map(c=>c.finding).join(' '),business:{name:params.name||first('name'),niche:params.niche||review?.niche||'unconfirmed',city:businessValue('city'),state:businessValue('state'),phone:businessValue('phone'),whatsapp:businessValue('phone'),address:businessValue('address'),website:params.url},facts,units:entities.map(id=>({id,facts:facts.filter(f=>f.entityId===id)})),factualStatus:errors.length?'NEEDS_FACTUAL_REVIEW':'REVIEWED'};
 write(root,`${base}/lead.json`,lead);
 let md=`# SITE ATUAL — ${lead.name}\n\nFonte: site oficial; transcrições vinculadas ao HTML em source-evidence.json.\n\n## Fatos liberados\n`;
 for(const f of facts)md+=`- [${f.id}] ${f.kind} (${f.entityId}): ${f.value} [${f.status}${f.resolution?'; escolha justificada':''}]\n`;
 md+='\n## Fontes e arquitetura\n';for(const p of sources.pages){md+=`\n### ${p.url}\n`;for(const h of p.headings)md+=`- ${h.text} — ${h.selector}\n`;md+=`\n${p.text}\n`;}
 md+='\n## Avaliação operacional\n';md+=review&&!errors.length?review.operationalCriteria.map(c=>`- ${c.label}: ${c.score}/10; peso ${c.weight}. ${c.finding} Motivo: ${c.reason}`).join('\n'):'Pendente; nenhuma nota estética ou industrial foi presumida.';
 md+=`\n\nOportunidade: ${opportunity===null?'não avaliada':opportunity+'/10'}.\n`;
 write(root,`${ref}/site-atual.md`,md);
 const inspected=manifest.assets.filter(a=>a.classification.method==='image-view'&&a.classification.status==='verified');
 const handoff={handoffVersion:'4.0-evidence',leadSlug:slug,companyName:lead.name,officialUrl:params.url,niche:lead.niche,status:errors.length?'NEEDS_FACTUAL_REVIEW':'READY_FOR_ART_DIRECTION',errors,facts:errors.length?[]:facts,conflicts:(review?.facts||[]).filter(f=>f.status!=='verified'),ambiguities:sources.ambiguities,primaryEntityId:primary||null,primaryEntityReason:review?.primaryEntityReason||null,primaryLogoLocal:inspected.find(a=>a.category==='logo')?.localPublicPath||null,primaryHeroImageLocal:null,primaryFacilityPhotoLocal:inspected.find(a=>a.category==='environment')?.localPublicPath||null,filesMap:{leadJson:`${base}/lead.json`,siteAtualMd:`${ref}/site-atual.md`,pagesManifest:`${ref}/pages-manifest.json`,assetsManifest:`${ref}/assets-manifest.json`,sources:`${ref}/source-evidence.json`,factsReview:reviewFile,assetReview:assetFile,screenshots:Object.fromEntries(['desktop','mobile'].flatMap(v=>[[v+'Full',`${base}/screenshots/site-${v}-full.png`],[v+'Fold',`${base}/screenshots/site-${v}.png`]]))},metricsSummary:{opportunityScore:opportunity,pagesDownloaded:sources.pages.length,assetsDownloaded:manifest.assets.length},limitations:['A coleta não atribui notas estéticas. Critérios operacionais exigem avaliação do agente com fontes.','Classificação dimensional não identifica assunto; assets sem inspeção permanecem indisponíveis para descrições factuais.']};
 write(root,`${ref}/download-handoff.json`,handoff);return handoff;
}
async function validate(root,slug) {
 const ref=`leads/${slug}/referencias`,sources=read(root,`${ref}/source-evidence.json`),review=read(root,`${ref}/source-review.json`),manifest=read(root,`${ref}/assets-manifest.json`),assets=read(root,`${ref}/asset-review.json`);
 assertFresh(root,sources);
 const errors=[...validateFacts(sources,review),...operationalErrors(sources,review),...validateAssetReview(root,manifest,assets)];
 const actual=await collectSources(root,slug);
 if(JSON.stringify(actual.pages)!==JSON.stringify(sources.pages)||JSON.stringify(actual.ambiguities)!==JSON.stringify(sources.ambiguities))errors.push('Inventário de evidências diverge do HTML baixado');
 const handoff=read(root,`${ref}/download-handoff.json`);
 if(JSON.stringify(handoff.facts)!==JSON.stringify(allowedFacts(review)))errors.push('Handoff não corresponde aos fatos liberados');
 return {passed:!errors.length,errors};
}
module.exports={prepare,validate,operationalErrors};
