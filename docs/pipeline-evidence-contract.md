# Contrato de evidências do fluxo

Os scripts coletam, medem e validam. Os agentes definidos em `.agents/models.json` interpretam o cliente, criam e inspecionam as imagens. Estados `NEEDS_*` retornam ao agente da etapa; não significam pedir autorização humana ou inventar um fallback.

## Prospector

1. `node scripts/prospector-engine.cjs --slug SLUG --url URL --name NOME --niche NICHO` coleta HTML, assets e capturas. `--from-snapshot` reprocessa somente fontes já baixadas; registrar essa modalidade, sem declarar nova coleta online.
2. `source-evidence.json` contém páginas deduplicadas, texto, seletores, formulários/campos, links, candidatos e ambiguidades. Não equivale a fatos liberados.
3. O agente escreve `referencias/source-review.json`:
   - `niche`, `audience`, `businessModelReason` derivados das fontes;
   - `facts`: `{id,kind,entityId,value,status,evidence:[{pageId,selector,quote,attribute?}]}`. `kind` inclui name, service, phone, address, city, state, hours, founders, positioning, identity, architecture. `value` é literal; interpretações pertencem à justificativa, não ao valor;
   - `status`: verified, conflicting, unconfirmed. Conflitos têm `alternatives:[{value,evidence}]`; uma escolha exige `resolution:{selectedValue,reason}`. Preservar todas as versões;
   - entidades separam empresa e unidades. `primaryEntityId` e `primaryEntityReason` escolhem explicitamente o contato prioritário;
   - `ambiguityResolutions:[{kind,values,factIds,reason}]` deve cobrir cada valor concorrente descoberto. Múltiplas unidades não são fundidas em um endereço;
   - `operationalCriteria:[{label,weight,score,finding,reason,factIds,evidence}]`: pelo menos três critérios específicos, pesos somando 1, notas observadas de 0–10. Nicho não justifica notas prontas. Ausência de formulário não é defeito por padrão;
   - `elementClaims:[{kind,pageId,selector}]`: form, field, cta ou section só podem ser declarados se existirem no HTML.
4. O agente abre os assets úteis e escreve `asset-review.json`: `{assets:[{path,sha256,category,method:'image-view',reviewedBy,reviewedAt,description,observableDetails:[],allowedCaptions:[],provenance}]}`. Categorias: logo, favicon, environment, team, service, product, video, thumbnail, icon, decoration. Provenance: client-source, stock, unknown. Origem no site não prova que pessoas são fundadores nem que fotos representam determinado procedimento. Use descrições neutras quando necessário. Dimensões servem para tamanho/recorte.
5. Reprocessar `--from-snapshot`, executar `validate-prospector-handoff.cjs --slug SLUG`. Somente fatos liberados aparecem no handoff. Conflitos e sua resolução permanecem rastreáveis.
6. Abrir quatro screenshots originais e escrever `visual/original-review.json`: method, reviewedBy, reviewedAt, inspections `{path,sha256,finding,regions:[{x,y,width,height,description}]}`, firstFold `{desktop,mobile}`, preserve, improve, limitations. Notas são opcionais, com scoreReason/opportunityReason. Executar `validate-original-review.cjs`.

## Diretor de Arte

`node scripts/art-director-engine.cjs --slug SLUG [--query PADRÃO]` gera `design-context.json`. A recuperação é lexical no catálogo revisado, não análise visual automática. Não há fallback para primeiros itens. Ampliar a busca quando não houver referências pertinentes.

O agente abre os HTML/STACK e escreve `creative-decision.json` (schemaVersion 3):

- slug, createdBy, createdAt, contextSha256 (hash do contexto JSON), typography `{heading,body}`, themeMode;
- references `{id,sourceSha256,observations:[{excerpt,benefit,factIds}]}`;
- três alternatives `{id,concept,rationale,tradeoff,clientTriggers:[{factIds,decision}],contextBindings,assetPaths,referenceIds,composition,assessment}`;
- contextBindings cobre positioning, audience, services, identity, architecture com `{factIds,reason}`. Inferências de público devem ser explicitadas na razão. Cada alternativa exige ao menos dois fatos específicos e composição distinta;
- composition cobre heroType, sectionOrder, imageStrategy, gridStrategy, backgroundTreatment, cardTreatment, typography, motion, ctaStyle, rhythm;
- assessment: identity, assets, audience, references, cada qual `{score:0–10,reason}`. Valores vêm da avaliação do agente, não de índice da alternativa;
- chosenId e selectionReason explícitos. O ranking resume avaliações; não escolhe automaticamente o primeiro;
- hero `{desktop,mobile,assetPath}`; se não há foto adequada, assetPath null e noPhotoReason;
- sections `{id,type,title,variant?,factIds,compositionRationale}`;
- palette: background, primary, secondary, accent, text `{value,status,source,path,sha256,reason}`. Status: `official` para cor medida no logo validado; `observed` para uso efetivamente comprovado no site ou asset; `inferred` para evolução explicitamente justificada; `neutral` para neutros editoriais. Prioridade: logo real → estilos efetivamente usados → assets → inferência explícita. Presets WordPress e declarações CSS sem prova de uso não são identidade institucional. Usar `palette-candidates.json`; CSS observado exige `usageVerified`. Neutros usam source `editorial-neutral`. Não converter amostra de foto em cor oficial.

Reexecutar o motor publica briefing, direção, seleção e handoff. `--check` valida sem publicar. Alteração das fontes invalida o contexto.

## Builder

Plano schemaVersion **2**, com createdBy e as entradas anteriores mais source-evidence.json, source-review.json e asset-review.json. Claims incluem factIds liberados. Descrição de asset deve coincidir com a inspeção validada. Manter configure/keep, adapt e create; não aumentar arquivos para parecer original.

hero inclui desktop, mobile e selectors `{logo,message,cta,identity,photo}`. Um seletor pode ser null quando o elemento foi conscientemente omitido. A captura registra existência, posição e parcela visível em cada viewport; foto fora da primeira dobra exige avaliação, não reprovação automática.

Cada implementationEvidence inclui renderCheck `{selector,minColumns?,styles?}`. Para grid, informar minColumns: 2 ou mais. Um trecho CSS presente e inativo não comprova aplicação. Registre também em figure/figcaption a relação imagem-legenda; alt e legendas devem constar em allowedCaptions ou description da inspeção.

Uma referência pode ter `decision: NOT_MATERIALIZED`, justificativa e `observations[].appliedTo: []`. Isso é preferível a forçar influência cosmética para completar 3/3. Para alegar influência forte, registrar pelo menos dois `compositionalEvidence` com `sourceExcerpt` existente no HTML da referência e `reinterpretation` específica. A regra de reutilização saudável permanece igual.

## Auditor Visual independente

O auditor deve ser executor distinto do Builder e abrir efetivamente as imagens. Campos preenchidos não comprovam inspeção. Scripts verificam contradições mensuráveis e atualidade, não a capacidade estética do auditor.

Após build e captura, `render-evidence.json` inclui geometria da primeira dobra, propriedades dos elementos inspirados nas referências, inventário de textos e imagens.

`redesign/factual-review.json`: status, reviewedBy distinto do Builder e textReviews `{id,kind,reason,factIds?,claimAssessment:{type,reason}}` para todo texto renderizado. id é SHA256 de `selector + '\n' + text`. kind: factual, visual, editorial, interface. Tipos de alegação: identity, service, capability, audience, infrastructure, specialization, credential, contact, quantity, none. Toda alegação de serviço, capacidade, público/segmento, infraestrutura ou especialização exige fonte; chamar texto de editorial não o isenta. Factual exige texto literal ou trecho normalizado de um fato liberado; paráfrases de alegações devem ser conferidas e vinculadas às fontes antes de publicação. Visual usa assetPath e descrição/legenda aprovada. Editorial/interface usa type none e editorialScope aspirational, navigation ou section-label. Criatividade sem alegação verificável é permitida; texto não classificado permanece pendente. Detector lexical é apenas uma barreira auxiliar, nunca substitui a revisão semântica independente. Examine também contexto de imagens e legendas.

`visual-review.json`, schemaVersion 3 e auditContractVersion 2, conserva status/method/reviewedBy/reviewedAt/screenshotHashes/observations/regressions/limitations e acrescenta:

- technicalEvidence `{renderSha256}` e factualEvidence `{sha256}` do relatório factual;
- visualAnalysis.inspections `{path,sha256,regions:[{x,y,width,height,description}]}` para primeira dobra e página completa desktop/mobile;
- visualAnalysis.viewports `{viewport,finding,firstFold:{logo,message,cta,identity,photo}}`; cada item tem inFirstFold, finding e tradeoff quando a foto fica abaixo;
- visualAnalysis.references `{referenceId,sectionId?,classification,benefit,limitations}` para todas as referências: STRONG, PARTIAL, SUPERFICIAL ou NOT_MATERIALIZED. STRONG exige ao menos dois patterns `{kind,finding,evidencePaths}` composicionais, compositionBenefit e fontes composicionais no plano. Fonte isolada, raio, borda ou scroll suave não bastam. PARTIAL também exige elemento renderizado; SUPERFICIAL reconhece influência cosmética; NOT_MATERIALIZED registra ausência, sem sectionId se não houve implementação;
- visualAnalysis.antiClone `{slug,method:'screenshot-comparison',conclusion,observations:{hero,placement,badges,order,grids,rhythm,images,backgrounds,cards,typography,cta},similarities:[],differences:[],perceivedSimilarity,screenshotHashes}`. Abrir capturas desktop/mobile atuais dos dois clientes. Percentual é estimativa perceptiva justificada, nunca função de hash/código. Comparar os três clientes disponíveis mais próximos, todos com heurística >=65 e os explicitados em requiredVisualComparisons, mesmo que a heurística seja baixa. Semelhança não condena reutilização; avaliar adequação específica;
- qualityAssessment `{strengths,limitations,originalComparison}`: acertos/limites com finding e evidencePaths; comparação explícita com o original em pelo menos quatro aspectos. Notas opcionais em qualitativeScores têm `{score,reason,evidencePaths}`. Nunca preencher notas constantes ou ajustar para concordar com outra auditoria;
- regressions graves usam `{severity:'critical',resolved:false,...}` e impedem aprovação.

O handoff exige as três camadas. Backend, mapas e integrações podem continuar pendentes. Parar antes do Comercial quando a execução assim determinar.
