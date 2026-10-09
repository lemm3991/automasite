# Consulta do acervo de referências

Use o acervo antes de criar a direção de arte. Primeiro leia a copy, os serviços, a marca e as imagens reais do cliente; depois procure referências por contexto e por características visuais.

## Busca

```bash
node "Design System/search.cjs" --query "saúde atendimento clínica" --top 5
node "Design System/search.cjs" --query "tipografia condensada fotografia composição assimétrica" --top 5 --json
node "Design System/search.cjs" --nicho "arquitetura" --estilo "fotografia grid" --tema claro
```

O motor compartilhado em search-core.cjs faz recuperação lexical com sinônimos, pontuação por campo, cobertura mínima e diversidade entre famílias. search.py é uma interface de compatibilidade que chama o mesmo motor Node. Não há embeddings nem avaliação visual automática.

Cada resultado informa score, match_reasons, match_kind, pagina_principal e design_system_page. Tema é um filtro, nunca prova de relevância. Uma busca sem correspondência retorna uma lista vazia: formule uma nova consulta por composição, tipo de imagem e tipografia a partir do cliente. Não use os primeiros itens do catálogo como substitutos.

O JSON da CLI traz evidências resumidas para economizar contexto. Use --full somente quando precisar do inventário completo de fontes e hashes; os mesmos dados estão em catalog.json.

Abra a página principal e o design system dos candidatos e confira o preview. Escolha uma referência principal; referências de apoio devem ter uma função clara. Um modelo de outro setor pode fornecer uma composição útil, mas não fornece serviços, avaliações, números ou imagens para o cliente.

## Fontes e manutenção

- catalog-profiles.json contém o contexto e os setores revistos no conteúdo salvo. Padrões manuais devem corresponder ao HTML.
- catalog.json reúne os perfis, sinais do HTML/CSS e source_evidence com caminhos e hashes. A inspeção é estática; render_verified=false explicita que o preview não foi validado pelo indexador.
- pagina_principal é a landing page original; design_system_page pode ser uma página separada de componentes. Confira ambas.
- Fontes carregadas por @font-face não significam fontes utilizadas. O índice procura regras efetivamente aplicadas ao body e ao título.
- tokens são sugestões editáveis; null significa identificação incompleta. Consulte a fonte e defina os valores para o projeto. Primária, acento, bordas e efeitos exigem decisão do Diretor de Arte.
- recommended_components fica vazio: a escolha dos componentes depende da composição do projeto.
- IDs de variantes são únicos. O ID legado echelon.aura.build é ambíguo: use a variante --claro ou --escuro conforme seu caminho. O tema observado pode diferir do nome da pasta.
- Famílias como Concrete Dreams e Langfuse evitam que versões semelhantes ocupem todas as posições na busca.

Depois de editar os perfis ou o material fonte:

```bash
npm run design-systems:index
npm run design-systems:check
npm run test:design-systems
```

O indexador valida IDs e arquivos antes de gravar o catálogo. Não altera as páginas do acervo. Não edite metadados gerados esperando que sobrevivam à reindexação.

## TypeScript

src/lib/design-systems.ts expõe queryDesignSystems e getDesignSystemTokens usando o mesmo motor da CLI. A consulta pode retornar []; a recomendação pode retornar null; os tokens também podem estar incompletos. O Builder deve consumir art-direction.json validado, adaptar o código dos componentes e customizar o hero quando necessário. A biblioteca não escolhe automaticamente uma página pronta para cada setor.
