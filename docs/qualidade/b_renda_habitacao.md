# Relatório de qualidade: renda e habitação (etapa B)

Gerado automaticamente por `etl/b_renda_habitacao.py` em 2026-11-22.

## Arquivos de origem

| Arquivo | URL | Encoding | Linhas lidas | Linhas filtradas |
|---|---|---|---|---|
| `Agregados_por_bairros_alfabetizacao_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_alfabetizacao_BR.zip | latin-1 | 17576 | 2 |
| `Agregados_por_bairros_caracteristicas_domicilio2_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip | latin-1 | 17576 | 2 |
| `Agregados_por_municipios_alfabetizacao_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_alfabetizacao_BR.zip | latin-1 | 5570 | 1 |
| `Agregados_por_municipios_caracteristicas_domicilio2_BR.csv` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_caracteristicas_domicilio2_BR_20250417.zip | latin-1 | 5570 | 1 |

## Ausências e tratamento

- Nenhuma ausência encontrada.

## Validações

| Validação | Resultado | Detalhe |
|---|---|---|
| Nome do território consistente entre alfabetização e domicílio 2 (bairro) | ok |  |
| Nome do território consistente entre alfabetização e domicílio 2 (municipio) | ok |  |
| Três territórios encontrados (2 bairros + Salvador) | ok | 2927408018 = Beiru / Tancredo Neves, 2927408117 = Pernambués, 2927408 = Salvador |
| Beiru / Tancredo Neves: total de DPPO positivo | ok | 15436 domicílios |
| Beiru / Tancredo Neves: população 15+ positiva | ok | 31414 pessoas |
| Beiru / Tancredo Neves: água rede geral <= total DPPO | ok | 15426 vs 15436 |
| Beiru / Tancredo Neves: esgoto rede+fossa <= total DPPO | ok | 15170 vs 15436 |
| Beiru / Tancredo Neves: lixo coletado (direto + caçamba) <= total DPPO | ok | 15042 vs 15436 |
| Pernambués: total de DPPO positivo | ok | 21539 domicílios |
| Pernambués: população 15+ positiva | ok | 44238 pessoas |
| Pernambués: água rede geral <= total DPPO | ok | 21504 vs 21539 |
| Pernambués: esgoto rede+fossa <= total DPPO | ok | 21294 vs 21539 |
| Pernambués: lixo coletado (direto + caçamba) <= total DPPO | ok | 20578 vs 21539 |
| Salvador: total de DPPO positivo | ok | 957587 domicílios |
| Salvador: população 15+ positiva | ok | 2006599 pessoas |
| Salvador: água rede geral <= total DPPO | ok | 950158 vs 957587 |
| Salvador: esgoto rede+fossa <= total DPPO | ok | 909226 vs 957587 |
| Salvador: lixo coletado (direto + caçamba) <= total DPPO | ok | 939869 vs 957587 |
| Todos os percentuais calculados estão entre 0 e 100 | ok | 18 observações calculadas |
| Taxas de alfabetização na faixa plausível (80% a 100%) | ok | 95.04%, 96.76%, 96.63% |
| Nenhum valor ausente na saída gerada | ok | 0 ausentes |
| Sem duplicidade de chave (território, indicador, fonte, ano) | ok |  |

## Resultado

- Situação: **aprovado**
- Observações geradas: 18
- Saída: `data/processed/b_renda_habitacao.csv`
