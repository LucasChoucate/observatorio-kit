# Arquivos brutos (`data/raw/`)

Os arquivos oficiais **não são versionados** (são grandes e públicos). Cada etapa baixa os seus para esta
pasta a partir das URLs abaixo e descompacta os `.zip` aqui mesmo. Os scripts de ETL leem os `.csv`
descompactados.

Base do FTP do IBGE (Censo 2022, agregados por setores censitários):
`https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/`

Os nomes de alguns arquivos trazem a data de publicação (ex.: `_20260520`). Se o IBGE publicar versão
nova, o nome muda: confira o diretório e atualize esta tabela e o script.

## Etapa A (demografia)

| Arquivo | URL | Acesso | Usado por |
|---|---|---|---|
| `Agregados_por_bairros_basico_BR_20260520.zip` → `Agregados_por_bairros_basico_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_basico_BR_20260520.zip) | 2026-11-20 | `etl/a_demografia.py` |
| `Agregados_por_bairros_demografia_BR.zip` → `Agregados_por_bairros_demografia_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_demografia_BR.zip) | 2026-11-20 | `etl/a_demografia.py` |
| `Agregados_por_municipios_basico_BR_20260520.zip` → `Agregados_por_municipios_basico_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_basico_BR_20260520.zip) | 2026-11-20 | `etl/a_demografia.py` (Salvador) |
| `Agregados_por_municipios_demografia_BR.zip` → `Agregados_por_municipios_demografia_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_demografia_BR.zip) | 2026-11-20 | `etl/a_demografia.py` (Salvador) |
| `dicionario_de_dados_agregados_por_setores_censitarios_20261113.xlsx` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/dicionario_de_dados_agregados_por_setores_censitarios_20261113.xlsx) | 2026-11-20 | consulta (significado das variáveis) |

## Etapa B (renda, escolaridade e habitação)

| Arquivo | URL | Acesso | Usado por |
|---|---|---|---|
| `Agregados_por_bairros_alfabetizacao_BR.zip` → `Agregados_por_bairros_alfabetizacao_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_alfabetizacao_BR.zip) | 2026-11-22 | `etl/b_renda_habitacao.py` |
| `Agregados_por_municipios_alfabetizacao_BR.zip` → `Agregados_por_municipios_alfabetizacao_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_alfabetizacao_BR.zip) | 2026-11-22 | `etl/b_renda_habitacao.py` (Salvador) |
| `Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip` → `Agregados_por_bairros_caracteristicas_domicilio2_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/Agregados_por_bairros_caracteristicas_domicilio2_BR_20250417.zip) | 2026-11-22 | `etl/b_renda_habitacao.py` |
| `Agregados_por_municipios_caracteristicas_domicilio2_BR_20250417.zip` → `Agregados_por_municipios_caracteristicas_domicilio2_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Municipio_csv/Agregados_por_municipios_caracteristicas_domicilio2_BR_20250417.zip) | 2026-11-22 | `etl/b_renda_habitacao.py` (Salvador) |

Rendimento do responsável: divulgação própria do Censo 2022, fora do diretório principal dos agregados
(`Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/`). Incluída na etapa C como correção da
etapa B.

| Arquivo | URL | Acesso | Usado por |
|---|---|---|---|
| `Agregados_por_bairros_renda_responsavel_BR_20260508_csv.zip` → `Agregados_por_bairros_renda_responsavel_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/Agregados_por_bairros_renda_responsavel_BR_20260508_csv.zip) | 2026-11-27 | `etl/b_renda_habitacao.py` |
| `Agregados_por_municipios_renda_responsavel_BR_20260508_csv.zip` → `Agregados_por_municipios_renda_responsavel_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/Agregados_por_municipios_renda_responsavel_BR_20260508_csv.zip) | 2026-11-27 | `etl/b_renda_habitacao.py` (Salvador) |
| `dicionario_de_dados_renda_responsavel_20260508.xlsx` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Rendimento_do_Responsavel/dicionario_de_dados_renda_responsavel_20260508.xlsx) | 2026-11-27 | consulta (V06001 a V06006) |

Formato dos CSVs: separador `;`, encoding `latin-1`, decimal com vírgula, valores entre aspas.

## Etapa C (malha territorial e entorno urbano)

Malha com atributos do Censo 2022 (versão de 2024-11-13), em `Agregados_por_Setores_Censitarios/malha_com_atributos/`:

| Arquivo | URL | Acesso | Usado por |
|---|---|---|---|
| `BA_bairros_CD2022.gpkg` (2,2 MB) | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/bairros/gpkg/UF/BA/BA_bairros_CD2022.gpkg) | 2026-11-27 | `etl/c_malha.py` |
| `BA_setores_CD2022.gpkg` (112 MB) | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/setores/gpkg/UF/BA/BA_setores_CD2022.gpkg) | 2026-11-27 | `etl/c_malha.py`, `etl/c_urbano.py` (setor → bairro) |
| `Dicionario_de_dados_malha_agregados.xlsx` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/malha_com_atributos/Dicionario_de_dados_malha_agregados.xlsx) | 2026-11-27 | consulta (CD_TIPO, CD_SITUACAO) |

Características urbanísticas do entorno dos domicílios: divulgação própria do Censo 2022
(`Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/`,
arquivos de 2025-04-17). Os nomes dos `.zip` de domicílios têm `í` (codificado como `%c3%ad` na URL).

| Arquivo | URL | Acesso | Usado por |
|---|---|---|---|
| `Agregados_por_bairros_entorno_domicílios_BR.zip` → `Agregados_por_bairros_entorno_domicílios_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Bairro_csv/Agregados_por_bairros_entorno_domic%c3%adlios_BR.zip) | 2026-11-27 | `etl/c_urbano.py` |
| `Agregados_por_municipios_entorno_domicílios_BR.zip` → `Agregados_por_municipios_entorno_domicílios_BR.csv` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Municipio_csv/Agregados_por_municipios_entorno_domic%c3%adlios_BR.zip) | 2026-11-27 | `etl/c_urbano.py` (Salvador) |
| `Agregados_por_setores_entorno_domicílios_BR.zip` → `Agregados_por_setores_entorno_domicílios_BR.csv` (12 MB) | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/Agregados_por_Setor_csv/Agregados_por_setores_entorno_domic%c3%adlios_BR.zip) | 2026-11-27 | `etl/c_urbano.py` (mapa por setor) |
| `dicionarios_de_dados_entorno.zip` → `dicionario_entorno_domicilios.xlsx` | [link](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios_Caracteristicas_urbanisticas_do_entorno_dos_domicilios/dicionarios_de_dados_entorno.zip) | 2026-11-27 | consulta (V05000 a V05034) |

Na mesma divulgação há os recortes `entorno_moradores` (V05200 a V05234, contagem de moradores) e
`entorno_faces` (V05400 a V05434, contagem de faces de quadra), não usados no observatório.

## Outros arquivos por bairro disponíveis (para as etapas C e D)

Mesmo diretório `Agregados_por_Bairro_csv/` (há equivalentes por município em `Agregados_por_Municipio_csv/`):

- `Agregados_por_bairros_caracteristicas_domicilio1_BR_20261021.zip`
- `Agregados_por_bairros_caracteristicas_domicilio3_BR_20250417.zip`
- `Agregados_por_bairros_cor_ou_raca_BR.zip`
- `Agregados_por_bairros_parentesco_BR.zip`
- `Agregados_por_bairros_obitos_BR.zip`
- `Agregados_por_bairros_domicilios_indigenas_BR.zip`, `..._pessoas_indigenas_BR.zip`
- `Agregados_por_bairros_domicilios_quilombolas_BR.zip`, `..._pessoas_quilombolas_BR.zip`

As etapas seguintes acrescentam aqui as linhas dos arquivos que baixarem.
