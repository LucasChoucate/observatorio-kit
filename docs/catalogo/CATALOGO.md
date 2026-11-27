# Catálogo de indicadores e fontes

Cada indicador ocupa uma linha. Classificação: **observado** (publicado diretamente pela fonte para o
território e o período), **derivado** (cálculo sobre variáveis oficiais, com fórmula) ou
**proxy** (aproximação de fenômeno não medido diretamente). Os metadados de cada indicador também
estão na tabela `indicadores` do Supabase (campos `metodologia` e `limitacoes`).

## Fontes

| Sigla | Instituição | Título | URL | Acesso |
|---|---|---|---|---|
| `IBGE_CENSO_2022` | IBGE | Censo Demográfico 2022: Agregados por Setores Censitários (agregados por bairro e por município) | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/ | 2026-11-20 |
| `IPEA_IVS` | IPEA | Atlas da Vulnerabilidade Social (IVS) | http://ivs.ipea.gov.br/ | 2026-11-20 |
| `EPE_ANUARIO` | EPE | Anuário Estatístico de Energia Elétrica: dados abertos | https://www.epe.gov.br/pt/publicacoes-dados-abertos/dados-abertos/dados-do-anuario-estatistico-de-energia-eletrica | 2026-11-20 |

Os arquivos exatos de cada indicador estão em `data/raw/README.md`.

### Malha territorial (geometria do mapa, etapa C)

A geometria não é indicador e não vai para o banco: fica em `web/public/geo/` (gerada por
`etl/c_malha.py`). Os setores censitários usados no mapa são cadastrados na tabela `territorios`
(tipo `setor_censitario`, pai = bairro).

| Arquivo | Instituição | Conteúdo | Versão | URL | Acesso | Saída |
|---|---|---|---|---|---|---|
| `BA_bairros_CD2022.gpkg` | IBGE | Malha de bairros com atributos do Censo 2022 (SIRGAS 2000, EPSG:4674) | 2024-11-13 | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/BA_bairros_CD2022.gpkg | 2026-11-27 | `web/public/geo/bairros.geojson` (WGS84, 21 KB) |
| `BA_setores_CD2022.gpkg` | IBGE | Malha de setores censitários com atributos do Censo 2022 (SIRGAS 2000, EPSG:4674) | 2024-11-13 | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/setores/gpkg/UF/BA/BA_setores_CD2022.gpkg | 2026-11-27 | `web/public/geo/setores.geojson` (WGS84, 240 KB, 172 setores) |

Os indicadores urbanos vêm da divulgação "Características urbanísticas do entorno dos domicílios"
do Censo 2022 (`Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/`,
arquivos de 2025-04-17), sob a mesma fonte `IBGE_CENSO_2022`.

## Territórios e equivalência Beiru/Tancredo Neves

| Território | Código IBGE | Tipo | Observação |
|---|---|---|---|
| Brasil | 1 | país | código do nível Brasil no IBGE/SIDRA |
| Bahia | 29 | estado | |
| Salvador | 2927408 | município | usado apenas como referência |
| Beiru/Tancredo Neves | 2927408018 | bairro | nome no IBGE: "Beiru / Tancredo Neves" |
| Pernambués | 2927408117 | bairro | nome no IBGE: "Pernambués" |

**Conclusão sobre Beiru/Tancredo Neves (etapa A, verificada em 2026-11-20):** no arquivo oficial
`Agregados_por_bairros_basico_BR.csv` do Censo 2022, Beiru e Tancredo Neves aparecem como **um único
bairro**, com nome "Beiru / Tancredo Neves" e código `2927408018` (distrito Salvador, subdistrito São
Caetano, 1,64 km²). Não há registros separados para "Beiru" nem para "Tancredo Neves" na lista de
bairros de Salvador. Por isso o observatório trata os dois nomes como o mesmo território, exatamente
com o limite adotado pelo IBGE. A etapa C deve confirmar o mesmo polígono na malha territorial. O limite do IBGE
pode não coincidir com a percepção local nem com outras delimitações municipais. Isso entra nas
limitações.

**Confirmação na malha (etapa C, 2026-11-27):** a malha de bairros do Censo 2022
(`BA_bairros_CD2022.gpkg`) tem um único polígono com código `2927408018` e nome "Beiru / Tancredo
Neves", com AREA_KM2 = 1,636208 km², o mesmo valor do arquivo de agregados. A área recalculada em
SIRGAS 2000 / UTM 24S é 1,6350 km² (−0,07%, diferença só de projeção). Os 72 setores do bairro cobrem
o polígono sem sobra nem falta. O mesmo vale para Pernambués (100 setores, 3,2051 km² contra
3,207388 km²). Detalhes em `docs/qualidade/c_malha.md`.

| Setor censitário (etapa C) | Código IBGE | Tipo | Observação |
|---|---|---|---|
| 172 setores (72 em Beiru/Tancredo Neves, 100 em Pernambués) | 15 dígitos (ex.: 292740805220178) | setor_censitario | cadastrados por `etl/c_malha.py`, usados só no mapa da Tela 3 |

## Indicadores

| Código | Nome | Dimensão | Classificação | Fórmula (se derivado) | Unidade | Fonte | Arquivo de origem | Ano | Escala | Limitações | Etapa |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `dem_populacao` | População residente | demográfica | observado | (V0001: total de pessoas) | pessoas | IBGE_CENSO_2022 | Agregados_por_bairros_basico_BR.csv; Agregados_por_municipios_basico_BR.csv | 2022 | bairro; município (referência) | Limite de bairro definido pelo IBGE. V0001 é do arquivo básico (versão 2026-05-20) e difere ligeiramente de V01006 do arquivo de demografia | A |
| `dem_domicilios` | Domicílios particulares ocupados | demográfica | observado | (V0007: DPPO + DPIO) | domicílios | IBGE_CENSO_2022 | Agregados_por_bairros_basico_BR.csv; Agregados_por_municipios_basico_BR.csv | 2022 | bairro; município (referência) | Não inclui domicílios coletivos, vagos ou de uso ocasional | A |
| `dem_moradores_por_domicilio` | Média de moradores por domicílio | demográfica | observado | (V0005, calculada e publicada pelo IBGE: pessoas em domicílios particulares ocupados ÷ DPO) | moradores/domicílio | IBGE_CENSO_2022 | Agregados_por_bairros_basico_BR.csv; Agregados_por_municipios_basico_BR.csv | 2022 | bairro; município (referência) | Publicada com uma casa decimal. Não usar V0001 ÷ V0007, porque V0001 inclui pessoas em domicílios coletivos | A |
| `dem_area_km2` | Área do território | demográfica | observado | (AREA_KM2) | km² | IBGE_CENSO_2022 | Agregados_por_bairros_basico_BR.csv; Agregados_por_municipios_basico_BR.csv | 2022 | bairro; município (referência) | Área total do polígono, inclusive áreas não residenciais; a área de Salvador inclui ilhas e áreas não urbanizadas | A |
| `dem_densidade_hab_km2` | Densidade demográfica | demográfica | derivado | V0001 ÷ AREA_KM2 | hab/km² | IBGE_CENSO_2022 | Agregados_por_bairros_basico_BR.csv; Agregados_por_municipios_basico_BR.csv | 2022 | bairro; município (referência) | Densidade bruta (área total), que subestima a densidade das áreas ocupadas; pouco comparável com a de Salvador | A |
| `dem_idade_0_14_pct` | População de 0 a 14 anos | demográfica | derivado | (V01031 + V01032 + V01033) ÷ (V01031 + … + V01041) × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_demografia_BR.csv; Agregados_por_municipios_demografia_BR.csv | 2022 | bairro; município (referência) | A soma das faixas fica ligeiramente abaixo de V01006 no arquivo oficial (diferença registrada em `docs/qualidade/a_demografia.md`) | A |
| `dem_idade_15_59_pct` | População de 15 a 59 anos | demográfica | derivado | (V01034 + … + V01039) ÷ (V01031 + … + V01041) × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Idem; faixa definida pelos cortes do arquivo (não é a idade ativa de 15 a 64) | A |
| `dem_idade_60_mais_pct` | População de 60 anos ou mais | demográfica | derivado | (V01040 + V01041) ÷ (V01031 + … + V01041) × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Idem; o arquivo não permite o recorte 65+ | A |
| `dem_mulheres_pct` | Mulheres na população | demográfica | derivado | V01008 ÷ V01006 × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Denominador V01006 (= V01007 + V01008 no arquivo) | A |
| `eco_rendimento_medio_responsavel_rs` | Rendimento médio mensal do responsável pelo domicílio | econômica | observado | (V06004, calculada e publicada pelo IBGE) | R$ | IBGE_CENSO_2022 | Agregados_por_bairros_renda_responsavel_BR.csv; Agregados_por_municipios_renda_responsavel_BR.csv | 2022 | bairro; município (referência) | Rendimento nominal (2022) só dos responsáveis com rendimento; não é renda domiciliar nem per capita. Muito sensível a valores extremos: o desvio-padrão (raiz de V06005) é de R$ 58.617 em Beiru/Tancredo Neves, contra R$ 3.307 em Pernambués; prefira a mediana | B (incluído na C) |
| `eco_rendimento_mediano_responsavel_rs` | Rendimento mediano mensal do responsável pelo domicílio | econômica | observado | (V06006, calculada e publicada pelo IBGE) | R$ | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Mesmo universo da média; pouco sensível a extremos, mas se concentra em valores redondos (como o salário mínimo de 2022) | B (incluído na C) |
| `soc_taxa_alfabetizacao_pct` | Taxa de alfabetização (15 anos ou mais) | social | derivado | V00900 ÷ (V00900 + V00901) × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_alfabetizacao_BR.csv; Agregados_por_municipios_alfabetizacao_BR.csv | 2022 | bairro; município (referência) | Alfabetização declarada (ler e escrever bilhete simples) para população de 15 anos ou mais | B |
| `hab_agua_rede_geral_pct` | Domicílios com água da rede geral | habitacional | derivado | V00111 ÷ (V00494 + V00495) × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_caracteristicas_domicilio2_BR.csv; Agregados_por_municipios_caracteristicas_domicilio2_BR.csv | 2022 | bairro; município (referência) | Considera domicílios particulares permanentes ocupados (DPPO); não avalia intermitência do serviço | B |
| `hab_esgoto_adequado_pct` | Domicílios com esgoto adequado | habitacional | derivado | (V00309 + V00310) ÷ (V00494 + V00495) × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Soma rede geral/pluvial (V00309) e fossa séptica ligada à rede (V00310); não mede estação final | B |
| `hab_lixo_coletado_pct` | Domicílios com lixo coletado | habitacional | derivado | (V00397 + V00398) ÷ (V00494 + V00495) × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Soma coleta direta no domicílio (V00397) e depósito em caçamba de serviço de limpeza (V00398) | B |
| `hab_lixo_cacamba_pct` | Domicílios com descarte em caçamba | habitacional | derivado | V00398 ÷ (V00494 + V00495) × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Mostra a forma de coleta declarada, não o motivo: o Censo não registra por que o domicílio usa caçamba. Para contexto, ver `urb_via_sem_veiculos_pct`, sem tratar como causa | B |
| `hab_sem_banheiro_exclusivo_pct` | Domicílios sem banheiro exclusivo | habitacional | derivado | V00495 ÷ (V00494 + V00495) × 100 | % | IBGE_CENSO_2022 | idem | 2022 | bairro; município (referência) | Domicílios sem banheiro privativo com chuveiro e vaso (uso comum, sanitário rudimentar ou sem sanitário) | B |
| `urb_iluminacao_publica_pct` | Domicílios em face com iluminação pública | urbana | derivado | V05012 ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Iluminação pública **não** mede a continuidade nem a qualidade do fornecimento de energia nas casas, nem se o poste funciona. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |
| `urb_via_pavimentada_pct` | Domicílios em face com via pavimentada | urbana | derivado | V05006 ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Não distingue tipo nem estado do pavimento. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |
| `urb_calcada_pct` | Domicílios em face com calçada | urbana | derivado | V05021 ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Não mede largura, continuidade nem obstáculos. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |
| `urb_bueiro_pct` | Domicílios em face com bueiro ou boca de lobo | urbana | derivado | V05009 ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Presença do dispositivo, não funcionamento da drenagem nem alagamento. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |
| `urb_arborizacao_pct` | Domicílios em face com pelo menos uma árvore | urbana | derivado | (V05031 + V05032 + V05033) ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Conta árvores na face (1 ou mais), não cobertura de copa nem sombreamento. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |
| `urb_rampa_cadeirante_pct` | Domicílios em face com rampa para cadeirante | urbana | derivado | V05027 ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Sem calçada a rampa não é investigada (não declarada), então acompanha a falta de calçada. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |
| `urb_via_sem_veiculos_pct` | Domicílios em via só para pedestres, bicicletas e motos | urbana | derivado | V05003 ÷ V05000 × 100 | % | IBGE_CENSO_2022 | Agregados_por_bairros_entorno_domicílios_BR.csv; Agregados_por_setores_entorno_domicílios_BR.csv; Agregados_por_municipios_entorno_domicílios_BR.csv | 2022 | bairro; setor censitário; município (referência) | Circulação possível na via (becos, escadarias, vielas); não mede motivo nem impacto em serviços. Contextualiza o descarte em caçamba sem provar causa. Face de quadra do domicílio, não a casa; denominador V05000 inclui faces não declaradas (1,1% em Beiru/Tancredo Neves, 0,9% em Pernambués), então o valor é um piso | C |

## Indicadores investigados e não disponíveis

| Indicador procurado | Motivo | Alternativa adotada | Etapa |
|---|---|---|---|
| Percentual de idosos com 65 anos ou mais | Os agregados por bairro agrupam as idades em "60 a 69" e "70 ou mais"; não há como isolar 65+ | `dem_idade_60_mais_pct` (60+) | A |
| Densidade líquida (pessoas por área residencial) | O IBGE publica só a área total do bairro (AREA_KM2), sem área residencial | `dem_densidade_hab_km2` (densidade bruta) | A |
| Concentração de baixa renda (até 1/2 ou 1 SM) por bairro (Censo 2022) | O arquivo de rendimento do responsável por bairro traz só total de responsáveis, moradores, média, mediana e variâncias (V06001 a V06006), sem faixas de salário mínimo; os demais agregados por bairro não têm variável de renda | `eco_rendimento_mediano_responsavel_rs` (mediana do rendimento do responsável) | B (revisto na C) |
| Rendimento domiciliar total ou per capita por bairro (Censo 2022) | Não publicado nos agregados por bairro; o arquivo de rendimento traz só o rendimento do responsável | `eco_rendimento_*_responsavel_rs`, com a limitação registrada | B (revisto na C) |

> **Correção (etapa C, 2026-11-27):** a etapa B registrou o rendimento por bairro como indisponível,
> porque o procurou só no diretório principal dos agregados. O IBGE publicou o rendimento do
> responsável em divulgação própria, `Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/`
> (arquivos de 2026-05-08). Os dois indicadores `eco_` acima vêm dessa divulgação.

### Etapa C (infraestrutura urbana)

| Indicador procurado | Motivo | Alternativa adotada | Etapa |
|---|---|---|---|
| Esgoto a céu aberto na face de quadra | Investigado no entorno do Censo 2010, mas não consta no dicionário do entorno de 2022 (V05000 a V05034) | `hab_esgoto_adequado_pct` (destino do esgoto do domicílio, etapa B) | C |
| Lixo acumulado na face de quadra | Idem: não consta no dicionário do entorno de 2022 | `hab_lixo_coletado_pct` e `hab_lixo_cacamba_pct` (etapa B) | C |
| Qualidade e manutenção dos itens do entorno (poste apagado, buraco, calçada quebrada) | O Censo registra só presença ou ausência do item na face | Registrado nas limitações de cada `urb_` | C |
| Continuidade ou qualidade do fornecimento de energia nas casas | Iluminação pública não mede isso; o Censo 2022 não traz interrupções nem qualidade do serviço por bairro | Fica para a etapa D (contexto energético, sem atribuir dado estadual ao bairro) | C |
| Densidade por área do polígono recalculada | Não pendente: a etapa A já calculou `dem_densidade_hab_km2` com o AREA_KM2 oficial, e a área da malha confere (−0,07%) | Mantido o indicador da etapa A | C |
