// The model creates the decision. This engine verifies sources and persists it.
const {runArtDirector}=require('./lib/art-direction-evidence.cjs');
module.exports=require('./lib/art-direction-evidence.cjs');
if(require.main===module){const args=process.argv.slice(2),value=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;runArtDirector({slug:value('--slug')||args[0],decisionFile:value('--decision'),checkOnly:args.includes('--check'),queries:args.flatMap((v,i)=>v==='--query'?[args[i+1]]:[])}).then(r=>{console.log(JSON.stringify({status:r.status,slug:r.slug,passed:r.passed,errors:r.errors,context:r.context,contextSha256:r.contextSha256},null,2));if(r.passed===false)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});}
