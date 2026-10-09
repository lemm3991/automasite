---
name: builder-handoff
description: Empacota evidências reais da implementação e revisão visual de um redesign, separando prontidão da demonstração e pendências de produção.
---

# Builder Handoff

Exigir `auditContractVersion: 2`: revisão semântica independente por texto, referências graduadas STRONG/PARTIAL/SUPERFICIAL/NOT_MATERIALIZED, comparação real por screenshots e notas com justificativa/evidências. Registrar influências ausentes honestamente; não transformar três referências selecionadas em 3/3 aplicadas. Comparações e notas não podem vir de constantes ou diferença de código.

Use `docs/pipeline-evidence-contract.md`: plano v2 e revisão visual v3, com relatório factual completo e medições de renderização. Auditor final distinto do Builder. O gate rejeita contradições mensuráveis (posição da foto, grid inativo, horários divergentes e alt/legenda sem validação); percentuais de similaridade solicitam revisão.

O objetivo é uma demonstração comercial atraente, reconhecível e personalizada à empresa e ao ramo. Priorize a primeira dobra: composição, headline, fotografia autêntica, hierarquia e acabamento. Escolha efeitos pela adequação ao cliente; não imponha tema escuro, glow, parallax ou quantidade fixa de cards. Integrações de produção podem ficar pendentes. Preserve os modelos de .agents/models.json.

O fluxo é automático por lead: o Builder prepara o plano, implementa, valida e captura; o Auditor Visual executa a revisão independente. Um gate que falha pede correção ao agente responsável, não aprovação humana a cada passo. Respeite limites específicos da execução (por exemplo, teste sem Comercial).

Execute node scripts/generate-builder-handoff.cjs --slug SLUG após os gates e a revisão. O gerador não cria notas, resultados de build, fatos nem aprovação visual. Ele consome:

- implementation-plan.json e os recibos dos gates;
- build-evidence.json com os comandos realmente executados, exitCode, logPath e hash da configuração;
- render-evidence.json com URL, dimensões, checks do navegador e screenshots;
- visual/render-validation.json (verificação objetiva);
- redesign/visual-review.json (análise feita após abrir as imagens), com status approved/needs_changes, reviewedBy, screenshotHashes, observations e limitations.

Inclua no handoff a classificação dos componentes, contribuição concreta de cada referência, fontes, comparações estruturais, resultados reais e pendenciasProducao. Screenshots existentes não comprovam qualidade, Zod não comprova responsividade e build não comprova copy verdadeira. Campos ausentes devem permanecer pendentes, nunca ganhar defaults positivos.

A avaliação estética deve explicar hero, identidade, composição, fotografia, hierarquia, legibilidade, acabamento, personalização e fidelidade ao 2A. A revisão pode ser qualitativa sem números. Aprovação da demonstração não significa que backend, métricas de conversão ou publicação em produção foram validados.
