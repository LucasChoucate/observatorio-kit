# Relatório de qualidade: demografia (etapa A)

Gerado automaticamente por `etl/a_demografia.py` em 2026-11-20.

## Arquivos de origem

| Arquivo | URL | Encoding | Linhas lidas | Linhas filtradas |
|---|---|---|---|---|
| `Agregados_por_bairros_basico_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip | latin-1 | 17576 | 2 |
| `Agregados_por_bairros_demografia_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_demografia_BR.zip | latin-1 | 17576 | 2 |
| `Agregados_por_municipios_basico_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_basico_BR_20260520.zip | latin-1 | 5570 | 1 |
| `Agregados_por_municipios_demografia_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_demografia_BR.zip | latin-1 | 5570 | 1 |

## Ausências e tratamento

- Nenhuma ausência encontrada.

## Validações

| Validação | Resultado | Detalhe |
|---|---|---|
| Nome do território igual nos arquivos básico e demografia (bairro) | ok |  |
| Nome do território igual nos arquivos básico e demografia (municipio) | ok |  |
| Três territórios encontrados (2 bairros + Salvador) | ok | 2927408018 = Beiru / Tancredo Neves, 2927408117 = Pernambués, 2927408 = Salvador |
| Beiru / Tancredo Neves: soma das faixas etárias difere de V01006 em menos de 0,1% | ok | 38322 vs 38323 |
| Beiru / Tancredo Neves: homens + mulheres = V01006 | ok | 38323 vs 38323 |
| Beiru / Tancredo Neves: V0001 e V01006 diferem menos de 1% | ok | V0001 = 38329, V01006 = 38323, diferença = 6 |
| Beiru / Tancredo Neves: média de moradores entre 1 e 6 | ok | 2.5 |
| Beiru / Tancredo Neves: área positiva | ok | 1.6362079 |
| Pernambués: soma das faixas etárias difere de V01006 em menos de 0,1% | ok | 52558 vs 52564 |
| Pernambués: homens + mulheres = V01006 | ok | 52564 vs 52564 |
| Pernambués: V0001 e V01006 diferem menos de 1% | ok | V0001 = 52564, V01006 = 52564, diferença = 0 |
| Pernambués: média de moradores entre 1 e 6 | ok | 2.4 |
| Pernambués: área positiva | ok | 3.2073876 |
| Salvador: soma das faixas etárias difere de V01006 em menos de 0,1% | ok | 2412410 vs 2412968 |
| Salvador: homens + mulheres = V01006 | ok | 2412968 vs 2412968 |
| Salvador: V0001 e V01006 diferem menos de 1% | ok | V0001 = 2417678, V01006 = 2412968, diferença = 4710 |
| Salvador: média de moradores entre 1 e 6 | ok | 2.5 |
| Salvador: área positiva | ok | 693.4420551 |
| Percentuais entre 0 e 100 | ok | 12 valores |
| Faixas etárias somam 100% em cada território | ok | 2927408: 100.0000, 2927408018: 100.0000, 2927408117: 100.0000 |
| População de cada bairro menor que a de Salvador | ok |  |
| Nenhum valor ausente na saída | ok | 0 ausentes |
| Sem duplicidade na chave (território, indicador, fonte, ano) | ok |  |

## Observações

- Beiru / Tancredo Neves: a soma das faixas etárias (38322) é 1 pessoa(s) menor que V01006 (38323) no próprio arquivo do IBGE. Não foi corrigida; as faixas usam a soma das faixas como denominador para fecharem em 100%.
- Beiru / Tancredo Neves: V0006 = 0.0231 (dicionário do IBGE: total de domicílios particulares ocupados imputados ÷ total de domicílios particulares ocupados).
- Pernambués: a soma das faixas etárias (52558) é 6 pessoa(s) menor que V01006 (52564) no próprio arquivo do IBGE. Não foi corrigida; as faixas usam a soma das faixas como denominador para fecharem em 100%.
- Pernambués: V0006 = 0.0418 (dicionário do IBGE: total de domicílios particulares ocupados imputados ÷ total de domicílios particulares ocupados).
- Salvador: a soma das faixas etárias (2412410) é 558 pessoa(s) menor que V01006 (2412968) no próprio arquivo do IBGE. Não foi corrigida; as faixas usam a soma das faixas como denominador para fecharem em 100%.
- Salvador: V0006 = 0.0323 (dicionário do IBGE: total de domicílios particulares ocupados imputados ÷ total de domicílios particulares ocupados).

## Resultado

- Situação: **aprovado**
- Observações geradas: 27
- Saída: `data/processed/a_demografia.csv`
