import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { ThemeTokensSchema } from '../src/clients/schema.ts';
const require = createRequire(import.meta.url);
const { inspectPage, within } = require('./lib/design-system-source.cjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folder = path.join(root, 'Design System');
const catalogPath = path.join(folder, 'catalog.json');
const profiles = JSON.parse(fs.readFileSync(path.join(folder, 'catalog-profiles.json'), 'utf8'));
const entries = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const counts = new Map<string, number>();
for (const entry of entries) counts.set(entry.id, (counts.get(entry.id) || 0) + 1);
const luminance = (color: string) => {
  const channels = color.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
};
const seen = new Set<string>();
const output = entries.map((entry: any) => {
  const legacyId = entry.legacy_id || entry.id;
  const folderTheme = entry.catalog_folder_theme || entry.tema;
  const id = counts.get(entry.id)! > 1 ? entry.id + '--' + folderTheme : entry.id;
  if (seen.has(id)) throw new Error('ID duplicado: ' + id);
  seen.add(id);
  const profile = profiles[id];
  if (!profile?.context || !profile.sectors?.length) throw new Error('Perfil revisado ausente: ' + id);
  within(folder, entry.design_system_page);
  const evidence = inspectPage(folder, entry.pagina_principal);
  const designEvidence = entry.pagina_principal === entry.design_system_page ? evidence : inspectPage(folder, entry.design_system_page);
  const theme = evidence.background ? (luminance(evidence.background) < .18 ? 'escuro' : 'claro') : entry.tema;
  const fonts = [...new Set([evidence.heading_font, evidence.body_font].filter(Boolean))];
  const palette = evidence.palette;
  const chromatic = palette.find((color: string) => {
    const c = color.slice(1).match(/../g)!.map(v => parseInt(v, 16));
    return Math.max(...c) - Math.min(...c) > 35;
  });
  // These are editable starting tokens. Colour roles beyond body/text require the director's decision.
  let tokens = null;
  if (evidence.background && evidence.foreground && evidence.heading_font && evidence.body_font) {
    tokens = ThemeTokensSchema.parse({
      primaryColor: evidence.foreground,
      secondaryColor: palette.find((c: string) => c !== evidence.background && c !== evidence.foreground) || evidence.foreground,
      accentColor: chromatic || evidence.foreground,
      backgroundColor: evidence.background,
      textColor: evidence.foreground,
      headingFont: evidence.heading_font,
      bodyFont: evidence.body_font,
      borderRadius: 'none',
      mode: theme === 'escuro' ? 'dark' : 'light',
      backgroundEffect: 'none',
      enableParallax: false
    });
  }
  const typography = [];
  if (/Oswald|Anton|Condensed/i.test(evidence.heading_font || '')) typography.push('tipografia condensada');
  if (/Playfair|Newsreader|Serif|Cormorant|Merriweather|Cinzel/i.test(evidence.heading_font || '')) typography.push('tipografia serifada editorial');
  if (/Mono/i.test(evidence.heading_font || '')) typography.push('tipografia monoespaçada');
  if (/Space Grotesk|Orbitron|Syncopate|Syne/i.test(evidence.heading_font || '')) typography.push('tipografia geométrica');
  const patterns = [...new Set([...(profile.patterns || []), ...evidence.signals, ...typography])];
  return {
    id, legacy_id: legacyId, family: profile.family || id,
    tema: theme, catalog_folder_theme: folderTheme,
    caminho: entry.caminho, pagina_principal: entry.pagina_principal, design_system_page: entry.design_system_page,
    titulo: profile.context, subtitulo: evidence.title,
    nichos: profile.sectors, estilo_visual: patterns, clima_sensacao: [],
    paleta_predominante: palette, efeitos_visuais: evidence.signals.filter((s: string) => /animação|parallax|translúcid/.test(s)),
    componentes_chave: [], fontes: fonts,
    melhor_para: profile.context + '. A transferência para outros setores exige uma justificativa visual.',
    classification: {
      context: profile.context, actual_sectors: profile.sectors, visual_patterns: patterns,
      method: 'reviewed_saved_content', render_verified: false,
      theme_basis: evidence.background ? 'declared_body_background' : 'legacy_folder_needs_preview',
    },
    source_evidence: { page: evidence, design_system: designEvidence },
    tokens, token_status: tokens ? 'draft_requires_project_adaptation' : 'partial_requires_director',
    token_notes: 'Fontes e cores extraídas estaticamente; primária, secundária, acento e bordas são sugestões. Confirmar aparência no preview; respeitar a marca do cliente. Parallax permanece desativado até decisão explícita.',
    recommended_components: {},
    component_policy: 'Escolher composição e componentes no projeto após ler o conteúdo e inspecionar as referências; não há receita por nicho.'
  };
});
const markdown = [
  '# Catálogo de referências visuais',
  '',
  'Gerado por npm run design-systems:index a partir dos perfis revisados, páginas HTML e CSS locais.',
  'A classificação descreve o conteúdo salvo. A aparência final ainda deve ser conferida no preview dos candidatos.',
  'Os tokens são sugestões e podem estar incompletos. A ausência de correspondência na busca não autoriza selecionar os primeiros itens.',
  '',
  '| ID | Contexto observado | Tema declarado | Fontes identificadas | Página |',
  '| --- | --- | --- | --- | --- |',
  ...output.map((d: any) => '| ' + d.id + ' | ' + d.titulo + ' | ' + d.tema + ' | ' + (d.fontes.join(' / ') || 'Conferir no preview') + ' | [HTML](<' + d.pagina_principal + '>) |'),
  '',
  'IDs antigos ambíguos devem ser substituídos pelo ID específico da variante. Famílias compartilhadas são agrupadas na busca para não ocupar várias posições com versões do mesmo modelo.',
  ''
].join('\n');
const metadata = `// Generated by scripts/index-design-systems.ts. Do not edit by hand.
import catalog from './catalog.json' with { type: 'json' };
import type { ThemeTokens } from '../src/clients/schema.ts';
export type EnrichedDesignSystem = Omit<(typeof catalog)[number], 'tokens' | 'tema'> & {
  tema: 'claro' | 'escuro';
  tokens: ThemeTokens | null;
};
export const DESIGN_SYSTEMS_CATALOG = catalog as EnrichedDesignSystem[];
export const DESIGN_SYSTEMS_MAP: Record<string, EnrichedDesignSystem> = {};
for (const entry of DESIGN_SYSTEMS_CATALOG) {
  if (DESIGN_SYSTEMS_MAP[entry.id]) throw new Error('Duplicate design system ID: ' + entry.id);
  DESIGN_SYSTEMS_MAP[entry.id] = entry;
}
`;
const json = JSON.stringify(output, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(catalogPath, 'utf8') !== json || fs.readFileSync(path.join(folder, 'design-systems-meta.ts'), 'utf8') !== metadata || fs.readFileSync(path.join(folder, 'CATALOG.md'), 'utf8') !== markdown) {
    throw new Error('Índice desatualizado. Execute npm run design-systems:index.');
  }
} else {
  fs.writeFileSync(catalogPath, json);
  fs.writeFileSync(path.join(folder, 'design-systems-meta.ts'), metadata);
  fs.writeFileSync(path.join(folder, 'CATALOG.md'), markdown);
}
console.log(JSON.stringify({entries:output.length, unique_ids:seen.size, draft_tokens:output.filter((d: any)=>d.tokens).length, partial_tokens:output.filter((d: any)=>!d.tokens).length, fixed_component_recipes:0, checked:process.argv.includes('--check')}));
