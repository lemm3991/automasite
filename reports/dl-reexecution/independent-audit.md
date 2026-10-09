# Auditoria independente — D&L Cabeleireiros

**Decisão: approved; READY_FOR_DEMO confirmado.** Executor real: `/root/independent_dl_review`, distinto do Builder `codex-dl-builder`. Auditoria realizada em 7 de outubro de 2026. Não identifiquei falha material ou regressão crítica que impeça a demonstração.

Esta reexecução usou Codex conforme a continuidade autorizada pelo usuário após a consulta sobre indisponibilidade de Gemini. O mapeamento central Gemini foi preservado; não descreve o modelo efetivamente executado nesta revisão.

## Escopo e evidências

Conferi o contrato v3, a skill visual-auditor, validadores de revisão/build, lead, handoffs/manifests, source-review, asset-review, decisão criativa, direção, seleção, briefing, plano/validação, build/render, configuração do cliente e todos os arquivos de seus componentes locais. Também li o Footer01 compartilhado e o botão flutuante usado pela página.

Abri efetivamente 21 capturas: quatro originais, quatro novas, quatro da versão anterior, duas recapturas lentas do original, duas Delta Pan, duas São Jorge e três referências. Abri também os quatro assets usados pelo redesign. Os hashes estão em `redesign/visual-review.json`; as novas capturas têm inspeções regionais e avaliação separada dos cinco papéis da primeira dobra.

As capturas longas rápidas do original ocultam conteúdo por animação. As recapturas `original-desktop-full-slow.png` e `original-mobile-full-slow.png` mostram os 12 serviços e Quem Somos. Galeria de vídeos e mapas externos continuam com limitação de carregamento. **Não pontuei os vazios desses embeds como defeito intrínseco do original.** O original já possui marca reconhecível, headline serifada, CTA e identidade de salão.

## Factualidade

Revisei **107 registros únicos de seletor/texto, correspondentes a 81 textos distintos**: 38 factuais, 54 de interface, 12 editoriais e três visuais. Cada id é SHA256 de `selector + '\n' + text`. Os textos repetidos em seletores diferentes continuam com registros próprios.

Os 12 nomes e as 12 descrições de serviços são factuais, inclusive o conteúdo dos acordeões. Douglas e Luciano estão documentados como fundadores no texto original. Não associei nominalmente o homem das miniaturas a qualquer fundador. A foto do ambiente não foi atribuída a uma unidade específica e os retratos não foram rotulados por procedimento.

As três legendas usam `kind: visual` com `assetPath` correspondente e texto aprovado na inspeção. Os textos criativos não contêm serviço novo, número, prêmio ou garantia escondida como editorial. Cabeçalhos de navegação, chamada para agendar, copyright e capitalização do nome foram avaliados pela função de interface; não exigi literalidade que alterasse apenas a caixa ou a apresentação.

| Unidade | Endereço documentado | Telefone | Horário publicado |
|---|---|---|---|
| Pedra Branca, Palhoça | Rua Portinari, 170; CEP 88137-076 | (48) 99936-0284 | Segunda a Sábado: 09h às 21h |
| Agronômica, Florianópolis | Rua Frei Caneca, 17; CEP 88025-000 | (48) 99936-0365 | Segunda a Sábado: 09h às 21h30 |

O endereço de São Paulo e o horário genérico divergente foram excluídos por resolução documental explícita, preservada nas fontes. Os links tel/WhatsApp do HTML construído correspondem aos números completos das respectivas unidades. O flutuante usa Palhoça, entidade prioritária registrada. Não houve ligação, mensagem, reserva ou confirmação operacional dos conflitos.

Não há avaliação Google, contador de clientes, estatística comercial ou identidade de pessoa inventada na implementação atual. Fidelidade à documentação da empresa não equivale a comprovar externamente todas as suas alegações.

## Primeira dobra e superioridade

No desktop, a foto real à esquerda e a chamada serifada à direita formam composição equilibrada. No mobile de 390×844, a foto de 350×234 começa em y=241,5 e o CTA de 350×56 termina em y=610,4. **Logo, mensagem, CTA, identidade e foto têm fração visível 1 nos dois viewports medidos.** A foto preserva cadeiras, espelhos e madeira nos dois recortes.

A nova versão supera o original pelo uso do ambiente específico na entrada, leitura estável, remoção do resíduo de embed e cardápio mais compacto, com escolha clara de unidade. A comparação não depende dos vazios causados por animações ou embeds do original.

A nova versão também supera a anterior preservada. A anterior deixava a foto abaixo da primeira dobra mobile, repetia cartões, agrupava o cardápio de forma que serviços desapareciam e apresentava atribuições indevidas de procedimentos nas miniaturas. A atual mantém os 12 serviços, utiliza legendas neutras e organiza os contatos separadamente. A altura mobile passa de 10945px para 3540px, acompanhando a redução de repetição; a altura isolada não determina qualidade.

A anterior apresentava mais informações de localização na entrada. Na atual, o CTA explicita a escolha e leva até Unidades. É uma troca consciente entre concisão do hero e informação operacional imediata.

Há limites de acabamento: miniaturas suaves quando ampliadas, alguns rótulos pequenos e o WhatsApp flutuante tocando parte do título de serviços ao pé da dobra mobile. Isso não bloqueia hero, consulta ou contatos. O menu superior é oculto no mobile; Agendar e Serviços permanecem acessíveis. Esses pontos foram registrados sem transformar aprovação em declaração de perfeição.

## Utilidade das referências

| Referência | Parecer | Benefício observado |
|---|---|---|
| architecture-studio.aura.build | applied | Escala serifada, itálico e respiro conferidos na referência aparecem no hero com Playfair Display renderizada. Hierarquia adequada à mensagem de estilo e acolhimento. |
| green-museum | applied | Enquadramentos verticais, arcos e legendas junto às fotos aparecem no par de retratos. Grid de duas colunas ativo nos dois tamanhos e desnível entre figuras criam pausa visual. |
| barbershop-landing-51.aura.build | partial | Nome/descrição tornam o cardápio consultável, mas são hierarquia comum. A referência usa cards, preço e duração; acordeões e linhas são reinterpretação do Builder, sem influência visual distintiva integral demonstrada. |

Não considerei presença de classe CSS ou simples grid como prova suficiente. Confrontei capturas, trechos HTML das referências e propriedades computadas. A influência parcial de barber51 não impede a qualidade demonstrativa da solução.

## Componentes e personalização

| Componente | Classificação | Motivo observado |
|---|---|---|
| Header01 | adapt | Marca sobre verde, navegação curta e CTA para unidades. |
| SalonHero | create | Estrutura dedicada, arco do ambiente e ordem mobile título/foto/CTA. |
| Services01 | adapt | Dados de serviços em novo menu expansível com separadores. |
| Showcase01 | adapt | Dois retratos com legendas neutras e apresentação factual ao lado. |
| SalonUnits | create | Dois contatos independentes, cada um com endereço, horário e CTA. |
| Footer01 | keep | Rodapé compartilhado convencional, suficiente para a demonstração. |

Por contagem dos seis componentes: **16,67% keep, 50% adapt e 33,33% create**. Isso não mede linhas de código originais, esforço ou qualidade criativa. A classificação respeita o reaproveitamento legítimo.

Personalização percebida: **75–85%**, estimativa subjetiva. Marca, ambiente, paleta inferida das cadeiras, cardápio e duas unidades influenciam a solução. A chamada de acolhimento, cabeçalho e rodapé ainda têm partes reutilizáveis. Não é apenas troca de cor ou logo em página industrial.

## Anti-clone: nove dimensões

| Dimensão | Delta Pan × D&L | São Jorge × D&L |
|---|---|---|
| Hero | Texto técnico pesado e arte à direita × ambiente em arco à esquerda e serifa. | Foto de aço retangular à direita × interior em arco, composição invertida. |
| Ordem | Produtos/sobre/diferenciais/métricas/formulário × serviços/galeria/unidades. Ordem inferior Delta lida no código. | Capacidades/história/materiais/portfólio/formulário × percurso curto para agendamento. |
| Grids | Cards industriais configurados × menu em duas colunas. Parte inferior Delta sem captura nesta revisão. | Tabela técnica e três fotos × acordeões e dois retratos. |
| Ritmo | Entrada densa com prova e múltiplas ações × foto, menu compacto, pausa e contato. | Alternância escura com tabela clara × creme contínuo e fechamento verde. |
| Imagens | Desenho de equipamento × interior e cabelos do acervo. | Aço, perfis e máquinas × espelhos, cadeiras e cabelos. |
| Backgrounds | Escuro pontilhado/laranja × creme/verde/dourado. | Preto azulado/vermelho × creme/verde/dourado. |
| Cards | Caixas da arte e prova arredondada × figuras abertas e linhas. | Tabela e formulário delimitado × unidades abertas. |
| Tipografia | Sans pesada e detalhe técnico × serifa normal/itálico com Inter. | Sans pesada e rótulos técnicos × serifa editorial com Inter. |
| CTA | Cotação fabril laranja × escolha de unidade e agendamento verde. | Orçamento com medidas × conversa com unidade escolhida. |

Semelhança percebida: **20–30% com Delta Pan e 25–35% com São Jorge**, faixas subjetivas. Os **39% automáticos** de cada comparador são heurística incompleta, com sete/oito dimensões conhecidas, e não verdade objetiva sobre originalidade. Split hero, separadores e CTA compartilhados não fazem a página parecer clone.

A comparação visual da Delta está limitada à primeira dobra. Ordem e grids posteriores foram analisados pela configuração local e estão sinalizados como inferência; não alego ter visto capturas inexistentes.

## Notas justificadas — 0 a 10

| Critério | Nota | Justificativa |
|---|---:|---|
| Prospector | 8,7 | Separou unidades, conflitos e contatos; preservou 12 serviços. Captura longa original exigiu complemento e validação continua documental. |
| Diretor de Arte | 8,3 | Alternativas contextuais e escolha pela melhor foto disponível; duas referências úteis e barber51 parcial. |
| Builder | 8,5 | Hero dedicado com foto na dobra mobile, menu e unidades corretos, build/render limpos. Flutuante e thumbnails limitam acabamento. |
| Personalização | 8,5 | Marca, interior, paleta das cadeiras, cardápio e duas unidades determinam conteúdo e arquitetura. Partes continuam reutilizáveis. |
| Qualidade visual | 8,4 | Boa hierarquia, espaço e ritmo nos dois tamanhos; material fotográfico limitado, pequenos rótulos e repetição de arcos impedem nota máxima. |
| Factualidade | 9,5 | Todos os textos ligados a fontes, assets ou função editorial/interface legítima; operação atual não confirmada externamente. |
| Superioridade ao original | 8,5 | Foto específica, leitura estável, menu compacto e escolha de unidade melhoram o original, sem penalizar vazios de animação/embeds. |
| Nova versus anterior | 8,7 | Foto passa a caber no mobile, 12 serviços mantidos, legendas sem atribuições indevidas e menos repetição genérica. |

As notas de superioridade expressam força do julgamento comparativo; não são crescimento percentual de receita, conversão ou desempenho. Não decorrem de média automática.

## Gate e limites de generalização

Após salvar os dois JSONs, executei `node scripts/generate-builder-handoff.cjs --slug dl-cabeleireiros --check-only`: **exit 0, READY_FOR_DEMO, errors: []**. O contrato aceitou a revisão independente sem alteração de validadores para aprovação. Esse comando não publicou o handoff; a geração final cabe ao executor principal.

Aprovação vale para esta demonstração D&L no material disponível. **Um único lead real reexecutado e fixtures de cinco nichos não comprovam qualidade estética generalizável.** Fixtures exercitam contratos e falhas controladas. Operação dos contatos/horários, reservas, produção, integrações e resultados comerciais exigem verificações próprias.

Não executei Comercial, outro lead, publicação ou alterações no site, fontes, plano, build ou capturas. Esta auditoria produziu somente os relatórios factual, visual e este parecer; o utilitário temporário de gravação foi removido.
