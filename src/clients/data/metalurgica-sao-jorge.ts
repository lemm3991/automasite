import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  "slug": "metalurgica-sao-jorge",
  "status": "published",
  "createdAt": "2026-10-06T08:55:00.000Z",
  "updatedAt": "2026-10-06T16:51:47.481Z",
  "business": {
    "name": "Metalúrgica São Jorge",
    "legalName": "Metalúrgica São Jorge",
    "niche": "Corte e Dobra de Chapas de Aço",
    "city": "Porto Alegre",
    "state": "RS",
    "logo": "/assets/clients/metalurgica-sao-jorge/01-sjorge_corte_e_dobra_de_chapas48.png",
    "address": "Rua Senhor do Bom Fim, 720 — Sarandi, Porto Alegre / RS",
    "phone": "(51) 99390-1225",
    "whatsapp": "(51) 99390-1225",
    "instagram": "@metsaojorge",
    "socialLinks": {
      "facebook": "https://facebook.com/metalsaojorge",
      "instagram": "https://instagram.com/metsaojorge"
    }
  },
  "theme": {
    "primaryColor": "#0f172a",
    "secondaryColor": "#1e293b",
    "accentColor": "#dc2626",
    "backgroundColor": "#090d16",
    "textColor": "#f8fafc",
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "borderRadius": "none",
    "mode": "dark",
    "backgroundEffect": "none",
    "enableParallax": false
  },
  "pages": [
    {
      "path": "",
      "seo": {
        "title": "Metalúrgica São Jorge | Corte e Dobra em Porto Alegre",
        "description": "Mais de 50 anos de experiência. Corte e dobra de chapas de aço carbono e galvanizadas, calandragem, recorte a plasma e lambri sob medida em Porto Alegre.",
        "ogImage": "/assets/clients/metalurgica-sao-jorge/03-sjorge_corte_e_dobra_de_chapas93.jpg"
      },
      "sections": [
        {
          "id": "header-main",
          "type": "header",
          "variant": "Header01",
          "content": {
            "navLinks": [
              {
                "label": "Capacidades",
                "href": "#servicos"
              },
              {
                "label": "A São Jorge",
                "href": "#empresa"
              },
              {
                "label": "Materiais",
                "href": "#materiais"
              },
              {
                "label": "Portfólio",
                "href": "#portfolio"
              },
              {
                "label": "Contato",
                "href": "#contato"
              }
            ],
            "ctaHref": "https://wa.me/5551993901225"
          }
        },
        {
          "id": "hero",
          "type": "hero",
          "variant": "Hero07",
          "content": {
            "eyebrow": "METALÚRGICA SÃO JORGE · PORTO ALEGRE / RS",
            "lines": [
              "Corte e dobra.",
              "Na medida do",
              "seu projeto."
            ],
            "description": "Mais de 50 anos de experiência transformando chapas de aço. Corte, dobra e calandragem para projetos em Porto Alegre e todo o Rio Grande do Sul.",
            "featuredImage": "/assets/clients/metalurgica-sao-jorge/03-sjorge_corte_e_dobra_de_chapas93.jpg",
            "imageAlt": "Chapa de aço posicionada em máquina de dobra, imagem do site da Metalúrgica São Jorge.",
            "primaryCtaLabel": "Solicitar orçamento no WhatsApp",
            "primaryCtaHref": "https://wa.me/5551993901225",
            "metrics": [
              {
                "label": "Dobra de chapas",
                "value": "3 m",
                "note": "até 1/2” de espessura"
              },
              {
                "label": "Calandragem",
                "value": "2 m",
                "note": "até 1/4” de espessura"
              },
              {
                "label": "Experiência",
                "value": "50+",
                "note": "anos no setor"
              }
            ]
          }
        },
        {
          "id": "servicos",
          "type": "services",
          "variant": "Services01",
          "content": {
            "title": "Capacidade que dá forma ao seu projeto.",
            "description": "Conheça os serviços e os limites de maquinário informados pela São Jorge. Consulte sua necessidade com a nossa equipe.",
            "services": [
              {
                "title": "Corte e dobra",
                "length": "Até 3 m",
                "thickness": "Até 1/2”",
                "description": "Capacidades de comprimento e espessura para dobra de chapas."
              },
              {
                "title": "Calandragem",
                "length": "Até 2 m",
                "thickness": "Até 1/4”",
                "description": "Conformação de chapas por calandragem."
              },
              {
                "title": "Recorte a plasma",
                "length": "Sob consulta",
                "thickness": "Sob consulta",
                "description": "Consulte a possibilidade de executar seu projeto."
              },
              {
                "title": "Lambri sob medida",
                "length": "Sob consulta",
                "thickness": "Sob consulta",
                "description": "Converse com a equipe sobre as medidas desejadas."
              }
            ]
          }
        },
        {
          "id": "empresa",
          "type": "about",
          "variant": "About01",
          "content": {
            "title": "Tradição no trabalho. Evolução em cada projeto.",
            "description": "A Metalúrgica São Jorge possui mais de 50 anos de experiência em corte e dobra de chapas de aço carbono em Porto Alegre e todo o Rio Grande do Sul. A melhoria constante do processo de trabalho caminha junto com o custo-benefício que faz parte da nossa história."
          }
        },
        {
          "id": "materiais",
          "type": "benefits",
          "variant": "MaterialsPanel",
          "content": {
            "title": "O material certo. A forma que você precisa.",
            "description": "Trabalhamos com corte e dobra de chapas. Consulte a equipe para definir o material e as medidas do seu pedido.",
            "note": "Vendas apenas de aço carbono e chapa galvanizada.",
            "items": [
              {
                "name": "Aço carbono",
                "description": "Chapas de aço carbono para seu projeto."
              },
              {
                "name": "Chapa galvanizada",
                "description": "Consulte medidas e condições de fornecimento."
              }
            ]
          }
        },
        {
          "id": "portfolio",
          "type": "projects",
          "variant": "Showcase01",
          "content": {
            "title": "Do trabalho com o aço, formas reais.",
            "description": "Uma seleção de imagens do portfólio da São Jorge. Detalhes das chapas e perfis apresentados pela empresa.",
            "items": [
              {
                "title": "Perfis dobrados",
                "image": "/assets/clients/metalurgica-sao-jorge/05-sjorge_corte_e_dobra_de_chapas96.png",
                "alt": "Extremidades de perfis de chapa dobrada.",
                "caption": "Diferentes seções e dobras."
              },
              {
                "title": "Peças e perfis",
                "image": "/assets/clients/metalurgica-sao-jorge/07-sjorge_corte_e_dobra_de_chapas022.png",
                "alt": "Peças metálicas dobradas empilhadas.",
                "caption": "Detalhes do portfólio São Jorge."
              },
              {
                "title": "Detalhes em chapa",
                "image": "/assets/clients/metalurgica-sao-jorge/12-sjorge_corte_e_dobra_de_chapas018.png",
                "alt": "Chapa metálica com frisos paralelos.",
                "caption": "Linhas e formas no aço."
              }
            ]
          }
        },
        {
          "id": "contato",
          "type": "contact",
          "variant": "Contact01",
          "content": {
            "title": "Vamos dar forma ao seu próximo projeto?",
            "description": "Envie o material, as medidas e o serviço desejado. A equipe da São Jorge conversa com você pelo WhatsApp.",
            "whatsapp": "5551993901225",
            "mapHref": "https://www.google.com/maps/search/?api=1&query=Rua%20Senhor%20do%20Bom%20Fim%20720%20Sarandi%20Porto%20Alegre"
          }
        },
        {
          "id": "footer",
          "type": "footer",
          "variant": "Footer08",
          "content": {
            "privacyHref": "https://metalurgicasaojorge.com.br/politica-de-privacidade"
          }
        }
      ]
    }
  ]
};

export default client;
