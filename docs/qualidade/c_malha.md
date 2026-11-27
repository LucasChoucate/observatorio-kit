# Relatório de qualidade: malha territorial (etapa C)

Gerado automaticamente por `etl/c_malha.py` em 2026-11-27.

## Arquivos de origem

| Arquivo | URL | Encoding | Linhas lidas | Linhas filtradas |
|---|---|---|---|---|
| `BA_bairros_CD2022.gpkg` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/BA_bairros_CD2022.gpkg | GeoPackage | 468 | 2 |
| `BA_setores_CD2022.gpkg` | https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/setores/gpkg/UF/BA/BA_setores_CD2022.gpkg | GeoPackage | 31070 | 172 |

## Ausências e tratamento

- Nenhuma ausência encontrada.

## Validações

| Validação | Resultado | Detalhe |
|---|---|---|
| Malha em SIRGAS 2000 (EPSG:4674) | ok | bairros: EPSG:4674, setores: EPSG:4674 |
| Os dois bairros do projeto estão na malha | ok | 2927408018 = Beiru / Tancredo Neves, 2927408117 = Pernambués |
| 2927408018: nome na malha igual ao dos agregados | ok | 'Beiru / Tancredo Neves' |
| 2927408117: nome na malha igual ao dos agregados | ok | 'Pernambués' |
| Códigos de setor únicos e com 15 dígitos | ok | 172 setores |
| Geometrias válidas | ok | 0 bairros e 0 setores inválidos |
| Beiru / Tancredo Neves: área calculada (UTM 24S) difere do AREA_KM2 em menos de 1% | ok | 1.6350 km² calculada vs 1.636208 km² do IBGE (-0.071%) |
| Beiru / Tancredo Neves: setores cobrem o bairro (diferença de área < 0,5%) | ok | 72 setores; diferença simétrica de 0.0000% da área |
| Pernambués: área calculada (UTM 24S) difere do AREA_KM2 em menos de 1% | ok | 3.2051 km² calculada vs 3.207388 km² do IBGE (-0.072%) |
| Pernambués: setores cobrem o bairro (diferença de área < 0,5%) | ok | 100 setores; diferença simétrica de 0.0000% da área |
| Todos os setores pertencem a um dos dois bairros | ok | 172 setores |
| web/public/geo/bairros.geojson com menos de 2 MB | ok | 21.2 KB, 2 feições |
| bairros.geojson: geometrias válidas depois da simplificação | ok | 0 inválidas |
| web/public/geo/setores.geojson com menos de 2 MB | ok | 239.5 KB, 172 feições |
| setores.geojson: geometrias válidas depois da simplificação | ok | 0 inválidas |

## Observações

- Beiru / Tancredo Neves: 72 setores censitários (Favela e Comunidade Urbana: 63; Não especial: 8; Convento / hospital / ILPI / IACA: 1). Soma do AREA_KM2 dos setores = 1.636208 km².
- Pernambués: 100 setores censitários (Favela e Comunidade Urbana: 73; Não especial: 27). Soma do AREA_KM2 dos setores = 3.207388 km².
- Área calculada em EPSG:31984 (SIRGAS 2000 / UTM 24S). A diferença para o AREA_KM2 do IBGE é só de projeção; os indicadores dem_area_km2 e dem_densidade_hab_km2 (etapa A) continuam com o AREA_KM2 oficial e não foram recalculados.
- Simplificação de cobertura (simplify_coverage) com tolerância de 1.0 m em EPSG:31984, que mantém as divisas comuns entre setores sem abrir frestas; coordenadas em EPSG:4326 com 6 casas decimais.
- Os GeoJSON não trazem nenhum valor de indicador: só códigos e nomes, para ligar cada polígono às observações do Supabase.

## Resultado

- Situação: **aprovado**
- Observações geradas: 0
- Saída: `data/processed/c_malha.csv`
