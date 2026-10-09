import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import builder from '../../../../scripts/lib/builder-implementation.cjs';
// Persists an explicit creative decision; never chooses a niche recipe.
export async function scaffold(root,slug){
 if(!/^[a-z0-9-]+$/.test(slug||''))throw new Error('Slug inválido');
 const planFile=path.join(root,'leads',slug,'redesign/implementation-plan.json');
 if(!fs.existsSync(planFile))return {status:'NEEDS_CREATIVE_PLAN',next:'O agente 2B deve ler o contexto, inspecionar referências e preparar o plano da skill site-builder.',exitCode:2};
 const gate=await builder.validate(root,slug,'plan');
 if(!gate.passed)return {status:'NEEDS_PLAN_CORRECTION',errors:gate.errors,exitCode:2};
 const target=path.join(root,'src/clients/data',slug+'.ts');
 if(fs.existsSync(target))return {status:'EXISTING_CONFIG_REQUIRES_IMPLEMENTATION_GATE',path:target,exitCode:0};
 const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));
 if(!plan.configuration)return {status:'NEEDS_CREATIVE_IMPLEMENTATION',next:'O agente 2B deve implementar a configuração e os componentes previstos no plano; depois executar builder:validate.',exitCode:2};
 const {ClientConfigSchema}=await import(pathToFileURL(path.join(root,'src/clients/schema.ts')).href);
 const config=ClientConfigSchema.parse(plan.configuration);
 if(config.slug!==slug)throw new Error('Slug da configuração diverge do plano');
 const actual=config.pages.find(p=>p.path==='')?.sections || [];
 if(actual.length!==plan.sections.length||actual.some((s,i)=>s.id!==plan.sections[i].id||s.variant!==plan.sections[i].variant))throw new Error('Configuração diverge das seções planejadas');
 await builder.validate(root,slug,'plan',{stamp:true});
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'export default '+JSON.stringify(config,null,2)+';\n',{flag:'wx'});
 return {status:'CONFIG_SAVED_IMPLEMENTATION_PENDING',path:target,exitCode:0};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];
 scaffold(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..'),slug).then(r=>{console.log(JSON.stringify(r,null,2));process.exitCode=r.exitCode;}).catch(e=>{console.error(e.message);process.exitCode=1;});
}
