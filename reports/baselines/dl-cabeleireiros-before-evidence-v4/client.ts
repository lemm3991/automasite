import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  slug: "dl-cabeleireiros",
  status: "published",
  createdAt: "2026-10-06T15:00:00.000Z",
  updatedAt: "2026-10-06T15:00:00.000Z",
  business: {
    name: "D&L Cabeleireiros",
    legalName: "D&L Cabeleireiros",
    niche: "Salão de Beleza",
    city: "Palhoça",
    state: "SC",
    logo: "/assets/clients/dl-cabeleireiros/01-d-l---logo-sem-fundo-RC4m511o2CDnGJl0.png",
    address: "Rua Portinari, 170, Pedra Branca, Palhoça / SC",
    phone: "(48) 99936-0284",
    whatsapp: "(48) 99936-0284",
    instagram: "@dlcabeleireiros",
    socialLinks: {
      instagram: "https://instagram.com/dlcabeleireiros",
      facebook: "https://facebook.com/dlcabeleireiros"
    }
  },
  theme: {
    primaryColor: "#0f172a",
    secondaryColor: "#e2e8f0",
    accentColor: "#c59b27",
    backgroundColor: "#fafaf9",
    textColor: "#121417",
    headingFont: "Inter",
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
        title: "D&L Cabeleireiros | Beleza e Excelência Premium em Palhoça e Florianópolis",
        description: "Salão de beleza premium com unidades na Pedra Branca (Palhoça) e Agronômica (Florianópolis). Cortes personalizados, mechas, mega hair e tratamentos capilares com Douglas e Luciano.",
        ogImage: "/assets/clients/dl-cabeleireiros/03-whatsapp-image-2026-03-11-at-13.25.26-W6QUkRMQrgKOxaJJ.jpeg"
      },
      sections: [
        {
          id: "header-main",
          type: "header",
          variant: "Header01",
          content: {
            navLinks: [
              { label: "Serviços", href: "#servicos" },
              { label: "Diferenciais", href: "#diferenciais" },
              { label: "Unidades", href: "#unidades" },
              { label: "Portfólio", href: "#portfolio" },
              { label: "Contato", href: "#contato" }
            ],
            ctaHref: "https://wa.me/5548999360284",
            ctaLabel: "Agendar em Palhoça"
          }
        },
        {
          id: "hero",
          type: "hero",
          variant: "Hero07",
          content: {
            eyebrow: "D&L CABELEIREIROS · PEDRA BRANCA, PALHOÇA / SC",
            headline: "Beleza e excelência em cada detalhe.",
            subheadline: "Sua beleza elevada ao mais alto nível com técnica, cuidado e atenção a cada detalhe. Cortes autorais, mechas iluminadas, mega hair e tratamentos capilares premium.",
            featuredImage: "/assets/clients/dl-cabeleireiros/03-whatsapp-image-2026-03-11-at-13.25.26-W6QUkRMQrgKOxaJJ.jpeg",
            imageAlt: "Transformação capilar real no salão D&L Cabeleireiros",
            primaryCtaLabel: "Agendar em Palhoça no WhatsApp",
            primaryCtaHref: "https://wa.me/5548999360284",
            secondaryCtaLabel: "Conhecer Serviços",
            secondaryCtaHref: "#servicos",
            metrics: [
              { label: "Unidade Palhoça", value: "Pedra Branca", note: "Rua Portinari, 170" },
              { label: "Unidade Florianópolis", value: "Agronômica", note: "Rua Frei Caneca, 17" },
              { label: "Fundadores", value: "Douglas & Luciano", note: "Excelência e Alto Padrão" }
            ]
          }
        },
        {
          id: "servicos",
          type: "services",
          variant: "Services01",
          content: {
            title: "Nossos Serviços Especializados",
            description: "No D&L Cabeleireiros, oferecemos uma experiência completa de beleza e cuidado para valorizar sua autoestima e realçar sua melhor versão.",
            services: [
              {
                title: "Cortes Personalizados",
                description: "Cortes personalizados que valorizam sua identidade e movimento natural."
              },
              {
                title: "Mechas & Iluminação",
                description: "Ilumine seu cabelo com tons naturais, sofisticados e proteção da fibra capilar."
              },
              {
                title: "Mega Hair & Volume",
                description: "Técnicas modernas para volume, comprimento e acabamento imperceptível."
              },
              {
                title: "Tratamentos Capilares",
                description: "Cuidados exclusivos para restaurar a saúde e o brilho dos fios."
              },
              {
                title: "Coloração Sob Medida",
                description: "Cores personalizadas que realçam sua beleza e estilo com alta durabilidade."
              },
              {
                title: "Manicure & Pedicure",
                description: "Unhas sofisticadas, resistentes e com acabamento perfeito."
              },
              {
                title: "Produções Elegantes",
                description: "Penteados e produções que destacam sua beleza em cada ocasião especial."
              }
            ]
          }
        },
        {
          id: "diferenciais",
          type: "benefits",
          variant: "SalonExperience",
          content: {
            title: "A Experiência D&L: Filosofia e Rigor",
            description: "Trabalhamos exclusivamente com produtos premium e protocolos avançados, garantindo saúde, beleza e bem-estar em cada atendimento.",
            items: [
              {
                badge: "EXCLUSIVIDADE",
                title: "Produtos Premium & Protocolos Avançados",
                description: "Trabalhamos exclusivamente com produtos premium e protocolos avançados, garantindo saúde, beleza e bem-estar em cada atendimento."
              },
              {
                badge: "QUALIFICAÇÃO",
                title: "Profissionais Altamente Qualificados",
                description: "Nossa equipe é formada por profissionais constantemente atualizados com as principais tendências do mercado nacional e internacional."
              },
              {
                badge: "TRADIÇÃO",
                title: "Fundado por Douglas & Luciano",
                description: "O salão nasceu com o propósito de elevar o conceito de beleza por meio da excelência, qualidade e atendimento personalizado."
              }
            ]
          }
        },
        {
          id: "unidades",
          type: "about",
          variant: "About01",
          content: {
            title: "Nossas Unidades: Palhoça & Florianópolis",
            description: "No D&L Salão, cada detalhe é pensado para proporcionar uma experiência única, onde estilo, conforto e excelência se encontram.",
            units: [
              {
                name: "D&L — Pedra Branca",
                city: "Palhoça - SC",
                address: "Rua Portinari, 170, Pedra Branca",
                cep: "CEP 88137-076",
                hours: "Segunda a Sábado: 09h às 21h",
                phone: "(48) 99936-0284",
                whatsappUrl: "https://wa.me/5548999360284",
                isPriority: true
              },
              {
                name: "Salão D&L — Agronômica",
                city: "Florianópolis - SC",
                address: "Rua Frei Caneca, 17, Agronômica",
                cep: "CEP 88025-000",
                hours: "Segunda a Sábado: 09h às 21h30",
                phone: "(48) 99936-0365",
                whatsappUrl: "https://wa.me/5548999360365",
                isPriority: false
              }
            ]
          }
        },
        {
          id: "portfolio",
          type: "projects",
          variant: "Showcase01",
          content: {
            title: "Resultados Reais & Clientes Reais",
            description: "Assista às transformações e descubra a qualidade dos procedimentos realizados pela equipe D&L.",
            items: [
              {
                title: "Iluminação & Mechas",
                caption: "Tons luminosos e preservação da fibra capilar",
                image: "/assets/clients/dl-cabeleireiros/05-hqdefault.webp",
                alt: "Mechas e iluminação realizadas no salão D&L"
              },
              {
                title: "Loiro Sofisticado",
                caption: "Acabamento luminoso com saúde e brilho",
                image: "/assets/clients/dl-cabeleireiros/06-hqdefault.webp",
                alt: "Transformação de cor e tratamento D&L"
              },
              {
                title: "Corte & Estilização",
                caption: "Valorização da identidade e movimento natural",
                image: "/assets/clients/dl-cabeleireiros/07-hqdefault.webp",
                alt: "Corte de cabelo e finalização D&L"
              },
              {
                title: "Produção Completa",
                caption: "Finalização impecável com leveza e durabilidade",
                image: "/assets/clients/dl-cabeleireiros/08-hqdefault.webp",
                alt: "Produção de beleza e penteado D&L"
              }
            ]
          }
        },
        {
          id: "contato",
          type: "contact",
          variant: "Contact01",
          content: {
            title: "Estamos Prontos para Cuidar de Você",
            description: "Entre em contato diretamente pelo WhatsApp para agendar seu horário na unidade de sua preferência.",
            whatsappPalhoca: "5548999360284",
            whatsappFloripa: "5548999360365"
          }
        },
        {
          id: "cta-final",
          type: "cta",
          variant: "CTA04",
          content: {
            headline: "Estamos prontos para cuidar de você.",
            subheadline: "Agende seu horário na unidade Pedra Branca em Palhoça e viva a experiência de um atendimento verdadeiramente premium.",
            primaryCtaLabel: "Agendar Horário no WhatsApp",
            primaryCtaHref: "https://wa.me/5548999360284"
          }
        },
        {
          id: "footer",
          type: "footer",
          variant: "Footer08",
          content: {
            privacyHref: "https://dlcabeleireiro.com"
          }
        }
      ]
    }
  ]
};

export default client;
