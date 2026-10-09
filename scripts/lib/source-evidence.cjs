const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {unescape} = require('html-escaper');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const clean = value => unescape(String(value || '')).replace(/\s+/g, ' ').trim();
function inside(root, relative) {
  const file = path.resolve(root, relative || '');
  const rel = path.relative(root, file);
  if (!relative || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error(`Caminho inválido: ${relative}`);
  return file;
}
const read = (root, file) => JSON.parse(fs.readFileSync(inside(root,file),'utf8'));
function write(root,file,value) { const dest=inside(root,file); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.writeFileSync(dest,typeof value==='string'?value:JSON.stringify(value,null,2)); }
function textOf(node) {
  if (['script','style','noscript'].includes(node.name)) return '';
  if (node.type===2) return node.value;
  return (node.children||[]).map(textOf).join(' ');
}
async function parseHtml(html) {
  const {parse,walkSync}=await import('ultrahtml');
  const tree=parse(html),nodes=[];
  walkSync(tree,node=>{if(node.type===1) nodes.push(node);});
  return {tree,nodes,text:clean(textOf(tree))};
}
function selectorFor(node) {
  if (node.attributes?.id) return `[id=${JSON.stringify(node.attributes.id)}]`;
  const parts=[]; let current=node;
  while(current?.name) {const siblings=(current.parent?.children||[]).filter(n=>n.name===current.name);parts.unshift(`${current.name}:nth-of-type(${siblings.indexOf(current)+1})`);current=current.parent;}
  return parts.join(' > ');
}
async function collectSources(root,slug) {
  if(!/^[a-z0-9-]+$/.test(slug))throw new Error('Slug inválido');
  const base=`leads/${slug}`,manifest=read(root,`${base}/referencias/pages-manifest.json`),pages=[];
  for(const record of manifest.realPages||[]) {
    if(record.status!=='DOWNLOADED'||pages.some(p=>p.path===`${base}/${record.localPath}`))continue;
    const file=`${base}/${record.localPath}`,html=fs.readFileSync(inside(root,file),'utf8');
    const {nodes,text}=await parseHtml(html);
    const entry={id:`page-${pages.length+1}`,url:record.url,path:file,sha256:digest(html),text,
      headings:[],sections:[],forms:[],links:[],textBlocks:[],cssColors:[]};
    for(const n of nodes) {
      const a=n.attributes||{},value=clean(textOf(n)),selector=selectorFor(n);
      if(/^h[1-6]$/.test(n.name)&&value)entry.headings.push({selector,text:value});
      if(['section','header','footer','main'].includes(n.name))entry.sections.push({selector,text:value});
      if(n.name==='form')entry.forms.push({selector,text:value,fields:nodes.filter(c=>{let p=c.parent;while(p){if(p===n)return ['input','select','textarea'].includes(c.name);p=p.parent;}return false;}).map(c=>({selector:selectorFor(c),name:c.attributes.name||'',type:c.attributes.type||c.name}))});
      if(n.name==='a'&&a.href)entry.links.push({selector,text:value,href:a.href});
      if(['p','li','address','h1','h2','h3','h4','h5','h6'].includes(n.name)&&value)entry.textBlocks.push({selector,text:value});
      if(n.name==='style'||a.style)for(const match of (n.name==='style'?textOfStyle(n):a.style).matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi))entry.cssColors.push({value:match[0].toLowerCase(),selector});
    }
    entry.cssColors=entry.cssColors.filter((x,i,a)=>a.findIndex(v=>v.value===x.value)===i);
    pages.push(entry);
  }
  const candidates=[];
  for(const p of pages) {
    for(const kind of ['phone','address','hours']) {
      const re=kind==='phone'?/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/g:kind==='address'?/\b(?:Rua|Av\.|Avenida|Alameda|Rodovia|Travessa)\s[^\n]{4,180}/gi:/(?:Segunda|Terça|Seg\s+a|segunda|terça)[^\n]{0,90}(?:\d{1,2}h(?:[0-5]\d)?|\d{1,2}:\d{2})/g;
      for(const block of p.textBlocks)for(const m of block.text.matchAll(re))candidates.push({id:`candidate-${candidates.length+1}`,kind,value:m[0],status:'unconfirmed',evidence:{pageId:p.id,selector:block.selector,quote:block.text}});
    }
    for(const l of p.links.filter(l=>/wa\.me|whatsapp|^tel:/i.test(l.href))) candidates.push({id:`candidate-${candidates.length+1}`,kind:'contactLink',value:l.href,status:'unconfirmed',evidence:{pageId:p.id,selector:l.selector,quote:l.href,attribute:'href'}});
  }
  // Multiple locations may be legitimate. They require entity assignment, never silent merging.
  const ambiguities=['phone','address','hours','contactLink'].map(kind=>({kind,values:[...new Set(candidates.filter(c=>c.kind===kind).map(c=>c.value))]})).filter(g=>g.values.length>1);
  return {schemaVersion:1,slug,pages,candidates,ambiguities,generatedAt:new Date().toISOString()};
}
function textOfStyle(node){return (node.children||[]).map(n=>n.value||'').join('');}
function evidenceErrors(bundle, evidence, value) {
  const errors=[];
  for(const ref of evidence||[]) {
    const page=bundle.pages.find(p=>p.id===ref.pageId);
    const items=page?[...page.headings,...page.sections,...page.forms,...page.links,...page.textBlocks]:[];
    const found=items.find(x=>x.selector===ref.selector&&(ref.attribute==='href'?x.href===ref.quote:clean(x.text).includes(clean(ref.quote))));
    if(!page||!ref.quote||!found)errors.push(`Trecho/seletor não encontrado no HTML: ${ref.pageId}/${ref.selector}`);
  }
  if(!evidence?.length)errors.push('Afirmação sem fonte HTML');
  const corpus=clean((evidence||[]).map(e=>e.quote).join(' '));
  if(value&&!corpus.includes(clean(value)))errors.push(`Valor não literal nas fontes: ${value}`);
  return errors;
}
function validateFacts(bundle,review) {
  const errors=[],facts=review?.facts||[],ids=new Set();
  for(const fact of facts) {
    if(typeof fact.value!=='string'||!fact.value.trim())errors.push(`Valor factual vazio/inválido: ${fact.id}`);
    if(ids.has(fact.id)||!fact.id)errors.push(`ID factual inválido/duplicado: ${fact.id}`);ids.add(fact.id);
    if(!['verified','conflicting','unconfirmed'].includes(fact.status)||!fact.kind||!fact.entityId)errors.push(`Classificação factual incompleta: ${fact.id}`);
    errors.push(...evidenceErrors(bundle,fact.evidence,fact.value).map(e=>`${fact.id}: ${e}`));
    if(fact.kind==='service'&&/cnpj|não divulgado|not disclosed/i.test(fact.value))errors.push(`Dado cadastral não é serviço: ${fact.id}`);
    if(fact.status==='conflicting'&&(!fact.alternatives?.length||fact.alternatives.some(a=>evidenceErrors(bundle,a.evidence,a.value).length)))errors.push(`Conflito sem fontes alternativas: ${fact.id}`);
    if(fact.resolution&&(!fact.resolution.reason||!fact.resolution.selectedValue||![fact.value,...(fact.alternatives||[]).map(a=>a.value)].includes(fact.resolution.selectedValue)))errors.push(`Resolução inválida: ${fact.id}`);
  }
  for(const fact of facts.filter(f=>f.status==='verified')) {
    if(facts.some(f=>f.id!==fact.id&&f.entityId===fact.entityId&&f.kind===fact.kind&&f.value!==fact.value&&['hours','phone','address','city'].includes(f.kind)))errors.push(`Conflito marcado como verified: ${fact.entityId}/${fact.kind}`);
  }
  for(const ambiguity of bundle.ambiguities||[]) {
    const response=review?.ambiguityResolutions?.find(r=>r.kind===ambiguity.kind);
    if(!response?.reason||!response.factIds?.length||response.factIds.some(id=>!ids.has(id))||ambiguity.values.some(v=>!response.values?.includes(v)))errors.push(`Ambiguidade não resolvida explicitamente: ${ambiguity.kind}`);
  }
  return errors;
}
function allowedFacts(review) {return (review.facts||[]).filter(f=>f.status==='verified'||(f.status==='conflicting'&&f.resolution?.reason&&f.resolution.selectedValue)).map(f=>({...f,value:f.resolution?.selectedValue||f.value}));}
function assertFresh(root,bundle) {for(const p of bundle.pages)if(digest(fs.readFileSync(inside(root,p.path)))!==p.sha256)throw new Error(`Fonte mudou: ${p.path}`);}
module.exports={digest,clean,inside,read,write,parseHtml,collectSources,evidenceErrors,validateFacts,allowedFacts,assertFresh};
