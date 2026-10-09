/**
 * PROSPECTOR ENGINE — FERRAMENTA REUTILIZÁVEL DO AGENTE 1
 * Totalmente dinâmica, client-agnostic, orientada a evidências e em conformidade
 * com as 10 diretrizes operacionais do Prospector & Downloader.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { spawnSync } = require('child_process');
const sharp = require('sharp');
const {classifyCandidate} = require('./lib/asset-evidence.cjs');
const {prepare} = require('./lib/prospector-evidence.cjs');

// Agente SSL permissivo para sites legados com cadeias intermediárias incompletas
const sslAgent = new https.Agent({ rejectUnauthorized: false });

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const params = {
    url: '',
    slug: '',
    name: '',
    niche: '',
    city: '',
    state: '',
    maxAssets: 60
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from-snapshot') params.fromSnapshot = true;
    if (args[i] === '--url' && args[i + 1]) params.url = args[i + 1];
    if (args[i] === '--slug' && args[i + 1]) params.slug = args[i + 1];
    if (args[i] === '--name' && args[i + 1]) params.name = args[i + 1];
    if (args[i] === '--niche' && args[i + 1]) params.niche = args[i + 1];
    if (args[i] === '--city' && args[i + 1]) params.city = args[i + 1];
    if (args[i] === '--state' && args[i + 1]) params.state = args[i + 1];
    if (args[i] === '--max-assets' && args[i + 1]) params.maxAssets = parseInt(args[i + 1], 10);
  }

  if (!params.url || !params.slug) {
    console.error('Uso obrigatório: node prospector-engine.cjs --url <URL> --slug <SLUG> [--name <NOME>] [--niche <NICHE>] [--city <CIDADE>] [--state <UF>]');
    process.exit(1);
  }

  if (!/^https?:\/\//i.test(params.url)) {
    params.url = 'https://' + params.url;
  }

  if (!/^[a-z0-9-]+$/.test(params.slug)) throw new Error('Slug inválido');
  return params;
}

function fetchHttpText(urlStr, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(urlStr);
      const client = u.protocol === 'https:' ? https : http;
      client.get(urlStr, {
        agent: u.protocol === 'https:' ? sslAgent : undefined,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: timeoutMs
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redir = new URL(res.headers.location, urlStr).toString();
          return resolve(fetchHttpText(redir, timeoutMs));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} para ${urlStr}`));
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ text: data, statusCode: res.statusCode }));
      }).on('error', reject);
    } catch (e) {
      reject(e);
    }
  });
}

function downloadBinaryFile(urlStr, destPath, timeoutMs = 25000) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const client = u.protocol === 'https:' ? https : http;
      client.get(urlStr, {
        agent: u.protocol === 'https:' ? sslAgent : undefined,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: timeoutMs
      }, res => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redir = new URL(res.headers.location, urlStr).toString();
          return resolve(downloadBinaryFile(redir, destPath, timeoutMs));
        }
        if (res.statusCode === 200) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          const file = fs.createWriteStream(destPath);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            const exists = fs.existsSync(destPath);
            const size = exists ? fs.statSync(destPath).size : 0;
            resolve({ success: exists && size > 50, size });
          });
          file.on('error', () => resolve({ success: false, size: 0 }));
        } else {
          resolve({ success: false, size: 0, httpError: res.statusCode });
        }
      }).on('error', () => resolve({ success: false, size: 0 }));
    } catch {
      resolve({ success: false, size: 0 });
    }
  });
}

async function ensureChromeCDP() {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    if (res.ok) {
      const data = await res.json();
      if (data.webSocketDebuggerUrl) return;
    }
  } catch {}

  console.log('[CDP] Iniciando Chrome conforme REGRA: PREPARAÇÃO DO BROWSER...');
  const psCmd = `
    $chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    $profile = "$env:LOCALAPPDATA\\Antigravity-CDP-Profile"
    Start-Process $chrome -WindowStyle Hidden -ArgumentList "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=9222", "--user-data-dir=$profile", "--no-first-run", "--no-default-browser-check", "about:blank"
  `;
  spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-Command', psCmd], { stdio: 'inherit' });
  await sleep(3500);

  const testRes = await fetch('http://127.0.0.1:9222/json/version');
  const testData = await testRes.json();
  if (!testData.webSocketDebuggerUrl) {
    throw new Error('Chrome CDP não respondeu após inicialização.');
  }
}

async function openCdpTab() {
  await ensureChromeCDP();
  const res = await fetch('http://127.0.0.1:9222/json/new?url=about:blank', { method: 'PUT' });
  const tab = await res.json();
  const ws = new globalThis.WebSocket(tab.webSocketDebuggerUrl);

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
          }
        } catch (e) {
          reject(e);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(r => ws.addEventListener('open', r));

  const close = async () => {
    try { ws.close(); } catch {}
    try { await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`); } catch {}
  };

  return { tab, ws, send, close };
}

async function main() {
  const params = parseCliArgs();
  const rootDir = process.cwd();
  const slug = params.slug;
  if (params.fromSnapshot) { const result=await prepare(rootDir,params); console.log(JSON.stringify({status:result.status,errors:result.errors},null,2)); return; }

  const leadDir = path.join(rootDir, 'leads', slug);
  const refDir = path.join(leadDir, 'referencias');
  const siteBaixadoRoot = path.join(refDir, 'site-baixado');
  const screenshotsDir = path.join(leadDir, 'screenshots');
  const publicAssetsDir = path.join(rootDir, 'public', 'assets', 'clients', slug);

  [leadDir, refDir, siteBaixadoRoot, screenshotsDir, publicAssetsDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  console.log('='.repeat(80));
  console.log(`[PROSPECTOR ENGINE] Executando coleta dinâmica orientada a evidências`);
  console.log(`URL Alvo: ${params.url}`);
  console.log(`Slug: ${slug}`);
  console.log('='.repeat(80));

  // ---------------------------------------------------------------------------
  // FASE 1: DESCOBERTA DINÂMICA DE PÁGINAS, SITEMAP E NAVEGAÇÃO
  // ---------------------------------------------------------------------------
  console.log('\n[FASE 1] Descobrindo estrutura de páginas e sitemaps...');

  const sitemapsToCheck = ['/sitemap.xml', '/wp-sitemap.xml', '/page-sitemap.xml', '/sitemap_index.xml', '/robots.txt'];
  const sitemapUrlsFound = new Set();
  const targetDomain = new URL(params.url).hostname;

  for (const sm of sitemapsToCheck) {
    try {
      const fullSmUrl = new URL(sm, params.url).toString();
      const res = await fetchHttpText(fullSmUrl, 10000);
      if (res.text) {
        const matches = res.text.match(/<loc>(.*?)<\/loc>/gi) || [];
        matches.forEach(m => {
          const u = m.replace(/<\/?loc>/gi, '').trim();
          if (u.startsWith('http') && u.includes(targetDomain)) {
            sitemapUrlsFound.add(u);
          }
        });
      }
    } catch {}
  }

  console.log('[FASE 1.2] Carregando Home no Chrome CDP para análise estrutural...');
  const cdp = await openCdpTab();

  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await cdp.send('Page.navigate', { url: params.url });
  await sleep(5000);

  // Extrair metadados e links brutos
  const pageDomInfo = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        rawHref: a.getAttribute('href') || '',
        text: (a.innerText || '').trim(),
        title: a.getAttribute('title') || ''
      }));

      const title = document.title || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';

      return { links, title, metaDesc, ogSiteName, ogTitle };
    })()`,
    returnByValue: true
  });

  const domData = pageDomInfo.result.value || {};
  const companyName = params.name || domData.ogSiteName || domData.title.split(/[-–|]/)[0].trim() || slug;

  // Classificar links em rotas reais vs âncoras da home
  const realRoutesMap = new Map();
  const anchorsMap = new Map();

  realRoutesMap.set(params.url, {
    url: params.url,
    type: 'ROTA_REAL_PRINCIPAL',
    category: 'home',
    localRelPath: 'index.html'
  });

  domData.links.forEach(l => {
    const raw = l.rawHref;
    if (raw.startsWith('#') || (raw.includes('#') && raw.split('#')[0] === '')) {
      const anchorClean = raw.startsWith('#') ? raw : '#' + raw.split('#')[1];
      if (anchorClean.length > 1 && !anchorsMap.has(anchorClean)) {
        anchorsMap.set(anchorClean, {
          anchor: anchorClean,
          label: l.text || l.title || anchorClean,
          targetUrl: `${params.url}${anchorClean}`
        });
      }
    } else {
      try {
        const uObj = new URL(l.href);
        if (uObj.hostname === targetDomain) {
          const pathname = uObj.pathname.replace(/\/+$/, '') || '/';
          const fullRoute = `${uObj.protocol}//${uObj.host}${pathname}`;
          if (!realRoutesMap.has(fullRoute) && !pathname.match(/\.(pdf|zip|jpg|png|webp|svg)$/i)) {
            let cat = 'outros';
            if (/sobre|empresa|quem-somos/i.test(pathname)) cat = 'sobre';
            else if (/servico/i.test(pathname)) cat = 'servicos';
            else if (/produto|portfolio|projeto/i.test(pathname)) cat = 'portfolio';
            else if (/contato|fale/i.test(pathname)) cat = 'contato';
            else if (/privacidade|termos/i.test(pathname)) cat = 'legal';

            const localRel = pathname === '/' ? 'index.html' : path.join(pathname.replace(/^\//, ''), 'index.html');
            realRoutesMap.set(fullRoute, {
              url: fullRoute,
              type: pathname === '/' ? 'ROTA_REAL_PRINCIPAL' : 'ROTA_REAL_SECUNDARIA',
              category: cat,
              label: l.text || pathname,
              localRelPath: localRel
            });
          }
        }
      } catch {}
    }
  });

  sitemapUrlsFound.forEach(smUrl => {
    try {
      const uObj = new URL(smUrl);
      const pathname = uObj.pathname.replace(/\/+$/, '') || '/';
      const fullRoute = `${uObj.protocol}//${uObj.host}${pathname}`;
      if (!realRoutesMap.has(fullRoute) && !pathname.match(/\.(xml|html|pdf|png|jpg)$/i)) {
        realRoutesMap.set(fullRoute, {
          url: fullRoute,
          type: 'ROTA_REAL_SITEMAP',
          category: /privacidade/i.test(pathname) ? 'legal' : 'outros',
          localRelPath: pathname === '/' ? 'index.html' : path.join(pathname.replace(/^\//, ''), 'index.html')
        });
      }
    } catch {}
  });

  console.log(`[FASE 1.4] Baixando ${realRoutesMap.size} páginas reais encontradas...`);
  const downloadedPagesList = [];

  for (const [rUrl, info] of realRoutesMap.entries()) {
    const destLocal = path.join(siteBaixadoRoot, info.localRelPath);
    try {
      const res = await fetchHttpText(rUrl);
      fs.mkdirSync(path.dirname(destLocal), { recursive: true });
      fs.writeFileSync(destLocal, res.text, 'utf8');
      downloadedPagesList.push({
        url: rUrl,
        type: info.type,
        category: info.category,
        localPath: path.relative(leadDir, destLocal).replace(/\\/g, '/'),
        status: 'DOWNLOADED',
        bytes: Buffer.byteLength(res.text)
      });
      console.log(`  ✓ Página baixada: ${rUrl} (${Math.round(Buffer.byteLength(res.text) / 1024)} KB)`);
    } catch (err) {
      downloadedPagesList.push({
        url: rUrl,
        type: info.type,
        category: info.category,
        localPath: path.relative(leadDir, destLocal).replace(/\\/g, '/'),
        status: 'FAILED',
        failureReason: err.message
      });
      console.warn(`  ✗ Falha ao baixar ${rUrl}: ${err.message}`);
    }
  }

  const pagesManifest = {
    slug,
    client: companyName,
    domain: targetDomain,
    auditTimestamp: new Date().toISOString(),
    sitemapsInspected: sitemapsToCheck,
    realPages: downloadedPagesList,
    homeAnchors: Array.from(anchorsMap.values())
  };
  fs.writeFileSync(path.join(refDir, 'pages-manifest.json'), JSON.stringify(pagesManifest, null, 2), 'utf8');

  // ---------------------------------------------------------------------------
  // FASE 2: ANÁLISE SEMÂNTICA PROFUNDA E SEGMENTAÇÃO REAL SEÇÃO POR SEÇÃO
  // ---------------------------------------------------------------------------
  console.log('\n[FASE 2] Analisando estrutura semântica, contatos e seções reais no DOM...');

  const deepDomAnalysis = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const bodyText = document.body.innerText || '';
      const allLinks = Array.from(document.querySelectorAll('a[href]'));

      // 1. Redes Sociais
      let instagram = null;
      let facebook = null;
      let linkedin = null;
      let youtube = null;

      allLinks.forEach(a => {
        const h = a.href.toLowerCase();
        if (h.includes('instagram.com/')) {
          const m = a.href.match(/instagram\\.com\\/([^/?#]+)/i);
          if (m && !['p', 'explore', 'stories'].includes(m[1].toLowerCase())) instagram = '@' + m[1];
        }
        if (h.includes('facebook.com/')) {
          const m = a.href.match(/facebook\\.com\\/([^/?#]+)/i);
          if (m && !['sharer', 'share'].includes(m[1].toLowerCase())) facebook = m[1];
        }
        if (h.includes('linkedin.com/')) linkedin = a.href;
        if (h.includes('youtube.com/')) youtube = a.href;
      });

      // 2. Telefones e WhatsApp
      const foundPhones = new Set();
      allLinks.forEach(a => {
        const h = a.href;
        if (h.startsWith('tel:')) {
          const num = h.replace('tel:', '').trim();
          if (num) foundPhones.add(num);
        }
        const waMatch = h.match(/(?:phone=|send\\?phone=)(\\d+)/i) || h.match(/wa\\.me\\/(\\d+)/i);
        if (waMatch) {
          let raw = waMatch[1].replace(/\\D/g, '');
          if (raw.startsWith('55') && raw.length >= 12) raw = raw.slice(2);
          if (raw.length === 10 || raw.length === 11) {
            const ddd = raw.slice(0, 2);
            const rest = raw.slice(2);
            const formatted = rest.length === 9 
              ? '(' + ddd + ') ' + rest.slice(0, 5) + '-' + rest.slice(5)
              : '(' + ddd + ') ' + rest.slice(0, 4) + '-' + rest.slice(4);
            foundPhones.add(formatted);
          } else {
            foundPhones.add(waMatch[1]);
          }
        }
      });

      const textPhoneMatches = bodyText.match(/(?:\\(?\\d{2}\\)?\\s*)?9?\\d{4}[-\\s]\\d{4}/g) || [];
      textPhoneMatches.forEach(p => {
        const clean = p.trim();
        if (clean.length >= 8 && !/^\\d{4}-\\d{2}$/.test(clean)) {
          foundPhones.add(clean);
        }
      });

      // 3. E-mails
      const foundEmails = new Set();
      allLinks.forEach(a => {
        if (a.href.startsWith('mailto:')) {
          const em = a.href.replace('mailto:', '').split('?')[0].trim();
          if (em) foundEmails.add(em);
        }
      });
      const textEmailMatches = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g) || [];
      textEmailMatches.forEach(em => foundEmails.add(em.toLowerCase()));

      // 4. CNPJ, CEP e Endereço
      const cnpjs = Array.from(new Set(bodyText.match(/\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}/g) || []));
      const ceps = Array.from(new Set(bodyText.match(/\\d{5}-\\d{3}/g) || []));

      let foundAddress = null;
      const addressEl = document.querySelector('address, [class*="endereco"], [class*="address"]');
      if (addressEl && addressEl.innerText.trim().length > 10) {
        foundAddress = addressEl.innerText.trim().replace(/\\s+/g, ' ');
      } else {
        const lines = bodyText.split('\\n').map(l => l.trim()).filter(l => l.length > 15 && l.length < 150);
        const addrLine = lines.find(l => /^(?:Rua|Av\\.?|Avenida|Rodovia|Travessa|Alameda|Estrada)/i.test(l) || /\\d{5}-\\d{3}/.test(l));
        if (addrLine) foundAddress = addrLine;
      }

      // 5. Termos técnicos literais
      const technicalTerms = [];
      bodyText.split('\\n').forEach(l => {
        const lt = l.trim();
        if (lt.length > 15 && lt.length < 250) {
          if (/atendimento|horário|serviço|produto|tratamento|projeto|capacidade|restriç/i.test(lt)) {
            technicalTerms.push(lt);
          }
        }
      });

      // 6. Segmentação de Seções Reais da Home
      const headerEl = document.querySelector('header, #header, .site-header, #header-grid');
      const footerEl = document.querySelector('footer, #footer, .site-footer');

      const anchorElements = Array.from(document.querySelectorAll('[id]')).filter(el => {
        const id = el.id.toLowerCase();
        return ['empresa', 'sobre', 'servicos', 'serviços', 'portfolio', 'portfólio', 'materiais', 'produtos', 'localizacao', 'localização', 'contato', 'hero', 'top'].some(k => id.includes(k));
      });

      const headingElements = Array.from(document.querySelectorAll('main h1, main h2, #content h1, #content h2, body > div h1, body > div h2'));

      const markers = [];
      if (headerEl) {
        markers.push({ el: headerEl, type: 'header', title: 'Cabeçalho e Navegação', id: 'header', top: 0 });
      }

      anchorElements.forEach(el => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        markers.push({ el, type: 'anchor', id: el.id, title: el.id.toUpperCase(), top });
      });

      headingElements.forEach(h => {
        const top = h.getBoundingClientRect().top + window.scrollY;
        const text = (h.innerText || '').trim();
        if (text.length > 2 && text.length < 80) {
          markers.push({ el: h, type: 'heading', id: text.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30), title: text, top });
        }
      });

      if (footerEl) {
        const top = footerEl.getBoundingClientRect().top + window.scrollY;
        markers.push({ el: footerEl, type: 'footer', id: 'footer', title: 'Rodapé e Informações Legais', top });
      }

      markers.sort((a, b) => a.top - b.top);

      const consolidatedSections = [];
      markers.forEach(m => {
        const prev = consolidatedSections[consolidatedSections.length - 1];
        if (prev && Math.abs(m.top - prev.top) < 130) {
          if (m.type === 'heading' && prev.type === 'anchor') {
            prev.title = m.title;
          } else if (m.type === 'anchor' && prev.type === 'heading') {
            prev.id = m.id;
          }
        } else {
          consolidatedSections.push({
            id: m.id,
            title: m.title,
            type: m.type,
            top: m.top,
            el: m.el
          });
        }
      });

      const extractedSections = consolidatedSections.map((sec, idx) => {
        const nextSec = consolidatedSections[idx + 1];
        const bottomLimit = nextSec ? nextSec.top : document.body.scrollHeight;

        const secHeadings = [];
        const secParagraphs = [];
        const secButtons = [];
        const secImages = [];
        let secBgColor = 'transparent';
        let secBgImage = null;

        try {
          const style = window.getComputedStyle(sec.el);
          secBgColor = style.backgroundColor;
          if (style.backgroundImage && style.backgroundImage !== 'none') {
            secBgImage = style.backgroundImage;
          }
        } catch {}

        const allDescendants = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, a, button, img'));
        allDescendants.forEach(node => {
          const r = node.getBoundingClientRect();
          const top = r.top + window.scrollY;
          if (top >= sec.top - 20 && top < bottomLimit - 20) {
            const tag = node.tagName.toLowerCase();
            const text = (node.innerText || '').trim();

            if (['h1', 'h2', 'h3', 'h4'].includes(tag) && text) {
              secHeadings.push({ tag, text });
            } else if (tag === 'p' && text && text.length > 5) {
              secParagraphs.push(text);
            } else if ((tag === 'a' || tag === 'button') && text && text.length > 2) {
              secButtons.push({ text, href: node.getAttribute('href') || '' });
            } else if (tag === 'img') {
              const src = node.currentSrc || node.src || node.getAttribute('data-src');
              if (src) secImages.push({ src, alt: node.alt || '', width: node.clientWidth, height: node.clientHeight });
            }
          }
        });

        return {
          id: sec.id,
          title: sec.title,
          top: sec.top,
          bgColor: secBgColor,
          bgImage: secBgImage,
          headings: secHeadings.filter((h, i, arr) => arr.findIndex(x => x.text === h.text) === i),
          paragraphs: Array.from(new Set(secParagraphs)),
          buttons: secButtons.filter((b, i, arr) => arr.findIndex(x => x.text === b.text && x.href === b.href) === i),
          images: secImages.filter((img, i, arr) => arr.findIndex(x => x.src === img.src) === i)
        };
      }).filter(s => s.headings.length > 0 || s.paragraphs.length > 0 || s.images.length > 0 || s.buttons.length > 0);

      // 7. Inspeção do Formulário: Visibilidade real no layout
      const formEl = document.querySelector('form');
      let formStatus = { exists: false, isVisible: false, reason: 'NO_FORM' };
      if (formEl) {
        const cs = window.getComputedStyle(formEl);
        const pcs = formEl.parentElement ? window.getComputedStyle(formEl.parentElement) : null;
        const rect = formEl.getBoundingClientRect();
        const isHidden = cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0' ||
                         (pcs && (pcs.display === 'none' || pcs.opacity === '0')) ||
                         rect.width < 10 || rect.height < 10;
        
        formStatus = {
          exists: true,
          id: formEl.id || 'form-1',
          isVisible: !isHidden,
          reason: isHidden ? 'FORM_HIDDEN_VIA_CSS' : 'FORM_VISIBLE',
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        };
      }

      return {
        contacts: {
          phones: Array.from(foundPhones),
          emails: Array.from(foundEmails),
          address: foundAddress,
          cnpjs,
          ceps,
          socials: { instagram, facebook, linkedin, youtube }
        },
        technicalTerms: Array.from(new Set(technicalTerms)),
        sections: extractedSections,
        formStatus
      };
    })()`,
    returnByValue: true
  });

  const domAnalysis = deepDomAnalysis.result.value || {};
  const contactsData = domAnalysis.contacts || {};
  const sectionsData = domAnalysis.sections || [];
  const formStatus = domAnalysis.formStatus || {};

  console.log(`  ✓ Seções reais mapeadas individualmente na Home: ${sectionsData.length}`);
  console.log(`  ✓ Telefones identificados: ${contactsData.phones.join(', ') || 'Nenhum'}`);

  // ---------------------------------------------------------------------------
  // FASE 3: INVENTÁRIO DINÂMICO E VERIFICAÇÃO DE MÍDIAS VIA SHARP
  // ---------------------------------------------------------------------------
  console.log('\n[FASE 3] Extraindo e inspecionando mídias (DOM, Backgrounds CSS, Sharp)...');

  const mediaExtraction = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const discovered = [];
      const seen = new Set();

      // Imagens <img>
      document.querySelectorAll('img').forEach(img => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (src && !seen.has(src)) {
          seen.add(src);
          discovered.push({
            type: 'image',
            src: src,
            alt: img.getAttribute('alt') || '',
            title: img.getAttribute('title') || '',
            isInHeader: !!img.closest('header, nav, .header, .nav, #header-grid'),
            isInFooter: !!img.closest('footer, .footer, #site-footer'),
            domWidth: img.clientWidth,
            domHeight: img.clientHeight,
            classes: img.className || ''
          });
        }
      });

      // Elementos com CSS background-image
      document.querySelectorAll('*').forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\\(["']?([^"']+)["']?\\)/);
          if (match && match[1] && !seen.has(match[1])) {
            seen.add(match[1]);
            const isHero = !!el.closest('.fundocabecalho, .hero, #hero, .wp-block-cover');
            discovered.push({
              type: 'background',
              src: match[1],
              alt: isHero ? 'Hero Background CSS' : 'Background CSS',
              domWidth: el.clientWidth,
              domHeight: el.clientHeight,
              isInHeader: !!el.closest('header, nav') || isHero,
              isInFooter: !!el.closest('footer')
            });
          }
        }
      });

      // Vídeos
      document.querySelectorAll('video, video source').forEach(v => {
        const src = v.src || v.getAttribute('src');
        if (src && !seen.has(src)) {
          seen.add(src);
          discovered.push({
            type: 'video',
            src: src,
            alt: 'Video Institucional'
          });
        }
      });

      return discovered;
    })()`,
    returnByValue: true
  });

  const discoveredRawMedia = mediaExtraction.result.value || [];
  console.log(`[FASE 3.1] Total de mídias descobertas na página: ${discoveredRawMedia.length}`);

  const processedAssets = [];
  const notDownloadedMedia = [];

  let assetIndex = 1;
  for (const item of discoveredRawMedia) {
    if (processedAssets.length >= params.maxAssets) break;

    const mediaUrl = item.src;
    if (mediaUrl.startsWith('data:') && mediaUrl.length < 500) {
      notDownloadedMedia.push({ url: mediaUrl.slice(0, 40) + '...', reason: 'DATA_URI_INLINE_PEQUENO' });
      continue;
    }

    try {
      const uObj = new URL(mediaUrl, params.url);
      const parsedPath = path.basename(uObj.pathname) || `asset-${assetIndex}.bin`;
      const sanitizedName = parsedPath.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${String(assetIndex).padStart(2, '0')}-${sanitizedName}`;

      const destPublic = path.join(publicAssetsDir, filename);
      const destMirror = path.join(siteBaixadoRoot, 'assets', filename);

      const dlResult = await downloadBinaryFile(uObj.toString(), destPublic);

      if (dlResult.success) {
        fs.mkdirSync(path.dirname(destMirror), { recursive: true });
        fs.copyFileSync(destPublic, destMirror);

        let realMeta = { width: null, height: null, format: null, size: dlResult.size };
        try {
          const meta = await sharp(destPublic).metadata();
          realMeta.width = meta.width;
          realMeta.height = meta.height;
          realMeta.format = meta.format;
        } catch {
          realMeta.format = path.extname(filename).replace('.', '') || 'bin';
        }

        const classification = classifyCandidate({filename,originalUrl:uObj.toString(),altOriginal:item.alt});
        const category = classification.category;

        processedAssets.push({
          id: `asset-${assetIndex}`,
          category,
          classification,
          filename,
          originalUrl: uObj.toString(),
          localPublicPath: `/assets/clients/${slug}/${filename}`,
          localRefPath: `referencias/site-baixado/assets/${filename}`,
          dimensions: {
            width: realMeta.width,
            height: realMeta.height
          },
          format: realMeta.format,
          fileSizeBytes: realMeta.size,
          altOriginal: item.alt || '',
          downloadStatus: 'SUCCESS'
        });

        console.log(`  ✓ [${category.toUpperCase()}] ${filename} (${realMeta.width}x${realMeta.height} | ${Math.round(realMeta.size / 1024)} KB)`);
        assetIndex++;
      } else {
        notDownloadedMedia.push({ url: uObj.toString(), reason: `DOWNLOAD_FAILED_HTTP_${dlResult.httpError || 'ERROR'}` });
      }
    } catch (err) {
      notDownloadedMedia.push({ url: mediaUrl, reason: err.message });
    }
  }

  const assetsManifest = {
    slug,
    client: companyName,
    inventoryTimestamp: new Date().toISOString(),
    totalDiscovered: discoveredRawMedia.length,
    totalDownloaded: processedAssets.length,
    assets: processedAssets,
    notDownloaded: notDownloadedMedia
  };
  fs.writeFileSync(path.join(refDir, 'assets-manifest.json'), JSON.stringify(assetsManifest, null, 2), 'utf8');

  // ---------------------------------------------------------------------------
  // FASE 4: CAPTURAS DE TELA REAIS VIA CHROME CDP (FULLPAGE + COMPONENTES)
  // ---------------------------------------------------------------------------
  console.log('\n[FASE 4] Realizando capturas visuais completas e comprovatórias via CDP...');

  async function revealPage() {
    await cdp.send('Runtime.evaluate', {expression: `(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');const end=Math.min(document.documentElement.scrollHeight,24000);for(let y=0;y<end;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,550));}await Promise.race([Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode().catch(()=>{}))]),new Promise(r=>setTimeout(r,3000))]);await new Promise(r=>setTimeout(r,1500));scrollTo(0,0);await new Promise(r=>setTimeout(r,1000));})()`,awaitPromise:true,returnByValue:true});
  }
  await revealPage();

  // 4.1 Desktop Full Page
  const deskFullSnap = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true
  });
  const deskFullFile = path.join(screenshotsDir, 'site-desktop-full.png');
  fs.writeFileSync(deskFullFile, Buffer.from(deskFullSnap.data, 'base64'));
  console.log(`  ✓ Screenshot Desktop Full-Page salvo (${Math.round(fs.statSync(deskFullFile).size / 1024)} KB)`);

  // 4.2 Desktop Fold Padrão
  const deskFoldSnap = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const deskFoldFile = path.join(screenshotsDir, 'site-desktop.png');
  fs.writeFileSync(deskFoldFile, Buffer.from(deskFoldSnap.data, 'base64'));

  // 4.3 Mobile Viewport (iPhone 14)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await cdp.send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });
  await cdp.send('Page.navigate', { url: params.url });
  await sleep(4000);

  // Checar overflow mobile dinâmico
  const mobileMetrics = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      return {
        hasHorizontalOverflow: scrollW > clientW + 5,
        scrollWidth: scrollW,
        clientWidth: clientW
      };
    })()`,
    returnByValue: true
  });
  const mobEval = mobileMetrics.result.value || {};

  await revealPage();
  const mobFullSnap = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true
  });
  const mobFullFile = path.join(screenshotsDir, 'site-mobile-full.png');
  fs.writeFileSync(mobFullFile, Buffer.from(mobFullSnap.data, 'base64'));
  console.log(`  ✓ Screenshot Mobile Full-Page salvo (${Math.round(fs.statSync(mobFullFile).size / 1024)} KB)`);

  const mobFoldSnap = await cdp.send('Page.captureScreenshot', { format: 'png' });
  const mobFoldFile = path.join(screenshotsDir, 'site-mobile.png');
  fs.writeFileSync(mobFoldFile, Buffer.from(mobFoldSnap.data, 'base64'));

  // 4.4 Evidência de componente: apenas se estiver VISÍVEL e comprovável
  let formEvidencePath = null;
  if (formStatus.isVisible && formStatus.rect.width > 50 && formStatus.rect.height > 50) {
    console.log('[FASE 4.4] Capturando formulário visível no DOM...');
    // Realiza captura apenas se o formulário for visível
    const formClip = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: Math.max(0, Math.round(formStatus.rect.left)),
        y: Math.max(0, Math.round(formStatus.rect.top)),
        width: Math.min(390, Math.round(formStatus.rect.width)),
        height: Math.min(600, Math.round(formStatus.rect.height)),
        scale: 1
      }
    });
    formEvidencePath = path.join(screenshotsDir, 'evidencia-formulario.png');
    fs.writeFileSync(formEvidencePath, Buffer.from(formClip.data, 'base64'));
  } else {
    console.log(`[FASE 4.4] Formulário no site possui status: ${formStatus.reason}. Evidência mantida via auditoria de código DOM sem falsas capturas.`);
  }

  await cdp.close();

  fs.writeFileSync(path.join(refDir,'capture-observations.json'),JSON.stringify({mobile:mobEval,form:formStatus,capturedAt:new Date().toISOString()},null,2));
  const handoff=await prepare(rootDir,{...params,name:companyName});
  console.log(JSON.stringify({status:handoff.status,errors:handoff.errors},null,2));
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL NO PROSPECTOR ENGINE:', err);
  process.exit(1);
});
