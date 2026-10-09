const fs=require('node:fs'),path=require('node:path');
const {read,write,inside,digest,allowedFacts,assertFresh}=require('./source-evidence.cjs');
const {validate:validateProspector}=require('./prospector-evidence.cjs');
const {validatePalette}=require('./asset-evidence.cjs');
const {loadCatalog}=require('../../Design System/search.cjs');
const {searchCatalog,resolveReference}=require('../../Design System/search-core.cjs');
const dimensions=['heroType','sectionOrder','imageStrategy','gridStrategy','backgroundTreatment','cardTreatment','typography','motion','ctaStyle','rhythm'];
function checkDecision(context,proposal,root) {
 const errors=[],facts=context.facts,ids=new Set(facts.map(f=>f.id)),assets=context.assets;
 const assert=(ok,message)=>{if(!ok)errors.push(message);};
 assert(proposal?.schemaVersion===3&&proposal.slug===context.slug,'Versão/slug da decisão inválidos');
 assert(proposal?.createdBy&&proposal?.createdAt,'Autoria da decisão ausente');
 assert(proposal?.typography?.heading&&proposal?.typography?.body&&['light','dark'].includes(proposal.themeMode),'Tokens tipográficos/tema ausentes');
 assert(proposal.contextSha256===digest(JSON.stringify(context)),'Contexto criativo mudou');
 const refs=proposal.references||[];
 assert(refs.length>=2,'Comparar pelo menos duas referências pertinentes');
 for(const ref of refs) {
  const candidate=context.retrieval.flatMap(q=>q.results).find(r=>r.id===ref.id);
  assert(candidate,'Referência não recuperada: '+ref.id);
  if(!candidate)continue;
  const html=fs.readFileSync(inside(root,candidate.path),'utf8');
  assert(ref.sourceSha256===digest(html)&&ref.observations?.length>0,'Referência sem inspeção atual: '+ref.id);
  for(const o of ref.observations||[])assert(o.excerpt?.length>=12&&html.includes(o.excerpt)&&o.benefit&&o.factIds?.length&&o.factIds.every(id=>ids.has(id)),'Padrão sem fonte/benefício específico: '+ref.id);
 }
 const alts=proposal.alternatives||[];
 assert(alts.length===3&&new Set(alts.map(a=>a.id)).size===3,'Três alternativas distintas são necessárias');
 const compositionKeys=new Set();
 for(const alt of alts) {
  assert(alt.concept&&alt.tradeoff&&alt.rationale,'Alternativa sem comparação: '+alt.id);
  const triggers=alt.clientTriggers||[];
  assert(triggers.length>=2&&new Set(triggers.flatMap(t=>t.factIds||[])).size>=2,'Alternativa sem dois fatos específicos: '+alt.id);
  for(const t of triggers)assert(t.decision&&t.factIds?.length&&t.factIds.every(id=>ids.has(id)),'Origem factual da alternativa inválida: '+alt.id);
  for(const key of ['positioning','audience','services','identity','architecture'])assert(alt.contextBindings?.[key]?.factIds?.length&&alt.contextBindings[key].reason&&alt.contextBindings[key].factIds.every(id=>ids.has(id)),`Vínculo ${key} ausente: ${alt.id}`);
  assert(Array.isArray(alt.assetPaths)&&alt.assetPaths.every(p=>assets.some(a=>a.path===p))&&(alt.assetPaths.length||alt.noPhotoReason),'Assets não inspecionados: '+alt.id);
  assert(alt.referenceIds?.length&&alt.referenceIds.every(id=>refs.some(r=>r.id===id)),'Referências não avaliadas: '+alt.id);
  for(const key of dimensions)assert(alt.composition?.[key]!=null,`Dimensão ${key} ausente: ${alt.id}`);
  compositionKeys.add(JSON.stringify([alt.composition?.heroType,alt.composition?.gridStrategy,alt.composition?.imageStrategy,alt.composition?.sectionOrder]));
  for(const key of ['identity','assets','audience','references'])assert(Number.isFinite(alt.assessment?.[key]?.score)&&alt.assessment[key].score>=0&&alt.assessment[key].score<=10&&alt.assessment[key].reason,`Avaliação ${key} sem fundamento: ${alt.id}`);
 }
 assert(compositionKeys.size===3,'Alternativas repetem a composição trocando apenas rótulos');
 assert(alts.some(a=>a.id===proposal.chosenId)&&proposal.selectionReason,'Direção deve ser escolhida explicitamente e justificada');
 assert(proposal.hero?.desktop&&proposal.hero?.mobile,'Planejar a primeira dobra em ambos os viewports');
 assert(proposal.hero?.assetPath?assets.some(a=>a.path===proposal.hero.assetPath):proposal.hero?.noPhotoReason,'Hero sem asset inspecionado ou justificativa para composição sem foto');
 const sourceCorpus=facts.map(f=>f.value).join(' ').toLowerCase();
 const sections=proposal.sections||[];
 assert(sections.length>0&&new Set(sections.map(s=>s.id)).size===sections.length,'Seções ausentes/duplicadas');
 for(const s of sections) {
  assert(s.title&&s.compositionRationale&&s.factIds?.length&&s.factIds.every(id=>ids.has(id)),'Seção sem origem no cliente: '+s.id);
  for(const term of ['matérias-primas','peças e trabalhos','cotação','cnpj'])if(s.title?.toLowerCase().includes(term)&&!sourceCorpus.includes(term))errors.push('Rótulo sem suporte factual: '+s.title);
 }
 errors.push(...validatePalette(proposal.palette,context.palette,{assets}));
 return errors;
}
async function prepareContext(root,slug,queries=[]) {
 const result=await validateProspector(root,slug);if(!result.passed)throw new Error(result.errors.join('\n'));
 const baseline=await require('../validate-original-review.cjs').validateOriginal(root,slug);if(!baseline.passed)throw new Error(baseline.errors.join('\n'));
 const base=`leads/${slug}/referencias`,sources=read(root,`${base}/source-evidence.json`);assertFresh(root,sources);
 const review=read(root,`${base}/source-review.json`),lead=read(root,`leads/${slug}/lead.json`),assetReview=read(root,`${base}/asset-review.json`),catalog=loadCatalog(path.join(root,'Design System'));
 const facts=allowedFacts(review),queryList=[review.niche,...queries,...facts.filter(f=>['service','positioning'].includes(f.kind)).slice(0,3).map(f=>f.value)];
 const retrieval=[...new Set(queryList.filter(Boolean))].map(query=>({query,results:searchCatalog(catalog,{query,limit:6,minScore:5}).map(r=>({id:r.id,path:`Design System/${r.design_system_page}`,score:r.score,reasons:r.match_reasons,method:r.retrieval_method,tokenStatus:r.token_status}))}));
 const context={schemaVersion:3,slug,name:lead.name,niche:review.niche,audience:review.audience,facts,conflicts:review.facts.filter(f=>f.status!=='verified'),assets:assetReview.assets,baseline:read(root,`leads/${slug}/visual/original-review.json`),architecture:sources.pages.map(p=>({pageId:p.id,url:p.url,headings:p.headings})),palette:read(root,`${base}/palette-candidates.json`),retrieval,sourceHashes:Object.fromEntries([...['source-evidence.json','source-review.json','asset-review.json','palette-candidates.json'].map(f=>`${base}/${f}`),`leads/${slug}/visual/original-review.json`].map(f=>[f,digest(fs.readFileSync(inside(root,f)))]))};
 write(root,`${base}/design-context.json`,context);return context;
}
async function publish(root,slug,proposal,context) {
 const errors=checkDecision(context,proposal,root);if(errors.length)throw new Error(errors.join('\n'));
 const base=`leads/${slug}`,chosen=proposal.alternatives.find(a=>a.id===proposal.chosenId);
 const ranked=proposal.alternatives.map(a=>({...a,score:Object.values(a.assessment).reduce((sum,v)=>sum+v.score,0)/4})).sort((a,b)=>b.score-a.score);
 const catalog=loadCatalog(path.join(root,'Design System'));
 const selected=proposal.references.map(r=>{const entry=resolveReference(catalog,r.id);return {name:r.id,path:`Design System/${entry.design_system_page}`,sourceSha256:r.sourceSha256,selectionReason:r.observations.map(o=>o.benefit).join(' '),observations:r.observations};});
 const fp={...chosen.composition,selectedVariants:proposal.sections.map(s=>s.variant||'agent-to-select')};
 const art={schema_version:3,slug,client:context.name,status:'READY_FOR_BUILDER',createdBy:proposal.createdBy,createdAt:proposal.createdAt,contextSha256:proposal.contextSha256,decisionSha256:digest(JSON.stringify(proposal)),sourceHashes:context.sourceHashes,clientFactualSummary:{name:context.name,niche:context.niche,audience:context.audience,services:context.facts.filter(f=>f.kind==='service').map(f=>f.value),facts:context.facts},aesthetic_concept:chosen.concept,concept_rationale:proposal.selectionReason,rankedAlternatives:ranked,chosenId:chosen.id,fingerprint:fp,consulted_design_systems:selected.map(r=>r.name),sectionsBlueprint:proposal.sections,heroSpecification:proposal.hero,paletteEvidence:proposal.palette,...Object.fromEntries(Object.entries(proposal.palette).map(([role,c])=>[role==='background'?'backgroundColor':role==='accent'?'accentColor':role==='text'?'textColor':`${role}Color`,c.value])),headingFont:proposal.typography.heading,bodyFont:proposal.typography.body,themeMode:proposal.themeMode,keyAssetsMapping:{heroMain:{path:proposal.hero.assetPath,description:context.assets.find(a=>a.path===proposal.hero.assetPath)?.description||null},logo:{path:context.assets.find(a=>a.category==='logo')?.path||null}},antiClone:{method:'planned-composition-requires-render-review',reviewRequired:true,limitations:'Percentuais de código não comprovam semelhança percebida.'}};
 write(root,`${base}/referencias/art-direction.json`,art);
 write(root,`${base}/referencias/design-selection.json`,{slug,selectedDesignSystems:selected});
 write(root,`${base}/referencias/creative-brief.md`,`# ${context.name}\n\n${chosen.concept}\n\n${proposal.selectionReason}\n\n## Fatos que orientam a composição\n${chosen.clientTriggers.map(t=>`- ${t.factIds.join(', ')}: ${t.decision}`).join('\n')}\n\n## Alternativas avaliadas pelo Diretor\n${ranked.map(a=>`- ${a.concept}: ${a.rationale} Limitação: ${a.tradeoff}`).join('\n')}\n\n## Seções\n${proposal.sections.map(s=>`- ${s.title}: ${s.compositionRationale}`).join('\n')}\n`);
 write(root,`${base}/visual/visual-handoff.json`,{schemaVersion:3,slug,status:'READY_FOR_BUILDER',artDirection:`${base}/referencias/art-direction.json`,facts:context.facts,conflicts:context.conflicts,hero:proposal.hero,assets:context.assets,palette:proposal.palette,requiresIndependentVisualReview:true});
 return art;
}
async function runArtDirector({slug,rootDir=process.cwd(),queries=[],decisionFile,checkOnly=false}) {
 if(checkOnly) {
  // Validation must not rewrite the context with a different retrieval query set.
  const prospector=await validateProspector(rootDir,slug);
  const baseline=await require('../validate-original-review.cjs').validateOriginal(rootDir,slug);
  const published=validatePublished(rootDir,slug);
  const errors=[...prospector.errors,...baseline.errors,...published.errors];
  return {passed:!errors.length,errors};
 }
 if(!queries.length) {
  const prior=`leads/${slug}/referencias/design-context.json`;
  if(fs.existsSync(inside(rootDir,prior)))queries=read(rootDir,prior).retrieval.map(r=>r.query);
 }
 const context=await prepareContext(rootDir,slug,queries),file=decisionFile||`leads/${slug}/referencias/creative-decision.json`;
 if(!fs.existsSync(inside(rootDir,file)))return {status:'NEEDS_CREATIVE_DECISION',context:`leads/${slug}/referencias/design-context.json`,contextSha256:digest(JSON.stringify(context))};
 const proposal=read(rootDir,file),errors=checkDecision(context,proposal,rootDir);
 if(errors.length)throw new Error(errors.join('\n'));
 return publish(rootDir,slug,proposal,context);
}
function validatePublished(root,slug) {
 const base=`leads/${slug}/referencias`,context=read(root,`${base}/design-context.json`),proposal=read(root,`${base}/creative-decision.json`),art=read(root,`${base}/art-direction.json`),errors=checkDecision(context,proposal,root);
 const currentFacts=allowedFacts(read(root,`${base}/source-review.json`));
 if(JSON.stringify(currentFacts)!==JSON.stringify(context.facts))errors.push('Contexto criativo diverge dos fatos liberados');
 for(const [file,hash] of Object.entries(context.sourceHashes||{}))if(digest(fs.readFileSync(inside(root,file)))!==hash)errors.push('Fonte da direção mudou: '+file);
 if(art.schema_version!==3||art.status!=='READY_FOR_BUILDER'||art.contextSha256!==digest(JSON.stringify(context))||art.decisionSha256!==digest(JSON.stringify(proposal)))errors.push('Direção publicada sem validação atual');
 const chosen=proposal.alternatives.find(a=>a.id===proposal.chosenId);
 for(const [actual,expected] of [[art.chosenId,proposal.chosenId],[art.aesthetic_concept,chosen?.concept],[art.sectionsBlueprint,proposal.sections],[art.heroSpecification,proposal.hero],[art.paletteEvidence,proposal.palette],[art.consulted_design_systems,proposal.references.map(r=>r.id)]])if(JSON.stringify(actual)!==JSON.stringify(expected))errors.push('Direção publicada diverge da decisão criativa');
 return {passed:!errors.length,errors};
}
module.exports={dimensions,checkDecision,prepareContext,publish,runArtDirector,validatePublished};
