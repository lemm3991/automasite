const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function within(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) throw new Error(`Caminho relativo inválido: ${relative}`);
  const file = path.resolve(root, relative);
  const rel = path.relative(root, file);
  if (rel === '..' || rel.startsWith(`..${path.sep}`)) throw new Error(`Caminho fora do acervo: ${relative}`);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Arquivo ausente: ${relative}`);
  const realRel = path.relative(fs.realpathSync(root), fs.realpathSync(file));
  if (realRel === '..' || realRel.startsWith(`..${path.sep}`)) throw new Error(`Link fora do acervo: ${relative}`);
  return file;
}

function text(html) {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&(amp|nbsp|quot|apos|lt|gt);/g, (_, k) => ({amp:'&',nbsp:' ',quot:'"',apos:"'",lt:'<',gt:'>'}[k]))
    .replace(/\s+/g, ' ').trim();
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function hex(value) {
  const m = value?.trim().match(/^#([\da-f]{3}|[\da-f]{6})(?:\b|$)/i);
  if (!m) return null;
  return '#' + (m[1].length === 3 ? [...m[1]].map(c => c+c).join('') : m[1]).toLowerCase();
}

const COLORS = {white:'#ffffff',black:'#000000',transparent:null};
const scales = {
  slate:'f8fafc f1f5f9 e2e8f0 cbd5e1 94a3b8 64748b 475569 334155 1e293b 0f172a 020617',
  gray:'f9fafb f3f4f6 e5e7eb d1d5db 9ca3af 6b7280 4b5563 374151 1f2937 111827 030712',
  zinc:'fafafa f4f4f5 e4e4e7 d4d4d8 a1a1aa 71717a 52525b 3f3f46 27272a 18181b 09090b',
  neutral:'fafafa f5f5f5 e5e5e5 d4d4d4 a3a3a3 737373 525252 404040 262626 171717 0a0a0a',
  stone:'fafaf9 f5f5f4 e7e5e4 d6d3d1 a8a29e 78716c 57534e 44403c 292524 1c1917 0c0a09',
  orange:'fff7ed ffedd5 fed7aa fdba74 fb923c f97316 ea580c c2410c 9a3412 7c2d12 431407',
  cyan:'ecfeff cffafe a5f3fc 67e8f9 22d3ee 06b6d4 0891b2 0e7490 155e75 164e63 083344',
  teal:'f0fdfa ccfbf1 99f6e4 5eead4 2dd4bf 14b8a6 0d9488 0f766e 115e59 134e4a 042f2e',
};
for (const [name, values] of Object.entries(scales)) values.split(' ').forEach((v,i) => { COLORS[`${name}-${[50,100,200,300,400,500,600,700,800,900,950][i]}`] = '#'+v; });

function inspectPage(root, relative) {
  const file = within(root, relative);
  const html = fs.readFileSync(file, 'utf8');
  const sources = [{path:relative, content:html}];
  const cssFiles = new Set();
  for (const link of html.match(/<link\b[^>]*>/gi) || []) {
    const href = attribute(link, 'href').split(/[?#]/)[0];
    if (!href.endsWith('.css') || /^(https?:|\/\/)/i.test(href)) continue;
    const cssRelative = path.relative(root, path.resolve(path.dirname(file), href)).replaceAll('\\', '/');
    try { const cssFile = within(root, cssRelative); cssFiles.add(cssFile); sources.push({path:cssRelative, content:fs.readFileSync(cssFile,'utf8')}); } catch { /* Missing assets remain a separate preview concern. */ }
  }
  for(const script of html.match(/<script\b[^>]*>/gi)||[]) {
    const src=attribute(script,'src');
    if(!/(?:tailwind[-.]config|theme[-.]config)\.[cm]?js$/i.test(src)) continue;
    const rel=path.relative(root,path.resolve(path.dirname(file),src)).replaceAll('\\','/');
    try { sources.push({path:rel,content:fs.readFileSync(within(root,rel),'utf8')}); } catch {}
  }
  const configText=html+'\n'+sources.filter(s=>s.path.endsWith('.js')).map(s=>s.content).join('\n');
  const css = sources.map(s => s.path.endsWith('.css') ? s.content : [...s.content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n')).join('\n');
  const variables=Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].map(m=>[m[1],m[2].trim()]));
  const resolve=value=>{
    for(let i=0;i<5&&value?.includes('var(');i++) value=value.replace(/var\((--[\w-]+)(?:,\s*([^()]+))?\)/g,(m,key,fallback)=>variables[key]||fallback||m);
    return value;
  };
  const rules = [...css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@import[^;]+;/g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(m => ({selectors:m[1].trim().split(',').map(s=>s.trim()), declarations:m[2]}));
  const bodyTag = (html.match(/<body\b[^>]*>/i)||[])[0] || '';
  const heading = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)||[])[0] || '';
  const headings = [...html.matchAll(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi)].map(m=>text(m[1])).filter(Boolean).slice(0,12);
  const classRules = (markup) => {
    const classes = [...markup.matchAll(/\bclass\s*=\s*(["'])([\s\S]*?)\1/gi)].flatMap(m=>m[2].split(/\s+/));
    return rules.filter(r => r.selectors.some(s => classes.some(c=>s==='.'+c)));
  };
  const property = (candidates, name) => {
    for (const r of [...candidates].reverse()) { const m=r.declarations.match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`,'i')); if(m) return m[1].replace(/\s*!important\s*/,'').trim(); }
    return null;
  };
  const fontName = value => { const name=resolve(value)?.split(',')[0].trim().replace(/^["']|["']$/g,''); return !name||name.includes('var(')||['inherit','initial','unset'].includes(name) ? null : name; };
  const bodyRules = rules.filter(r=>r.selectors.includes('body')||r.selectors.includes('html'));
  const headingRules = rules.filter(r=>r.selectors.includes('h1'));
  const inline = markup=>({declarations:attribute(markup.match(/^<[^>]+>/)?.[0]||markup,'style')});
  const tailwindFont = markup => {
    const cls = [...markup.matchAll(/\bclass\s*=\s*(["'])([\s\S]*?)\1/gi)].map(m=>m[2]).join(' ');
    const arbitrary=cls.match(/(?:^|\s)font-\[['"]?([^\]]+?)['"]?\]/);
    if(arbitrary) return arbitrary[1].replaceAll('_',' ');
    for(const token of cls.split(/\s+/)) {
      if(!/^font-[\w-]+$/.test(token)) continue;
      const key=token.slice(5);
      const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const m=configText.match(new RegExp(`(?:["']?${escaped}["']?)\\s*:\\s*\\[\\s*["']([^"']+)["']`));
      if(m) return m[1];
    }
    return null;
  };
  const bodyFont=fontName(property([...bodyRules,...classRules(bodyTag),inline(bodyTag)],'font-family')) || tailwindFont(bodyTag);
  const headingFont=fontName(property([...headingRules,...classRules(heading),inline(heading)],'font-family')) || tailwindFont(heading) || bodyFont;
  const utilityColor=(markup,prefix)=>{
    for (const token of attribute(markup.match(/^<[^>]+>/)?.[0]||markup,'class').split(/\s+/)) {
      if(!token.startsWith(prefix+'-') || token.includes('/')) continue;
      const value=token.slice(prefix.length+1);
      const result=hex(value.replace(/^\[|\]$/g,''))||COLORS[value];
      if(result) return result;
    }
    return null;
  };
  const htmlTag=(html.match(/<html\b[^>]*>/i)||[])[0]||'';
  const background=hex(resolve(property([...bodyRules,inline(bodyTag)],'background-color'))) || hex(resolve(property([...bodyRules,inline(bodyTag)],'background'))) || utilityColor(bodyTag,'bg') || utilityColor(htmlTag,'bg');
  const foreground=hex(resolve(property([...bodyRules,inline(bodyTag)],'color'))) || utilityColor(bodyTag,'text');
  const colorCounts=new Map();
  // Count literals in markup and authored CSS, excluding bundled font inventory and JS runtimes.
  for(const value of (html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')+'\n'+css).match(/#[\da-f]{6}\b|#[\da-f]{3}\b/gi)||[]) { const c=hex(value);colorCounts.set(c,(colorCounts.get(c)||0)+1); }
  const palette=[...colorCounts].sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);
  for(const c of [background,foreground].filter(Boolean)) if(!palette.includes(c)) palette.unshift(c);
  const signals=[];
  const signal=(regex,label)=>{if(regex.test(html+'\n'+css)) signals.push(label);};
  signal(/\bgrid-cols-[2-9]\b/,'grid multicoluna');
  signal(/\b(?:lg|md):(?:flex-row|grid-cols-2)\b/,'colunas responsivas');
  signal(/\btext-(?:center|left|right)\b/,'alinhamentos tipográficos');
  signal(/\bobject-cover\b/,'fotografia com recorte');
  signal(/\bbackdrop-blur|backdrop-filter/,'superfícies translúcidas');
  signal(/\btracking-(?:widest|tight|tighter)\b/,'espaçamento tipográfico expressivo');
  signal(/\brounded-(?:2xl|3xl|full)\b/,'contornos arredondados');
  signal(/\buppercase\b/,'títulos e rótulos em caixa alta');
  signal(/@keyframes|animate-on-scroll|animationIn/,'animação declarada');
  signal(/parallax|data-speed|data-scroll-speed/i,'parallax declarado');
  return {
    title:text((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||''),headings,
    body_font:bodyFont,heading_font:headingFont,background,foreground,palette,signals,
    h1_classes:[...heading.matchAll(/class\s*=\s*(["'])([\s\S]*?)\1/gi)].map(m=>m[2]),
    sources:sources.map(s=>({path:s.path,sha256:crypto.createHash('sha256').update(s.content).digest('hex')})),
    method:'static_html_css',render_verified:false,
  };
}

module.exports={within,text,attribute,hex,inspectPage};
