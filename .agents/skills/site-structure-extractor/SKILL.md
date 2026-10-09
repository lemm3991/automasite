---
name: site-structure-extractor
description: Confere a estrutura e a copy extraídas do HTML do cliente, com fontes e seletores verificáveis e sem textos de preenchimento.
---

# Site Structure Extractor

A coleta e extração são centralizadas em scripts/prospector-engine.cjs. Leia docs/pipeline-evidence-contract.md: source-evidence.json contém as páginas, títulos, textos, links e formulários realmente encontrados; source-review.json separa fatos liberados e conflitos; site-atual.md consolida o material.

Não preencher uma extração incompleta com serviços, diferenciais, CTAs, formulários ou desenhos de layout fictícios. Ausência de evidência permanece ausência. A ordem das dobras e os elementos visíveis devem ser conferidos nas capturas; a ordem de tags HTML não comprova o layout.

O comando de compatibilidade valida o material atual sem substituir o Markdown revisado. Se faltar evidência, o agente volta à coleta/revisão e reprocessa o Prospector com --from-snapshot; isso não exige aprovação humana.

    node .agents/skills/site-structure-extractor/scripts/extract_structure.js --slug SLUG

O Builder pode reorganizar UX e escrever copy editorial. Afirmações sobre o negócio continuam vinculadas aos factIds liberados, não a frases genéricas de um template.
