const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const pages = [
    'https://deltapan.com.br/sobre',
    'https://deltapan.com.br/produtos',
    'https://deltapan.com.br/contato'
  ];

  for (const p of pages) {
    console.log(`\n=== PAGINA: ${p} ===`);
    try {
      const html = await get(p);
      console.log('HTML Length:', html.length);
      const imgs = [];
      const imgRegex = /(?:src|href)=["']([^"']+\.(?:png|jpg|jpeg|svg|webp))["']/gi;
      let m;
      while ((m = imgRegex.exec(html)) !== null) {
        imgs.push(m[1]);
      }
      console.log('Imgs:', [...new Set(imgs)]);
      const textClean = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                            .replace(/<style[\s\S]*?<\/style>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ');
      console.log('Text snippet:', textClean.slice(0, 500));
    } catch (e) {
      console.error('Erro:', e.message);
    }
  }
}

run().catch(console.error);
