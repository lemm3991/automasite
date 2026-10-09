import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import handoff from './generate-builder-handoff.cjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),slugs=args.flatMap((arg,i)=>arg==='--slug'&&args[i+1]?[args[i+1]]:[]);
if(!slugs.length)slugs.push(...fs.readdirSync(path.join(root,'src/clients/data')).filter(f=>f.endsWith('.ts')).map(f=>f.slice(0,-3)));
for(const slug of slugs){
 try{const report=await handoff.generate(root,slug,{checkOnly:true});console.log(JSON.stringify({slug,status:report.status,errors:report.errors},null,2));if(!report.passed)process.exitCode=1;}
 catch(error){console.error(slug+': '+error.message);process.exitCode=1;}
}
