const {runArtDirector}=require('./lib/art-direction-evidence.cjs');
const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];
runArtDirector({slug,checkOnly:true}).then(r=>{console.log(JSON.stringify(r,null,2));if(!r.passed)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
