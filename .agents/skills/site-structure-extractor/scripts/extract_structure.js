import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {validate}=require('../../../../scripts/lib/prospector-evidence.cjs');
const args=process.argv.slice(2),slug=args[args.indexOf('--slug')+1];
if(!args.includes('--slug')||!/^[a-z0-9-]+$/.test(slug||''))throw Error('Informe --slug válido');
try {
 const result=await validate(process.cwd(),slug);
 const file='leads/'+slug+'/referencias/site-atual.md';
 if(!result.passed||!fs.existsSync(file))throw Error(result.errors.join('\n')||'site-atual.md ausente');
 console.log(JSON.stringify({status:'SOURCE_STRUCTURE_VERIFIED',path:file,instruction:'A extração consolidada é produzida por scripts/prospector-engine.cjs. Consumir source-evidence.json para títulos, textos, formulários e seletores reais; source-review.json define fatos liberados. Nenhum texto ou layout padrão foi acrescentado.'}));
} catch(error) {
 console.error('NEEDS_SOURCE_REVIEW: '+error.message+'\nExecutar o Prospector, revisar as fontes e reprocessar --from-snapshot.');process.exitCode=1;
}
