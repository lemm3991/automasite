---
name: asset-analyzer
description: Cataloga assets do site a partir de inspeções visuais rastreáveis, preservando imagens desconhecidas como não confirmadas.
---

# Asset Analyzer

Siga o contrato de assets em docs/pipeline-evidence-contract.md. Use assets-manifest.json para descobrir arquivos; abra somente os úteis ao redesign e registre asset-review.json com hash, assunto observado, categoria, origem e legendas permitidas.

- Nome, extensão, dimensões e alt são pistas. Não transformam uma foto em equipe, procedimento, produto ou logo confirmado.
- Separe logo, favicon, ambiente, equipe, serviço, produto, vídeo/thumbnail, ícone e decoração. Mídia sem inspeção permanece unconfirmed.
- Pessoas e procedimentos só recebem nomes quando documentados; uma imagem publicada pelo cliente não comprova autoria, unidade ou resultado.
- Escolha o hero pela adequação e pelo recorte, sem selecionar automaticamente o primeiro arquivo. Não é necessário usar todas as imagens.

Execute o comando abaixo para gerar assets-catalog.json a partir das inspeções verificadas. O script não substitui a abertura das imagens nem inventa recomendações.

    node .agents/skills/asset-analyzer/scripts/analyze_assets.js --slug SLUG
