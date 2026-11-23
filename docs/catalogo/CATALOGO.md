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

## Indicadores investigados e não disponíveis

| Indicador procurado | Motivo | Alternativa adotada | Etapa |
|---|---|---|---|
| Percentual de idosos com 65 anos ou mais | Os agregados por bairro agrupam as idades em "60 a 69" e "70 ou mais"; não há como isolar 65+ | `dem_idade_60_mais_pct` (60+) | A |
| Densidade líquida (pessoas por área residencial) | O IBGE publica só a área total do bairro (AREA_KM2), sem área residencial | `dem_densidade_hab_km2` (densidade bruta) | A |
