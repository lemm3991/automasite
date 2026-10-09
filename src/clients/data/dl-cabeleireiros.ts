import type { ClientConfig } from '../schema';

const client: ClientConfig = {
  "slug": "dl-cabeleireiros",
  "status": "ativo",
  "createdAt": "2026-10-07T14:50:13.680Z",
  "updatedAt": "2026-10-07T14:50:13.683Z",
  "business": {
    "name": "D&L Cabeleireiros",
    "niche": "Salão de Beleza",
    "city": "Palhoça",
    "state": "SC",
    "logo": "/assets/clients/dl-cabeleireiros/01-d-l---logo-sem-fundo-RC4m511o2CDnGJl0.png",
    "address": "Rua Portinari, 170, Pedra Branca, Palhoça - SC. CEP 88137-076",
    "phone": "(48) 99936-0284",
    "whatsapp": "(48) 99936-0284"
  },
  "theme": {
    "primaryColor": "#213e35",
    "secondaryColor": "#e8e3d8",
    "accentColor": "#f0d0a0",
    "backgroundColor": "#f5f1e9",
    "textColor": "#222b27",
    "headingFont": "Playfair Display",
    "bodyFont": "Inter",
    "borderRadius": "none",
    "mode": "light",
    "backgroundEffect": "none",
    "enableParallax": false
  },
  "pages": [
    {
      "path": "",
      "seo": {
        "title": "D&L Cabeleireiros | Pedra Branca e Agronômica",
        "description": "Conheça os serviços de cabelo, unhas e maquiagem do D&L Cabeleireiros. Escolha sua unidade em Palhoça ou Florianópolis e converse pelo WhatsApp."
      },
      "sections": [
        {
          "id": "header",
          "type": "header",
          "variant": "Header01",
          "content": {
            "navLinks": [
              {
                "label": "Serviços",
                "href": "#servicos"
              },
              {
                "label": "O salão",
                "href": "#galeria"
              },
              {
                "label": "Unidades",
                "href": "#unidades"
              }
            ]
          }
        },
        {
          "id": "hero",
          "type": "hero",
          "variant": "SalonHero",
          "content": {
            "eyebrow": "D&L Cabeleireiros",
            "image": "/assets/clients/dl-cabeleireiros/03-whatsapp-image-2026-03-11-at-13.25.26-W6QUkRMQrgKOxaJJ.jpeg",
            "imageAlt": "Ambiente com cadeiras verdes, espelhos circulares iluminados e bancadas de madeira.",
            "caption": "Um olhar para o ambiente D&L",
            "description": "Beleza, conforto e cuidado em cada detalhe. Encontre seu momento no D&L."
          }
        },
        {
          "id": "servicos",
          "type": "services",
          "variant": "Services01",
          "content": {
            "title": "Seu cuidado, do seu jeito.",
            "services": [
              {
                "title": "Corte Feminino",
                "description": "Cortes personalizados que valorizam sua identidade e movimento."
              },
              {
                "title": "Escovas",
                "description": "Finalização impecável com leveza, brilho e durabilidade."
              },
              {
                "title": "Mechas",
                "description": "Ilumine seu cabelo com tons naturais e sofisticados."
              },
              {
                "title": "Mega Hair",
                "description": "Técnicas modernas para volume, comprimento e acabamento perfeito."
              },
              {
                "title": "Kérastase",
                "description": "Cuidados exclusivos para restaurar a saúde e o brilho dos fios."
              },
              {
                "title": "Tratamentos Davines",
                "description": "Tratamentos premium com performance, sustentabilidade e resultados visíveis."
              },
              {
                "title": "Colorações",
                "description": "Cores personalizadas que realçam sua beleza e estilo."
              },
              {
                "title": "Dia da Noiva",
                "description": "Uma experiência completa para tornar seu dia inesquecível."
              },
              {
                "title": "Corte Masculino",
                "description": "Estilo, precisão e acabamento alinhado às tendências atuais."
              },
              {
                "title": "Alongamento de Unhas",
                "description": "Unhas sofisticadas, resistentes e com acabamento perfeito."
              },
              {
                "title": "Manicure e Pedicure",
                "description": "Cuidado, higiene e beleza para mãos e pés impecáveis."
              },
              {
                "title": "Maquiagens",
                "description": "Produções elegantes que destacam sua beleza em cada ocasião."
              }
            ]
          }
        },
        {
          "id": "galeria",
          "type": "showcase",
          "variant": "Showcase01",
          "content": {
            "title": "Beleza nos detalhes.",
            "founders": "Fundado por Douglas e Luciano",
            "description": "No D&L Salão, cada detalhe é pensado para proporcionar uma experiência única, onde estilo, conforto e excelência se encontram.",
            "items": [
              {
                "image": "/assets/clients/dl-cabeleireiros/07-hqdefault.webp",
                "alt": "Miniatura de vídeo com cliente de cabelo loiro e profissional ao fundo.",
                "caption": "Cabelos em movimento"
              },
              {
                "image": "/assets/clients/dl-cabeleireiros/08-hqdefault.webp",
                "alt": "Miniatura de vídeo com mulher de cabelo longo e claro vista em três quartos.",
                "caption": "Detalhes que fazem o visual"
              }
            ]
          }
        },
        {
          "id": "unidades",
          "type": "contact",
          "variant": "SalonUnits",
          "content": {
            "title": "Escolha onde viver o seu momento.",
            "units": [
              {
                "name": "D&L – Pedra Branca",
                "city": "Palhoça",
                "address": "Rua Portinari, 170, Pedra Branca, Palhoça - SC. CEP 88137-076",
                "phone": "(48) 99936-0284",
                "hours": "Segunda a Sábado: 09h às 21h"
              },
              {
                "name": "Salão D&L – Agronômica",
                "city": "Florianópolis",
                "address": "Rua Frei Caneca, 17 Agronômica, Florianópolis - SC. CEP 88025-000",
                "phone": "(48) 99936-0365",
                "hours": "Segunda a Sábado: 09h às 21h30"
              }
            ]
          }
        },
        {
          "id": "footer",
          "type": "footer",
          "variant": "Footer01",
          "content": {}
        }
      ]
    }
  ]
};

export default client;
