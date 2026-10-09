# Correções estruturais e reexecução do D&L

Data: 07/10/2026. Escopo: Prospector → Diretor de Arte → Builder → Capturas → Auditor Visual. Somente o D&L foi reexecutado; não houve Comercial, envio, publicação ou nova prospecção de outro lead.

## 1. Critérios industriais removidos

O Prospector deixou de gerar matriz B2B industrial, exigências de cotação/especificações e notas fixas para qualquer empresa. A matriz agora é fornecida pelo agente, com pelo menos três critérios fundamentados nas fontes do cliente, pesos explícitos e observações. Não encontrar um formulário deixa de ser uma deficiência presumida.

O coletor preserva páginas, seletores, títulos, textos, formulários/campos e links reais. Uma declaração de form#wpforms-385 sem elemento correspondente falha na validação. Dois auxiliares antigos também foram corrigidos: o extrator não inventa serviços/diferenciais ausentes e o analisador de assets não classifica imagens desconhecidas como serviços por padrão.

## 2. Conflitos factuais

Cada afirmação tem estado verified, conflicting ou unconfirmed, entidade/unidade, trecho e seletor da fonte. Conflitos mantêm as alternativas. Uma escolha só é liberada com valor e justificativa explícitos; informações não confirmadas não são passadas como fatos ao Builder.

No D&L, Pedra Branca/Palhoça e Agronômica/Florianópolis permanecem separadas. O endereço de São Paulo e o horário genérico de /servicos foram preteridos em favor da seção identificada de cada unidade na home, com o conflito registrado. Dois links de WhatsApp com números inconsistentes foram excluídos; os novos links derivam dos números completos exibidos por unidade. Isso é resolução documental, não confirmação com a empresa.

## 3. Classificação de assets

Dimensão identifica resolução, não assunto. Logo, ambiente, equipe, serviço, produto, vídeo/thumbnail, ícone e decoração são separados; arquivos sem inspeção ficam não confirmados. A descrição exige arquivo aberto, hash atual, detalhes observados e legendas permitidas.

Foram baixados 10 assets, inspecionados 6 e usados 4 no novo site: logo, ambiente e duas miniaturas do acervo. A foto do ambiente não foi atribuída a uma unidade específica; pessoas não foram identificadas como fundadores e as miniaturas não receberam procedimentos inferidos.

## 4. Alternativas criativas dependentes do cliente

O motor não contém três conceitos prontos por nicho. Ele prepara contexto, recupera referências, verifica as decisões do agente e publica os entregáveis. Cada proposta exige vínculos com posicionamento, público, serviços, identidade, arquitetura, assets e referências, além de avaliação justificada e composição distinta.

No D&L foram comparadas: A — Um espaço para o seu estilo; B — O seu próximo visual; C — Duas casas, o mesmo cuidado. A venceu pela qualidade da foto do ambiente e adequação à proposta de conforto. B dependia de miniaturas pequenas; C priorizava localização e enfraquecia a apresentação estética. A vencedora estava na terceira posição do arquivo, sem seleção automática do primeiro item.

## 5. Origem da paleta

As cores passam a exigir origem: logo, CSS, amostra de asset ou inferência visual explícita. Não há inferência por palavras como “Redes”. Dourado #f0d0a0 foi medido no logo. Verde #213e35 é uma interpretação escurecida das cadeiras vistas na foto, documentada como inferência — não como cor oficial. Creme e texto escuro são neutros escolhidos para contraste.

## 6. Afirmações incorretas eliminadas do D&L

- Critérios e vocabulário industriais aplicados ao salão.
- Formulário wpforms inexistente.
- Cidade de prospecção misturada com endereço de outra unidade.
- Telefones incompletos nos CTAs.
- Horários começando na terça-feira: a fonte informa Segunda a Sábado, até 21h em Pedra Branca e 21h30 em Agronômica.
- Procedimentos não documentados e legendas que confundiam corte masculino, cabelos e ambiente.
- Contador fictício de uma mensagem no botão compartilhado de WhatsApp, removido para todos os próximos clientes.
- Aprovação visual por notas constantes ou pela simples presença de campos.

O cardápio contém os 12 serviços documentados. Douglas e Luciano só aparecem na afirmação de fundação que consta no site original. Não foram acrescentados avaliações Google, selos, estatísticas ou garantias.

## 7. Componentes

| Componente | Decisão | Motivo |
|---|---|---|
| Header01 | Adaptado | Marca legível e agendamento pela escolha de unidade |
| SalonHero | Novo | Foto à esquerda, hierarquia editorial e ordem mobile própria |
| Services01 | Adaptado | Menu de 12 serviços com descrições em expansão, sem cartões repetitivos |
| Showcase01 | Adaptado | Fotografias verticais, legendas conferidas e apresentação breve |
| SalonUnits | Novo | Dois conjuntos separados de endereço, horário e contato |
| Footer01 | Reutilizado | Rodapé simples já atendia à necessidade |

São seis seções: três adaptações, dois componentes novos e um reutilizado. Não houve meta de criar nove arquivos ou reduzir hashes. O percentual automático continua apenas como indicação para revisão.

## 8. Primeira dobra e comparação

No desktop 1440×900, a foto real ocupa o lado esquerdo e a mensagem/CTA o direito. No mobile 390×844, logo, mensagem, foto e CTA aparecem na primeira dobra. O mobile reorganiza os elementos e recorta conscientemente a foto do ambiente. Há movimento curto de entrada e respeito a preferência por movimento reduzido.

Build e render passaram, sem imagem quebrada ou rolagem horizontal. A captura original foi complementada com rolagem mais lenta para revelar serviços e apresentação; a mesma espera entrou no coletor reutilizável. Embeds externos de vídeo/mapa continuam limitando a captura do original e não servem como prova de superioridade do redesign.

Comparativos: [desktop novo](<D:/projetos antigravity/Site automatico/leads/dl-cabeleireiros/redesign/screenshots/home-desktop.png>), [mobile novo](<D:/projetos antigravity/Site automatico/leads/dl-cabeleireiros/redesign/screenshots/home-mobile.png>), [original completo](<D:/projetos antigravity/Site automatico/reports/dl-reexecution/original-desktop-full-slow.png>). A versão anterior foi preservada em reports/baselines/dl-cabeleireiros-before-evidence-v4/.

## 9. Design Systems materializados

- architecture-studio: escala serifada, itálico e hierarquia editorial da abertura.
- green-museum: enquadramento vertical e relação entre fotografia e legenda.
- barbershop-landing-51: hierarquia entre nome e descrição de serviço; transferência limitada por ser um padrão comum. Os acordeões são decisão do Builder.

A busca continua lexical, com pontuação e fontes locais; não foi apresentada como embeddings ou visão automática. O acervo não foi reclassificado nesta rodada. A aplicação visual é julgada pelo auditor, que pode marcar partial em vez de declarar artificialmente 3/3.

## 10. Resultado independente

Auditoria realizada por /root/independent_dl_review, executor distinto do Builder. Resultado: **APROVADO PARA DEMONSTRAÇÃO**. O handoff final foi gerado como **READY_FOR_DEMO**, sem erros.

| Critério | Nota / 10 |
|---|---:|
| Prospector | 8.7 |
| Diretor de Arte | 8.3 |
| Builder | 8.5 |
| Personalização real | 8.5 |
| Qualidade visual | 8.4 |
| Fidelidade factual | 9.5 |

O auditor conferiu 107 registros de seletor/texto (81 textos distintos), 21 capturas e os quatro assets usados. Julgou o novo redesign superior ao original e à versão anterior, sem usar vazios de carregamento do original para inflar a avaliação. Não identificou duplicação de componente sem necessidade: três adaptações justificadas, dois componentes novos justificados e uma reutilização saudável.

**Referências: 2/3 claramente materializadas e 1/3 parcial.** Similaridade percebida: **20–30% com Delta Pan** e **25–35% com São Jorge**; faixas subjetivas. A heurística automática foi 39% com ambos e não determinou a aprovação.

Ressalvas aceitas: miniaturas de baixa resolução, rótulos pequenos, leve sobreposição do WhatsApp em parte do título de serviços no mobile e necessidade de confirmar operacionalmente as fontes conflitantes antes da publicação. A foto e o CTA do hero ficam integralmente visíveis nos dois tamanhos. Nenhuma regressão crítica foi registrada.

[Parecer independente completo](<D:/projetos antigravity/Site automatico/reports/dl-reexecution/independent-audit.md>) · [Handoff final](<D:/projetos antigravity/Site automatico/leads/dl-cabeleireiros/redesign/builder-handoff.json>)

A aprovação demonstra melhoria neste lead; não é certificação de qualidade universal do fluxo ou de conversão comercial.

## Verificações e limite da conclusão

44 testes de regressão passaram: evidências, Builder e catálogo. Os casos sintéticos incluem salão, clínica, cafeteria, arquitetura e indústria; não são cinco clientes reais executados. O comando de conferência do 2A foi corrigido para não reescrever o contexto de busca durante uma validação. Rotas antigas de execução também deixam de substituir nota visual ausente por nota operacional ou concluir um handoff sem candidato qualificado.

Esta reexecução foi feita pelo Codex. A configuração central Gemini em .agents/models.json foi preservada; não houve execução real dos modelos Gemini no Antigravity. O teste comprova o novo contrato e esta demonstração, não garante qualidade futura sem o agente raciocinar e o auditor inspecionar.

Principais implementações: scripts/lib/source-evidence.cjs, prospector-evidence.cjs, asset-evidence.cjs, art-direction-evidence.cjs, builder-implementation.cjs, render-observations.cjs, review-evidence.cjs; instruções e contratos correspondentes em .agents/ e docs/pipeline-evidence-contract.md.

Execução encerrada antes do Comercial. Nenhum outro lead foi iniciado.
