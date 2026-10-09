import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  slug: "salete-cabeleireira",
  status: "ativo",
  createdAt: "2026-10-09T21:45:00.000Z",
  updatedAt: "2026-10-09T21:50:00.000Z",
  business: {
    name: "Salão de Beleza Salete Cabeleireira",
    legalName: "Salão de Beleza Salete Cabeleireira",
    niche: "Salão de Beleza e Estética",
    city: "Criciúma",
    state: "SC",
    logo: "/assets/clients/salete-cabeleireira/01-salao-de-beleza-salete-cabeleireira-logo.png",
    address: "Rua Coronel Pedro Benedet, 159, Ed. Frederico Minato, Sala 01, Centro, Criciúma - SC",
    phone: "48 3433 1789",
    whatsapp: "48 3433 1789"
  },
  theme: {
    primaryColor: "#fcfbfb",
    secondaryColor: "#803050",
    accentColor: "#802050",
    backgroundColor: "#0f0f11",
    textColor: "#fafafa",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    borderRadius: "full",
    mode: "dark",
    backgroundEffect: "none",
    enableParallax: false
  },
  pages: [
    {
      path: "",
      seo: {
        title: "Salão de Beleza Salete Cabeleireira | Alta Tradição em Criciúma e Balneário Rincão",
        description: "Desde 1966, a arte do cuidado capilar e estética em Criciúma e Balneário Rincão. Formação internacional Vidal Sassoon e TONI&GUY. Agende seu horário."
      },
      sections: [
        {
          id: "hero",
          type: "hero",
          variant: "salon-hero",
          content: {
            tagline: "Tradição & Alta Beleza em Santa Catarina",
            title: "Salão de Beleza Salete Cabeleireira",
            subtitle: "A Arte do Cuidado Capilar e a Tradição que Atravessa Gerações",
            description: "Quase seis décadas de pioneirismo, técnica apurada e elegância em Santa Catarina. Formação internacional Vidal Sassoon e TONI&GUY a serviço da sua beleza.",
            heroImage: "/assets/clients/salete-cabeleireira/28-salao-de-beleza-salete-cabeleireira-bg_top2.jpg",
            heroImageAlt: "Vista Geral do Salão Salete Cabeleireira"
          }
        },
        {
          id: "history",
          type: "about",
          variant: "history-split",
          content: {
            title: "Uma Trajetória Consagrada na Beleza",
            subtitle: "Pioneirismo em Santa Catarina e especialização nas melhores academias internacionais."
          }
        },
        {
          id: "services",
          type: "services",
          variant: "services-menu",
          content: {
            title: "Menu de Rituais & Especialidades",
            subtitle: "Tratamentos capilares de alta reconstrução, cortes contemporâneos e Dia da Noiva exclusivo."
          }
        },
        {
          id: "brands",
          type: "benefits",
          variant: "brands-bar",
          content: {
            title: "Parcerias Globais de Alta Performance"
          }
        },
        {
          id: "units",
          type: "benefits",
          variant: "units-cards",
          content: {
            title: "Nossas Unidades em Santa Catarina",
            subtitle: "Atendimento acolhedor e infraestrutura moderna no Centro de Criciúma e Balneário Rincão."
          }
        },
        {
          id: "contact",
          type: "contact",
          variant: "direct-contact",
          content: {
            title: "Agendamento & Atendimento Exclusivo",
            subtitle: "Entre em contato diretamente por WhatsApp ou telefone."
          }
        }
      ]
    }
  ]
};

export default client;
