# Correção reutilizável do Builder e teste controlado — São Jorge

Data: 06/10/2026  
Resultado: **READY_FOR_DEMO**. Comercial não executado; nenhuma mensagem enviada e nenhuma publicação externa realizada.

## Resumo

O Builder recebeu um contrato reutilizável para transformar a direção de arte em código, com prioridade na primeira dobra. O teste na São Jorge passou por plano, implementação, build, capturas e inspeção real. A biblioteca compartilhada permanece como base; os componentes do cliente foram adaptados de forma isolada.

As ferramentas verificam rastreabilidade, atualidade e consistência. O julgamento criativo/factual continua a cargo do agente que lê as fontes e abre as imagens. Não existe garantia automática de bom design por preencher JSON.

## Mudanças para próximos clientes

- Plano obrigatório antes do ClientConfig: contexto, hero, seções, assets selecionados, fontes, candidatos e decisão de manter/configurar/adaptar/criar.
- Cada referência selecionada exige caminho real, trecho encontrado, elemento observado, aplicação prevista e evidência no código.
- Scaffold deixou de gerar conteúdo de advocacia ou receitas por nicho. Só persiste configuração explicitamente planejada; quando falta decisão criativa, devolve a etapa ao agente.
- O agente deve usar o conteúdo real para determinar a composição, quantidade de itens e tratamento visual. Não há obrigação de dark, parallax, glow ou uso de todas as fotos.
- Primeira dobra concentra o trabalho: proposta clara, imagem apropriada, hierarquia, identidade, CTA visível e acabamento coerente.
- Comparação estrutural considera nove dimensões e os arquivos efetivamente resolvidos, incluindo clientes legados. Reuso é permitido; semelhança alta exige adequação justificada.
- Handoff exige plano validado, build real com log, capturas atuais e revisão visual registrada. Mudanças de código/assets invalidam evidências antigas.
- Render Validation verifica arquivos, dimensões, carregamento e overflow. Removidas notas fixas, incrementos artificiais e declaração automática de zero regressões.
- O lote não contabiliza subprocesso com erro como sucesso; registra pendências para o orquestrador continuar a correção. Não exige aprovação humana por gate.
- Integrações de produção continuam separadas da prontidão de uma demonstração. Modelos de .agents/models.json preservados.

Entradas principais atualizadas: skills site-builder, astro-platform-builder, builder-handoff e visual-auditor; instrução do agente Builder; scaffolds legados; scripts validate-builder-implementation.cjs, generate-builder-handoff.cjs, validate-handoff.ts e run-top5-pipeline.ts. Os scripts históricos específicos de clientes/lotes não são o caminho recomendado para novos clientes.

O orquestrador continua responsável por acionar os agentes configurados. Os scripts locais de validação não chamam Gemini nem substituem esse raciocínio. Nesta execução, Codex aplicou as correções e realizou o teste local; não foi executado um lote autônomo de novos clientes.

## 1–4. Componentes no teste

| Classificação das seções | Quantidade | Componentes |
|---|---:|---|
| Mantidos intactos | 0 | — |
| Apenas configurados | 0 | — |
| Adaptados | 7 | Header01, Hero07, Services01, About01, Showcase01, Contact01, Footer08 |
| Novos | 1 | MaterialsPanel |

Os oito arquivos estão em src/clients/components/metalurgica-sao-jorge/. O CSS industrial também é local. BaseLayout, registry e componentes compartilhados de outros clientes não foram alterados para esta personalização. O contador fictício do botão flutuante compartilhado foi ocultado por CSS deste cliente.

O CTA separado da configuração anterior foi integrado ao hero/contato. O painel de materiais contém somente os dois materiais confirmados.

## 5. Elementos concretos do Design System

| Referência realmente lida | Padrão observado | Reinterpretação implementada |
|---|---|---|
| autonomous-drone-62 | Bordas técnicas contínuas, módulos e etiquetas | Moldura da foto principal, marcações de canto e etiquetas da galeria |
| AEX | Títulos de grande escala, linhas compactas e composição editorial | Headline empilhada no hero e contraste editorial na seção da empresa |
| Axion AI | Rótulos monoespaçados e divisores de informações | Tabela de capacidades, numeração e linhas abertas dos materiais |

Essas referências não foram apresentadas como empresas metalúrgicas. Foram aproveitados padrões visuais. Inter foi mantida conforme o 2A atual; a fonte Oswald do AEX não foi copiada. Trechos observados e seis aplicações concretas estão no implementation-plan.json.

## 6–7. Fingerprint anterior e novo

| Dimensão | Antes | Depois |
|---|---|---|
| Hero | Hero07 compartilhado intacto, fundo geométrico usado como foto | Hero07 local: título editorial, fotografia real ampla, moldura técnica, régua de capacidades |
| Ordem | Header → hero → empresa → serviços → benefícios → projetos → contato → CTA → footer | Header → hero → capacidades → empresa → materiais → portfólio → contato → footer |
| Imagens | Hero com asset abstrato 04; seis fotos com interpretações técnicas | Foto real da máquina 03; três fotos selecionadas com legendas descritivas |
| Grids | Grades padrão da biblioteca | Split editorial, tabela técnica, dois materiais em linhas e galeria assimétrica; empilhamento mobile |
| Fundos | Escuro contínuo com dots | Alternância escuro/claro/escuro e painéis abertos |
| Cards | Painéis arredondados compartilhados | Linhas, molduras e informação técnica aberta |
| Tipografia | Barlow + Inter | Inter + Inter, conforme direção atual do 2A |
| Movimento | Parallax compartilhado | Movimento local sutil e respeito a movimento reduzido |
| Variantes | 9 componentes compartilhados sem adaptação | 7 adaptados localmente + 1 novo |

O fingerprint bruto anterior está preservado no recibo do plano. A nomenclatura da heurística foi aprimorada durante a correção; não foi calculada uma evolução percentual artificial entre versões distintas desse algoritmo.

## 8. Similaridade com Delta Pan

Antes, 8 dos 9 componentes tinham o mesmo código utilizado pela Delta Pan. Agora, nenhum dos oito componentes de seção tem código idêntico aos componentes resolvidos da Delta Pan.

Ainda existem seis nomes de variantes-base em comum. Isso é esperado: os nomes continuam servindo à resolução dos overrides. O novo indicador heurístico de similaridade estrutural é **34/100**, com nove dimensões disponíveis. É um sinal para revisão, não uma nota estética nem um percentual comprovado de originalidade. O hero ainda pertence à família split; a personalização está no tratamento concreto e no conjunto da composição.

## 9. Auditoria factual e correções de copy

Removidos da configuração anterior por evidência insuficiente:

- Promessas de tolerâncias estreitas e ângulos rigorosos.
- Distribuição e expedição para todas as regiões do RS.
- Furação atribuída a foto de peças dobradas.
- Calandragem/curvatura atribuída a foto de perfis.
- Chapas xadrez/pisos tratados como oferta adicional sem confirmação suficiente nas fontes usadas.

Os termos Usinagem, Ferramentaria, Inox, Bronze e “100% próprio” já não estavam no snapshot imediatamente anterior deste teste; foram conferidos e permaneceram excluídos.

Também foi corrigida a escolha do hero: o asset 04 é um fundo geométrico; o asset 03 mostra chapa em uma máquina. Não foi chamado de foto externa da fábrica. Foram ignorados fragmentos de URL e telefone classificados como serviço no resumo do 2A, com uso da fonte literal.

Preservados: experiência de mais de 50 anos, dobra até 3 m e 1/2”, calandragem até 2 m e 1/4”, recorte a plasma, lambri sob medida, venda de aço carbono e chapa galvanizada, endereço, horários e contato.

## 10. Capturas e inspeção visual

- [Primeira dobra desktop — 1440 × 900](screenshots/home-desktop.png)
- [Primeira dobra mobile — 390 × 844](screenshots/home-mobile.png)
- [Página completa desktop](screenshots/home-desktop-full.png)
- [Página completa mobile](screenshots/home-mobile-full.png)

As seis imagens registradas na revisão incluem essas quatro capturas e as primeiras dobras originais desktop/mobile. Elas foram abertas e inspecionadas.

**Conclusão qualitativa:** aceitável para demonstração. Título, máquina e CTA estão visíveis nas primeiras dobras avaliadas. A tabela técnica, o bloco de tradição, os dois materiais e a galeria trazem ritmo e conteúdo específico. No mobile, desapareceu a duplicação da chamada observada no site original. Não foi identificada regressão impeditiva nas capturas.

Pequenos rótulos técnicos poderiam ganhar tamanho em um refinamento futuro. Não foi feita auditoria integral de acessibilidade ou de todos os dispositivos. Não foi atribuída nota estética numérica.

## Verificações executadas

- 12 testes de regressão aprovados: fonte inexistente, referências sem inspeção, plano ausente, adaptação intacta, fonte alterada, renomeação de componente idêntico, scaffolds sem receitas para saúde/educação, capturas vazias/corrompidas/antigas e revisão sem evidências.
- 4 configurações de clientes válidas, 0 erros de schema.
- Build Astro final concluído, exitCode 0; log salvo em build.log.
- Gate de implementação aprovado; Render Validation aprovado sem erros ou avisos.
- HTTP 200, imagens carregadas, fontes carregadas, nenhuma âncora ausente e nenhum overflow horizontal nos dois tamanhos capturados.
- Menu mobile abre e fecha; formulário prepara mensagem para o número correto. A abertura do WhatsApp foi interceptada no teste: nenhuma mensagem enviada.
- Handoff final: READY_FOR_DEMO.

## Pendências compatíveis com demonstração

Backend de formulário e mapa incorporado continuam opcionais para a próxima fase. Há cotação por WhatsApp e link de mapa. Não foram medidos conversão ou novo PageSpeed. Publicação, Comercial e envio ao cliente ficam fora desta execução.
