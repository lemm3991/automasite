const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const {sourceSnapshot,sameSnapshot}=require('./builder-evidence.cjs');
async function validateRender(root,slug){
 if(!/^[a-z0-9-]+$/.test(slug||''))throw new Error('Slug inválido');
 const dir=path.join(root,'leads',slug),errors=[],warnings=[];
 const read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
 let evidence;try{evidence=read('redesign/render-evidence.json');}catch{ return {kind:'Render Validation',passed:false,errors:['Evidência de renderização ausente'],warnings,visualAssessment:'pending',visualQualityScore:null}; }
 if(evidence.httpStatus!==200)errors.push('Página não retornou HTTP 200');
 if(!sameSnapshot(evidence.sourceHashes,sourceSnapshot(root,slug)))errors.push('Código/assets mudaram desde as capturas');
 const built=path.join(root,'dist/client',slug,'index.html');
 if(!fs.existsSync(built)||evidence.htmlSha256!==hash(fs.readFileSync(built)))errors.push('HTML capturado não corresponde ao build atual');
 if(evidence.clientConfigSha256!==hash(fs.readFileSync(path.join(root,'src/clients/data',slug+'.ts'))))errors.push('Capturas anteriores à configuração atual');
 const inspected=[];
 for(const name of ['desktop','mobile']){
  const capture=evidence.captures?.find(c=>c.viewport.name===name);
  if(!capture){errors.push(`Captura ${name} ausente`);continue;}
  if(!capture.checks || capture.checks.readyState!=='complete' || capture.checks.fontsStatus!=='loaded'){errors.push(`Carregamento incompleto: ${name}`);continue;}
  if(capture.checks.width!==capture.viewport.width)errors.push(`Viewport incorreto: ${name}`);
  if(capture.checks.scrollWidth>capture.viewport.width+1)errors.push(`Overflow horizontal: ${name}`);
  if(capture.checks.brokenImages?.length)errors.push(`Imagens não carregadas: ${name}`);
  if(capture.checks.missingAnchors?.length)warnings.push(`Âncoras pendentes ${name}: ${capture.checks.missingAnchors.join(', ')}`);
  if(!capture.screenshots?.some(s=>s.fullPage===false)||!capture.screenshots?.some(s=>s.fullPage===true))errors.push(`Exigidas primeira dobra e página completa: ${name}`);
  for(const image of capture.screenshots||[]){try{
   const absolute=path.resolve(root,image.path);if(!absolute.startsWith(path.resolve(dir,'redesign')+path.sep))throw new Error('Caminho de captura inválido');
   const b=fs.readFileSync(absolute),meta=await sharp(b).metadata();await sharp(b).raw().toBuffer();
   if(meta.format!=='png'||meta.width!==image.width||meta.width!==capture.viewport.width||meta.height!==image.height||(!image.fullPage&&meta.height!==capture.viewport.height)||hash(b)!==image.sha256)throw new Error('Dimensões/hash divergem da captura');
   inspected.push({path:image.path,width:meta.width,height:meta.height,sha256:hash(b)});
  }catch(e){errors.push(`${image.path}: ${e.message}`);}}
 }
 if(evidence.runtimeErrors?.length)errors.push(...evidence.runtimeErrors);
 return {schemaVersion:1,kind:'Render Validation',slug,checkedAt:new Date().toISOString(),passed:errors.length===0,errors,warnings,inspected,visualAssessment:'requires_image_review',visualQualityScore:null,regressions:null,limitations:['Arquivos válidos e página renderizada não comprovam qualidade visual.','Comparar original e redesign abrindo as imagens e registrar visual-review.json.']};
}
module.exports={validateRender};
