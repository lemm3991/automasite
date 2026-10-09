# Brotto Campelo — correção controlada

## Escopo

Correção da demonstração Brotto Campelo e dos falsos positivos reutilizáveis demonstrados pela auditoria. Mantidos os seis componentes/seções existentes, a direção jurídica e a arquitetura do fluxo. A regra de reutilização saudável e a configuração dos modelos do pipeline foram preservadas. Não houve execução do Comercial nem processamento de outro lead. A validação de esquemas e o build da plataforma enumeram rotas existentes; isso não executa o fluxo desses clientes.

## Correções da demonstração

- Logo laranja autêntico e paleta laranja/grafite, com a origem de cada token explicitada.
- Retrato dos sócios ampliado no desktop e no mobile, com os dois rostos visíveis. No celular, a foto antecede a mensagem de apoio e os CTAs; o parágrafo longo foi substituído por uma frase documentada.
- Selos reais em faixa compacta, com anos e distinção entre reconhecimento nacional e regional. Nenhuma premiação nova foi inventada.
- Diretório aberto de 12 áreas em lugar da sequência de cartões com descrições extrapoladas. Quatro áreas imobiliárias/registrais recuperadas e destacadas.
- Pilares em colunas abertas sobre grafite, sede com fotografia/endereço reais e contato mais simples. Menor repetição de caixas.
- Botões retangulares, navegação textual e retrato sem badge flutuante, para afastar a composição da apresentação médica do IORC sem exigir diferença artificial de todos os elementos.
- Áreas agora abrem páginas reais do escritório; localização, telefone, e-mail, WhatsApp e âncoras têm destinos. Não foi enviada mensagem por esses canais.

Arquivos de implementação: `src/clients/data/brotto-campelo.ts` e os seis componentes existentes, mais `legal.css`, em `src/clients/components/brotto-campelo/`.

## Alegações removidas e causa comprovada

Foram removidos da apresentação:

1. Infraestrutura para assembleias societárias e conferências internacionais.
2. Atuação específica com contratos de software/SaaS e inteligência artificial.
3. Operações de crédito rural por CPR.

O inventário anterior de textos, preservado em `before/leads/brotto-campelo/redesign/`, mostra as três frases como `kind: editorial`, com a justificativa genérica “Texto descritivo editorial contextualmente alinhado à apresentação jurídica”. Não havia vínculo a fatos documentados. O gerador antigo classificava textos não reconhecidos como editorial e aprovava o conjunto. Direito Digital e Agronegócio documentados não comprovam automaticamente os serviços específicos adicionados.

O gerador anterior da revisão visual também continha a nota 9.1, a declaração de factualidade integral e as três referências como aplicadas. Esses dois geradores antigos foram desativados com erro explícito; seu conteúdo foi preservado para diagnóstico, sem poder sobrescrever novas revisões como aprovadas.

## Paleta final

| Papel | Cor | Classificação | Origem |
| --- | --- | --- | --- |
| Laranja principal | `#e15927` | `official` | Cor dominante exata do logo real `01-BCA-logos-03-1024x205.png`: 36.033 pixels opacos. |
| Grafite: texto, botões e faixa institucional | `#292929` | `neutral` | Neutro editorial coerente com a identidade observada; não declarado cor oficial. |
| Laranja escurecido: textos pequenos/links/hover | `#a83d19` | `inferred` | Evolução escurecida do laranja do logo para legibilidade. |
| Fundo quente | `#f7f4f0` | `neutral` | Neutro editorial para acolher as fotografias e a marca laranja. |
| Superfícies brancas | `#ffffff` | `neutral` | Branco neutro de conteúdo. |

Auxiliares de acabamento em `legal.css`: `#d8d2ca`, `#55504b`, `#5e5851`, `#8c8378`, `#615c56`, `#666666`, `#6d625a`, `#d7d1cb` e `#e8e4df` são neutros editoriais de regras/texto. `#f1a085` é uma variação clara inferida do laranja para texto sobre grafite. O verde do botão compartilhado de WhatsApp identifica o canal e não foi promovido à paleta institucional.

`#0693e3` foi excluído da identidade: sua presença em presets WordPress não demonstrava uso relevante pela marca. A descrição do logo laranja e da variante branca/transparente foi corrigida. Nenhum token final depende da classificação `observed`; ela continua disponível para uso efetivamente comprovado em futuros sites/assets.

## Especialidades recuperadas

- Direito Imobiliário Aplicado — Imobiliárias.
- Direito Imobiliário Aplicado — Construtoras e Incorporadoras.
- Direito Imobiliário Aplicado ao Direito Público.
- Registral e Notarial.

Os vínculos constam em `referencias/source-review.json`, com página, seletor e trecho literal. Foram adicionados também os vínculos dos anos das premiações e dos textos institucionais já presentes no material baixado. A revalidação do Prospector usou o snapshot existente, sem declarar uma nova coleta online.

## Correções reutilizáveis

### Factualidade

`scripts/lib/audit-claims.cjs` e `review-evidence.cjs` exigem avaliação semântica explícita de cada texto renderizado. Alegações de identidade, serviço, capacidade, segmento, infraestrutura, especialização, credencial, contato e quantidade são separadas de copy aspiracional/navegação/rótulos. Conteúdo factual exige vínculo e correspondência com fato liberado; editorial/interface exige ausência de alegação verificável e escopo explícito. A revisão final tem executor diferente do Builder. O detector lexical é uma barreira auxiliar, não uma prova automática de veracidade.

### Identidade

`scripts/lib/asset-evidence.cjs` diferencia official/observed/inferred/neutral, mede cores exatas do logo e identifica presets WordPress. Declaração CSS sem uso comprovado não basta. Prioridade documentada: logo real → estilos efetivamente usados → assets → inferência explícita.

### Design Systems

O plano pode registrar uma referência consultada como NOT_MATERIALIZED sem inventar influência. A revisão final classifica cada referência como STRONG, PARTIAL, SUPERFICIAL ou NOT_MATERIALIZED, com benefício e limites. STRONG exige padrões composicionais e evidências da fonte/renderização; fonte isolada, raio, borda ou scroll não bastam. Múltiplas aplicações declaradas da mesma referência são conferidas individualmente.

### Anti-clone e julgamento visual

O índice automático permanece heurístico. O gate exige comparação por screenshots dos três vizinhos disponíveis, dos casos explicitamente indicados e de todos com índice alto, mesmo quando os primeiros índices são baixos. O registro cobre hero, posição texto/imagem, badges, ordem, grids, ritmo, imagens, backgrounds, cards, tipografia e CTAs, com semelhanças, diferenças e estimativa perceptiva explicada.

Notas deixam de ser preenchidas por gerador fixo e exigem justificativa/evidências. O relatório precisa registrar acertos, limitações e comparação com o original; hashes ligam a revisão às capturas atuais. Os verificadores não tentam reproduzir a nota de outra auditoria e não medem estética por fórmula. Ainda dependem de inspeção honesta por um executor independente; campos preenchidos não provam, sozinhos, que uma imagem foi vista.

O contrato e as skills de Diretor de Arte, Builder, Builder Handoff e Visual Auditor foram alinhados a essas regras. O formato geral do pipeline foi mantido.

## Verificações executadas

- 39 testes aprovados, cobrindo os falsos positivos e a regressão dos gates existentes.
- Validação dos esquemas: zero erros.
- Build final do Brotto: aprovado, com log e hash registrados.
- Implementação: gate aprovado.
- Capturas finais: desktop 1440×900 e página completa; mobile 390×844 e página completa.
- Render Validation: aprovado, sem erros nem avisos. Isso é validação técnica, não a nota estética.

## Resultado independente

Executor: `codex-independent-brotto-review`, distinto do Builder. Abriu 22 capturas e conferiu os 61 textos únicos renderizados, fontes e assets.

- **Nota visual independente: 8,2/10.**
- **Similaridade percebida com IORC: 30%.** Estimativa visual explicada, não cálculo por código.
- **Architecture Studio: PARTIAL.** Faixa e divisória de credenciais úteis, com influência limitada.
- **AI SaaS Landing 27: SUPERFICIAL.** Tipografia presente; composição da referência não foi traduzida.
- **Luxury Real Estate 22: NOT_MATERIALIZED.** Scroll suave não comprova influência visual.
- **Veredito: READY_FOR_DEMO.**

Limites mantidos no parecer: legendas/anos pequenos; menos atalhos de equipe, blog, materiais e simulador que o site original; semelhança editorial de cerca de 60% com D&L. Não há promessa de composição inédita, migração integral ou funcionalidade de produção. A correção tornou as decisões mais adequadas ao Brotto; não prova, sozinha, a qualidade de todos os leads futuros.

Detalhamento: [auditoria independente](independent-audit.md) e `leads/brotto-campelo/redesign/visual-review.json`. A aprovação técnica e o julgamento qualitativo permanecem evidências separadas.
