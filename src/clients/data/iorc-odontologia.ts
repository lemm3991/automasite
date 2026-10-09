import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  slug: "iorc-odontologia",
  status: "ativo",
  createdAt: "2026-10-09T02:20:00.000Z",
  updatedAt: "2026-10-09T02:25:00.000Z",
  business: {
    name: "INSTITUTO DE ORTODONTIA DE CURITIBA S/S LTDA",
    legalName: "INSTITUTO DE ORTODONTIA DE CURITIBA S/S LTDA",
    niche: "Odontologia e Implantes",
    city: "Curitiba",
    state: "PR",
    logo: "/assets/clients/iorc-odontologia/01-cropped-logo-horizontal-300x136.png",
    address: "Rua Francisco Derosso, 4567, Alto Boqueirão, Curitiba - PR",
    phone: "(41) 3026-1234",
    whatsapp: "(41) 99907-6236"
  },
  theme: {
    primaryColor: "#104050",
    secondaryColor: "#205060",
    accentColor: "#104060",
    backgroundColor: "#ffffff",
    textColor: "#1e293b",
    headingFont: "Inter",
    bodyFont: "Inter",
    borderRadius: "md",
    mode: "light",
    backgroundEffect: "none",
    enableParallax: false
  },
  pages: [
    {
      path: "",
      seo: {
        title: "IORC Odontologia | Ortodontia e Implantes em Curitiba",
        description: "Referência em Ortodontia e Implantes em Curitiba desde 1995. Conheça nossos tratamentos com alinhadores invisíveis, 4.000 m² de estrutura e agende sua consulta."
      },
      sections: [
        {
          id: "hero",
          type: "hero",
          variant: "split-showcase",
          content: {
            tagline: "INSTITUTO DE ORTODONTIA DE CURITIBA",
            title: "Excelência em Ortodontia e Implantes em Curitiba",
            description: "Referência desde 1995 sob a liderança do Dr. Fabio Takachi Hase (CRO/PR-9169). Tratamentos ortodônticos avançados com alinhadores invisíveis, reabilitação oral e 4.000 m² de estrutura integrada.",
            heroImage: "/assets/clients/iorc-odontologia/11-young-woman-consulting-dentist-768x512.jpg",
            heroImageAlt: "Atendimento Humanizado"
          }
        },
        {
          id: "stats",
          type: "stats",
          variant: "metric-bar",
          content: {
            title: "Estrutura e Tradição em Números"
          }
        },
        {
          id: "services",
          type: "services",
          variant: "clinical-grid",
          content: {
            title: "Especialidades e Tratamentos Integrados",
            subtitle: "Corpo clínico multidisciplinar e estrutura completa para cuidar de todas as fases do seu sorriso."
          }
        },
        {
          id: "technology",
          type: "benefits",
          variant: "partner-badges",
          content: {
            title: "Parcerias e Tecnologia de Ponta",
            subtitle: "Marcas globais e materiais homologados para assegurar previsibilidade e biocompatibilidade em cada procedimento."
          }
        },
        {
          id: "infrastructure",
          type: "about",
          variant: "facility-split",
          content: {
            title: "Espaço Planejado para o Seu Cuidado e Conforto",
            subtitle: "A matriz do IORC está situada no Alto Boqueirão e reúne 1.800 m² de infraestrutura construída segundo normas rigorosas de acessibilidade e biossegurança."
          }
        },
        {
          id: "units",
          type: "contact",
          variant: "location-cards",
          content: {
            title: "Unidades de Atendimento em Curitiba",
            subtitle: "Três clínicas estrategicamente localizadas para acolher você com pontualidade e excelência."
          }
        },
        {
          id: "cta",
          type: "cta",
          variant: "direct-contact",
          content: {
            title: "Agende sua Avaliação Odontológica no IORC",
            subtitle: "Dê o primeiro passo para alinhar o seu sorriso ou iniciar sua reabilitação com especialistas de confiança em Curitiba."
          }
        }
      ]
    }
  ]
};

export default client;
