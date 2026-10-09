// Validate the agent's actual inspection; never manufacture aesthetic scores.
const path=require('node:path');
const {validateOriginal}=require('../../../../scripts/validate-original-review.cjs');
const root=path.resolve(__dirname,'../../../..');
validateOriginal(root,process.argv[2]).then(r=>{console.log(JSON.stringify(r,null,2));if(!r.passed)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});
