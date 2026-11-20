# Etapa C: Infraestrutura urbana + Tela 3 (Mapa de vulnerabilidade)

**Branch:** `feature/etapa-c-mapa-urbano`
**Pergunta do relatório:** 4
**Tela:** 3 (Mapa) completa

Pré-requisito: etapa B concluída (ver `docs/PROGRESSO.md`). Leia os registros de passagem das etapas A e B.

Os critérios de aceite estão em `docs/PROGRESSO.md`, seção "Etapa C".

---

## Parte 1: Revisão da etapa B

Revise o PR da etapa B (se ainda estiver aberto), rode o projeto e confira a Tela 2.

## Parte 2: Malha territorial oficial

1. Localizar no IBGE a malha oficial do Censo 2022 que contenha os limites dos bairros de Salvador e, se possível, os **setores censitários** dos dois bairros. Registrar URL, arquivo e data de acesso. Se a malha de bairros não estiver no IBGE, procurar a delimitação oficial da Prefeitura de Salvador e documentar a escolha.
2. Converter para GeoJSON (WGS84, EPSG:4326), recortar só Salvador ou só os dois bairros, simplificar a geometria para o arquivo ficar leve (alvo: menos de 2 MB) e salvar em `web/public/geo/`. Script em `etl/c_malha.py` (pode usar `geopandas`; acrescentar ao `requirements.txt`).
3. Calcular a **área oficial** de cada bairro em km² (projeção métrica adequada, por exemplo SIRGAS 2000 / UTM 24S) e, se a etapa A deixou pendente, gravar `dem_densidade_hab_km2` (derivado).
4. Registrar territórios do tipo `setor_censitario` no banco somente se forem usados no mapa.

O GeoJSON pode ser um arquivo estático (é geometria, não indicador). **Os valores que colorem o mapa vêm do Supabase.**

## Parte 3: Dados urbanos (ETL)

Script `etl/c_urbano.py`. Verificar no Censo 2022 o que existe sobre **características do entorno dos domicílios** por bairro ou setor (iluminação pública, pavimentação, calçada, arborização, bueiro, esgoto a céu aberto, lixo acumulado). Essa parte do Censo tem divulgação própria; confirmar se e em que escala foi publicada antes de assumir qualquer coisa.

- Se existir por bairro ou setor: indicadores `urb_*` em percentual de domicílios (derivados).
- Se não existir: registrar na seção "não disponíveis" do catálogo e usar como camadas do mapa os indicadores habitacionais da etapa B por setor censitário, se compatíveis.

Saídas: `data/processed/c_urbano.csv` e `docs/qualidade/c_urbano.md`.

Lembrete do roteiro: iluminação pública **não** mede continuidade ou qualidade do fornecimento de energia nas casas. Isso vai nas limitações.

## Parte 4: Tela 3, Mapa de vulnerabilidade

- Mapa Leaflet (`react-leaflet`) com base OpenStreetMap, centralizado nos dois bairros.
- Camada com os **limites oficiais** dos bairros.
- **Camadas temáticas** selecionáveis (pelo menos 2), por exemplo: um indicador urbano e um habitacional, coloridos em escala sequencial. Por setor censitário quando os dados forem compatíveis; senão, por bairro.
- **Legenda** com as faixas de valor, unidade, fonte e ano.
- Popup ao clicar: nome do território, valor do indicador, fonte, ano.
- Aviso visível quando a camada estiver em escala de bairro e não de setor.
- Corrigir o problema conhecido dos ícones padrão do Leaflet no Vite, se usar marcadores.
- Responsiva (altura do mapa adequada no celular).

Esta tela conta como pelo menos **1 visualização** (2 se as camadas forem bem distintas). Se ainda faltarem visualizações para chegar a 6 no projeto, acrescentar um gráfico comparativo dos indicadores urbanos ao lado do mapa.

Na **Tela 1**, acrescentar cards de infraestrutura urbana no espaço deixado pela etapa A.

## Parte 5: Documentação

- Catálogo: indicadores urbanos, malha (como fonte) e não disponíveis.
- `docs/relatorio/04-infraestrutura-urbana.md` (pergunta 4).
- README: preencher o nome do responsável da etapa C.
- Preencher a seção da etapa C em `docs/PROGRESSO.md` e passar para a etapa D.
