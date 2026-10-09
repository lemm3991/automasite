---
name: design-reference-selector
description: Recupera e compara referências do acervo local Design System a partir do contexto e dos padrões visuais desejados, com pontuação, motivos e caminhos verificáveis.
---

# Seleção de referências

Leia primeiro o material do cliente: atividade, público, copy, identidade e imagens disponíveis. Consulte o acervo por contexto e por padrões visuais; o nome do nicho sozinho pode não ter correspondência.

```bash
node "Design System/search.cjs" --query "descrição do contexto ou da composição" --top 5 --json
node .agents/skills/design-reference-selector/scripts/select_design_reference.cjs --slug cliente --nicho "atividade real" --estilo "características visuais"
```

A interface Python continua disponível e delega ao mesmo motor Node. Falhas e baixa relevância não produzem referências genéricas. Use pagina_principal e design_system_page retornados pelo catálogo, sem montar caminhos manualmente.

O seletor grava design-system-selected.json com status CANDIDATES_FOR_REVIEW, pontuação e motivos. Isso é uma lista de candidatos, não a direção de arte final. Inspecione o preview e o código dos candidatos e descreva o que será aproveitado de cada um. Referências de outro setor fornecem padrões visuais; a copy e as informações continuam vindo do cliente.

Consulte Design System/AGENTS.md para manutenção e limites da extração. Tokens ausentes exigem inspeção; tokens presentes são sugestões para adaptar à marca. A composição das seções e dos componentes será definida na proposta do Diretor de Arte. Não gere outro design-system.html para cada cliente.
