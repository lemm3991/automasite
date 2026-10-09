const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {fileHash,configFor}=require('./lib/builder-implementation.cjs');
const {sourceSnapshot,sameSnapshot}=require('./lib/builder-evidence.cjs');
const {pathToFileURL}=require('node:url');
const args=process.argv.slice(2),slug=args[args.indexOf('--slug')+1];
async function main(){
 if(!args.includes('--slug')||!/^[a-z0-9-]+$/.test(slug||''))throw new Error('Informe --slug cliente');
 const root=path.resolve(__dirname,'..'),dir=path.join(root,'leads',slug,'redesign');fs.mkdirSync(dir,{recursive:true});
 const {ClientConfigSchema}=await import(pathToFileURL(path.join(root,'src/clients/schema.ts')).href);
 ClientConfigSchema.parse(await configFor(root,slug));
 const before=sourceSnapshot(root,slug),startedAt=new Date().toISOString();
 const command=['node','node_modules/astro/bin/astro.mjs','build'];
 const run=spawnSync(process.execPath,command.slice(1),{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024});
 const log=`${run.stdout||''}\n${run.stderr||''}\n${run.error?.message||''}`;
 const logPath=`leads/${slug}/redesign/build.log`;fs.writeFileSync(path.join(root,logPath),log);
 const html=`dist/client/${slug}/index.html`;
 const passed=run.status===0&&sameSnapshot(before,sourceSnapshot(root,slug))&&fs.existsSync(path.join(root,html));
 const evidence={schemaVersion:1,slug,startedAt,completedAt:new Date().toISOString(),passed,command,exitCode:run.status,schemaValid:true,logPath,logSha256:fileHash(root,logPath),sourceHashes:before,htmlPath:html,htmlSha256:passed?fileHash(root,html):null};
 fs.writeFileSync(path.join(dir,'build-evidence.json'),JSON.stringify(evidence,null,2));
 console.log(JSON.stringify({slug,passed,exitCode:run.status,logPath}));if(!passed){console.error(log.slice(-8000));process.exitCode=1;}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
