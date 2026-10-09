const fs=require('node:fs');
const {inside,read,digest,clean,allowedFacts}=require('./source-evidence.cjs');
const {dimensions}= {dimensions:['hero','order','grids','rhythm','images','backgrounds','cards','typography','cta']};
function factualReviewErrors(root,slug,review,render,assets,facts) {
 const errors=[],texts=new Map();
 for(const capture of render.captures||[])for(const t of capture.observations?.texts||[])texts.set(digest(t.selector+'\n'+t.text),t);
 if(!texts.size)errors.push('Inventário de texto renderizado ausente');
 const bindings=review?.textReviews||[];
 for(const [id,t] of texts) {
  const binding=bindings.find(b=>b.id===id);
  if(!binding||!['factual','visual','editorial','interface'].includes(binding.kind)||!binding.reason){errors.push('Texto sem revisão factual: '+t.text.slice(0,100));continue;}
  if(binding.kind==='factual') {
   const source=(binding.factIds||[]).map(id=>facts.find(f=>f.id===id));
   if(!source.length||source.some(f=>!f)||!source.some(f=>clean(f.value).includes(clean(t.text))))errors.push('Texto factual diverge das fontes verificadas: '+t.text);
  }else if(binding.kind==='visual') {
   const asset=assets.assets.find(a=>a.path===binding.assetPath);
   if(!asset||![asset.description,...asset.allowedCaptions].includes(t.text))errors.push('Texto visual sem inspeção correspondente: '+t.text);
  }else if(/\(\d{2}\)|\d{2}:\d{2}|\b(?:segunda|terça|quarta|quinta|sexta|sábado|domingo)\b/i.test(t.text))errors.push('Horário/telefone precisa de classificação factual: '+t.text);
 }
 for(const capture of render.captures||[])for(const img of capture.observations?.images||[]) {
  const asset=assets.assets.find(a=>a.path===img.src);
  if(!asset){errors.push('Imagem sem descrição validada: '+img.src);continue;}
  if(![asset.description,...asset.allowedCaptions].includes(img.alt))errors.push('Alt incompatível com descrição validada: '+img.alt);
  if(img.caption&&!asset.allowedCaptions.includes(img.caption))errors.push('Legenda sem validação: '+img.caption);
 }
 if(review?.status!=='approved')errors.push('Revisão factual não aprovada');
 return errors;
}
function validateDetailedReview(root,slug,review,render) {
 const errors=[],assert=(ok,message)=>{if(!ok)errors.push(message);};
 let plan,sources,assetReview,factsReview;
 try {plan=read(root,`leads/${slug}/redesign/implementation-plan.json`);sources=read(root,`leads/${slug}/referencias/source-review.json`);assetReview=read(root,`leads/${slug}/referencias/asset-review.json`);factsReview=read(root,`leads/${slug}/redesign/factual-review.json`);}catch(e){return ['Documentação da revisão independente incompleta: '+e.message];}
 assert(review?.schemaVersion===3,'Revisão precisa do contrato 3: técnica, visual e factual separadas');
 assert(review?.reviewedBy&&plan.createdBy&&review.reviewedBy!==plan.createdBy,'Auditoria visual deve ter executor distinto do Builder');
 assert(review?.technicalEvidence?.renderSha256===digest(fs.readFileSync(inside(root,`leads/${slug}/redesign/render-evidence.json`))),'Evidência técnica diverge da revisão');
 assert(review?.factualEvidence?.sha256===digest(fs.readFileSync(inside(root,`leads/${slug}/redesign/factual-review.json`))),'Evidência factual diverge da revisão');
 errors.push(...factualReviewErrors(root,slug,factsReview,render,assetReview,allowedFacts(sources)));
 for(const capture of render.captures||[]) {
  const viewport=capture.viewport.name,assessment=review?.visualAnalysis?.viewports?.find(v=>v.viewport===viewport);
  assert(assessment?.finding,`Análise visual ${viewport} ausente`);
  for(const role of ['logo','message','cta','identity','photo']) {
   const measured=capture.observations?.firstFold?.[role],claim=assessment?.firstFold?.[role];
   assert(measured&&claim?.finding&&typeof claim.inFirstFold==='boolean',`Avaliar ${role} separadamente em ${viewport}`);
   if(measured&&claim)assert(claim.inFirstFold===measured.inFirstFold,`Afirmação visual contradiz posição de ${role} em ${viewport}`);
   if(role==='photo'&&measured?.inFirstFold===false)assert(claim?.tradeoff,'Foto fora da primeira dobra: registrar decisão consciente');
  }
  for(const shot of capture.screenshots||[]) {
   const inspection=review?.visualAnalysis?.inspections?.find(i=>i.path===shot.path&&i.sha256===shot.sha256);
   assert(inspection?.regions?.length>=2,'Inspeção regional ausente: '+shot.path);
   for(const r of inspection?.regions||[])assert(r.description&&r.x>=0&&r.y>=0&&r.width>0&&r.height>0&&r.x+r.width<=shot.width&&r.y+r.height<=shot.height,'Região fora da captura: '+shot.path);
  }
 }
 for(const expected of plan.implementationEvidence||[]) {
  const verdict=review?.visualAnalysis?.references?.find(r=>r.referenceId===expected.referenceId&&r.sectionId===expected.sectionId);
  assert(verdict&&['applied','partial','not_applied'].includes(verdict.status)&&verdict.benefit,'Referência sem avaliação de utilidade: '+expected.referenceId);
  if(verdict?.status==='applied') {
   const records=(render.captures||[]).flatMap(c=>c.observations?.referenceChecks||[]).filter(r=>r.referenceId===expected.referenceId&&r.sectionId===expected.sectionId);
   assert(records.some(r=>r.exists&&r.rendered),'Referência declarada aplicada sem elemento renderizado');
   if(expected.renderCheck?.minColumns>1)assert(records.some(r=>r.rendered&&r.display==='grid'&&r.gridTemplateColumns!=='none'&&r.gridTemplateColumns.split(/\s+/).length>=expected.renderCheck.minColumns&&r.children>=expected.renderCheck.minColumns),'Grid declarado aplicado está inativo/incompleto: '+expected.referenceId);
   for(const [property,value] of Object.entries(expected.renderCheck?.styles||{}))assert(records.some(r=>r.rendered&&r.styles?.[property]===value),`Estilo ${property} não materializado: ${expected.referenceId}`);
  }
 }
 const comparisons=review?.visualAnalysis?.antiClone||[];
 assert(comparisons.length>0,'Comparação estrutural observada ausente');
 try {const implementation=read(root,`leads/${slug}/redesign/implementation-validation.json`);for(const c of implementation.comparisons||[])if(c.structuralSimilarity>=65)assert(comparisons.some(r=>r.slug===c.slug),'Revisar composição sinalizada pela heurística: '+c.slug);}catch{errors.push('Comparação automática ausente');}
 for(const c of comparisons)assert(c.slug&&c.conclusion&&dimensions.every(d=>c.observations?.[d]),'Anti-clone exige observação das nove dimensões');
 assert(!review?.regressions?.some(r=>r.severity==='critical'&&!r.resolved),'Regressão crítica não resolvida');
 return errors;
}
module.exports={factualReviewErrors,validateDetailedReview};
