import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {scaffold} from '../../astro-platform-builder/scripts/scaffold_client_config.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];
scaffold(root,slug).then(r=>{console.log(JSON.stringify(r,null,2));process.exitCode=r.exitCode;}).catch(e=>{console.error(e.message);process.exitCode=1;});
