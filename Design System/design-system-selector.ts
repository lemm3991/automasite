import { DESIGN_SYSTEMS_CATALOG, type EnrichedDesignSystem } from './design-systems-meta.ts';
import core from './search-core.cjs';
import { ThemeTokensSchema, type ThemeTokens } from '../src/clients/schema.ts';

export interface QueryDesignSystemOptions {
  query?: string;
  niche?: string;
  vibe?: string | string[];
  theme?: 'claro' | 'escuro' | 'dark' | 'light';
  limit?: number;
  minScore?: number;
  excludeIds?: string[];
  recentIds?: string[];
  diversify?: boolean;
}
export interface DesignSystemMatchResult {
  designSystem: EnrichedDesignSystem;
  score: number;
  matchReasons: string[];
  matchKind: string;
  tokens: ThemeTokens | null;
  recommendedComponents: Record<string, never>;
}
export function queryDesignSystems(options: QueryDesignSystemOptions = {}): DesignSystemMatchResult[] {
  return core.searchCatalog(DESIGN_SYSTEMS_CATALOG, options).map((result: any) => ({
    designSystem: result, score: result.score, matchReasons: result.match_reasons,
    matchKind: result.match_kind, tokens: result.tokens, recommendedComponents: {}
  }));
}
export function getDesignSystemTokens(id: string, overrides: Partial<ThemeTokens> = {}): ThemeTokens {
  const ds = core.resolveReference(DESIGN_SYSTEMS_CATALOG, id);
  if (!ds.tokens) throw new Error('Tokens incompletos em ' + id + '. Inspecione a referência e defina os tokens no projeto.');
  return ThemeTokensSchema.parse({ ...ds.tokens, ...overrides });
}
// Compatibility helper: returns null on no match. The director must author the page composition.
export function recommendDesignSystemAndComponents(options: { niche: string; vibe: string; themePreference?: QueryDesignSystemOptions['theme'] }) {
  const selected = queryDesignSystems({ niche: options.niche, vibe: options.vibe, theme: options.themePreference, limit: 1 })[0];
  if (!selected) return null;
  const ds = selected.designSystem;
  return {
    niche: options.niche, vibe: options.vibe,
    selectedDesignSystem: { id: ds.id, titulo: ds.titulo, tema: ds.tema, melhorPara: ds.melhor_para, fontes: ds.fontes, score: selected.score, reasons: selected.matchReasons },
    tokens: selected.tokens, recommendedComponents: {}, requiresArtDirection: true,
    designSystemHtmlPath: ds.design_system_page, referencePagePath: ds.pagina_principal
  };
}
