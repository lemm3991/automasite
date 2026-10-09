const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),slug='brotto-campelo',base=`leads/${slug}`;
const {read,write,digest}=require('../../scripts/lib/source-evidence.cjs');
async function main(){
 const sources=read(root,`${base}/referencias/source-evidence.json`),review=read(root,`${base}/referencias/source-review.json`);
 function add(id,kind,value){
  const page=sources.pages.find(p=>p.textBlocks.some(b=>b.text.includes(value)));
  if(!page)throw Error('Fonte ausente: '+value);
  const block=page.textBlocks.filter(b=>b.text.includes(value)).sort((a,b)=>a.text.length-b.text.length)[0];
  const fact={id,kind,entityId:'company',value,status:'verified',evidence:[{pageId:page.id,selector:block.selector,quote:block.text}]};
  review.facts=review.facts.filter(f=>f.id!==id);review.facts.push(fact);
 }
 for(const [id,value] of Object.entries({
  'service-imobiliarias':'Direito Imobiliário Aplicado – Imobiliárias',
  'service-imobiliario-publico':'Direito Imobiliário Aplicado ao Direito Público',
  'service-construtoras':'Direito Imobiliário Aplicado – Construtoras e Incorporadoras',
  'service-registral':'Registral e Notarial'
 }))add(id,'service',value);
 add('positioning-empresarial-imobiliario','positioning','com forte atuação em Direito Empresarial e Imobiliário');
 add('award-national-label','credential','ESCRITÓRIOS MAIS ADMIRADOS DO BRASIL');
 add('award-national-years','credential','2021, 2022, 2023/2024, 2025 e 2026.');
 add('award-regional-label','credential','ESCRITÓRIOS MAIS ADMIRADOS DA REGIÃO SUL');
 add('award-regional-years','credential','2022, 2023, 2024, 2025 e 2026.');
 add('pillar-inovacao-copy','positioning','DNA inovador que orienta o escritório a explorar possibilidades além dos riscos convencionais, abrindo caminho para novos negócios e parcerias transformadoras.');
 add('pillar-abordagem-copy','positioning','Compromisso com o atendimento personalizado, estreitando a relação cliente-advogado através de uma advocacia baseada na confiança, proximidade e compreensão das necessidades individuais dos clientes.');
 add('pillar-facilitadores-copy','positioning','uma atitude proativa em viabilizar negócios e encontrar soluções jurídicas personalizadas');
 review.controlledCorrection={by:'codex-brotto-controlled-builder',at:new Date().toISOString(),reason:'Recuperar áreas omitidas e vincular texto literal às fontes. Nenhuma nova coleta.'};
 write(root,`${base}/referencias/source-review.json`,review);
 const assets=read(root,`${base}/referencias/asset-review.json`);
 for(const a of assets.assets){
  if(a.path.includes('01-BCA')){a.description='Logotipo horizontal Brotto Campelo Advogados em laranja, com monograma BCA.';a.observableDetails=['Monograma BCA e nome do escritório em laranja sobre transparência','Cor dominante medida no arquivo: #e15927'];}
  if(a.path.includes('03-BCA')){a.description='Logotipo horizontal Brotto Campelo Advogados em branco sobre transparência.';a.observableDetails=['Monograma BCA em branco','Nome horizontal branco sobre fundo transparente'];}
  if(a.path.includes('04-SELO')){a.observableDetails=['Selo vertical vermelho com o nome Brotto Campelo Advogados','Ano 2026 e inscrição Escritório Mais Admirado'];a.allowedCaptions.push('Análise Advocacia 2026');}
  if(a.path.includes('08-SELO'))a.allowedCaptions.push('Análise Advocacia 2025');
  if(a.path.includes('11-SELO')){a.observableDetails=['Selo verde com moldura bege e cantos arredondados','Inscrição Análise Advocacia Regional 2024'];a.allowedCaptions.push('Análise Regional 2024');}
  a.allowedCaptions=[...new Set(a.allowedCaptions)];
 }
 write(root,`${base}/referencias/asset-review.json`,assets);
 const lead=read(root,`${base}/lead.json`);
 const prep=await require('../../scripts/lib/prospector-evidence.cjs').prepare(root,{slug,name:lead.name,url:lead.url,niche:lead.niche});
 if(prep.errors.length)throw Error(prep.errors.join('\n'));
 const oldContext=read(root,`${base}/referencias/design-context.json`),director=require('../../scripts/lib/art-direction-evidence.cjs');
 const context=await director.prepareContext(root,slug,oldContext.retrieval.map(r=>r.query));
 const decision=read(root,`${base}/referencias/creative-decision.json`),logo=assets.assets.find(a=>a.path.includes('01-BCA'));
 decision.contextSha256=digest(JSON.stringify(context));decision.createdBy='codex-brotto-controlled-builder';decision.createdAt=new Date().toISOString();
 const neutral=(value,reason)=>({value,status:'neutral',source:'editorial-neutral',reason});
 decision.palette={background:neutral('#f7f4f0','Neutro quente editorial para acolher o retrato e o laranja; não é cor oficial.'),primary:{value:'#e15927',status:'official',source:'logo',path:logo.path,sha256:logo.sha256,reason:'Cor dominante exata medida no logotipo real (36.033 pixels opacos na imagem original).'},secondary:neutral('#292929','Grafite editorial coerente com o original; não declarado oficial.'),accent:{value:'#a83d19',status:'inferred',source:'explicit-visual-inference',path:logo.path,sha256:logo.sha256,reason:'Variação escurecida do laranja para texto e controles legíveis sobre fundo claro; inferência explícita, não cor oficial.'},text:neutral('#292929','Grafite neutro para leitura.'),surface:neutral('#ffffff','Branco neutro nas seções de conteúdo.')};
 decision.selectionReason='Correção controlada da direção já escolhida. Preserva boutique jurídica e seis seções; reforça sócios, laranja/grafite, atuação imobiliária e reconhecimentos reais. AI SaaS contribui parcialmente pela tipografia; Architecture inspira linhas e enquadramento; Luxury foi consultada mas não será apresentada como materializada.';
 decision.hero.desktop='Abertura em duas colunas com retrato ampliado, chamada curta e linhas de enquadramento laranja/grafite; navegação textual e CTA sem formato de pílula.';
 decision.hero.mobile='Título, retrato largo dos sócios, mensagem curta e contato prioritário. Legenda fora da foto. Retirar o parágrafo institucional extenso.';
 const chosen=decision.alternatives.find(a=>a.id===decision.chosenId);
 Object.assign(chosen.composition,{heroType:'split-portrait-editorial',imageStrategy:'founder-portrait-first-mobile',gridStrategy:'open-practice-directory',backgroundTreatment:'warm-white-graphite-orange',cardTreatment:'open-ruled-sections',motion:'subtle-reveal-reduced-motion',ctaStyle:'rectangular',rhythm:'portrait-compact-awards-open-directory'});
 for(const s of decision.sections){if(s.id==='services'){s.factIds=review.facts.filter(f=>f.kind==='service').map(f=>f.id);s.compositionRationale='Diretório aberto das 12 áreas documentadas, com atuação imobiliária e registral em destaque e links reais para as páginas originais.';}if(s.id==='awards')s.compositionRationale='Faixa compacta com três selos autênticos, histórico nacional/regional e linhas de alinhamento, sem cartões aninhados.';if(s.id==='pillars')s.compositionRationale='Três princípios originais em colunas abertas sobre grafite, sem cartões fechados.';}
 write(root,`${base}/referencias/creative-decision.json`,decision);
 const errors=director.checkDecision(context,decision,root);if(errors.length)throw Error(errors.join('\n'));
 director.publish(root,slug,decision,context);
 const plan=read(root,`${base}/redesign/implementation-plan.json`);
 plan.createdBy='codex-brotto-controlled-builder';plan.requiredVisualComparisons=['iorc-odontologia','dl-cabeleireiros','metalurgica-sao-jorge'];
 plan.hero.desktop=decision.hero.desktop;plan.hero.mobile=decision.hero.mobile;plan.hero.selectors.identity='#bca-hero .bca-eyebrow';
 plan.hero.changes=['Retrato amplo antes do texto de apoio no mobile','Copy curta documentada e laranja do logo','Navegação textual e botões retangulares'];
 plan.removedUnsupportedClaims=['assembleias societárias e conferências internacionais','contratos de software e SaaS, inteligência artificial','operações de crédito rural (CPR)'];
 plan.upstreamCorrections=['Logo descrito corretamente como laranja','Preset WordPress não é identidade institucional','12 áreas documentadas recuperadas','Referências terão classificação graduada sem exigir 3/3 artificiais'];
 plan.productionPending=[];
 for(const a of plan.assets)a.description=assets.assets.find(x=>x.path===a.path).description;
 for(const r of plan.references){r.stackPath=r.sourcePath.replace('design-system.html','STACK.md');if(r.id.startsWith('luxury-')){r.decision='NOT_MATERIALIZED';r.reason='Scroll suave isolado não é referência visual. Sem obrigação de adicionar uma influência artificial.';for(const o of r.observations){o.appliedTo=[];o.reinterpretation=r.reason;}}}
 for(const s of plan.sections){s.reason=decision.sections.find(d=>d.id===s.id).compositionRationale;s.referenceIds=s.referenceIds.filter(id=>!id.startsWith('luxury-'));}
 plan.sections.find(s=>s.id==='services').changes=['Recuperar as quatro áreas omitidas','Substituir cartões por diretório com links reais','Remover SaaS/IA/CPR sem fonte'];
 plan.sections.find(s=>s.id==='headquarters').changes=['Preservar foto real e contatos','Excluir usos não documentados das instalações'];
 plan.claims=plan.claims.filter(c=>!c.id.startsWith('controlled-'));
 for(const f of review.facts.filter(f=>f.id.startsWith('service-')||f.id.startsWith('award-')||f.id.endsWith('-copy')||f.id==='positioning-empresarial-imobiliario'))plan.claims.push({id:'controlled-'+f.id,factIds:[f.id],text:f.value,sourcePath:`${base}/referencias/site-atual.md`,sourceExcerpt:f.value,usedIn:[f.id.startsWith('service-')?'services':f.id.startsWith('award-')?'awards':f.id.endsWith('-copy')?'pillars':'hero']});
 plan.implementationEvidence=[{referenceId:'ai-saas-landing-27.aura.build',sectionId:'hero',codePath:`src/clients/components/${slug}/executive-hero.astro`,codeExcerpt:"font-family: 'Playfair Display', serif;",explanation:'Contribuição tipográfica parcial; não comprova composição forte.',renderCheck:{selector:'#bca-hero h1'}},{referenceId:'architecture-studio.aura.build',sectionId:'awards',codePath:`src/clients/components/${slug}/awards-bar.astro`,codeExcerpt:'class="bca-awards-rail"',explanation:'Faixa aberta de selos alinhados por linhas discretas, sem recipientes sobrepostos.',renderCheck:{selector:'.bca-awards-rail',minColumns:3}}];
 write(root,`${base}/redesign/implementation-plan.json`,plan);
 console.log('Fontes, paleta e plano atualizados sem mudar a direção escolhida ou as seis seções.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
