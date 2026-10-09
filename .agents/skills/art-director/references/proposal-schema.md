# Contrato da proposta de direção de arte

Escreva um objeto JSON em referencias/art-direction-proposal.json. O script importa os dados, valida fontes e caminhos e publica os arquivos finais. Não coloque modelos prontos ou fatos de outro cliente no gerador.

| Campo | Conteúdo |
| --- | --- |
| schema_version | Número 2. |
| slug | Identificador do cliente. |
| aesthetic_concept | Nome e descrição breve da direção escolhida. |
| client_understanding | Objeto com site_type, audience, objective e brand_context, baseados na leitura do site. |
| evidence | Lista de objetos com id, path e quote. path é relativo à pasta leads/slug; quote é um trecho literal de lead.json, site-atual.md ou outra fonte coletada. Use IDs como source-services. A própria proposta não é fonte. |
| reference_choices | Lista em ordem de importância; cada item contém id canônico, query realmente usada, reason, used_patterns (lista de textos) e inspection. |
| reference_choices[].inspection | path relativo à pasta Design System, quote literal da página, preview_checked=true após abrir o preview e visual_notes descrevendo o que foi visto. Use pagina_principal ou design_system_page do catálogo. |
| alternatives | Ao menos outra possibilidade, com concept e reason_not_selected. Compare adequação ao cliente, não sorteie um tema. |
| theme_tokens | primaryColor, secondaryColor, accentColor, backgroundColor, textColor (hex), headingFont, bodyFont, borderRadius (none/sm/md/lg/full), mode (light/dark), backgroundEffect (none/mesh/dots/prism) e enableParallax (boolean explícito). |
| copy | headline, subheadline, primaryCta e evidence_ids. Reorganize a copy preservando o significado, os números e as unidades. secondaryCta é opcional. |
| hero_specification | composition, desktop, mobile, cta_treatment, motion e reduced_motion (descrições concretas); asset_path relativo à raiz do projeto e image_alt. |
| hero_specification.asset_path | Foto em leads/slug/referencias/site-baixado/ ou public/assets/clients/slug/. Se não houver imagem adequada, use null e asset_reason explicando a composição escolhida. |
| hero_specification.credibility | Lista de objetos com text e evidence_ids. Use [] quando não houver provas adequadas. |
| section_flow | Lista em ordem; cada seção contém type, layout, purpose e evidence_ids. Inclua hero. Seções e variantes devem atender à copy e ao objetivo do site. |
| differentiation | Explique diferenças concretas quando a comparação apontar semelhança com uma direção anterior. Mudar só nome, foto ou cor de destaque não resolve um layout repetido. |

O validador verifica fontes locais, trechos, números, referências recuperadas pela consulta, caminhos, campos obrigatórios e repetição estrutural. A inspeção de preview é registrada pelo agente; não é executada pelo script. O agente continua responsável por revisar coerência, sentido das afirmações, unidades e legibilidade.

Use `--validate-only` durante a preparação. Ao publicar, art-direction.json recebe status READY_FOR_BUILDER e snapshots das fontes. `--check` revalida a proposta e detecta mudanças posteriores nas fontes. Propostas antigas sem esse contrato precisam ser refeitas pelo Agente 2A.
