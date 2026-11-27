# Relatório de qualidade: entorno urbano dos domicílios (etapa C)

Gerado automaticamente por `etl/c_urbano.py` em 2026-11-27.

## Arquivos de origem

| Arquivo | URL | Encoding | Linhas lidas | Linhas filtradas |
|---|---|---|---|---|
| `Agregados_por_bairros_entorno_domicílios_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Bairro_csv/Agregados_por_bairros_entorno_domic%c3%adlios_BR.zip | latin-1 | 17576 | 2 |
| `Agregados_por_municipios_entorno_domicílios_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Municipio_csv/Agregados_por_municipios_entorno_domic%c3%adlios_BR.zip | latin-1 | 5570 | 1 |
| `Agregados_por_setores_entorno_domicílios_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Setor_csv/Agregados_por_setores_entorno_domic%c3%adlios_BR.zip | utf-8 | 340965 | 170 |
| `br_setores_entorno_cd2022(in).csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Dados_percentuais_das_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/br_setores_entorno_cd2022(in).csv | utf-8 (linhas entre aspas) | - | 170 |

## Ausências e tratamento

- Setor 292740805220252: não aparece no arquivo do entorno (setor não incluído na pesquisa do entorno); gravado como ausente (null) em todos os indicadores.
- Setor 292740805220772: não aparece no arquivo do entorno (setor não incluído na pesquisa do entorno); gravado como ausente (null) em todos os indicadores.
- Setor 292740805220256: valores marcados com "X" (sigilo do IBGE); gravado como ausente (null), sem estimativa.
- Setor 292740805220423: 77.6% das faces não declaradas (base de 223 domicílios); valores gravados como ausentes (null), com nota. O percentual sobre o total, método do IBGE, seria um piso artificial.
- Setor 292740805220711: 100.0% das faces não declaradas (base de 180 domicílios); valores gravados como ausentes (null), com nota. O percentual sobre o total, método do IBGE, seria um piso artificial.

## Validações

| Validação | Resultado | Detalhe |
|---|---|---|
| Setores do entorno sem duplicidade | ok | 170 linhas |
| Beiru / Tancredo Neves: categorias de circulação da via somam V05000 | ok | 15120 vs 15120 |
| Beiru / Tancredo Neves: categorias de via pavimentada somam V05000 | ok | 15120 vs 15120 |
| Beiru / Tancredo Neves: categorias de bueiro somam V05000 | ok | 15120 vs 15120 |
| Beiru / Tancredo Neves: categorias de iluminação pública somam V05000 | ok | 15120 vs 15120 |
| Beiru / Tancredo Neves: categorias de calçada somam V05000 | ok | 15120 vs 15120 |
| Beiru / Tancredo Neves: categorias de rampa para cadeirante somam V05000 | ok | 15120 vs 15120 |
| Beiru / Tancredo Neves: categorias de arborização somam V05000 | ok | 15120 vs 15120 |
| Pernambués: categorias de circulação da via somam V05000 | ok | 21546 vs 21546 |
| Pernambués: categorias de via pavimentada somam V05000 | ok | 21546 vs 21546 |
| Pernambués: categorias de bueiro somam V05000 | ok | 21546 vs 21546 |
| Pernambués: categorias de iluminação pública somam V05000 | ok | 21546 vs 21546 |
| Pernambués: categorias de calçada somam V05000 | ok | 21546 vs 21546 |
| Pernambués: categorias de rampa para cadeirante somam V05000 | ok | 21546 vs 21546 |
| Pernambués: categorias de arborização somam V05000 | ok | 21546 vs 21546 |
| Salvador: categorias de circulação da via somam V05000 | ok | 956277 vs 956277 |
| Salvador: categorias de via pavimentada somam V05000 | ok | 956277 vs 956277 |
| Salvador: categorias de bueiro somam V05000 | ok | 956277 vs 956277 |
| Salvador: categorias de iluminação pública somam V05000 | ok | 956277 vs 956277 |
| Salvador: categorias de calçada somam V05000 | ok | 956277 vs 956277 |
| Salvador: categorias de rampa para cadeirante somam V05000 | ok | 956277 vs 956277 |
| Salvador: categorias de arborização somam V05000 | ok | 956277 vs 956277 |
| Setores: categorias de cada grupo somam V05000 | ok | 169 setores com dados, 0 falhas |
| Beiru / Tancredo Neves: soma de V05000 dos setores igual ao total do bairro | ok | 15120 vs 15120 |
| Pernambués: soma de V05000 dos setores igual ao total do bairro | ok | 21546 vs 21546 |
| Beiru / Tancredo Neves: universo do entorno cobre ao menos 90% dos domicílios ocupados | ok | V05000 = 15120 de 15458 domicílios ocupados (dem_domicilios, V0007): 97.8% |
| Pernambués: universo do entorno cobre ao menos 90% dos domicílios ocupados | ok | V05000 = 21546 de 21568 domicílios ocupados (dem_domicilios, V0007): 99.9% |
| Salvador: universo do entorno cobre ao menos 90% dos domicílios ocupados | ok | V05000 = 956277 de 959423 domicílios ocupados (dem_domicilios, V0007): 99.7% |
| Percentuais entre 0 e 100 | ok | 1190 valores |
| Uma observação por indicador e território (bairros, Salvador e todos os setores) | ok | 1225 de 1225 |
| Bairros e Salvador sem valor ausente | ok | 35 observações ausentes, todas de setor censitário |
| Sem duplicidade na chave (território, indicador, fonte, ano) | ok |  |
| urb_iluminacao_publica_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.00 p.p., máxima 3.99 p.p. |
| urb_via_pavimentada_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.00 p.p., máxima 2.37 p.p. |
| urb_calcada_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.54 p.p., máxima 8.39 p.p. |
| urb_bueiro_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.64 p.p., máxima 5.62 p.p. |
| urb_arborizacao_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.52 p.p., máxima 4.96 p.p. |
| urb_rampa_cadeirante_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.00 p.p., máxima 2.74 p.p. |
| urb_via_sem_veiculos_pct: mediana da diferença para o percentual oficial do IBGE por setor (moradores) abaixo de 2 p.p. | ok | 167 setores; mediana 0.74 p.p., máxima 8.39 p.p. |

## Observações

- Beiru / Tancredo Neves: faces não declaradas = 1.14% do universo do entorno.
- Pernambués: faces não declaradas = 0.91% do universo do entorno.
- Salvador: faces não declaradas = 0.31% do universo do entorno.
- Setores no arquivo com valores numéricos: 169 de 172; observações por setor com valor no mapa: 1169 de 1204. Sem linha no arquivo: 292740805220252, 292740805220772. Com sigilo (X): 292740805220256. A soma dos setores com dado já fecha o total publicado de cada bairro, então os setores ausentes não acrescentam domicílios a esse total.

## Resultado

- Situação: **aprovado**
- Observações geradas: 1225
- Saída: `data/processed/c_urbano.csv`
