import { z } from 'zod';

export const RESERVED_SLUGS = [
  'login',
  'logout',
  'api',
  'preview',
  'admin',
  'assets',
  '_astro',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml'
] as const;

export const ClientStatusSchema = z.enum([
  'ativo',
  'aprovado',
  'nao_aprovado',
  'arquivado',
  'draft',
  'review',
  'published'
]);

export const RECOMMENDED_HEADING_FONTS = [
  'Playfair Display', 'Plus Jakarta Sans', 'Inter', 'Cinzel', 'Montserrat',
  'Lora', 'Cormorant Garamond', 'Merriweather', 'DM Sans', 'Syne', 'Outfit'
] as const;

export const RECOMMENDED_BODY_FONTS = [
  'Plus Jakarta Sans', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'DM Sans'
] as const;

export const ThemeTokensSchema = z.object({
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor primária deve ser um hex válido'),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor secundária deve ser um hex válido'),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor de destaque deve ser um hex válido'),
  backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor de fundo deve ser um hex válido'),
  textColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor de texto deve ser um hex válido'),
  // Flexível: aceita presets ou qualquer fonte do Google Fonts
  headingFont: z.string().min(2, 'Nome da fonte de título inválido').default('Playfair Display'),
  bodyFont: z.string().min(2, 'Nome da fonte de corpo inválido').default('Plus Jakarta Sans'),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  mode: z.enum(['dark', 'light']).default('dark'),
  backgroundEffect: z.enum(['none', 'mesh', 'dots', 'prism']).optional().default('none'),
  enableParallax: z.boolean().optional().default(false)
});

export const SECTION_TYPES = [
  'header',
  'hero',
  'services',
  'products',
  'projects',
  'gallery',
  'about',
  'team',
  'benefits',
  'process',
  'stats',
  'credentials',
  'testimonials',
  'faq',
  'contact',
  'map',
  'cta',
  'footer',
  'bento',
  'showcase'
] as const;

export const SectionConfigSchema = z.object({
  id: z.string(),
  type: z.enum(SECTION_TYPES),
  variant: z.string(),
  content: z.record(z.string(), z.any())
});

export const PageConfigSchema = z.object({
  path: z.string(), // "" para Home
  seo: z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20).max(250),
    ogImage: z.string().optional()
  }),
  sections: z.array(SectionConfigSchema)
});

export const ClientConfigSchema = z.object({
  slug: z.string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .max(50, 'Slug deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .refine(
      (val) => !RESERVED_SLUGS.includes(val as any),
      (val) => ({ message: `O slug "${val}" é reservado pelo sistema e não pode ser utilizado.` })
    ),
  status: ClientStatusSchema.default('draft'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  
  business: z.object({
    name: z.string().min(2),
    legalName: z.string().optional(),
    niche: z.string(),
    city: z.string(),
    state: z.string().length(2).optional(),
    logo: z.string().optional(),
    // Dados opcionais para que o Builder nunca precise inventar informações
    address: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
    googleRating: z.number().min(0).max(5).optional(),
    instagram: z.string().optional(),
    socialLinks: z.record(z.string(), z.string()).optional()
  }),

  theme: ThemeTokensSchema,
  pages: z.array(PageConfigSchema)
});

export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export type ClientStatus = z.infer<typeof ClientStatusSchema>;
export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;
export type SectionConfig = z.infer<typeof SectionConfigSchema>;
export type PageConfig = z.infer<typeof PageConfigSchema>;
export type SectionType = typeof SECTION_TYPES[number];
