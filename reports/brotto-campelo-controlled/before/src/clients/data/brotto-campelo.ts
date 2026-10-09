import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  slug: "brotto-campelo",
  status: "ativo",
  createdAt: "2026-10-09T10:10:00.000Z",
  updatedAt: "2026-10-09T10:15:00.000Z",
  business: {
    name: "Brotto Campelo Advogados",
    legalName: "Brotto Campelo Advogados",
    niche: "Direito Empresarial e Soluções Jurídicas",
    city: "Curitiba",
    state: "PR",
    logo: "/assets/clients/brotto-campelo/01-BCA-logos-03-1024x205.png",
    address: "Rua Padre Agostinho 1926 - Bigorrilho, Curitiba - PR",
    phone: "41 3026-8001",
    whatsapp: "(41) 3026-8001"
  },
  theme: {
    primaryColor: "#0693e3",
    secondaryColor: "#32373c",
    accentColor: "#e06020",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    borderRadius: "lg",
    mode: "light",
    backgroundEffect: "none",
    enableParallax: false
  },
  pages: [
    {
      path: "",
      seo: {
        title: "Brotto Campelo Advogados | Advocacia Empresarial em Curitiba",
        description: "Boutique jurídica de prestígio em Curitiba/PR. Escritório mais admirado Análise Advocacia especializado em Direito Empresarial, Imobiliário, Sucessões e Inovação."
      },
      sections: [
        {
          id: "hero",
          type: "hero",
          variant: "executive-hero",
          content: {
            tagline: "BROTTO CAMPELO ADVOGADOS",
            title: "Soluções jurídicas inovadoras",
            subtitle: "O Brotto Campelo Advogados nasceu da união entre experiência e inovação, com forte atuação em Direito Empresarial e Imobiliário, além de outras áreas estratégicas. Somos um escritório premiado nacionalmente e referência entre os mais admirados do Sul do país, sempre atuando como parceiros estratégicos dos clientes.",
            ctaText: "Agendar Consulta Jurídica",
            ctaLink: "#contato"
          }
        },
        {
          id: "awards",
          type: "credentials",
          variant: "awards-bar",
          content: {
            title: "Reconhecimentos & Premiações Análise Advocacia"
          }
        },
        {
          id: "services",
          type: "services",
          variant: "practice-grid",
          content: {
            title: "Áreas de Atuação Estratégica Empresarial"
          }
        },
        {
          id: "pillars",
          type: "benefits",
          variant: "firm-pillars",
          content: {
            title: "Pilares de Excelência e Facilitação de Negócios"
          }
        },
        {
          id: "headquarters",
          type: "showcase",
          variant: "headquarters-showcase",
          content: {
            title: "Sede Corporativa no Bigorrilho"
          }
        },
        {
          id: "cta",
          type: "cta",
          variant: "executive-contact",
          content: {
            title: "Atendimento & Consulta Jurídica Especializada"
          }
        }
      ]
    }
  ]
};

export default client;
