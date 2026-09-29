import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  slug: 'delta-pan',
  status: 'published',
  createdAt: '2026-09-29T13:44:57.861Z',
  updatedAt: '2026-09-29T13:44:57.861Z',
  business: {
    name: 'Delta Pan Equipamentos',
    legalName: 'DELTA PAN - EQUIPAMENTOS INDUSTRIA E COMERCIO LTDA',
    niche: 'Metalúrgica de Equipamentos para Panificação e Indústria Alimentícia',
    city: 'Criciúma',
    state: 'SC',
    logo: '/assets/clients/delta-pan/logo-white.png',
    address: 'Rua Francisco Severo Pizzetti, Vila Francesa - Criciúma - SC',
    phone: '(48) 99617-0558',
    whatsapp: '(48) 99617-0558',
    email: 'contato@deltapan.com.br'
  },
  theme: {
    primaryColor: '#161b22',
    secondaryColor: '#21262d',
    accentColor: '#f97316',
    backgroundColor: '#0c0f12',
    textColor: '#f1f5f9',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    borderRadius: 'md',
    mode: 'dark',
    backgroundEffect: 'dots',
    enableParallax: true
  },
  pages: [
    {
      path: '',
      seo: {
        title: 'Delta Pan Equipamentos | Equipamentos & Formas para Panificação em Criciúma - SC',
        description: 'Indústria metalúrgica em Criciúma especializada em formas para pão, assadeiras de alumínio e inox, esteiras rotativas e equipamentos industriais para panificação.',
        ogImage: '/assets/clients/delta-pan/fabrica-maquinario.jpg'
      },
      sections: [
        {
          id: 'header-main',
          type: 'header',
          variant: 'Header01',
          content: {
            logo: '/assets/clients/delta-pan/logo-white.png',
            navLinks: [
              { label: 'Linha Industrial', href: '#produtos' },
              { label: 'A Indústria', href: '#sobre' },
              { label: 'Engenharia & Rigor', href: '#diferenciais' },
              { label: 'Cotação Direta', href: '#contato' }
            ],
            ctaLabel: 'Solicitar Orçamento'
          }
        },
        {
          id: 'hero-main',
          type: 'hero',
          variant: 'Hero07',
          content: {
            badge: 'Indústria Metalúrgica de Precisão • Criciúma - SC',
            headline: 'Engenharia em aço e alumínio para a máxima produtividade da sua panificação.',
            subheadline: 'Fabricamos formas industriais, esteiras, assadeiras estampadas e estruturas reforçadas para fornos de alta capacidade, atendendo indústrias e panificadoras em todo o Brasil.',
            primaryCtaLabel: 'Cotação Rápida de Fábrica',
            primaryCtaHref: 'https://wa.me/5548996170558',
            secondaryCtaLabel: 'Conhecer Linha de Produtos',
            secondaryCtaHref: '#produtos',
            featuredImage: '/assets/clients/delta-pan/fabrica-maquinario.jpg',
            trustMetric: { number: '100% Grau Alimentício', text: 'Alumínio Naval & Aço Inox AISI 304 com Conformidade Sanitária' }
          }
        },
        {
          id: 'produtos',
          type: 'services',
          variant: 'Services01',
          content: {
            badge: 'Linha de Fabricação Própria',
            title: 'Equipamentos Industriais de Alta Performance',
            subtitle: 'Soluções desenvolvidas para resistir a ciclos contínuos de cocção com distribuição térmica uniforme.',
            services: [
              {
                title: 'Formas para Pão de Forma',
                description: 'Conjuntos múltiplos com travas estruturais e tampas reforçadas. Fabricação em alumínio ou folha flandres de alta durabilidade.',
                icon: 'cube'
              },
              {
                title: 'Assadeiras Lisas & Perfuradas',
                description: 'Assadeiras estampadas sem cantos vivos e bandejas perfuradas para fluxo otimizado de ar quente em fornos turbo e lastro.',
                icon: 'grid'
              },
              {
                title: 'Telas & Calhas Bagueteiras',
                description: 'Perfis ondulados antiaderentes em aço inox ou alumínio para baguetes francesas e pães rústicos com casca perfeita.',
                icon: 'layers'
              },
              {
                title: 'Carros Esqueleto & Transporte',
                description: 'Estruturas tubulares reforçadas com rodízios de alta temperatura para transporte seguro e fermentação padronizada.',
                icon: 'truck'
              },
              {
                title: 'Bandejas para Fornos Rotativos',
                description: 'Projetos sob medida para qualquer marca e modelo de forno rotativo do mercado com encaixes milimétricos.',
                icon: 'cog'
              },
              {
                title: 'Corte a Laser & Estamparia Especial',
                description: 'Desenvolvimento de matrizes, peças estampadas e chapas especiais sob medida conforme o projeto técnico da sua linha.',
                icon: 'shield'
              }
            ]
          }
        },
        {
          id: 'sobre',
          type: 'about',
          variant: 'About01',
          content: {
            badge: 'Parque Fabril em Criciúma',
            title: 'Tradição industrial, maquinário moderno e entrega direta de fábrica.',
            description: 'Sediada estrategicamente no polo metalmecânico de Criciúma (SC), na Rua Francisco Severo Pizzetti, a Delta Pan Equipamentos combina processos avançados de conformação mecânica, corte a laser e solda especializada. Nossa missão é suprir indústrias de panificação, cozinhas industriais e atacados com equipamentos que elevam o rendimento e eliminam desperdícios operacionais.',
            image: '/assets/clients/delta-pan/fabrica-industrial.jpg',
            stats: [
              { number: 'Criciúma', label: 'Polo Metalmecânico SC' },
              { number: '100% Nacional', label: 'Produção Própria com Garantia' }
            ]
          }
        },
        {
          id: 'diferenciais',
          type: 'benefits',
          variant: 'Features02',
          content: {
            badge: 'Rigor Técnico & Engenharia',
            title: 'Por Que Escolher a Delta Pan',
            subtitle: 'Compromisso com a durabilidade operacional e precisão geométrica em cada lote produzido.',
            items: [
              {
                tag: 'CONFORMIDADE ANVISA',
                title: 'Materiais Certificados e Atóxicos',
                description: 'Uso rigoroso de ligas de alumínio e aço inoxidável com laudo de atoxidade, garantindo segurança alimentar total.'
              },
              {
                tag: 'RESISTÊNCIA TÉRMICA',
                title: 'Soldagem e Reforços Estruturais',
                description: 'Reforços perimetrais com arames de aço e soldas de alta penetração que impedem empenamentos em choques térmicos.'
              },
              {
                tag: 'EFICIÊNCIA OPERACIONAL',
                title: 'Distribuição Térmica Otimizada',
                description: 'Espessuras calibradas que aceleram o tempo de forno, economizando combustível e padronizando o assamento dos pães.'
              },
              {
                tag: 'DIRETO DA INDÚSTRIA',
                title: 'Preço Competitivo e Prazos Rápidos',
                description: 'Sem intermediários. Negociação direta com a equipe técnica da fábrica e condições personalizadas para compras em escala.'
              }
            ]
          }
        },
        {
          id: 'metricas',
          type: 'testimonials',
          variant: 'SocialProof04',
          content: {
            title: 'Autoridade Fabril em Santa Catarina',
            subtitle: 'Capacidade comprovada para atender desde panificadoras artesanais até grandes plantas de panificação industrial.',
            metrics: [
              { value: 'Milhares', label: 'de Formas Produzidas', description: 'Atendendo padarias e indústrias em múltiplos estados' },
              { value: 'Grau Alimentício', label: 'Matérias-Primas', description: 'Aço inox e alumínio com rastreabilidade' },
              { value: 'Sob Medida', label: 'Projetos Especiais', description: 'Adequação precisa aos carrinhos e fornos do cliente' }
            ]
          }
        },
        {
          id: 'contato',
          type: 'contact',
          variant: 'Contact01',
          content: {
            badge: 'Atendimento Comercial & Técnico',
            title: 'Fale Diretamente com a Fábrica da Delta Pan',
            formTitle: 'Solicitar Cotação B2B',
            formSubtitle: 'Informe as medidas ou modelos das formas desejadas e receba um orçamento direto da nossa engenharia.'
          }
        },
        {
          id: 'cta-final',
          type: 'cta',
          variant: 'CTA04',
          content: {
            badge: 'Orçamento Imediato',
            headline: 'Precisa renovar ou expandir o parque de formas da sua panificadora?',
            subheadline: 'Fale pelo WhatsApp com nosso departamento técnico em Criciúma e receba o catálogo técnico com preços de fábrica.',
            primaryCtaLabel: 'Cotar Formas no WhatsApp',
            primaryCtaHref: 'https://wa.me/5548996170558',
            statsHighlight: { value: '(48) 99617-0558', label: 'Canal Direto de Vendas da Fábrica' }
          }
        },
        {
          id: 'footer-main',
          type: 'footer',
          variant: 'Footer08',
          content: {
            logo: '/assets/clients/delta-pan/logo-white.png',
            disclaimer: 'DELTA PAN - Equipamentos Indústria e Comércio Ltda • CNPJ e Sede em Criciúma - SC. Fabricação de máquinas e equipamentos para panificação.'
          }
        }
      ]
    }
  ]
};

export default client;
