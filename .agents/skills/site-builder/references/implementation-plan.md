# Contrato do plano de implementação

Arquivo por lead: leads/SLUG/redesign/implementation-plan.json. schemaVersion: 2. Incluir createdBy, a identidade real do executor.

Siga também `docs/pipeline-evidence-contract.md`: acrescentar source-evidence.json, source-review.json e asset-review.json às entradas; factIds a cada claim; desktop/mobile e selectors (logo,message,cta,identity,photo) ao hero; renderCheck (selector,minColumns?,styles?) a cada implementationEvidence. Descrição e legendas de assets devem corresponder à inspeção validada. Campos preenchidos não substituem verificação semântica e visual.

- slug, concept: cliente e conceito recebido do 2A.
- inputs: [{path}] com creative-brief.md, art-direction.json, design-selection.json, visual-handoff.json, site-atual.md, lead.json e assets-manifest.json. Caminhos relativos ao projeto.
- hero: {sectionId,direction,asset,baseComponent,action,changes:[]}. Descreva também ordem mobile, recorte, escala, CTA e movimento conforme o caso.
- references: [{id,sourcePath,stackPath,observations:[{excerpt,element,appliedTo:[sectionId],reinterpretation}]}]. excerpt é literal do HTML inspecionado; sourcePath corresponde à seleção atual. Sem aplicação concreta, registre como consultada e revise a seleção; não marque utilizada.
- assets: [{path,sourcePath,role,description,inspection:{method:"image-view",observed}}]. path é URL pública local presente no manifesto; registrar o assunto realmente visto.
- claims: [{id,text,sourcePath,sourceExcerpt,usedIn:[sectionId ou "business"]}]. Usar fonte factual, não score do auditor. Validar unidades, condições e sentido, além da presença textual.
- sections: [{id,type,variant,action,candidateComponents:[path],outputPath,reason,changes:[],referenceIds:[],claimIds:[],assetPaths:[]}]. action: keep/configure/adapt/create. Adapt/create usam src/clients/components/SLUG/VARIANT.astro. A quantidade de itens segue o conteúdo comprovado.
- similarityJustification: {outroSlug: justificativa específica}, quando necessária.
- upstreamCorrections e productionPending: registrar ajustes ao 2A e pendências reais.
- implementationEvidence: preencher depois do código, [{referenceId,sectionId,codePath,codeExcerpt,explanation}]. Pode ser atualizado sem mudar o plano fixado. Mudanças de escopo precisam de nova validação consciente; não validar de novo para esconder divergências.

Comandos:

    node scripts/validate-builder-implementation.cjs --slug SLUG --phase plan
    node scripts/validate-builder-implementation.cjs --slug SLUG --phase implemented

O gate comprova integridade, presença dos trechos e vínculos entre plano e código; não substitui julgamento visual ou verificação semântica dos fatos. Não calcula Visual Quality Score. configuration no plano é opcional: se fornecida para scaffold, deve conter ClientConfig completo já raciocinado, sem defaults de setor/cidade/contato.
