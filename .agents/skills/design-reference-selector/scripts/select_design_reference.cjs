const fs=require('node:fs');
const path=require('node:path');
const {loadCatalog}=require('../../../../Design System/search.cjs');
const {searchCatalog}=require('../../../../Design System/search-core.cjs');
const root=path.resolve(__dirname,'../../../..');
function selectReferences(options,projectRoot=root) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.slug||'')) throw new Error('Slug inválido.');
  const leadDir=path.join(projectRoot,'leads',options.slug);
  if(!fs.existsSync(path.join(leadDir,'lead.json'))) throw new Error('Cliente inexistente: '+options.slug);
  const catalog=loadCatalog(path.join(projectRoot,'Design System'));
  const query={query:options.query||options.nicho||'',niche:options.nicho||'',vibe:options.estilo||'',theme:options.tema,limit:5};
  const matches=searchCatalog(catalog,query);
  if(!matches.length) throw new Error('Nenhuma referência relevante. Reformule a busca com características visuais; o arquivo anterior não foi sobrescrito.');
  const reference=m=>({id:m.id,tema:m.tema,titulo:m.titulo,pagina_principal:m.pagina_principal,design_system_page:m.design_system_page,score:m.score,match_reasons:m.match_reasons,match_kind:m.match_kind});
  const result={slug:options.slug,status:'CANDIDATES_FOR_REVIEW',selected_at:new Date().toISOString(),query,primary_reference:reference(matches[0]),alternative_references:matches.slice(1).map(reference),requires_visual_inspection:true,component_policy:'Composição e componentes devem ser definidos pelo Diretor de Arte com base no cliente.'};
  for(const dir of [path.join(leadDir,'referencias'),path.join(projectRoot,'index',options.slug,'referencias')]) {
    fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'design-system-selected.json'),JSON.stringify(result,null,2)+'\n');
  }
  return result;
}
function main(argv) {
  const opts={};
  for(let i=0;i<argv.length;i+=2) {if(!['--slug','--nicho','--query','--tema','--estilo'].includes(argv[i])||!argv[i+1]) throw new Error('Argumento inválido: '+argv[i]);opts[argv[i].slice(2)]=argv[i+1];}
  const result=selectReferences(opts);console.log('Candidatos para '+result.slug+': '+[result.primary_reference,...result.alternative_references].map(r=>r.id).join(', '));
}
if(require.main===module) {try{main(process.argv.slice(2));}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={selectReferences};
