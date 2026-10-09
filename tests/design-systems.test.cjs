const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const {searchCatalog,resolveReference}=require('../Design System/search-core.cjs');
const {loadCatalog,compactResult}=require('../Design System/search.cjs');
const {inspectPage,within}=require('../scripts/lib/design-system-source.cjs');
const director=require('../.agents/skills/art-director/scripts/generate_art_direction.cjs');
const {selectReferences}=require('../.agents/skills/design-reference-selector/scripts/select_design_reference.cjs');
const catalog=loadCatalog(path.join(root,'Design System'));

function fixture(t) {
  const tempParent=fs.realpathSync(os.tmpdir());
  const dir=fs.mkdtempSync(path.join(tempParent,'design-systems-test-'));
  t.after(()=>{
    const absolute=fs.realpathSync(dir);
    assert.equal(path.dirname(absolute),tempParent);
    assert.ok(path.basename(absolute).startsWith('design-systems-test-'));
    fs.rmSync(absolute,{recursive:true,force:true});
  });
  const entries=catalog.filter(d=>['aex.aura.build','savory-plate.aura.build'].includes(d.id));
  for(const entry of entries) for(const file of new Set([entry.pagina_principal,entry.design_system_page])) {
    const target=path.join(dir,'Design System',file);fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.copyFileSync(path.join(root,'Design System',file),target);
  }
  fs.writeFileSync(path.join(dir,'Design System/catalog.json'),JSON.stringify(entries));
  const lead=path.join(dir,'leads/oficina-horizonte');fs.mkdirSync(path.join(lead,'referencias'),{recursive:true});
  fs.writeFileSync(path.join(lead,'lead.json'),JSON.stringify({slug:'oficina-horizonte',name:'Oficina Horizonte',niche:'Metalúrgica e corte de chapas'}));
  const copy='A Oficina Horizonte trabalha com corte e dobra de chapas de aço. Atendimento por orçamento.';
  fs.writeFileSync(path.join(lead,'referencias/site-atual.md'),copy);
  const asset='public/assets/clients/oficina-horizonte/foto.svg';fs.mkdirSync(path.dirname(path.join(dir,asset)),{recursive:true});
  fs.writeFileSync(path.join(dir,asset),'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>');
  const aex=entries.find(e=>e.id==='aex.aura.build');
  const proposal={
    schema_version:2,slug:'oficina-horizonte',aesthetic_concept:'Ofício e precisão em composição editorial',
    client_understanding:{site_type:'Institucional de serviços',audience:'Compradores de peças',objective:'Solicitar orçamento',brand_context:'Preservar o ofício e as imagens reais'},
    evidence:[{id:'source-services',path:'referencias/site-atual.md',quote:copy}],
    reference_choices:[{id:aex.id,query:'tipografia condensada fotografia composição assimétrica',reason:'Adaptar a composição de produto à apresentação dos serviços',used_patterns:['Tipografia condensada e fotografia segmentada'],inspection:{path:aex.pagina_principal,quote:aex.source_evidence.page.headings[0],preview_checked:true,visual_notes:'Composição assimétrica com painéis de imagem e título condensado'}}],
    alternatives:[{concept:'Catálogo técnico em lista',reason_not_selected:'A imagem do trabalho deve ter maior presença na abertura'}],
    theme_tokens:{...aex.tokens},copy:{headline:'Corte e dobra de chapas de aço',subheadline:'Atendimento por orçamento na Oficina Horizonte.',primaryCta:'Solicitar orçamento',evidence_ids:['source-services']},
    hero_specification:{composition:'Fotografia em painéis com título lateral',desktop:'Título ao lado dos painéis de foto',mobile:'Título seguido da fotografia com CTA visível',cta_treatment:'Botão de contraste com hover discreto',motion:'Revelação suave',reduced_motion:'Exibir o conteúdo imediatamente',asset_path:asset,image_alt:'Trabalho da oficina',credibility:[]},
    section_flow:[{type:'hero',layout:'Título lateral e fotografia',purpose:'Apresentar o serviço de corte e dobra',evidence_ids:['source-services']},{type:'contact',layout:'Chamada direta',purpose:'Solicitar orçamento',evidence_ids:['source-services']}]
  };
  return {dir,lead,proposal,entries};
}

test('catalog keeps every reference addressable, with source evidence and no fixed page recipe',()=>{
  assert.equal(catalog.length,61);assert.equal(new Set(catalog.map(d=>d.id)).size,catalog.length);
  for(const entry of catalog) {
    assert.ok(entry.source_evidence.page.sources.length);assert.equal(entry.source_evidence.page.render_verified,false);
    assert.deepEqual(entry.recommended_components,{});assert.ok(!entry.tokens||entry.tokens.enableParallax===false);
  }
  assert.throws(()=>resolveReference(catalog,'echelon.aura.build'),/ambíguo/);
  assert.equal(resolveReference(catalog,'echelon.aura.build--claro').legacy_id,'echelon.aura.build');
});
test('source extraction distinguishes loaded fonts from fonts used in the page',()=>{
  const aex=catalog.find(d=>d.id==='aex.aura.build'),future=catalog.find(d=>d.id==='futureui.aura.build');
  assert.deepEqual(aex.fontes,['Oswald','Inter']);assert.deepEqual(future.fontes,['Oswald','Space Grotesk']);
  assert.ok(!aex.nichos.some(n=>/metal|industrial|maquin/i.test(n)));assert.ok(future.titulo.includes('interfaces'));
  assert.equal(inspectPage(path.join(root,'Design System'),aex.pagina_principal).background,'#ebedea');
});
test('no generic result for empty, unknown, theme-only or unsupported industry requests',()=>{
  for(const options of [{},{query:'xylophonexyz'},{theme:'escuro'},{query:'metalúrgica corte dobra'},{query:'equipamentos para panificação industrial'}]) assert.deepEqual(searchCatalog(catalog,options).map(r=>r.id),[],JSON.stringify(options));
  assert.throws(()=>searchCatalog(catalog,{query:'saúde',minScore:-1}));
});
test('different contexts retrieve appropriate families and explain their scores',()=>{
  const cases=[['clínica odontológica acolhedora e moderna','white-medical'],['fotografia portfólio','aris-photograph.aura.build'],['gastronomia receitas','savory-plate.aura.build'],['barbearia','barbershop-landing-51.aura.build'],['hotel spa turismo','luxury-desert-retreat-1.aura.build']];
  for(const [query,id] of cases) {
    const result=searchCatalog(catalog,{query,limit:3});assert.equal(result[0]?.id,id,query);
    assert.ok(result[0].score>0);assert.ok(result[0].match_reasons.length>0);
  }
  assert.ok(!searchCatalog(catalog,{query:'ia',limit:61}).some(d=>d.id==='barbershop-landing-51.aura.build'));
});
test('visual transfer is explicit and variants do not crowd the shortlist',()=>{
  const results=searchCatalog(catalog,{niche:'metalúrgica',vibe:'tipografia condensada fotografia composição assimétrica'});
  assert.equal(results[0].match_kind,'visual_transfer');assert.ok(results[0].match_reasons.some(r=>r.includes('Setor diferente')));
  const arch=searchCatalog(catalog,{query:'arquitetura',limit:61});assert.equal(new Set(arch.map(r=>r.family)).size,arch.length);
  const filtered=searchCatalog(catalog,{query:'arquitetura',theme:'escuro',limit:61});assert.ok(filtered.every(r=>r.tema==='escuro'));
});
test('Node and TypeScript use the same ranking, and missing matches are handled',async()=>{
  const api=await import('../Design System/design-system-selector.ts');
  const options={query:'fotografia portfólio',limit:4};
  assert.deepEqual(api.queryDesignSystems(options).map(r=>[r.designSystem.id,r.score]),searchCatalog(catalog,options).map(r=>[r.id,r.score]));
  assert.equal(api.recommendDesignSystemAndComponents({niche:'xylophonexyz',vibe:''}),null);
  assert.throws(()=>api.getDesignSystemTokens('echelon.aura.build'),/ambíguo/);
  const partial=catalog.find(d=>!d.tokens);assert.throws(()=>api.getDesignSystemTokens(partial.id),/incompletos/);
});
test('catalog loader rejects missing paths, duplicates and traversal',t=>{
  const f=fixture(t);assert.throws(()=>within(path.join(f.dir,'Design System'),'../leads/oficina-horizonte/lead.json'),/fora/);
  const file=path.join(f.dir,'Design System/catalog.json');
  fs.writeFileSync(file,JSON.stringify([f.entries[0],f.entries[0]]));assert.throws(()=>loadCatalog(path.dirname(file)),/duplicado/);
  fs.writeFileSync(file,JSON.stringify([{...f.entries[0],design_system_page:'missing.html'}]));assert.throws(()=>loadCatalog(path.dirname(file)),/ausente/);
});
test('new clients get a source-based brief without legal defaults or invented ratings',t=>{
  const f=fixture(t);const brief=director.prepareBrief('oficina-horizonte',[],f.dir);
  assert.equal(brief.status,'NEEDS_CREATIVE_DIRECTION');assert.equal(brief.client.niche,'Metalúrgica e corte de chapas');
  assert.ok(brief.site_copy.includes('corte e dobra'));assert.ok(brief.asset_candidates.length>0);
  assert.ok(!JSON.stringify(brief).includes('4.9'));assert.ok(!JSON.stringify(brief).includes('Advocacia'));
  assert.ok(!fs.existsSync(path.join(f.lead,'referencias/art-direction.json')));
});
test('selection never overwrites a previous file on no match and marks results as candidates',t=>{
  const f=fixture(t),file=path.join(f.lead,'referencias/design-system-selected.json');fs.writeFileSync(file,'previous');
  assert.throws(()=>selectReferences({slug:'oficina-horizonte',query:'xylophonexyz'},f.dir),/Nenhuma/);assert.equal(fs.readFileSync(file,'utf8'),'previous');
  const result=selectReferences({slug:'oficina-horizonte',query:'tipografia condensada composição assimétrica'},f.dir);
  assert.equal(result.status,'CANDIDATES_FOR_REVIEW');assert.ok(result.primary_reference.score>0);
});
test('unsupported claims, false sources and foreign assets cannot be published',t=>{
  const f=fixture(t);
  const rating=structuredClone(f.proposal);rating.hero_specification.credibility=[{text:'Avaliação 4.9 estrelas',evidence_ids:['source-services']}];
  assert.throws(()=>director.publishProposal('oficina-horizonte',rating,f.dir),/Número sem evidência/);
  const fake=structuredClone(f.proposal);fake.evidence[0].quote='A oficina tem 50 anos de atuação.';
  assert.throws(()=>director.publishProposal('oficina-horizonte',fake,f.dir),/Trecho não encontrado/);
  const asset=structuredClone(f.proposal);asset.hero_specification.asset_path='public/assets/clients/outro/foto.jpg';
  assert.throws(()=>director.publishProposal('oficina-horizonte',asset,f.dir),/deste cliente/);
  const unseen=structuredClone(f.proposal);unseen.reference_choices[0].inspection.preview_checked=false;
  assert.throws(()=>director.publishProposal('oficina-horizonte',unseen,f.dir),/Inspecione/);
  const hidden=structuredClone(f.proposal);hidden.hero_specification.stats=[{label:'Avaliação',value:'4.9'}];
  assert.throws(()=>director.publishProposal('oficina-horizonte',hidden,f.dir),/fora do contrato/);
  assert.ok(!fs.existsSync(path.join(f.lead,'referencias/art-direction.json')));
});
test('publish uses canonical paths and source changes invalidate the handoff',t=>{
  const f=fixture(t);director.publishProposal('oficina-horizonte',f.proposal,f.dir,true);assert.ok(!fs.existsSync(path.join(f.lead,'referencias/art-direction.json')));
  director.publishProposal('oficina-horizonte',f.proposal,f.dir);
  assert.equal(director.checkPublished('oficina-horizonte',f.dir).status,'READY_FOR_BUILDER');
  const selected=JSON.parse(fs.readFileSync(path.join(f.lead,'referencias/design-selection.json'),'utf8'));
  assert.ok(selected.selectedDesignSystems.every(r=>fs.existsSync(r.path)));
  fs.appendFileSync(path.join(f.lead,'referencias/site-atual.md'),' Novas informações.');
  assert.throws(()=>director.checkPublished('oficina-horizonte',f.dir),/Fonte mudou/);
});
test('an identical composition cannot pass as a new personalized direction',t=>{
  const f=fixture(t),other=path.join(f.dir,'leads/another-client/referencias');fs.mkdirSync(other,{recursive:true});
  fs.writeFileSync(path.join(other,'art-direction.json'),JSON.stringify({...f.proposal,slug:'another-client'}));
  const copy={...f.proposal,differentiation:'Mudança somente do nome e da fotografia'};
  assert.throws(()=>director.publishProposal('oficina-horizonte',copy,f.dir),/repetidos/);
});
test('a broken sidecar path invalidates an otherwise valid published direction',t=>{
  const f=fixture(t);director.publishProposal('oficina-horizonte',f.proposal,f.dir);
  const file=path.join(f.lead,'referencias/design-selection.json');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));data.selectedDesignSystems[0].path=path.join(f.dir,'missing.html');
  fs.writeFileSync(file,JSON.stringify(data));
  assert.throws(()=>director.checkPublished('oficina-horizonte',f.dir),/Caminho publicado inválido/);
});
test('CLI reports malformed requests as errors rather than falling back',()=>{
  const result=spawnSync(process.execPath,[path.join(root,'Design System/search.cjs'),'--tema','invalido','--query','saúde'],{encoding:'utf8'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/Tema inválido/);
});
test('compact retrieval preserves the decision and its sources without the CSS inventory',()=>{
  const result=searchCatalog(catalog,{query:'fotografia portfólio',limit:1})[0];
  const compact=compactResult(result);
  assert.equal(compact.id,result.id);assert.equal(compact.score,result.score);
  assert.deepEqual(compact.match_reasons,result.match_reasons);
  assert.equal(compact.source_evidence.page_source.path,result.pagina_principal);
  assert.ok(JSON.stringify(compact).length<JSON.stringify(result).length);
});
