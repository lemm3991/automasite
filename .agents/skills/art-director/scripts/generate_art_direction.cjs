const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadCatalog } = require('../../../../Design System/search.cjs');
const { searchCatalog, resolveReference, normalize } = require('../../../../Design System/search-core.cjs');
const { within, text } = require('../../../../scripts/lib/design-system-source.cjs');
const rootDir = path.resolve(__dirname, '../../../..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const nonempty = (value, label) => { if (typeof value !== 'string' || value.trim().length < 3) throw new Error('Campo obrigatório: ' + label); return value; };
function fieldsOnly(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Objeto obrigatório: ' + label);
  const extra = Object.keys(value).filter(key => !allowed.includes(key));
  if (extra.length) throw new Error('Campos fora do contrato em ' + label + ': ' + extra.join(', '));
}
function clientPaths(slug, root = rootDir) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('Slug inválido.');
  const leadDir = path.join(root, 'leads', slug);
  const lead = JSON.parse(fs.readFileSync(within(leadDir, 'lead.json'), 'utf8'));
  return { root, slug, leadDir, lead, referencesDir: path.join(leadDir, 'referencias') };
}
function previousDirections(root, slug) {
  const directory = path.join(root, 'leads');
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).filter(x => x.isDirectory() && x.name !== slug).flatMap(x => {
    const file = path.join(directory, x.name, 'referencias/art-direction.json');
    if (!fs.existsSync(file)) return [];
    try { return [{ ...JSON.parse(fs.readFileSync(file, 'utf8')), slug: x.name }]; } catch { return []; }
  });
}
function assetCandidates(paths) {
  const files = [];
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(?:jpe?g|png|webp|avif|svg)$/i.test(entry.name)) files.push(path.relative(paths.root, file).replaceAll('\\', '/'));
    }
  }
  walk(path.join(paths.leadDir, 'referencias/site-baixado'));
  walk(path.join(paths.root, 'public/assets/clients', paths.slug));
  return [...new Set(files)];
}
function prepareBrief(slug, queries = [], root = rootDir) {
  const paths = clientPaths(slug, root);
  const siteFile = within(paths.leadDir, 'referencias/site-atual.md');
  const copy = fs.readFileSync(siteFile, 'utf8');
  const name = paths.lead.name || paths.lead.business?.name;
  const niche = paths.lead.detailedNiche || paths.lead.niche || paths.lead.segment || paths.lead.business?.niche;
  nonempty(name, 'nome da empresa'); nonempty(niche, 'atividade da empresa');
  const catalog = loadCatalog(path.join(root, 'Design System'));
  const recent = previousDirections(root, slug);
  const recentIds = recent.flatMap(art => art.consulted_design_systems || []);
  const searches = [niche, ...queries].map(query => ({
    query,
    results: searchCatalog(catalog, { query, limit: 5, recentIds }).map(r => ({
      id: r.id, context: r.titulo, score: r.score, match_reasons: r.match_reasons,
      pagina_principal: r.pagina_principal, design_system_page: r.design_system_page, token_status: r.token_status
    }))
  }));
  return {
    schema_version: 2, slug, status: 'NEEDS_CREATIVE_DIRECTION',
    client: { name, niche },
    source_files: ['lead.json', 'referencias/site-atual.md'],
    site_copy: copy, asset_candidates: assetCandidates(paths),
    searches, previous_directions: recent.map(a => ({
      slug: a.slug, concept: a.aesthetic_concept,
      references: a.consulted_design_systems,
      visual_fingerprint: fingerprint(a)
    })),
    next_action: 'O Diretor de Arte deve ler a copy, inspecionar imagens e referências, criar uma proposta conforme references/proposal-schema.md e executá-la com --proposal. Este briefing não libera o Builder.'
  };
}
function validateTheme(theme) {
  if (!theme || typeof theme !== 'object') throw new Error('theme_tokens ausente.');
  for (const key of ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor']) {
    if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(theme[key] || '')) throw new Error('Cor inválida: ' + key);
  }
  for (const key of ['headingFont', 'bodyFont']) nonempty(theme[key], key);
  if (!['dark', 'light'].includes(theme.mode) || !['none', 'sm', 'md', 'lg', 'full'].includes(theme.borderRadius)) throw new Error('Modo ou bordas inválidos.');
  if (!['none', 'mesh', 'dots', 'prism'].includes(theme.backgroundEffect) || typeof theme.enableParallax !== 'boolean') throw new Error('Efeitos devem ser uma decisão explícita.');
}
function fingerprint(art) {
  const t = art.theme_tokens || art;
  const hero = art.hero_specification || art.components?.hero || art.component_guidelines?.hero || {};
  return {
    references: [...(art.consulted_design_systems || art.reference_choices?.map(r => r.id) || [])].sort().join('|'),
    fonts: normalize([t.headingFont, t.bodyFont].join('|')),
    palette: [t.backgroundColor, t.primaryColor, t.accentColor].filter(Boolean).map(x => x.toLowerCase()).join('|'),
    hero: normalize(hero.composition || hero.variant || hero.layout || hero.style || ''),
    flow: (art.section_flow || []).map(s => s.type + ':' + (s.layout || s.variant || '')).join('|')
  };
}
function compareDirections(proposal, previous) {
  const candidate = fingerprint(proposal);
  return previous.map(other => {
    const old = fingerprint(other);
    const matching = Object.keys(candidate).filter(k => candidate[k] && old[k] && candidate[k] === old[k]);
    return { slug: other.slug, matching_dimensions: matching, needs_differentiation: matching.length >= 3 };
  }).filter(x => x.matching_dimensions.length >= 2);
}
function validateProposal(slug, proposal, root = rootDir) {
  const paths = clientPaths(slug, root);
  const catalogRoot = path.join(root, 'Design System');
  const catalog = loadCatalog(catalogRoot);
  fieldsOnly(proposal, ['schema_version','slug','aesthetic_concept','client_understanding','evidence','reference_choices','alternatives','theme_tokens','copy','hero_specification','section_flow','differentiation','status','consulted_design_systems','reference_results','source_snapshots','anti_clone_comparison','created_at'], 'proposta');
  if (proposal.schema_version !== 2 || proposal.slug !== slug) throw new Error('schema_version deve ser 2 e slug deve corresponder ao cliente.');
  nonempty(proposal.aesthetic_concept, 'aesthetic_concept');
  fieldsOnly(proposal.client_understanding, ['site_type','audience','objective','brand_context'], 'client_understanding');
  for (const key of ['site_type', 'audience', 'objective', 'brand_context']) nonempty(proposal.client_understanding?.[key], 'client_understanding.' + key);
  fieldsOnly(proposal.theme_tokens, ['primaryColor','secondaryColor','accentColor','backgroundColor','textColor','headingFont','bodyFont','borderRadius','mode','backgroundEffect','enableParallax'], 'theme_tokens');
  validateTheme(proposal.theme_tokens);
  if (!Array.isArray(proposal.evidence) || !proposal.evidence.length) throw new Error('Evidências do cliente ausentes.');
  const evidence = new Map(), snapshots = [];
  for (const item of proposal.evidence) {
    fieldsOnly(item, ['id','path','quote'], 'evidence');
    nonempty(item.id, 'evidence.id'); nonempty(item.quote, 'evidence.quote');
    if (normalize(item.quote).length < 3) throw new Error('Trecho de evidência sem conteúdo: ' + item.id);
    if (evidence.has(item.id)) throw new Error('ID de evidência duplicado: ' + item.id);
    if (/(?:art-direction|design-selection|design-system-selected|proposal|brief)/i.test(item.path || '')) throw new Error('A direção de arte não pode servir como fonte dos próprios fatos.');
    const file = within(paths.leadDir, item.path);
    if (!/\.(?:json|md|html?|txt)$/i.test(file)) throw new Error('Fonte de texto inválida: ' + item.path);
    const content = fs.readFileSync(file, 'utf8');
    if (!normalize(text(content)).includes(normalize(item.quote))) throw new Error('Trecho não encontrado na fonte: ' + item.id);
    evidence.set(item.id, item);
    snapshots.push({ path: item.path, sha256: hash(content) });
  }
  function supported(value, ids, label) {
    nonempty(value, label);
    if (!Array.isArray(ids) || !ids.length || ids.some(id => !evidence.has(id))) throw new Error('Vincule fontes válidas em ' + label);
    const source = ids.map(id => evidence.get(id).quote).join(' ');
    for (const number of value.match(/\d+(?:[.,]\d+)*/g) || []) {
      if (!(source.match(/\d+(?:[.,]\d+)*/g) || []).includes(number)) throw new Error('Número sem evidência em ' + label + ': ' + number);
    }
  }
  if (!Array.isArray(proposal.reference_choices) || !proposal.reference_choices.length) throw new Error('Selecione ao menos uma referência.');
  const selectedIds = new Set();
  const referenceResults = proposal.reference_choices.map(choice => {
    fieldsOnly(choice, ['id','query','reason','used_patterns','inspection'], 'reference_choices');
    fieldsOnly(choice.inspection, ['path','quote','preview_checked','visual_notes'], 'reference.inspection');
    const ref = resolveReference(catalog, choice.id);
    if (selectedIds.has(ref.id)) throw new Error('Referência repetida: ' + ref.id);
    selectedIds.add(ref.id);
    nonempty(choice.reason, 'reference.reason');
    if (!Array.isArray(choice.used_patterns) || !choice.used_patterns.length || choice.used_patterns.some(p=>typeof p!=='string'||p.trim().length<3)) throw new Error('Descreva os padrões aproveitados de ' + ref.id);
    const matches = searchCatalog(catalog, { query: choice.query, limit: catalog.length, diversify: false });
    const result = matches.find(m => m.id === ref.id);
    if (!result) throw new Error('Referência não recuperada pela busca registrada: ' + ref.id);
    if (![ref.pagina_principal, ref.design_system_page].includes(choice.inspection?.path)) throw new Error('Inspeção deve apontar para o HTML catalogado: ' + ref.id);
    const inspected = fs.readFileSync(within(catalogRoot, choice.inspection.path), 'utf8');
    const inspectedQuote=nonempty(choice.inspection.quote, 'reference.inspection.quote');
    if (normalize(inspectedQuote).length < 3) throw new Error('Trecho de inspeção sem conteúdo: ' + ref.id);
    if (!normalize(text(inspected)).includes(normalize(inspectedQuote))) throw new Error('Trecho de referência inexistente: ' + ref.id);
    nonempty(choice.inspection.visual_notes, 'reference.inspection.visual_notes');
    if (choice.inspection.preview_checked !== true) throw new Error('Inspecione o preview de ' + ref.id + ' antes de liberar a direção.');
    return { id: ref.id, titulo: ref.titulo, tema: ref.tema, pagina_principal: ref.pagina_principal, design_system_page: ref.design_system_page, score: result.score, match_reasons: result.match_reasons, reason: choice.reason, used_patterns: choice.used_patterns, source_sha256: hash(inspected) };
  });
  if (!Array.isArray(proposal.alternatives) || !proposal.alternatives.length) throw new Error('Registre ao menos uma alternativa e por que não foi escolhida.');
  for (const alt of proposal.alternatives) {
    fieldsOnly(alt, ['concept','reason_not_selected'], 'alternatives');
    nonempty(alt.concept, 'alternative.concept');nonempty(alt.reason_not_selected, 'alternative.reason_not_selected');
    if (normalize(alt.concept) === normalize(proposal.aesthetic_concept)) throw new Error('A alternativa deve representar outra direção.');
  }
  const hero = proposal.hero_specification;
  fieldsOnly(hero, ['composition','desktop','mobile','cta_treatment','motion','reduced_motion','asset_path','asset_reason','image_alt','credibility'], 'hero_specification');
  for (const key of ['composition', 'desktop', 'mobile', 'cta_treatment', 'motion', 'reduced_motion']) nonempty(hero?.[key], 'hero.' + key);
  if (hero.asset_path) {
    const allowed = ['leads/' + slug + '/referencias/site-baixado/', 'public/assets/clients/' + slug + '/'];
    const rel = hero.asset_path.replaceAll('\\', '/');
    if (!allowed.some(prefix => rel.startsWith(prefix)) || !/\.(?:jpe?g|png|webp|avif|svg)$/i.test(rel)) throw new Error('O hero deve usar um asset local deste cliente.');
    within(root, rel);nonempty(hero.image_alt, 'hero.image_alt');
  } else nonempty(hero.asset_reason, 'hero.asset_reason');
  fieldsOnly(proposal.copy, ['headline','subheadline','primaryCta','secondaryCta','evidence_ids'], 'copy');
  for (const key of ['headline', 'subheadline', 'primaryCta']) supported(proposal.copy?.[key], proposal.copy?.evidence_ids, 'copy.' + key);
  if (proposal.copy.secondaryCta) supported(proposal.copy.secondaryCta, proposal.copy.evidence_ids, 'copy.secondaryCta');
  if (!Array.isArray(hero.credibility)) throw new Error('hero.credibility deve ser uma lista; use [] quando não houver evidência.');
  for (const claim of hero.credibility) { fieldsOnly(claim, ['text','evidence_ids'], 'hero.credibility'); supported(claim.text, claim.evidence_ids, 'hero.credibility'); }
  if (!Array.isArray(proposal.section_flow) || !proposal.section_flow.some(s=>s.type==='hero')) throw new Error('section_flow deve conter a primeira dobra.');
  for (const section of proposal.section_flow) {
    fieldsOnly(section, ['type','layout','purpose','evidence_ids'], 'section_flow');
    nonempty(section.type, 'section.type');nonempty(section.layout, 'section.layout');
    supported(section.purpose, section.evidence_ids, 'section.purpose');
  }
  const antiClone = compareDirections(proposal, previousDirections(root, slug));
  if (antiClone.some(c => c.needs_differentiation)) {
    nonempty(proposal.differentiation, 'differentiation: proposta semelhante a ' + antiClone.filter(c=>c.needs_differentiation).map(c=>c.slug).join(', '));
    if (antiClone.some(c => ['hero','fonts','flow','palette'].every(k=>c.matching_dimensions.includes(k)))) throw new Error('Hero, fontes, paleta e sequência repetidos. Altere a composição antes de liberar.');
  }
  return { paths, referenceResults, source_snapshots: snapshots, anti_clone_comparison: antiClone };
}
function publishProposal(slug, proposal, root = rootDir, validateOnly = false) {
  const validated = validateProposal(slug, proposal, root);
  const { paths, referenceResults, source_snapshots, anti_clone_comparison } = validated;
  const artifact = { ...proposal, status: 'READY_FOR_BUILDER', consulted_design_systems: referenceResults.map(r=>r.id), reference_results: referenceResults, source_snapshots, anti_clone_comparison, created_at: new Date().toISOString() };
  if (validateOnly) return artifact;
  const selection = { schema_version: 2, slug, status: 'ART_DIRECTION_VALIDATED', selected_at: artifact.created_at, primary_reference: referenceResults[0], alternative_references: referenceResults.slice(1) };
  const legacy = { client: paths.lead.name || paths.lead.business?.name, slug, selectedDesignSystems: referenceResults.map(r=>({ name:r.id, concept:r.reason, path:path.join(root,'Design System',r.design_system_page) })) };
  fs.mkdirSync(paths.referencesDir, { recursive: true });
  for (const [file, value] of [['art-direction.json', artifact], ['design-system-selected.json', selection], ['design-selection.json', legacy]]) {
    fs.writeFileSync(path.join(paths.referencesDir, file), JSON.stringify(value, null, 2) + '\n');
  }
  return artifact;
}
function checkPublished(slug, root = rootDir) {
  const paths = clientPaths(slug, root);
  const artifact = JSON.parse(fs.readFileSync(path.join(paths.referencesDir, 'art-direction.json'), 'utf8'));
  if (artifact.status !== 'READY_FOR_BUILDER') throw new Error('Direção ainda não liberada pelo novo fluxo.');
  const verified = validateProposal(slug, artifact, root);
  if (!Array.isArray(artifact.source_snapshots) || !Array.isArray(artifact.reference_results) || artifact.reference_results.length !== verified.referenceResults.length) throw new Error('Snapshots de publicação ausentes ou incompletos. Publique pelo gerador.');
  for (const source of verified.source_snapshots) {
    const snapshot=artifact.source_snapshots.find(s=>s.path===source.path);
    if(!snapshot) throw new Error('Snapshot de fonte ausente: '+source.path);
    if (hash(fs.readFileSync(within(paths.leadDir,snapshot.path),'utf8')) !== snapshot.sha256) throw new Error('Fonte mudou após a direção de arte: '+snapshot.path);
  }
  const catalog=loadCatalog(path.join(root,'Design System'));
  for(const ref of artifact.reference_results||[]) {
    const current=resolveReference(catalog,ref.id);
    const choice=artifact.reference_choices.find(c=>c.id===ref.id);
    if(!choice || ref.design_system_page!==current.design_system_page) throw new Error('Referência publicada inconsistente: '+ref.id);
    if(hash(fs.readFileSync(within(path.join(root,'Design System'),choice.inspection.path),'utf8'))!==ref.source_sha256) throw new Error('Referência mudou após a inspeção: '+current.id);
  }
  const ids=verified.referenceResults.map(r=>r.id);
  if(JSON.stringify(artifact.consulted_design_systems)!==JSON.stringify(ids)) throw new Error('Lista de referências consultadas inconsistente.');
  const selection=JSON.parse(fs.readFileSync(path.join(paths.referencesDir,'design-system-selected.json'),'utf8'));
  if(JSON.stringify([selection.primary_reference,...(selection.alternative_references||[])].map(r=>r?.id))!==JSON.stringify(ids)) throw new Error('Seleção de referências diverge da direção de arte.');
  const legacy=JSON.parse(fs.readFileSync(path.join(paths.referencesDir,'design-selection.json'),'utf8'));
  if(!Array.isArray(legacy.selectedDesignSystems)||legacy.selectedDesignSystems.length!==ids.length) throw new Error('Caminhos publicados incompletos.');
  for(const [i,ref] of legacy.selectedDesignSystems.entries()) {
    const expected=verified.referenceResults[i];
    if(ref.name!==expected.id||path.resolve(ref.path)!==path.resolve(root,'Design System',expected.design_system_page)||!fs.existsSync(ref.path)) throw new Error('Caminho publicado inválido: '+ref.name);
  }
  return artifact;
}
function main(argv) {
  const slug=argv.shift(), queries=[];
  let proposalFile=null,validateOnly=false,check=false;
  for(let i=0;i<argv.length;i++) {
    if(argv[i]==='--proposal') proposalFile=argv[++i];
    else if(argv[i]==='--query') queries.push(nonempty(argv[++i],'query'));
    else if(argv[i]==='--validate-only') validateOnly=true;
    else if(argv[i]==='--check') check=true;
    else throw new Error('Argumento desconhecido: '+argv[i]);
  }
  if(!slug) throw new Error('Uso: node generate_art_direction.cjs <slug> [--query texto] [--proposal arquivo.json] [--validate-only | --check]');
  if(check) {checkPublished(slug);console.log('Direção válida para '+slug);return;}
  if(validateOnly&&!proposalFile) throw new Error('--validate-only exige --proposal.');
  if(proposalFile) {
    const result=publishProposal(slug,JSON.parse(fs.readFileSync(proposalFile,'utf8')),rootDir,validateOnly);
    console.log((validateOnly?'Proposta validada: ':'Direção publicada: ')+result.slug);return;
  }
  const brief=prepareBrief(slug,queries);
  const paths=clientPaths(slug);
  fs.mkdirSync(paths.referencesDir,{recursive:true});
  fs.writeFileSync(path.join(paths.referencesDir,'art-direction-brief.json'),JSON.stringify(brief,null,2)+'\n');
  console.log('Briefing gerado para '+slug+'. O Diretor de Arte deve criar e validar a proposta antes do Builder.');
}
if(require.main===module) {
 const args=process.argv.slice(2),slug=args[0],value=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;
 require('../../../../scripts/art-director-engine.cjs').runArtDirector({slug,decisionFile:value('--decision')||value('--proposal'),checkOnly:args.includes('--check')||args.includes('--validate-only'),queries:args.flatMap((v,i)=>v==='--query'?[args[i+1]]:[])}).then(r=>{console.log(JSON.stringify(r,null,2));if(r.passed===false)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
}
module.exports={prepareBrief,validateProposal,publishProposal,checkPublished,compareDirections,main};
