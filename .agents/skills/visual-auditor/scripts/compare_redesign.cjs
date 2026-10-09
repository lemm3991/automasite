// Objective render checks only. Qualitative findings require opened screenshots.
const fs=require('node:fs'),path=require('node:path');
const {validateRender}=require('../../../../scripts/lib/render-validation.cjs');
const root=path.resolve(__dirname,'../../../..'),args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];
async function main(){
 const report=await validateRender(root,slug),dir=path.join(root,'leads',slug,'visual');fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'render-validation.json'),JSON.stringify(report,null,2));
 fs.writeFileSync(path.join(dir,'visual-validation.json'),JSON.stringify({schemaVersion:2,status:'REQUIRES_IMAGE_REVIEW',kind:report.kind,renderPassed:report.passed,visualQualityScore:null,regressions:null,reviewPath:'leads/'+slug+'/redesign/visual-review.json'},null,2));
 fs.writeFileSync(path.join(dir,'visual-comparison.md'),'# Render Validation\n\nVerificação objetiva: '+(report.passed?'aprovada':'pendente')+'.\n\nEsta ferramenta não atribui nota visual nem detecta regressões estéticas. A comparação real está em redesign/visual-review.json.\n\n'+report.errors.map(e=>'- '+e).join('\n')+'\n');
 console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
