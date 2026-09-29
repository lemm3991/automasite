const sharp = require('sharp');
const fs = require('fs');

const svg = `<svg width="1600" height="1200" viewBox="0 0 1600 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f15"/>
      <stop offset="50%" stop-color="#151b24"/>
      <stop offset="100%" stop-color="#080c10"/>
    </linearGradient>
    <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="40%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="30%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="70%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="orangeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="laserSpark" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fed7aa"/>
      <stop offset="60%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1.5" fill="#475569" opacity="0.35"/>
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.7" opacity="0.4"/>
    </pattern>
    <pattern id="perf" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="11" cy="11" r="3.8" fill="#0f172a" stroke="#64748b" stroke-width="0.8"/>
    </pattern>
  </defs>

  <!-- Fundo escuro industrial -->
  <rect width="1600" height="1200" fill="url(#bgGrad)"/>
  <rect width="1600" height="1200" fill="url(#grid)"/>

  <!-- Brilho difuso da estamparia e laser -->
  <circle cx="1150" cy="480" r="480" fill="url(#orangeGlow)" filter="blur(60px)"/>

  <!-- Conjunto de Formas e Assadeiras Industriais em Perspectiva Técnica -->
  <g transform="translate(150, 160)">
    <!-- Placa Base de Usinagem CNC -->
    <rect x="80" y="140" width="1140" height="740" rx="24" fill="#161e29" stroke="#334155" stroke-width="3" opacity="0.85"/>
    
    <!-- Assadeira Perfurada em Alumínio Naval -->
    <g transform="translate(140, 200)">
      <rect x="0" y="0" width="640" height="460" rx="16" fill="url(#steelGrad)" stroke="#cbd5e1" stroke-width="3"/>
      <rect x="25" y="25" width="590" height="410" rx="8" fill="url(#perf)"/>
      <rect x="25" y="25" width="590" height="410" rx="8" fill="#0284c7" opacity="0.08"/>
      <text x="35" y="500" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#f97316" letter-spacing="2">ASSADEIRA PERFURADA • ALUMÍNIO NAVAL ESTAMPADO 1.5MM</text>
    </g>

    <!-- Conjunto Múltiplo de Formas para Pão de Forma em Aço Inox -->
    <g transform="translate(680, 290)">
      <rect x="0" y="0" width="480" height="380" rx="14" fill="#0f172a" stroke="url(#steelGrad)" stroke-width="4"/>
      <!-- Formas individuais no bloco -->
      <rect x="25" y="30" width="95" height="320" rx="6" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>
      <rect x="135" y="30" width="95" height="320" rx="6" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>
      <rect x="245" y="30" width="95" height="320" rx="6" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>
      <rect x="355" y="30" width="95" height="320" rx="6" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>
      
      <!-- Trava de Reforço Perimetral e Rebites -->
      <line x1="10" y1="190" x2="470" y2="190" stroke="#f97316" stroke-width="6" stroke-dasharray="14, 6"/>
      <circle cx="20" cy="190" r="5" fill="#f8fafc"/>
      <circle cx="130" cy="190" r="5" fill="#f8fafc"/>
      <circle cx="240" cy="190" r="5" fill="#f8fafc"/>
      <circle cx="350" cy="190" r="5" fill="#f8fafc"/>
      <circle cx="460" cy="190" r="5" fill="#f8fafc"/>
      
      <text x="25" y="395" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#f1f5f9">CONJUNTO 4X PÃO DE FORMA C/ TRAVA ESTRUTURAL</text>
    </g>

    <!-- Feixe e Centelha de Corte a Laser CNC de Precisão -->
    <line x1="1240" y1="80" x2="880" y2="400" stroke="#fdba74" stroke-width="3" opacity="0.95"/>
    <line x1="880" y1="400" x2="880" y2="445" stroke="#ffffff" stroke-width="5"/>
    <circle cx="880" cy="400" r="55" fill="url(#laserSpark)"/>

    <!-- Medições e Cotas Técnicas em HUD -->
    <g font-family="monospace" font-size="14" fill="#94a3b8">
      <text x="90" y="110">CORTE A LASER FIBRA ÓPTICA CNC // TOLERÂNCIA: ±0.05mm</text>
      <text x="90" y="915">DELTA PAN EQUIPAMENTOS • CRICIÚMA - SC • AÇO INOX AISI 304 &amp; ALUMÍNIO NAVAL</text>
    </g>
  </g>
</svg>`;

async function run() {
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 95 })
    .toFile('public/assets/clients/delta-pan/fabrica-maquinario.jpg');
  console.log('Imagem técnica industrial salva com sucesso!');
}

run();
