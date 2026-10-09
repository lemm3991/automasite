const fs=require('node:fs'),sharp=require('sharp');
const {digest,inside}=require('./source-evidence.cjs');
const categories=['logo','favicon','environment','team','service','product','video','thumbnail','icon','decoration','unconfirmed'];
function classifyCandidate(asset) {
 const url=asset.originalUrl||'',name=asset.filename||'',alt=asset.altOriginal||'';
 if(/\.(mp4|webm|mov)(?:\?|$)/i.test(url))return {category:'video',status:'verified',basis:'media-format',description:null};
 if(/(?:i\.ytimg\.com|img\.youtube\.com)\/|hqdefault|mqdefault/i.test(url))return {category:'thumbnail',status:'verified',basis:'video-provider',description:null};
 if(/favicon/i.test(name)||asset.domRole==='icon')return {category:'favicon',status:'unconfirmed',basis:'filename-or-dom'};
 if(/\blogo\b|logotipo/i.test(`${name.replace(/[-_]/g,' ')} ${alt}`))return {category:'logo',status:'unconfirmed',basis:'filename-or-alt'};
 return {category:'unconfirmed',status:'unconfirmed',basis:'requires-image-inspection',description:null};
}
function validateAssetReview(root,manifest,review) {
 const errors=[],seen=new Set();
 for(const item of review?.assets||[]) {
  const asset=manifest.assets.find(a=>a.localPublicPath===item.path);
  if(!asset||seen.has(item.path)){errors.push(`Asset desconhecido/duplicado: ${item.path}`);continue;}seen.add(item.path);
  const file=inside(root,`public/${item.path.replace(/^\//,'')}`);
  if(!fs.existsSync(file)||digest(fs.readFileSync(file))!==item.sha256)errors.push(`Inspeção de asset desatualizada: ${item.path}`);
  if(!categories.includes(item.category)||item.category==='unconfirmed'||item.method!=='image-view'||!item.reviewedBy||!item.reviewedAt||!item.description||!Array.isArray(item.observableDetails)||item.observableDetails.length<2)errors.push(`Inspeção visual incompleta: ${item.path}`);
  if(!Array.isArray(item.allowedCaptions)||item.allowedCaptions.some(c=>!c.trim())||!item.allowedCaptions.length)errors.push(`Legendas validadas ausentes: ${item.path}`);
  if(!['client-source','stock','unknown'].includes(item.provenance))errors.push(`Origem visual não classificada: ${item.path}`);
 }
 return errors;
}
async function paletteCandidates(root,bundle,manifest,review) {
 const colors=[];
 for(const asset of review?.assets||[]) {
  if(!['logo','environment','service','product'].includes(asset.category))continue;
  const file=inside(root,`public/${asset.path.replace(/^\//,'')}`);
  try {
   const decoder=sharp(file);
   if(asset.category!=='logo')decoder.resize(96,96,{fit:'inside'});
   const {data,info}=await decoder.ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const counts=new Map(),exact=new Map();
   for(let i=0;i<data.length;i+=info.channels){if(data[i+3]<245)continue;const value='#'+[...data.slice(i,i+3)].map(c=>c.toString(16).padStart(2,'0')).join('');exact.set(value,(exact.get(value)||0)+1);}
   for(const [value,pixels] of [...exact].sort((a,b)=>b[1]-a[1]).slice(0,3))colors.push({value,source:asset.category==='logo'?'logo':'asset',path:asset.path,sha256:asset.sha256,pixels,method:'exact-pixel-sample',status:'candidate'});
   for(let i=0;i<data.length;i+=info.channels){if(data[i+3]<180)continue;const rgb=[...data.slice(i,i+3)].map(c=>Math.min(255,Math.round(c/16)*16));if(Math.max(...rgb)-Math.min(...rgb)<24)continue;const hex='#'+rgb.map(c=>c.toString(16).padStart(2,'0')).join('');counts.set(hex,(counts.get(hex)||0)+1);}
   for(const [value,pixels] of [...counts].sort((a,b)=>b[1]-a[1]).slice(0,5))colors.push({value,source:asset.category==='logo'?'logo':'asset',path:asset.path,sha256:asset.sha256,pixels,method:'quantized-pixel-sample',status:'candidate'});
  }catch{ /* Video and undecodable files cannot supply a sampled color. */ }
 }
 for(const page of bundle.pages) {
  const html=fs.readFileSync(inside(root,page.path),'utf8');
  for(const color of page.cssColors) {
   const preset=new RegExp('--wp--(?:preset|custom)[^:;{}]*:\\s*'+color.value+'(?:;|\\s)','i').test(html);
   const inline=[...html.matchAll(/<[a-z][^>]*\sstyle=["']([^"']*)["'][^>]*>/gi)].some(m=>m[1].toLowerCase().includes(color.value.toLowerCase())&&!m[1].includes('--wp--'));
   colors.push({...color,source:'css',path:page.path,sha256:page.sha256,status:'candidate',origin:preset?'wordpress-preset':'css-declaration',usageVerified:inline,usageMethod:inline?'inline-on-dom-element':'declaration-only'});
  }
 }
 return {priority:['logo','observed-css-usage','asset','explicit-visual-inference'],colors};
}
function validatePalette(palette,candidates,assetReview) {
 const errors=[];
 for(const [role,color] of Object.entries(palette||{})) {
  if(!/^#[0-9a-f]{6}$/i.test(color.value||'')){errors.push(`Cor inválida: ${role}`);continue;}
  if(!['official','observed','inferred','neutral'].includes(color.status))errors.push(`Classificar identidade como official/observed/inferred/neutral: ${role}`);
  if(color.status==='official'&&color.source!=='logo')errors.push(`Cor oficial exige logo real; CSS observado não comprova oficialidade: ${role}`);
  if(color.source==='editorial-neutral') {const rgb=color.value.slice(1).match(/../g).map(x=>parseInt(x,16));if(Math.max(...rgb)-Math.min(...rgb)>35||!color.reason||color.status!=='neutral')errors.push(`Neutro editorial inválido: ${role}`);continue;}
  if(color.source==='explicit-visual-inference'&&color.status!=='inferred')errors.push(`Inferência não pode ser declarada oficial/observada: ${role}`);
  if(color.source==='explicit-visual-inference') {if(!assetReview.assets.some(a=>a.path===color.path&&a.sha256===color.sha256)||!color.reason)errors.push(`Inferência cromática sem inspeção: ${role}`);}
  else {
   const matches=candidates.colors.filter(c=>c.value.toLowerCase()===color.value.toLowerCase()&&c.source===color.source&&c.path===color.path&&c.sha256===color.sha256);
   if(!matches.length)errors.push(`Cor sem origem comprovada: ${role}`);
   if(color.source==='css'&&(!matches.some(c=>c.usageVerified)||color.status!=='observed'))errors.push(`CSS/preset declarado não comprova uso relevante da marca: ${role}`);
   if(color.source==='asset'&&color.status!=='observed')errors.push(`Cor de asset deve ser observed: ${role}`);
  }
  if(color.source!=='logo'&&candidates.colors.some(c=>c.source==='logo')&&!color.reason)errors.push(`Justificar prioridade cromática: ${role}`);
 }
 for(const key of ['background','primary','secondary','accent','text'])if(!palette?.[key])errors.push(`Token cromático ausente: ${key}`);
 return errors;
}
module.exports={categories,classifyCandidate,validateAssetReview,paletteCandidates,validatePalette};
