---
name: site-downloader
description: Baixa dinamicamente o site atual de qualquer lead, cataloga 100% dos assets visuais inspecionando dimensões reais via Sharp, mapeia rotas reais vs âncoras e valida a integridade física do material sem dados fixos.
---

# Skill: Site Downloader & Prospector Engine

## Contrato atual obrigatório (v4)

Siga `docs/pipeline-evidence-contract.md`. A coleta gera candidatos; o agente revisa `source-review.json` e abre os assets para `asset-review.json`. Fatos têm estados verified/conflicting/unconfirmed, entidades por unidade e resolução explícita com fontes concorrentes. Sem revisão, retornar NEEDS_FACTUAL_REVIEW ao Prospector; não aprovar nem pedir confirmação humana rotineira.

Critérios operacionais, pesos e notas são escritos pelo agente conforme negócio e evidências. Não há nota estética automática, CNPJ não é serviço e ausência de formulário não é falha por padrão. Todo seletor declarado deve existir no HTML. A classificação de assunto da imagem exige inspeção; Sharp confirma formato/dimensões, não conteúdo.

Após a revisão, reprocessar com `--from-snapshot` e executar o validador. O handoff libera apenas fatos verificados ou escolhas explicitamente justificadas; mantém conflitos. A matriz e as regras abaixo são descrição histórica quando divergirem deste contrato.

Esta skill executa a captura dinâmica, offline e probatória do site atual de qualquer lead sem nenhuma dependência de dados fixos previamente codificados.

## 1. Ferramenta Principal Reutilizável: Prospector Engine
```bash
node scripts/prospector-engine.cjs --url "https://site.com.br" --slug "lead-slug" [--name "Nome Empresa"] [--niche "Nicho"] [--city "Cidade"] [--state "UF"]
```

### Capacidades Dinâmicas:
1. **Descoberta Dinâmica de Páginas:** Varre `sitemap.xml`, `robots.txt`, links do menu e rodapé. Separa rotas HTTP reais de âncoras (`#`).
2. **Download Multirrotas:** Baixa Home, Sobre, Serviços, Produtos/Portfólio e Contato, salvando espelhos locais em `leads/[slug]/referencias/site-baixado/`.
3. **Inventário Completo de Mídias:** Descobre `img`, `srcset`, fundos CSS e vídeos. Inspeciona formato, largura e altura reais via Sharp.
4. **Extração Semântica e Literal:** Extrai a copy e condições comerciais ipsis litteris direto da árvore DOM com tags de rastreabilidade `[Fonte: site oficial | DOM]`.
5. **Capturas Comprovatórias via Chrome CDP:** Captura páginas completas (*full-page* desktop e mobile) e recortes de componentes localizados via DOM (`getBoundingClientRect`).
6. **Memória de Cálculo de Score:** Aplica fórmula algorítmica reproduzível baseada em evidências.

## 2. Validador Independente (Quality Gate)
```bash
node scripts/validate-prospector-handoff.cjs --slug "lead-slug"
```
Executa auditoria estrita de 10 passos:
- Existência e peso dos arquivos HTML (> 1 KB);
- Metadados reais dos assets validados pelo Sharp;
- Presença obrigatória de logo e fotos prioritárias;
- Screenshots válidos e legíveis;
- Rastreabilidade de fontes em `site-atual.md`;
- Congruência matemática do Score de Oportunidade;
- Emissão oficial de `READY_FOR_ART_DIRECTION`.
