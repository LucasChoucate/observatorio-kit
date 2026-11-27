# Relatório de qualidade: renda e habitação (etapa B)

Gerado automaticamente por `etl/b_renda_habitacao.py` em 2026-11-27.

## Arquivos de origem

| Arquivo | URL | Encoding | Linhas lidas | Linhas filtradas |
|---|---|---|---|---|
| `Agregados_por_bairros_alfabetizacao_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_alfabetizacao_BR.zip | latin-1 | 17576 | 2 |
| `Agregados_por_bairros_caracteristicas_domicilio2_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip | latin-1 | 17576 | 2 |
| `Agregados_por_bairros_renda_responsavel_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/Agregados_por_bairros_renda_responsavel_BR_20260508_csv.zip | latin-1 | 17378 | 2 |
| `Agregados_por_municipios_alfabetizacao_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_alfabetizacao_BR.zip | latin-1 | 5570 | 1 |
| `Agregados_por_municipios_caracteristicas_domicilio2_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_caracteristicas_domicilio2_BR_20250417.zip | latin-1 | 5570 | 1 |
| `Agregados_por_municipios_renda_responsavel_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/Agregados_por_municipios_renda_responsavel_BR_20260508_csv.zip | latin-1 | 5570 | 1 |

## Ausências e tratamento

- Nenhuma ausência encontrada.

## Validações

| Validação | Resultado | Detalhe |
|---|---|---|
| Nome do território consistente entre alfabetização, domicílio 2 e renda (bairro) | ok |  |
| Nome do território consistente entre alfabetização, domicílio 2 e renda (municipio) | ok |  |
| Três territórios encontrados (2 bairros + Salvador) | ok | 2927408018 = Beiru / Tancredo Neves, 2927408117 = Pernambués, 2927408 = Salvador |
| Beiru / Tancredo Neves: total de DPPO positivo | ok | 15436 domicílios |
| Beiru / Tancredo Neves: população 15+ positiva | ok | 31414 pessoas |
| Beiru / Tancredo Neves: água rede geral <= total DPPO | ok | 15426 vs 15436 |
| Beiru / Tancredo Neves: esgoto rede+fossa <= total DPPO | ok | 15170 vs 15436 |
| Beiru / Tancredo Neves: lixo coletado (direto + caçamba) <= total DPPO | ok | 15042 vs 15436 |
| Beiru / Tancredo Neves: rendimentos médio e mediano positivos e abaixo de R$ 50 mil | ok | média R$ 2035.87, mediana R$ 1212.00 |
| Beiru / Tancredo Neves: responsáveis (V06001) próximos do total de DPPO (diferença < 1%) | ok | 15454 responsáveis vs 15436 DPPO |
| Pernambués: total de DPPO positivo | ok | 21539 domicílios |
| Pernambués: população 15+ positiva | ok | 44238 pessoas |
| Pernambués: água rede geral <= total DPPO | ok | 21504 vs 21539 |
| Pernambués: esgoto rede+fossa <= total DPPO | ok | 21294 vs 21539 |
| Pernambués: lixo coletado (direto + caçamba) <= total DPPO | ok | 20578 vs 21539 |
| Pernambués: rendimentos médio e mediano positivos e abaixo de R$ 50 mil | ok | média R$ 2316.25, mediana R$ 1212.00 |
| Pernambués: responsáveis (V06001) próximos do total de DPPO (diferença < 1%) | ok | 21561 responsáveis vs 21539 DPPO |
| Salvador: total de DPPO positivo | ok | 957587 domicílios |
| Salvador: população 15+ positiva | ok | 2006599 pessoas |
| Salvador: água rede geral <= total DPPO | ok | 950158 vs 957587 |
| Salvador: esgoto rede+fossa <= total DPPO | ok | 909226 vs 957587 |
| Salvador: lixo coletado (direto + caçamba) <= total DPPO | ok | 939869 vs 957587 |
| Salvador: rendimentos médio e mediano positivos e abaixo de R$ 50 mil | ok | média R$ 3160.73, mediana R$ 1230.00 |
| Salvador: responsáveis (V06001) próximos do total de DPPO (diferença < 1%) | ok | 958539 responsáveis vs 957587 DPPO |
| Todos os percentuais calculados estão entre 0 e 100 | ok | 18 percentuais calculados |
| Taxas de alfabetização na faixa plausível (80% a 100%) | ok | 95.04%, 96.76%, 96.63% |
| Nenhum valor ausente na saída gerada | ok | 0 ausentes |
| Sem duplicidade de chave (território, indicador, fonte, ano) | ok |  |

## Observações

- Beiru / Tancredo Neves: desvio-padrão do rendimento dos responsáveis = R$ 58.617 (raiz de V06005), para média de R$ 2.035,87 (coeficiente de variação 28,8). Quanto maior a dispersão, mais a média é influenciada por valores extremos; por isso a mediana é a medida preferida para comparar os territórios.
- Pernambués: desvio-padrão do rendimento dos responsáveis = R$ 3.307 (raiz de V06005), para média de R$ 2.316,25 (coeficiente de variação 1,4). Quanto maior a dispersão, mais a média é influenciada por valores extremos; por isso a mediana é a medida preferida para comparar os territórios.
- Salvador: desvio-padrão do rendimento dos responsáveis = R$ 13.801 (raiz de V06005), para média de R$ 3.160,73 (coeficiente de variação 4,4). Quanto maior a dispersão, mais a média é influenciada por valores extremos; por isso a mediana é a medida preferida para comparar os territórios.

## Resultado

- Situação: **aprovado**
- Observações geradas: 24
- Saída: `data/processed/b_renda_habitacao.csv`
