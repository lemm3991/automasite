const fs=require('node:fs');
const path=require('node:path');
const {searchCatalog}=require('./search-core.cjs');
const {within}=require('../scripts/lib/design-system-source.cjs');
function loadCatalog(root=__dirname) {
  const catalog=JSON.parse(fs.readFileSync(path.join(root,'catalog.json'),'utf8'));
  const ids=new Set();
  for(const entry of catalog) {
    if(ids.has(entry.id)) throw new Error('ID duplicado: '+entry.id);
    ids.add(entry.id);
    within(root,entry.pagina_principal);within(root,entry.design_system_page);
  }
  return catalog;
}
function cli(argv) {
  const options={},aliases={'--query':'query','-q':'query','--nicho':'niche','-n':'niche','--estilo':'vibe','-e':'vibe','--tema':'theme','-t':'theme','--top':'limit','-k':'limit','--min-score':'minScore','--exclude':'excludeIds','--recent':'recentIds'};
  let json=false,full=false;
  for(let i=0;i<argv.length;i++) {
    const arg=argv[i];
    if(arg==='--json') {json=true;continue;}
    if(arg==='--full') {full=true;continue;}
    if(arg==='--no-diversity') {options.diversify=false;continue;}
    if(!aliases[arg]||!argv[i+1]||argv[i+1].startsWith('--')) throw new Error('Argumento inválido ou sem valor: '+arg);
    options[aliases[arg]]=argv[++i];
  }
  for(const key of ['excludeIds','recentIds']) if(options[key]) options[key]=options[key].split(',');
  const result=searchCatalog(loadCatalog(),options);
  if(json) console.log(JSON.stringify(full?result:result.map(compactResult),null,2));
  else if(!result.length) console.log('Nenhuma referência atingiu a relevância mínima. Reformule a busca com características visuais observadas no cliente.');
  else for(const r of result) console.log(`${r.id} | ${r.score} pontos | ${r.titulo}\n  ${r.match_reasons.join('\n  ')}\n  HTML: ${r.pagina_principal}`);
  return result;
}
function compactResult(result) {
  const {source_evidence,...rest}=result;
  const page=source_evidence?.page;
  return {...rest,source_evidence:{method:page?.method,render_verified:page?.render_verified,headings:page?.headings?.slice(0,4),heading_font:page?.heading_font,body_font:page?.body_font,page_source:page?.sources?.[0],full_record:'catalog.json#'+result.id}};
}
if(require.main===module) {try{cli(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={loadCatalog,cli,compactResult};
