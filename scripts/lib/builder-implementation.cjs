const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
function local(root, file) {
  const resolved = path.resolve(root, file || '');
  const rel = path.relative(root, resolved);
  if (!file || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Caminho fora do projeto: ${file}`);
  return resolved;
}
function fileHash(root, file) { return hash(fs.readFileSync(local(root, file))); }
function core(plan) { const { implementationEvidence, ...rest } = plan; return rest; }
function resolveComponent(root, slug, section) {
  const override = `src/clients/components/${slug}/${section.variant}.astro`;
  const category = { differentials: 'benefits', showcase: 'projects' }[section.type] || section.type;
  const shared = `src/components/${category}/${section.variant}.astro`;
  return fs.existsSync(local(root, override)) ? override : shared;
}
async function configFor(root, slug) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('Slug inválido');
  const file = `src/clients/data/${slug}.ts`;
  return (await import(pathToFileURL(local(root, file)).href + '?revision=' + fileHash(root, file))).default;
}
function fingerprint(root, config) {
  const sections = config.pages.find(p => p.path === '').sections;
  const sources = sections.map(s => { const file = resolveComponent(root, config.slug, s); return { s, file, code: fs.readFileSync(local(root, file), 'utf8') }; });
  const hero = sources.find(x => x.s.type === 'hero');
  const imports = sources.flatMap(x => [...x.code.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map(m=>path.resolve(root,path.dirname(x.file),m[1])));
  const css = [...new Set(imports)].map(file=>fs.readFileSync(local(root,file),'utf8')).join('\n');
  const code = sources.map(x => x.code).join('\n') + '\n' + css;
  const marker = (src, key) => src.match(new RegExp(`data-${key}="([^"]+)"`))?.[1];
  const grid = [...code.matchAll(/grid-template-columns\s*:\s*([^;}]+)/g)].map(m => String(m[1].trim().split(/\s+/).length));
  const imageRoles = sections.filter(s=>JSON.stringify(s.content).match(/\.(?:png|jpe?g|webp|avif)/i)).map(s=>s.type);
  return {
    heroType: /split|grid-cols/.test(hero?.code || '') ? 'split' : 'unknown',
    sectionOrder: sections.map(s => s.type),
    imageStrategy: [...new Set(imageRoles)].sort(),
    gridStrategy: grid.length ? [...new Set(grid)].sort() : [...new Set([...code.matchAll(/grid-cols-(\d+)/g)].map(m=>m[1]))].sort(),
    backgroundTreatment: [config.theme.mode, config.theme.backgroundEffect || 'none', marker(code, 'surface-rhythm') || 'continuous'],
    cardTreatment: marker(code, 'card-treatment') || (/rounded-(?:2xl|3xl)/.test(code) ? 'rounded-panels' : 'unknown'),
    typography: [config.theme.headingFont, config.theme.bodyFont],
    motion: config.theme.enableParallax ? 'shared-parallax' : (/prefers-reduced-motion/.test(code) ? 'local-reduced-motion' : 'none'),
    rhythm: marker(code,'surface-rhythm') || 'unknown',
    ctaStyle: /rounded-full/.test(code+css)?'pill':/rounded-(?:lg|xl)/.test(code)?'rounded':'unknown',
    selectedVariants: sources.map(x => ({ variant: x.s.variant, file: x.file, sha256: hash(x.code) }))
  };
}
function similarity(a, b) {
  const keys = ['heroType','sectionOrder','imageStrategy','gridStrategy','backgroundTreatment','cardTreatment','typography','rhythm','ctaStyle'];
  const details = {};
  for (const key of keys) {
    const x = a[key], y = b[key];
    if (!x || !y || x === 'unknown' || y === 'unknown') { details[key] = null; continue; }
    if (key === 'selectedVariants') {
      const aa = new Set(x.map(v => v.sha256)), bb = new Set(y.map(v => v.sha256));
      details[key] = [...aa].filter(v => bb.has(v)).length / (new Set([...aa,...bb]).size || 1);
    } else if (key === 'sectionOrder') {
      const table=Array.from({length:x.length+1},()=>Array(y.length+1).fill(0));
      for(let i=1;i<=x.length;i++)for(let j=1;j<=y.length;j++)table[i][j]=x[i-1]===y[j-1]?table[i-1][j-1]+1:Math.max(table[i-1][j],table[i][j-1]);
      details[key]=table[x.length][y.length]/Math.max(x.length,y.length,1);
    } else if (Array.isArray(x) && Array.isArray(y)) {
      if(!x.length || !y.length) {details[key]=null;continue;}
      const aa=new Set(x),bb=new Set(y);details[key]=[...aa].filter(v=>bb.has(v)).length/new Set([...aa,...bb]).size;
    } else details[key] = JSON.stringify(x) === JSON.stringify(y) ? 1 : 0;
  }
  const known = Object.values(details).filter(v => v !== null);
  const sharedBaseVariants = a.selectedVariants.filter(x => b.selectedVariants.some(y => y.variant === x.variant)).map(x => x.variant);
  return { method: 'Heurística aproximada de composição; hashes são diagnóstico separado e não reduzem a similaridade', structuralSimilarity: known.length ? Math.round(100 * known.reduce((n,v)=>n+v,0)/known.length) : null, knownDimensions: known.length, dimensions: details, sharedBaseVariants, identicalComponentSources: a.selectedVariants.filter(x => b.selectedVariants.some(y => y.sha256 === x.sha256)).length };
}
async function validate(root, slug, phase = 'plan', { stamp = false } = {}) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) throw new Error('Slug inválido');
  if (!['plan','implemented'].includes(phase)) throw new Error('Fase inválida');
  const errors = [], warnings = [];
  const base = `leads/${slug}`;
  const planFile = `${base}/redesign/implementation-plan.json`;
  const receiptFile = `${base}/redesign/implementation-plan.validation.json`;
  const plan = readJson(local(root, planFile));
  const assert = (ok, message) => { if (!ok) errors.push(message); };
  const source = file => { try { return fs.readFileSync(local(root, file), 'utf8'); } catch { errors.push(`Fonte ausente/inválida: ${file}`); return ''; } };
  assert(plan.schemaVersion === 2 && plan.slug === slug && !!plan.concept && plan.createdBy, 'Metadados do plano inválidos: exigir contrato factual v2 e autoria');
  const required = ['referencias/creative-brief.md','referencias/art-direction.json','referencias/design-selection.json','visual/visual-handoff.json','referencias/site-atual.md','lead.json','referencias/assets-manifest.json'].map(f => `${base}/${f}`);
  const inputs = new Set((plan.inputs || []).map(x => x.path));
  required.push(...['source-evidence.json','source-review.json','asset-review.json'].map(f=>`${base}/referencias/${f}`));
  for (const f of required) assert(inputs.has(f) && !!source(f), `Entrada obrigatória não lida no plano: ${f}`);
  try {errors.push(...require('./art-direction-evidence.cjs').validatePublished(root,slug).errors);}catch(e){errors.push(`Direção de arte não validada: ${e.message}`);}
  const sections = plan.sections || [];
  assert(sections.length > 0 && new Set(sections.map(s => s.id)).size === sections.length, 'Seções ausentes ou IDs duplicados');
  const ids = new Set(sections.map(s => s.id));
  const selection = readJson(local(root, `${base}/referencias/design-selection.json`));
  const refs = plan.references || [];
  for (const selected of selection.selectedDesignSystems || []) {
    const ref = refs.find(r => r.id === (selected.name || selected.id));
    assert(!!ref, `Referência não inspecionada: ${selected.name || selected.id}`);
    if (ref) assert(path.resolve(root, ref.sourcePath) === path.resolve(root, selected.path), `Caminho diverge da seleção: ${ref.id}`);
  }
  for (const ref of refs) {
    const html = source(ref.sourcePath);
    assert(ref.observations?.length > 0, `Sem observação concreta: ${ref.id}`);
    for (const obs of ref.observations || []) {
      assert(obs.excerpt?.length >= 12 && html.includes(obs.excerpt), `Trecho não encontrado na referência: ${ref.id}`);
      assert(obs.element && obs.reinterpretation && ((ref.decision==='NOT_MATERIALIZED'&&ref.reason&&obs.appliedTo?.length===0)||(obs.appliedTo?.length && obs.appliedTo.every(id => ids.has(id)))), `Aplicação ou descarte fundamentado não definido: ${ref.id}`);
    }
    if (ref.stackPath) source(ref.stackPath);
  }
  const manifest = readJson(local(root, `${base}/referencias/assets-manifest.json`));
  const {allowedFacts}=require('./source-evidence.cjs');
  let factual=[],inspections=[];
  try {
    const check=await require('./prospector-evidence.cjs').validate(root,slug);
    errors.push(...check.errors);
    factual=allowedFacts(readJson(local(root,`${base}/referencias/source-review.json`)));
    inspections=readJson(local(root,`${base}/referencias/asset-review.json`)).assets;
  }catch(e){errors.push(`Contrato factual indisponível: ${e.message}`);}
  for (const asset of plan.assets || []) {
    assert(manifest.assets.some(a => a.localPublicPath === asset.path), `Asset sem origem no manifesto: ${asset.path}`);
    assert(fs.existsSync(local(root, `public/${asset.path.replace(/^\//,'')}`)), `Asset ausente: ${asset.path}`);
    assert(asset.description && asset.inspection?.method === 'image-view' && asset.inspection.observed, `Asset sem inspeção registrada: ${asset.path}`);
    const inspected=inspections.find(a=>a.path===asset.path);
    assert(inspected && inspected.description===asset.description && inspected.sha256===fileHash(root,`public/${asset.path.replace(/^\//,'')}`),`Descrição de asset diverge da inspeção: ${asset.path}`);
  }
  const claims = plan.claims || [];
  for (const claim of claims) {
    assert(claim.factIds?.length && claim.factIds.every(id=>factual.some(f=>f.id===id)),`Afirmação sem fato liberado: ${claim.id}`);
    assert(claim.text && claim.sourceExcerpt?.length >= 8 && source(claim.sourcePath).includes(claim.sourceExcerpt), `Afirmação sem trecho de fonte: ${claim.id}`);
    assert(claim.usedIn?.length > 0 && claim.usedIn.every(id => ids.has(id) || id === 'business'), `Uso de afirmação não mapeado: ${claim.id}`);
  }
  for (const s of sections) {
    assert(['keep','configure','adapt','create'].includes(s.action) && s.reason, `Decisão não justificada: ${s.id}`);
    assert(s.candidateComponents?.length > 0, `Componentes candidatos não avaliados: ${s.id}`);
    for (const c of s.candidateComponents || []) source(c);
    if (['adapt','create'].includes(s.action)) {
      assert(s.outputPath?.startsWith(`src/clients/components/${slug}/`) && s.changes?.length > 0, `Adaptação deve ser isolada e descrita: ${s.id}`);
    }
    for (const id of s.referenceIds || []) assert(refs.some(r=>r.id===id), `Referência desconhecida: ${id}`);
    for (const id of s.claimIds || []) assert(claims.some(c=>c.id===id), `Afirmação desconhecida: ${id}`);
    for (const asset of s.assetPaths || []) assert(plan.assets?.some(a=>a.path===asset), `Asset não inspecionado: ${asset}`);
  }
  assert(ids.has(plan.hero?.sectionId) && plan.hero?.direction && plan.hero?.changes?.length, 'Planejamento do hero incompleto');
  for(const role of ['logo','message','cta','identity','photo'])assert(plan.hero?.selectors && Object.hasOwn(plan.hero.selectors,role),`Seletor da primeira dobra ausente: ${role}`);
  assert(plan.hero?.desktop && plan.hero?.mobile,'Planejar desktop e mobile separadamente');
  for(const evidence of plan.implementationEvidence||[]) {
    assert(evidence.renderCheck?.selector,`Referência sem verificação no DOM renderizado: ${evidence.referenceId}`);
    const reference=refs.find(r=>r.id===evidence.referenceId);
    for(const p of evidence.compositionalEvidence||[])assert(p.sourceExcerpt?.length>=12&&reference&&source(reference.sourcePath).includes(p.sourceExcerpt)&&p.reinterpretation,'Padrão composicional sem origem: '+evidence.referenceId);
  }
  const inputHashes = {};
  for (const f of new Set([...required, ...refs.flatMap(r=>[r.sourcePath,r.stackPath].filter(Boolean))])) {
    try { inputHashes[f] = fileHash(root, f); } catch { assert(false, `Não foi possível registrar entrada: ${f}`); }
  }
  let currentFingerprint = null, comparisons = [];
  if (phase !== 'plan') {
    let receipt;
    try { receipt = readJson(local(root, receiptFile)); } catch { assert(false, 'Gate anterior à codificação não registrado'); }
    if (receipt) {
      assert(receipt.planHash === hash(JSON.stringify(core(plan))), 'Plano mudou após o gate: revisar e validar novamente antes da implementação');
      assert(JSON.stringify(receipt.inputHashes) === JSON.stringify(inputHashes), 'Entradas do 2A ou referências mudaram após o gate');
    }
    const config = await configFor(root, slug);
    const actual = config.pages.find(p=>p.path==='').sections;
    assert(actual.length === sections.length, 'Quantidade de seções diverge do plano');
    for (const [i,s] of sections.entries()) {
      assert(actual[i]?.id === s.id && actual[i]?.variant === s.variant, `Seção/ordem diverge: ${s.id}`);
      const file = resolveComponent(root, slug, s);
      assert(file === s.outputPath, `Componente resolvido diverge: ${s.id}`);
      const code = source(file);
      if (s.action === 'adapt') assert(!s.candidateComponents.some(c=>source(c) === code), `Adaptação declarada sem mudanças: ${s.id}`);
    }
    for (const ref of refs) for (const obs of ref.observations || []) for (const sectionId of obs.appliedTo || []) {
      const evidence = (plan.implementationEvidence || []).find(e=>e.referenceId===ref.id && e.sectionId===sectionId);
      const s = sections.find(s=>s.id===sectionId);
      assert(evidence?.codePath === s?.outputPath && evidence?.codeExcerpt?.length >= 12 && source(evidence.codePath).includes(evidence.codeExcerpt) && evidence.explanation, `Decisão de design sem evidência no código: ${ref.id}/${sectionId}`);
    }
    currentFingerprint = fingerprint(root, config);
    const dir = local(root, 'src/clients/data');
    for (const file of fs.readdirSync(dir).filter(f=>f.endsWith('.ts') && f!==`${slug}.ts`)) {
      const other = file.slice(0,-3);
      try {
        const result = similarity(currentFingerprint, fingerprint(root, await configFor(root, other)));
        comparisons.push({slug:other,...result});
        if (result.structuralSimilarity >= 65) warnings.push(`Revisão visual de composição solicitada com ${other}; ${result.structuralSimilarity}% é heurística, não reprovação`);
      } catch(e) { warnings.push(`Comparação indisponível com ${other}: ${e.message}`); }
    }
  }
  const report = {schemaVersion:1,slug,phase,passed:errors.length===0,errors,warnings,planHash:hash(JSON.stringify(core(plan))),inputHashes,checkedAt:new Date().toISOString(),fingerprint:currentFingerprint,comparisons,limitations:['Trechos existentes não comprovam interpretação factual; revisar sentido e imagens.','Similaridade estrutural não mede qualidade visual.']};
  if (stamp && report.passed) {
    if (phase === 'plan') {
      const existing = `src/clients/data/${slug}.ts`;
      if (fs.existsSync(local(root, existing))) report.previousFingerprint = fingerprint(root, await configFor(root, slug));
      fs.writeFileSync(local(root, receiptFile), JSON.stringify(report,null,2));
    } else fs.writeFileSync(local(root, `${base}/redesign/implementation-validation.json`),JSON.stringify(report,null,2));
  }
  return report;
}
module.exports = {validate, fingerprint, similarity, configFor, resolveComponent, fileHash, hash, local};
