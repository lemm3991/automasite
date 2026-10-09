# Auditoria independente — Brotto Campelo

Executor: codex-independent-brotto-review. Auditoria externa Codex, distinta do Builder codex-brotto-controlled-builder. Os modelos configurados do pipeline não foram alterados.

**Veredito: READY_FOR_DEMO. Nota visual qualitativa: 8,2/10.**

A primeira dobra apresenta marca, mensagem, contato, identidade e retrato integralmente em 1440×900 e 390×844. O novo uso dos sócios favorece reconhecimento e confiança; o diretório preserva as 12 áreas documentadas; a faixa curta de selos e os princípios em grafite dão ritmo à página. A nota não é média automática, meta nem reprodução de uma avaliação anterior.

Foram abertos oito screenshots Brotto (quatro originais e quatro finais), quatro IORC, quatro D&L, quatro São Jorge e dois Delta Pan: 22 imagens. A antiga captura mobile isolada do original estava deslocada no scroll. O hero foi julgado pelo topo de site-mobile-full.png, também aberto em crop 390×844 em memória.

| Referência consultada (HTML e STACK abertos) | Classificação | Evidência e limite |
|---|---|---|
| Architecture Studio | PARTIAL | Faixa de selos organizada por alinhamento e divisória; adaptação útil e localizada. Não materializa as linhas do canvas, escala extrema e enquadramentos do conjunto original. |
| AI SaaS Landing 27 | SUPERFICIAL | Playfair Display visível no hero; não há tradução do hero centralizado, bento, gradientes ou camadas em vidro. |
| Luxury Real Estate 22 | NOT_MATERIALIZED | Scroll suave é genérico. Busca em vidro, hero de tela inteira e rail de imóveis não aparecem. |

Não há influência STRONG comprovada. A qualidade da página não depende de declarar três referências como materializadas.

| Comparador | Similaridade percebida | Leitura visual |
|---|---:|---|
| IORC | 30% | Compartilha split desktop e contatos; serif, foto, botões, listas, ritmo e posição da imagem mobile diferem. |
| D&L | 60% | É o vizinho mais próximo: fundo quente, serif, lista com divisórias e sequência mobile. Foto desktop invertida, selos, laranja e hierarquia jurídica distinguem Brotto. |
| Delta Pan | 20% | Primeira dobra escura industrial e painel técnico muito diferentes. Estimativa restrita às duas capturas existentes. |
| São Jorge | 35% | Enquadramento linear e retângulos comuns; tema técnico, sans, tabelas, portfólio e formulário diferem. |

Essas porcentagens são estimativas subjetivas explicadas em 11 dimensões por comparador, não medições por código ou hash. Não foram geradas novas capturas de outros leads. A comparação da sequência completa Delta Pan permanece limitada por falta de capturas completas.

A revisão factual cobre os **61 textos únicos por selector + quebra de linha + texto**. Serviços e capacidades receberam fontes explícitas; nenhum texto desconhecido foi aprovado por fallback. Os 12 serviços, os anos dos reconhecimentos, o endereço, telefone e email correspondem às fontes. As legendas coincidem com os assets inspecionados; a qualificação de fundadores foi adicionalmente conferida nas páginas coletadas page-18 (Natália) e page-20 (Ricardo). O WhatsApp corresponde ao link original. As alegações sobre assembleias/conferências internacionais, SaaS/IA e CPR estão ausentes.

Limitações reais: legendas e anos auxiliares pequenos (10–11px); parentesco editorial relevante com D&L; cobertura reduzida de navegação/equipe/blog/materiais/simulador em relação ao original; revisão estática não prova animações, atendimento externo nem produção completa. A perda de atalhos institucionais foi registrada como regressão menor, sem bloqueio para demonstração. Nenhuma regressão crítica foi identificada.

A evidência técnica final registra build válido, HTTP 200, uma h1, sem imagens quebradas, âncoras ausentes, overflow ou erros de runtime nos dois viewports. Os JSONs vinculam o render e a revisão factual por SHA256 e registram regiões inspecionadas e os hashes atuais das 22 capturas.

Arquivos: leads/brotto-campelo/redesign/factual-review.json e leads/brotto-campelo/redesign/visual-review.json. Comercial não executado.

Validação final do contrato: `generate-builder-handoff.cjs --slug brotto-campelo --check-only` retornou `READY_FOR_DEMO`, sem erros. A validação foi executada após o julgamento e serviu somente para conferir rastreabilidade e consistência dos registros, sem definir a nota. O handoff não foi alterado por esta auditoria.
