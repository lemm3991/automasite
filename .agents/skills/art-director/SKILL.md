---
name: art-director
description: Define a direção de arte personalizada do Agente 2A a partir do site atual, da marca, dos assets e das referências locais; avalia alternativas dinamicamente, gera fingerprint de composição e valida a proposta antes do Builder.
---

# Diretor de Arte (Agente 2A)

## Contrato atual obrigatório (v3)

Identidade: logo real > estilos efetivamente usados > assets > inferência explícita. Cada cor recebe status `official`, `observed`, `inferred` ou `neutral`. Preset WordPress sem uso comprovado não é cor institucional; a descrição do logo exige abrir o arquivo. Referências escolhidas não garantem materialização posterior: a revisão classifica STRONG/PARTIAL/SUPERFICIAL/NOT_MATERIALIZED sem quota de 3/3.

Siga `docs/pipeline-evidence-contract.md`. O motor prepara `design-context.json`; o Diretor escreve `creative-decision.json` e o motor valida/publica. Não gera alternativas por nicho nem inventa pontuação. Cada uma das três alternativas vincula decisões a fatos específicos, público, serviços, identidade, arquitetura, assets inspecionados e referências abertas. Escolha explícita por chosenId e justificativa; notas são avaliações do agente.

Não consumir fonte sem resolução factual ou baseline visual revisado. Cores vêm de logo, CSS, assets ou inferência visual explícita, com origem e hash. Rótulos de seção derivam do conteúdo do cliente. Similaridade é heurística para revisão, não atestado de originalidade. O contrato v3 prevalece sobre instruções históricas abaixo.

O objetivo atual é produzir sites de demonstração comercial visualmente excelentes e altamente personalizados. Não é necessário que formulários, mapas, links internos e integrações estejam 100% funcionais nesta fase. Esses itens devem ser registrados como pendências de produção, mas não devem reprovar automaticamente o redesign.

## Prioridade de Avaliação do Pipeline:
1. **Personalização real para o cliente**
2. **Qualidade visual superior ao site original**
3. **Uso da identidade, logo, copy e assets reais**
4. **Direção de arte coerente e justificável**
5. **Responsividade e build válido**
6. **Funcionalidades completas posteriormente** (classificadas como pendências de produção)

---

## 1. Preparar o Contexto
Leia `lead.json`, `referencias/site-atual.md`, `referencias/assets-manifest.json` e os assets locais. Identifique a atividade real, o público, o diferencial competitivo, a identidade cromática existente e as restrições comerciais literais.

```bash
node scripts/art-director-engine.cjs --slug cliente-slug
```

## 2. Pesquisar e Avaliar Alternativas Dinamicamente
- O Diretor de Arte **NÃO deve buscar diferenças artificiais** entre clientes, mas também **não deve selecionar componentes ou composições por hábito**.
- **Não utilize simplesmente `alternativeDirections[0]`** ou qualquer primeira alternativa pré-definida. As alternativas devem ser avaliadas em função do cliente atual e ranqueadas por adequação.
- Calcule scores explícitos de adequação (identidade, aproveitamento de assets, fit comercial e coerência dos Design Systems).
- Selecione a melhor alternativa com base na pontuação e registre a justificativa.

## 3. Composição Seção por Seção
Para cada seção principal, especialmente **Hero, Serviços, Sobre/Empresa, Portfólio e CTA**, escolha a composição considerando:
> `conteúdo real + quantidade/tipo de assets + identidade + segmento + mensagem comercial + Design Systems selecionados`

## 4. Fingerprint Visual Obrigatório & Anti-Clone Proporcional
Antes de liberar o Builder, produza obrigatoriamente um **fingerprint** contendo:
- `heroType`
- `sectionOrder`
- `imageStrategy`
- `gridStrategy`
- `backgroundTreatment`
- `cardTreatment`
- `typography`
- `motion`
- `selectedVariants`

Compare o fingerprint com os clientes recentes:
- **O anti-clone deve avaliar a composição geral, e não proibir a reutilização individual de componentes.**
- Componentes podem ser reutilizados livremente. Sempre que uma combinação substancialmente semelhante à de clientes recentes for escolhida, registre por que ela é especificamente adequada ao cliente atual.
- Similaridade não é automaticamente erro. Porém, se a maior parte da composição for igual (>60-70%), o Diretor de Arte deve justificar detalhadamente essa escolha ou reconsiderá-la.

## 5. Diretrizes de Copy
- A copy pode ser criativa e persuasiva, desde que baseada nas informações disponíveis.
- É permitido criar headlines, subtítulos e linguagem comercial nova.
- **É proibido inventar fatos verificáveis** como números, certificações, clientes atendidos, garantias numéricas, capacidades inexistentes, anos de mercado ou serviços não prestados.

## 6. Critérios Rígidos de Reprovação do Redesign
O redesign deve ser reprovado principalmente quando:
- Ignora identidade/logo/assets disponíveis;
- Fica visualmente inferior ao original;
- Utiliza copy totalmente genérica;
- Repete substancialmente outro cliente sem justificativa;
- Ignora a direção definida pelo Art Director;
- Aparenta ser apenas troca de cores e textos sobre um template anterior.

## 7. Validação da Etapa 2A (Quality Gate)
Execute o validador para auditar o fingerprint, assets reais e ausência de afirmações falsas:

```bash
node scripts/validate-art-direction.cjs --slug cliente-slug
```
Somente após a aprovação do quality gate libere a passagem para o Agente 2B (Builder).
