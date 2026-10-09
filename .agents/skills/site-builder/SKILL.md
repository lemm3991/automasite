---
name: site-builder
description: Implementa a direção criativa de cada cliente em um redesign demonstrativo Astro, com prioridade no hero, referências locais materializadas e componentes adaptados ao conteúdo real.
---

# Site Builder — Agente 2B

Contrato de auditoria 2: todo texto exige avaliação semântica de alegações. Serviço, capacidade, segmento atendido, infraestrutura e especialização precisam de fonte, inclusive em copy editorial. Não classificar texto desconhecido como editorial por padrão. Declarar referência não materializada quando pertinente; fonte isolada, raio, borda ou scroll suave não provam influência forte. A comparação perceptiva inclui posição texto/imagem e badges, mesmo quando o índice automático é baixo. Não trocar reuso saudável por duplicação para melhorar índices.

Contrato obrigatório: `docs/pipeline-evidence-contract.md`. Plano v2, fatos liberados por entityId, assets com descrição/legendas validadas e medições separadas do hero desktop/mobile. Não duplicar componentes para reduzir hashes. Alta similaridade pede análise visual, não veto. Registrar autor verdadeiro do Builder; a revisão final precisa de executor distinto. Não autorizar o próprio trabalho com outra assinatura.

O objetivo é uma demonstração comercial atraente, reconhecível e personalizada à empresa e ao ramo. Priorize a primeira dobra: composição, headline, fotografia autêntica, hierarquia e acabamento. Escolha efeitos pela adequação ao cliente; não imponha tema escuro, glow, parallax ou quantidade fixa de cards. Integrações de produção podem ficar pendentes. Preserve os modelos de .agents/models.json.

O fluxo é automático por lead: o Builder prepara o plano, implementa, valida e captura; o Auditor Visual faz a revisão independente. Um gate que falha pede correção ao agente responsável, não aprovação humana a cada passo. Respeite limites específicos da execução (por exemplo, teste sem Comercial).

## Da direção ao código

1. Leia creative-brief.md, art-direction.json, design-selection.json e visual-handoff.json; confronte com site-atual.md, lead.json e assets-manifest.json. Corrija na execução extrações inválidas e registre a divergência no plano; não transforme fragmentos de URL em copy nem invente fatos para completar um componente.
2. Abra fisicamente o HTML e o STACK.md de cada referência selecionada. Observe padrões concretos e examine as imagens escolhidas. A existência/dimensão de uma imagem não identifica seu assunto. Use apenas as imagens úteis.
3. Antes de alterar o ClientConfig, escreva redesign/implementation-plan.json conforme [o contrato](references/implementation-plan.md). Especifique hero desktop/mobile, composição por seção, candidatos, decisões configure/adapt/create, fontes factuais e o que cada referência fornecerá.
4. Execute node scripts/validate-builder-implementation.cjs --slug SLUG --phase plan. O recibo fixa o plano, as entradas e a configuração anterior. Não execute scaffold com receita pronta por nicho.
5. Implemente o plano. A biblioteca é matéria-prima: configure quando suficiente, adapte ou crie quando necessário. Preserve componentes compartilhados publicados; use src/clients/components/SLUG/. O registry já resolve overrides e variantes novas locais. Não force serviços, métricas, materiais, avaliações ou fotos para preencher layouts.
6. Registre implementationEvidence no plano, com referência, seção e trecho do código que materializou a decisão. Execute o gate --phase implemented. Compare a estrutura com clientes recentes, inclusive os legados. Semelhança permite reuso, mas exige adequação concreta quando alta. Nomes diferentes de variante ou troca de cores não comprovam personalização.
7. Execute `npm run client:validate` e `npm run builder:build -- --slug SLUG` (grava resultado e log reais). Sirva dist/client e capture com `npm run builder:capture -- --slug SLUG --cdp http://127.0.0.1:PORTA` em navegador isolado. Execute `npm run compare:visual -- SLUG`; abra original e redesign e avalie o hero primeiro. Corrija falhas relevantes e produza visual-review.json conforme a skill visual-auditor. Recapture após mudanças visuais; não reaproveite aprovação de arquivos antigos. Render Validation não fornece nota estética.
8. Gere o handoff com evidências, componentes mantidos/configurados/adaptados/novos, referências aplicadas, fingerprint anterior/novo, comparação com projetos recentes e pendências de produção. Avance ao Comercial somente quando a execução autorizar e a revisão estiver aprovada.

## Copy e qualidade

Headlines, subtítulos e CTAs podem ser novos. Afirmações verificáveis exigem fonte: números, serviços, materiais, garantias, certificados, clientes e equipamentos. Uma foto de peça não comprova processo produtivo ou tolerância técnica. Sem prova, omita ou use descrição visual neutra. Nunca reutilize contato de outro lead. Inspecione também widgets compartilhados: não exiba contadores fictícios de mensagens, estrelas ou avaliações sem fonte; desative-os ou adapte o uso localmente.

Concentre as iterações na primeira dobra e no fluxo visual da página; o nível exigido é uma demonstração convincente, sem invenções ou falhas visuais evidentes. Formulário sem backend, mapa incorporado e páginas secundárias podem ser registrados como pendentes. A interface deve descrever honestamente o que seus botões fazem.

## Orquestração em lote

O raciocínio criativo é executado pelo agente 2B configurado no orquestrador. Os scripts locais validam/persistem decisões; não invocam um modelo por conta própria. Estados `NEEDS_CREATIVE_PLAN`, `NEEDS_CREATIVE_IMPLEMENTATION` ou `NEEDS_AGENT_ACTION` devem voltar automaticamente ao agente da etapa. O lote registra pendências em leads/pipeline-pending.json e continua os outros leads, sem declarar sucesso quando um subprocesso falha. Scripts históricos `build-*-lead.cjs`, `build-*-top5.cjs` e `run-lead-pipeline.cjs` não são entradas reutilizáveis; não executar suas receitas fixas para novos clientes. Use o contrato desta skill.
