const fs=require('node:fs'),sharp=require('sharp');
const {inside,read,digest,write}=require('./lib/source-evidence.cjs');
async function validateOriginal(root,slug) {
 if(!/^[a-z0-9-]+$/.test(slug||''))throw Error('Slug inválido');
 const base=`leads/${slug}`,file=`${base}/visual/original-review.json`,errors=[];
 if(!fs.existsSync(inside(root,file)))return {passed:false,status:'NEEDS_ORIGINAL_IMAGE_REVIEW',errors:['Abrir as quatro capturas originais e registrar original-review.json; nenhuma nota foi presumida.']};
 const review=read(root,file);
 if(review.method!=='image-inspection'||!review.reviewedBy||!review.reviewedAt)errors.push('Autoria/inspeção original ausente');
 for(const viewport of ['desktop','mobile'])for(const full of [false,true]) {
  const file=`${base}/screenshots/site-${viewport}${full?'-full':''}.png`;
  const shot=review.inspections?.find(s=>s.path===file);
  try {const bytes=fs.readFileSync(inside(root,file)),meta=await sharp(bytes).metadata();if(shot?.sha256!==digest(bytes)||!shot?.finding||!shot.regions?.length)errors.push('Captura original sem inspeção atual: '+file);for(const r of shot?.regions||[])if(!r.description||r.x<0||r.y<0||r.width<=0||r.height<=0||r.x+r.width>meta.width||r.y+r.height>meta.height)errors.push('Região original inválida: '+file);}catch(e){errors.push(e.message);}
 }
 if(!review.firstFold?.desktop||!review.firstFold?.mobile||!Array.isArray(review.preserve)||!Array.isArray(review.improve)||!Array.isArray(review.limitations))errors.push('Baseline original incompleto');
 if(review.visualQualityScore!=null&&(!Number.isFinite(review.visualQualityScore)||review.visualQualityScore<0||review.visualQualityScore>10||!review.scoreReason))errors.push('Nota qualitativa sem fundamentação');
 if(review.redesignOpportunityScore!=null&&(!Number.isFinite(review.redesignOpportunityScore)||review.redesignOpportunityScore<0||review.redesignOpportunityScore>100||!review.opportunityReason))errors.push('Oportunidade sem fundamentação');
 return {passed:!errors.length,status:errors.length?'NEEDS_ORIGINAL_IMAGE_REVIEW':'ORIGINAL_REVIEWED',errors,visualQualityScore:review.visualQualityScore??null,redesignOpportunityScore:review.redesignOpportunityScore??null};
}
module.exports={validateOriginal};
if(require.main===module){const args=process.argv.slice(2),slug=args.includes('--slug')?args[args.indexOf('--slug')+1]:args[0];validateOriginal(process.cwd(),slug).then(r=>{console.log(JSON.stringify(r,null,2));if(!r.passed)process.exitCode=1;}).catch(e=>{console.error(e.message);process.exitCode=1;});}
