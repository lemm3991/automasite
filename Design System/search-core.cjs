// One deterministic retrieval engine shared by Node, Python and TypeScript.
// It retrieves reviewed metadata and source text; it does not claim visual or vector analysis.
function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
const STOP = new Set('a o as os de da do das dos e em para com por na no nas nos um uma site sites pagina paginas empresa empresas criar fazer quero que como the of and for with to in'.split(' '));
// Generic business nouns alone must not turn an unrelated sector into a match.
const BROAD_CONTEXT = new Set('equipamento equipamentos servico servicos projeto projetos plataforma plataformas produto produtos solucao solucoes'.split(' '));
const GROUPS = [
  ['saude','medicina','medico','medica','medicos','clinica','clinicas','odontologia','odontologica','dentista','dental'],
  ['arquitetura','arquiteto','arquitetos','arquitetonica','arquitetonico'],
  ['imoveis','imovel','imobiliaria','imobiliario'],
  ['gastronomia','culinaria','receita','receitas','restaurante','restaurantes','chef'],
  ['educacao','educacional','ensino','aprendizagem','curso','cursos'],
  ['fotografia','fotografico','fotografica','fotografo','photography'],
  ['software','saas'],['inteligencia','ia','ai'],['desenvolvimento','desenvolvedor','developer','dev'],
  ['metalurgia','metalurgica','metalurgico','siderurgia'],
  ['manufatura','fabricacao','fabricante','fabrica'],['panificacao','panificadora','panificadoras'],
  ['condensada','condensado','condensed'],['assimetrica','assimetrico','assimetria'],
  ['tecnica','tecnico','tecnicos','tecnicas'],['foto','fotos','fotografias','imagem','imagens'],
  ['serifada','serifado','serif'],['escuro','escura','dark'],['claro','clara','light'],
  ['vidro','glass','glassmorphism','translucidas'],['tipografia','tipografica','tipografico','typography'],
  ['jogos','jogo','games','game','gaming'],['cripto','criptomoeda','criptomoedas','crypto'],
];
const SYNONYMS = Object.fromEntries(GROUPS.flatMap(group=>group.map(word=>[word,group[0]])));
function terms(value) { return [...new Set(normalize(Array.isArray(value)?value.join(' '):value).split(' ').filter(t=>t.length>1&&!STOP.has(t)).map(t=>SYNONYMS[t]||t))]; }
const fields = entry => ({
  sector: terms(entry.classification?.actual_sectors || entry.nichos),
  visual: terms([...(entry.classification?.visual_patterns || entry.estilo_visual || []), ...(entry.fontes || [])]),
  context: terms(entry.classification?.context || entry.titulo),
  headings: terms(entry.source_evidence?.page?.headings || []),
});
function similarity(a,b) {
  if(a.family && a.family===b.family) return 1;
  const x=new Set([...(a.nichos||[]),...(a.estilo_visual||[])]), y=new Set([...(b.nichos||[]),...(b.estilo_visual||[])]);
  const both=[...x].filter(t=>y.has(t)).length;
  return both/Math.max(1,new Set([...x,...y]).size);
}
function searchCatalog(catalog, options={}) {
  const {query='',niche='',vibe='',limit=5,minScore=12,excludeIds=[],recentIds=[],diversify=true}=options;
  const requestedTheme={dark:'escuro',light:'claro',escuro:'escuro',claro:'claro'}[options.theme];
  if(options.theme&&!requestedTheme) throw new Error('Tema inválido: '+options.theme);
  if(!Number.isFinite(Number(limit))||Number(limit)<1||!Number.isFinite(Number(minScore))||Number(minScore)<0) throw new Error('Limite ou pontuação mínima inválidos.');
  const q=terms([query,niche,...(Array.isArray(vibe)?vibe:[vibe])].join(' '));
  if(!q.length) return [];
  const nicheTerms=terms(niche);
  const ranked=[];
  for(const entry of catalog) {
    if(requestedTheme&&entry.tema!==requestedTheme || excludeIds.includes(entry.id)) continue;
    const f=fields(entry), reasons=[], matched=[], sectorMatches=[], visualMatches=[];
    let score=0;
    for(const term of q) {
      if(f.sector.includes(term)) {score+=BROAD_CONTEXT.has(term)?8:20;sectorMatches.push(term);matched.push(term);}
      else if(f.visual.includes(term)) {score+=10;visualMatches.push(term);matched.push(term);}
      else if(f.context.includes(term)) {score+=6;matched.push(term);}
      else if(f.headings.includes(term)) {score+=2;matched.push(term);}
    }
    const exactId=normalize(query)===normalize(entry.id);
    if(exactId) {score+=100;reasons.push('ID exato solicitado.');}
    if(!exactId&&(!matched.length||score<Number(minScore))) continue;
    const coverage=matched.length/q.length;
    if(!exactId&&coverage<.2) continue;
    score=Math.round(score*(.5+.5*coverage)*100)/100;
    if(!exactId&&score<Number(minScore)) continue;
    if(sectorMatches.length) reasons.push('Contexto do modelo: '+sectorMatches.join(', ')+'.');
    if(visualMatches.length) reasons.push('Padrões visuais: '+visualMatches.join(', ')+'.');
    const other=matched.filter(t=>!sectorMatches.includes(t)&&!visualMatches.includes(t));
    if(other.length) reasons.push('Conteúdo salvo: '+other.join(', ')+'.');
    const directNiche=nicheTerms.some(t=>f.sector.includes(t));
    const matchKind=nicheTerms.length&&!directNiche?'visual_transfer':sectorMatches.length?'context':'visual';
    if(matchKind==='visual_transfer') reasons.push('Setor diferente do cliente: usar apenas os padrões visuais identificados e justificar a adaptação.');
    reasons.push('Cobertura de termos: '+matched.length+'/'+q.length+'.');
    if(requestedTheme) reasons.push('Filtro de tema: '+requestedTheme+' (não soma relevância).');
    const noveltyPenalty=recentIds.includes(entry.id)?Math.min(8,score*.2):0;
    if(noveltyPenalty) reasons.push('Referência usada recentemente; prioridade reduzida.');
    ranked.push({...entry,score,rank_score:score-noveltyPenalty,match_reasons:reasons,matched_terms:matched,query_coverage:coverage,match_kind:matchKind,retrieval_method:'lexical_reviewed_metadata'});
  }
  const selected=[],seenFamilies=new Set();
  while(ranked.length&&selected.length<Number(limit)) {
    for(const candidate of ranked) candidate.selection_score=candidate.rank_score-(diversify&&selected.length?Math.max(...selected.map(s=>similarity(s,candidate)))*6:0);
    ranked.sort((a,b)=>b.selection_score-a.selection_score||b.score-a.score||a.id.localeCompare(b.id));
    const next=ranked.shift();
    const family=next.family||next.id;
    if(diversify&&seenFamilies.has(family)) continue;
    seenFamilies.add(family);
    selected.push(next);
  }
  return selected;
}
function resolveReference(catalog,id) {
  const exact=catalog.find(d=>d.id===id);
  if(exact) return exact;
  const aliases=catalog.filter(d=>d.legacy_id===id);
  if(aliases.length>1) throw new Error('ID ambíguo '+id+'. Escolha: '+aliases.map(d=>d.id).join(', '));
  if(aliases.length===1) return aliases[0];
  throw new Error('Referência inexistente: '+id);
}
module.exports={normalize,terms,searchCatalog,resolveReference,similarity};
