const {validate} = require('./lib/builder-implementation.cjs');
const args=process.argv.slice(2), value=k=>args[args.indexOf(k)+1];
const slug=value('--slug'), phase=args.includes('--phase')?value('--phase'):'plan';
if(!args.includes('--slug') || !/^[a-z0-9-]+$/.test(slug) || !['plan','implemented'].includes(phase)) {console.error('Uso: node scripts/validate-builder-implementation.cjs --slug cliente --phase plan|implemented');process.exit(1);}
validate(process.cwd(),slug,phase,{stamp:true}).then(r=>{console.log(JSON.stringify(r,null,2));process.exitCode=r.passed?0:1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
