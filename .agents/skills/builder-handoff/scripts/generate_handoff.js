import path from 'node:path';
import {fileURLToPath} from 'node:url';
import handoff from '../../../../scripts/generate-builder-handoff.cjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];
handoff.generate(root,slug).then(r=>{console.log(JSON.stringify({slug:r.slug,status:r.status,errors:r.errors},null,2));if(!r.passed)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
