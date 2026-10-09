/**
 * PIPELINE AUTÔNOMO UNIFICADO DE PONTA A PONTA
 * Agente 1 (Prospector) -> Auditor Visual (Top 5) -> Agente 2 (Builder) -> Agente 3 (Comercial) -> Validador Handoff
 * 
 * Uso:
 *   node scripts/run-autonomous-pipeline.cjs --nicho "Advocacia" --estado "AC"
 *   node scripts/run-autonomous-pipeline.cjs --leads "caminho/para/leads.json"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const leadsDir = path.join(rootDir, 'leads');
const clientDataDir = path.join(rootDir, 'src/clients/data');

// Parse CLI Args
const args = process.argv.slice(2);
let customLeadsFile = null;
let targetNicho = 'Advocacia';
let targetEstado = 'AC';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--leads' && args[i + 1]) customLeadsFile = args[i + 1];
  if (args[i] === '--nicho' && args[i + 1]) targetNicho = args[i + 1];
  if (args[i] === '--estado' && args[i + 1]) targetEstado = args[i + 1];
}

console.log('='.repeat(80));
console.log('       PIPELINE AUTÔNOMO UNIFICADO DE PRODUÇÃO & REDESIGN (TOP 5 LEADS)      ');
console.log('='.repeat(80));
console.log(`Nicho: ${targetNicho} | Estado: ${targetEstado}`);
if (customLeadsFile) console.log(`Arquivo de leads customizado: ${customLeadsFile}`);
console.log('');

// 1. Obter lista de 15 candidatos
let candidates = [];
if (customLeadsFile && fs.existsSync(customLeadsFile)) {
  candidates = JSON.parse(fs.readFileSync(customLeadsFile, 'utf8'));
} else {
  // Procura se já existem leads do nicho/estado ou usa o catálogo do estado
  const stateLeadsDir = leadsDir;
  const leadFolders = fs.readdirSync(stateLeadsDir).filter(f => {
    const jsonP = path.join(stateLeadsDir, f, 'lead.json');
    return fs.existsSync(jsonP);
  });

  const matching = [];
  for (const f of leadFolders) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(stateLeadsDir, f, 'lead.json'), 'utf8'));
      const matchesState = !targetEstado || 
        data.state?.toLowerCase() === targetEstado.toLowerCase() || 
        data.city?.toLowerCase().includes(targetEstado.toLowerCase());

      const nicheLower = targetNicho.toLowerCase();
      const matchesNiche = !targetNicho ||
        data.category?.toLowerCase().includes(nicheLower) ||
        data.segment?.toLowerCase().includes(nicheLower) ||
        data.niche?.toLowerCase().includes(nicheLower) ||
        data.slug?.toLowerCase().includes(nicheLower) ||
        data.name?.toLowerCase().includes(nicheLower);

      if (matchesState && matchesNiche) {
        matching.push({
          slug: data.slug,
          name: data.name,
          legalName: data.legalName || data.name,
          city: data.city,
          address: data.address || '',
          website: data.website || '',
          instagram: data.instagram || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          segment: data.segment || data.niche || targetNicho,
          business_score: data.scores?.business ?? null,
          pagespeed_mobile: data.pagespeed?.mobile_performance ?? null,
          pagespeed_desktop: data.pagespeed?.desktop_performance ?? null,
          original_design: data.scores?.design ?? null,
          original_mobile: data.scores?.mobile ?? null,
          google_rating: data.business?.googleRating ?? null,
          years_active: data.business?.yearsActive ?? null
        });
      }
    } catch {}
  }

  if (matching.length >= 5) {
    candidates = matching;
  }
}

if (candidates.length === 0) {
  console.log(`[INFO] Nenhum lead em disco encontrado para ${targetNicho} no ${targetEstado}.`);
  console.log(`Utilize --leads <arquivo.json> para injetar 15 leads prospectados.`);
  process.exit(0);
}

console.log(`Total de empresas catalogadas: ${candidates.length}`);

// 1.5. COMPANY INTELLIGENCE - FASE 1 (ENRIQUECIMENTO LEVE NAS 15 EMPRESAS)
console.log(`\n[ETAPA 1.5 - COMPANY INTELLIGENCE] Pesquisa externa leve (identidade, CNPJ, contatos, avaliações)...`);
const compIntelScript = path.join(rootDir, '.agents/skills/company-intelligence/scripts/enrich_company_intelligence.cjs');

for (const cand of candidates) {
  if (fs.existsSync(compIntelScript)) {
    spawnSync('node', [compIntelScript, '--slug', cand.slug, '--phase', 'light'], { stdio: 'ignore' });
  }
}
console.log(`[OK] Enriquecimento leve concluído para as ${candidates.length} empresas.\n`);

// 2. Auditoria Visual e Cálculo de Notas
console.log(`[ETAPA 2 - AUDITOR VISUAL] Auditando e ranqueando empresas para consolidar o Top 5...`);
const auditScript = path.join(rootDir, '.agents/skills/visual-auditor/scripts/audit_visual.cjs');
const scoredCandidates = [];

for (const cand of candidates) {
  const jsonPath = path.join(leadsDir, cand.slug, 'lead.json');
  let leadData = cand;
  if (fs.existsSync(jsonPath)) {
    try { leadData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch {}
  }

  if (fs.existsSync(auditScript)) {
    const audit=spawnSync(process.execPath, [auditScript, cand.slug], { stdio: 'inherit' });
    if (audit.status!==0) { console.log(`[NEEDS_ORIGINAL_IMAGE_REVIEW] ${cand.slug}`); continue; }
  }

  const handoffPath = path.join(leadsDir, cand.slug, 'visual', 'original-review.json');
  let visualOpp = null;
  if (fs.existsSync(handoffPath)) {
    try {
      const h = JSON.parse(fs.readFileSync(handoffPath, 'utf8'));
      if (Number.isFinite(h.redesignOpportunityScore)) visualOpp = h.redesignOpportunityScore;
    } catch {}
  }

  // Sinais do Company Intelligence
  const bStrength = leadData.intelligence?.businessStrengthScore ?? (Number.isFinite(leadData.scores?.business) ? leadData.scores.business * 10 : null);
  const contactability = leadData.intelligence?.contactabilityScore ?? null;
  const dataConf = leadData.intelligence?.dataConfidenceScore ?? null;
  const prospectorOpp = Number.isFinite(leadData.scores?.opportunity) ? leadData.scores.opportunity * 10 : null;
  if (![bStrength, contactability, dataConf, prospectorOpp, visualOpp].every(Number.isFinite)) { console.log(`[NEEDS_EVIDENCE] ${cand.slug}: completar avaliações antes de ranquear`); continue; }

  // Fórmula Multidimensional:
  // Negócio forte + Site abaixo do potencial + Fácil de contactar = Alta prioridade comercial
  const conversionChance = Math.round(
    (bStrength * 0.35) + 
    (visualOpp * 0.25) + 
    (contactability * 0.20) + 
    (prospectorOpp * 0.10) + 
    (dataConf * 0.10)
  );

  if (!leadData.scores) leadData.scores = {};
  leadData.scores.conversion_chance = conversionChance;
  leadData.scores.business_strength = bStrength;
  leadData.scores.contactability = contactability;
  leadData.scores.data_confidence = dataConf;

  if (fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify(leadData, null, 2), 'utf8');
  }

  scoredCandidates.push({
    ...cand,
    conversionChance,
    businessStrength: bStrength,
    contactability,
    dataConfidence: dataConf,
    leadData
  });
}

scoredCandidates.sort((a, b) => {
  if (a.leadData?.ranking && b.leadData?.ranking) {
    return a.leadData.ranking - b.leadData.ranking;
  }
  return b.conversionChance - a.conversionChance;
});
const top5 = scoredCandidates.slice(0, 5);

console.log(`\n================================================================================`);
console.log(`              TOP 5 QUALIFICADOS POR INTELIGÊNCIA EMPRESARIAL                   `);
console.log('================================================================================');
top5.forEach((l, i) => {
  console.log(`  ★ #${i + 1} Lugar: [Chance: ${l.conversionChance}/100 | Força: ${l.businessStrength}/100 | Contato: ${l.contactability}/100] ${l.name} (${l.slug})`);
});
console.log('================================================================================\n');

// 2.5. COMPANY INTELLIGENCE - FASE 2 (ENRIQUECIMENTO PROFUNDO NOS TOP 5)
console.log(`[ETAPA 2.5 - COMPANY INTELLIGENCE PROFUNDO] Aprofundando dossiê dos 5 mais promissores...`);
for (const lead of top5) {
  if (fs.existsSync(compIntelScript)) {
    spawnSync('node', [compIntelScript, '--slug', lead.slug, '--phase', 'deep'], { stdio: 'inherit' });
  }
}
console.log(`[OK] Dossiês aprofundados salvos em leads/[slug]/research/\n`);

// 3. Execução dos 5 leads (Geração de Dossiês e Validação)
console.log(`[ETAPA 3] Processando Dossiês e Validando Requisitos de Handoff...\n`);
const topSlugs = top5.map(t => t.slug);
if (!topSlugs.length) {
  console.log('[NEEDS_AGENT_ACTION] Nenhum candidato tem todas as avaliações verificadas. Completar a etapa pendente antes do handoff.');
  process.exit(1);
}

// Executar validador de Handoff
const validateScript = path.join(rootDir, 'scripts/validate-handoff.ts');
const argsValidate = [
  '--import',
  'tsx/esm',
  validateScript
];
topSlugs.forEach(s => {
  argsValidate.push('--slug');
  argsValidate.push(s);
});

console.log('[VALIDADOR PRÉ-HANDOFF] Executando auditoria técnica...');
const valProc = spawnSync(process.execPath, argsValidate, { stdio: 'inherit' });

if (valProc.status !== 0) {
  console.log('\n⚠️ Alguns requisitos de handoff necessitam de atenção nos leads selecionados.');
  process.exitCode = 1;
} else {
  console.log('\n🎉 Pipeline executado com sucesso e todos os critérios cumpridos!');
}
