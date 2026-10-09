const fs = require('node:fs'), path = require('node:path');
const {local, fileHash} = require('./builder-implementation.cjs');
// Shared infrastructure plus this client's code/assets. Other isolated clients do not stale this receipt.
function sourceSnapshot(root, slug) {
  if (!/^[a-z0-9-]+$/.test(slug || '')) throw new Error('Slug inválido');
  const files = [];
  function walk(relative) {
    if (!fs.existsSync(local(root, relative))) return;
    for (const item of fs.readdirSync(local(root, relative), {withFileTypes:true})) {
      const file = `${relative}/${item.name}`;
      if (item.isSymbolicLink()) continue;
      if (relative === 'src/clients/data' && item.name !== `${slug}.ts`) continue;
      if (relative === 'src/clients/components' && item.isDirectory() && item.name !== slug) continue;
      if (item.isDirectory()) walk(file); else files.push(file);
    }
  }
  walk('src'); walk(`public/assets/clients/${slug}`);
  for (const file of ['package.json','package-lock.json','astro.config.mjs','astro.config.ts','tsconfig.json']) {
    if (fs.existsSync(local(root,file))) files.push(file);
  }
  return Object.fromEntries(files.sort().map(file => [file,fileHash(root,file)]));
}
function sameSnapshot(a,b) { return !!a && JSON.stringify(a) === JSON.stringify(b); }
function validateReview(root, slug, review, render) {
  const errors=[];
  if (!review || review.status !== 'approved' || review.method !== 'image-inspection' || !review.reviewedBy || !review.reviewedAt) errors.push('Revisão visual real não aprovada');
  const criteria=['hero','identity','composition','imagery','legibility','personalization','artDirection','factualContent'];
  for (const criterion of criteria) if (!review?.observations?.some(o=>o.criterion===criterion && o.finding?.length>=20 && o.evidencePaths?.length)) errors.push(`Observação visual ausente: ${criterion}`);
  const screenshots = review?.screenshotHashes || {};
  for (const image of render.inspected || []) if(screenshots[image.path] !== image.sha256) errors.push(`Revisão não corresponde à captura: ${image.path}`);
  for (const size of ['desktop','mobile']) {
    const original = `leads/${slug}/screenshots/site-${size}.png`;
    try { if(screenshots[original] !== fileHash(root,original)) errors.push(`Original ${size} não revisado`); }
    catch { errors.push(`Original ${size} ausente`); }
  }
  for(const observation of review?.observations || []) for(const file of observation.evidencePaths || []) if(!screenshots[file]) errors.push(`Observação sem imagem inspecionada: ${file}`);
  if(!Array.isArray(review?.limitations) || !Array.isArray(review?.regressions)) errors.push('Registrar limitações e regressões observadas na revisão');
  try {
    const actual=JSON.parse(fs.readFileSync(local(root,`leads/${slug}/redesign/render-evidence.json`),'utf8'));
    errors.push(...require('./review-evidence.cjs').validateDetailedReview(root,slug,review,actual));
  } catch(e) {errors.push(`Evidência detalhada indisponível: ${e.message}`);}
  return errors;
}
module.exports={sourceSnapshot,sameSnapshot,validateReview};
