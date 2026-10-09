---
trigger: always_on
description: Consulta fundamentada do acervo e validação da direção de arte antes do Builder.
---

# Referências para Diretor de Arte e Builder

Antes da direção de arte, identifique a empresa a partir do site atual, da marca e das imagens reais. Consulte Design System/search.cjs ou a API queryDesignSystems em src/lib/design-systems.ts. As interfaces Python e TypeScript usam o mesmo motor.

A consulta pode não encontrar referências relevantes. Reformule a busca por padrões visuais observados; nunca use os primeiros itens do catálogo nem padrões fixos por cliente. Tema escuro, glow, vidro e parallax são decisões do projeto. A primeira dobra deve ter composição e tratamento próprios, com efeitos que contribuam para legibilidade e identidade.

Inspecione as páginas retornadas pelo catálogo, registre os padrões aproveitados e diferencie a proposta dos projetos recentes. Tokens são sugestões e podem estar incompletos. recommended_components não fornece uma página pronta.

Siga .agents/skills/art-director/SKILL.md para gerar o briefing, escrever a proposta e validar a entrega. Antes do Builder, execute:

```bash
node .agents/skills/art-director/scripts/generate_art_direction.cjs cliente-slug --check
```

A presença de um arquivo art-direction.json ou de uma lista de referências não comprova que a etapa foi concluída. Não publique avaliações, números, selos ou capacidades sem evidência no material do cliente.
