const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SLUG = 'metalurgica-sao-jorge';
const TARGET_URL = `http://127.0.0.1:4321/${SLUG}/`;
const OUT_DIR = path.resolve(`leads/${SLUG}/redesign/screenshots`);
const COMM_DIR = path.resolve(`leads/${SLUG}/commercial/visual`);

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(COMM_DIR)) fs.mkdirSync(COMM_DIR, { recursive: true });

const DESKTOP_OUT = path.join(OUT_DIR, 'home-desktop.png');
const MOBILE_OUT = path.join(OUT_DIR, 'home-mobile.png');
const BEFORE_AFTER_OUT = path.join(COMM_DIR, 'before-after.png');

function sendCdpCommand(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const handleMsg = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handleMsg);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      } catch (e) {}
    };
    ws.addEventListener('message', handleMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureTab(url, outPath, width, height, isMobile) {
  console.log(`[CDP] Preparando captura: ${path.basename(outPath)} (${width}x${height})...`);
  
  // Tenta listar abas existentes
  let tab = null;
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    tab = tabs.find(t => t.type === 'page');
  } catch (e) {}

  if (!tab) {
    const createRes = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    tab = await createRes.json();
  }

  const wsUrl = tab.webSocketDebuggerUrl;
  console.log(`[CDP] Conectando WebSocket ao target: ${tab.id}`);
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  let msgId = 1;
  await sendCdpCommand(ws, msgId++, 'Page.enable');
  await sendCdpCommand(ws, msgId++, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: isMobile
  });

  console.log(`[CDP] Navegando para ${url}...`);
  await sendCdpCommand(ws, msgId++, 'Page.navigate', { url });

  // Aguarda carregamento completo e renderização
  await sleep(3500);

  console.log(`[CDP] Capturando frame...`);
  const snap = await sendCdpCommand(ws, msgId++, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  fs.writeFileSync(outPath, Buffer.from(snap.data, 'base64'));
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`[CDP OK] Salvo: ${outPath} (${sizeKb} KB)`);

  ws.close();
}

async function generateBeforeAfter() {
  const origPath = path.resolve(`leads/${SLUG}/screenshots/site-desktop.png`);
  const redPath = DESKTOP_OUT;

  if (!fs.existsSync(origPath) || !fs.existsSync(redPath)) {
    throw new Error('Imagens base para before-after não encontradas');
  }

  const targetHeight = 650;
  const targetWidth = 600;

  const origBuf = await sharp(origPath)
    .resize(targetWidth, targetHeight, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer();

  const redBuf = await sharp(redPath)
    .resize(targetWidth, targetHeight, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer();

  const totalWidth = targetWidth * 2 + 60;
  const totalHeight = targetHeight + 140;

  const svgHeader = Buffer.from(`
    <svg width="${totalWidth}" height="${totalHeight}">
      <rect width="100%" height="100%" fill="#090D16"/>
      <rect x="20" y="20" width="${targetWidth}" height="40" rx="8" fill="#B91C1C"/>
      <text x="${20 + targetWidth / 2}" y="46" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        SITE ATUAL (Sem especificações de máquina | Baixa conversão mobile)
      </text>

      <rect x="${30 + targetWidth + 10}" y="20" width="${targetWidth}" height="40" rx="8" fill="#047857"/>
      <text x="${30 + targetWidth + 10 + targetWidth / 2}" y="46" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
        NOVO REDESIGN (Autêntico | 50+ Anos de Fábrica | Alta Conversão B2B)
      </text>

      <text x="${totalWidth / 2}" y="${totalHeight - 25}" font-family="Arial, sans-serif" font-size="15" fill="#9CA3AF" text-anchor="middle">
        Comparativo Visual Exclusivo — Metalúrgica São Jorge | Porto Alegre - RS
      </text>
    </svg>
  `);

  await sharp(svgHeader)
    .composite([
      { input: origBuf, top: 80, left: 20 },
      { input: redBuf, top: 80, left: 30 + targetWidth + 10 }
    ])
    .png({ quality: 95 })
    .toFile(BEFORE_AFTER_OUT);

  const cardKb = (fs.statSync(BEFORE_AFTER_OUT).size / 1024).toFixed(1);
  console.log(`[BEFORE-AFTER OK] Salvo: ${BEFORE_AFTER_OUT} (${cardKb} KB)`);
}

async function main() {
  console.log(`Iniciando fluxo de evidência visual para ${SLUG}...`);
  await captureTab(TARGET_URL, DESKTOP_OUT, 1440, 900, false);
  await captureTab(TARGET_URL, MOBILE_OUT, 390, 844, true);
  await generateBeforeAfter();
  console.log('Evidências visuais concluídas com sucesso!');
}

main().catch((err) => {
  console.error('Erro na captura:', err);
  process.exit(1);
});
