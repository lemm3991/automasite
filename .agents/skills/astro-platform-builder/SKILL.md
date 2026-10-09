---
name: astro-platform-builder
description: Orquestra a implementação de leads na plataforma Astro a partir do plano criativo validado, com isolamento de componentes e verificações da entrega.
---

# Astro Platform Builder

O objetivo é uma demonstração comercial atraente, reconhecível e personalizada à empresa e ao ramo. Priorize a primeira dobra: composição, headline, fotografia autêntica, hierarquia e acabamento. Escolha efeitos pela adequação ao cliente; não imponha tema escuro, glow, parallax ou quantidade fixa de cards. Integrações de produção podem ficar pendentes. Preserve os modelos de .agents/models.json.

O fluxo é automático por lead: o próprio agente prepara o plano, implementa, valida, captura e revisa. Um gate que falha pede correção ao agente responsável, não aprovação humana a cada passo. Respeite limites específicos da execução (por exemplo, teste sem Comercial).

Siga [o fluxo criativo do Builder](../site-builder/SKILL.md) e o [contrato do plano](../site-builder/references/implementation-plan.md). Receba a entrega existente do 2A; não regenere prospecção ou direção de arte apenas para construir o site.

Antes do ClientConfig: node scripts/validate-builder-implementation.cjs --slug SLUG --phase plan.
Depois do código: node scripts/validate-builder-implementation.cjs --slug SLUG --phase implemented.

O scaffold não escolhe composição nem preenche fatos: só materializa configuration explícita do plano. O agente pode escrever ClientConfig diretamente após o gate. Para adaptar, use src/clients/components/SLUG/; o registry resolve pelo nome de variante. Não altere componentes publicados para personalizar outro cliente.

Valide com npm run client:validate e npm run builder:build -- --slug SLUG (build e recibo reais). Capture desktop/mobile com scripts/capture-redesign.cjs; execute compare_redesign.cjs apenas para Render Validation e faça inspeção qualitativa das imagens. Termine com o handoff conforme a skill builder-handoff, respeitando o ponto de parada solicitado.
