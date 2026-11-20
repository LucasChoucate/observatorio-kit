# Requisitos do projeto (resumo do roteiro do professor)

Fonte: roteiro "Situação de Aprendizagem: Observatório de Vulnerabilidade Socioenergética de Salvador", UC Desenvolvimento Fullstack, Prof. Celso Barreto, AV3 parcial.

## Objetivo

Construir um observatório web que coleta, integra, armazena, analisa e visualiza dados públicos sobre vulnerabilidade social e possíveis condições de vulnerabilidade energética em dois territórios de Salvador/BA: **Beiru/Tancredo Neves** e **Pernambués**.

Questão norteadora: como integrar dados públicos do IBGE, IPEA e EPE em uma aplicação web capaz de caracterizar, comparar e visualizar esses indicadores nos dois bairros?

O sistema deve produzir **análises fundamentadas, não apenas gráficos**. Para cada indicador é obrigatório explicitar origem, escala geográfica, ano de referência, metodologia e limitações.

## Fontes obrigatórias

| Fonte | O que investigar | Uso |
|---|---|---|
| IBGE, Censo 2022 | População, domicílios, rendimento, saneamento, características do entorno | Eixo principal da comparação entre bairros |
| IPEA, Atlas da Vulnerabilidade Social (IVS) | Renda e trabalho, capital humano, infraestrutura urbana, IVS | Contexto social na escala em que foi publicado |
| EPE, Anuário Estatístico de Energia Elétrica | Consumo residencial, consumidores, evolução do mercado | Contexto energético da Bahia |

Links:
1. https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/
2. https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html
3. http://ivs.ipea.gov.br/
4. https://www.epe.gov.br/pt/publicacoes-dados-abertos/dados-abertos/dados-do-anuario-estatistico-de-energia-eletrica

**Cuidados metodológicos do professor:**
- Dados da EPE podem existir só em escala estadual. Não atribuir valores da Bahia aos bairros.
- Confirmar a equivalência geográfica entre "Beiru" e "Tancredo Neves" nas bases e malhas oficiais.
- Usar o Censo 2022 como eixo principal; IPEA e EPE apenas nas escalas disponíveis, sem inferência geográfica indevida.
- Baixa renda não comprova pobreza energética de uma família. Iluminação pública não mede continuidade ou qualidade do fornecimento residencial.

## Dimensões e indicadores candidatos

| Dimensão | Indicadores candidatos | Fonte |
|---|---|---|
| Demográfica | População, domicílios, densidade, composição etária | IBGE |
| Econômica | Rendimento, concentração de baixa renda | IBGE |
| Social | Escolaridade, indicadores de vulnerabilidade | IBGE / IPEA |
| Habitacional | Água, esgotamento sanitário, coleta de lixo | IBGE |
| Urbana | Iluminação pública, pavimentação, arborização, entorno | IBGE |
| Energética | Acesso à eletricidade, contexto de consumo residencial | IBGE / EPE |
| Socioenergética | Associações entre renda, moradia e riscos energéticos | Indicadores derivados |

**Classificação obrigatória de cada indicador:**
- **Observado**: valor publicado diretamente pela fonte oficial para o território e o período.
- **Derivado**: cálculo sobre variáveis oficiais, com fórmula documentada.
- **Proxy/estimativa**: aproximação de fenômeno não medido diretamente; exige justificativa e limitações.

## Arquitetura obrigatória

IBGE / IPEA / EPE → ETL (Python) → Supabase (PostgreSQL + API) → Dashboard React (Vite) → Vercel. Git e GitHub para versionamento, colaboração e deploy contínuo.

- O dashboard **consulta os dados no Supabase**. Não pode depender só de CSV carregado no navegador.
- Chaves privilegiadas nunca no frontend.
- Gráficos com Recharts, mapa com Leaflet.

## Telas obrigatórias

1. **Visão geral**: população, domicílios, rendimento e infraestrutura; seleção de bairro; fonte e ano visíveis.
2. **Comparativo territorial**: barras, tabelas, diferenças absolutas e percentuais quando comparáveis.
3. **Mapa de vulnerabilidade**: limites oficiais, camadas temáticas, legendas, setores censitários quando compatíveis.
4. **Análise energética**: consumo e consumidores da Bahia, separando indicadores estaduais dos dados locais.
5. **Metodologia e fontes**: dicionário de indicadores, fórmulas, datas, escala geográfica, arquivos e limitações.

Mínimo de **6 visualizações funcionais** no total. Interface responsiva.

## Banco de dados (modelo inicial do professor, pode ser ajustado)

Tabelas: territórios, fontes, indicadores, observações, análises. A tabela de observações preserva território, fonte e período de cada registro. Consultas filtram por bairro, ano, fonte e dimensão. Dados estaduais não são replicados como observação de bairro. O esquema adotado pela equipe está em `docs/etapas/ETAPA_A.md`.

## Desafio analítico obrigatório (respostas vão no relatório)

1. Qual é o perfil demográfico de Beiru/Tancredo Neves e Pernambués?
2. Como se distribuem os indicadores de rendimento?
3. Quais condições habitacionais podem representar vulnerabilidade?
4. Quais diferenças existem na infraestrutura urbana?
5. Quais indicadores permitem discutir riscos de vulnerabilidade energética?
6. Como os dados energéticos da Bahia contextualizam os territórios?
7. Que informações adicionais seriam necessárias para medir vulnerabilidade energética familiar diretamente?
8. Que intervenções poderiam ser priorizadas, considerando evidências e limitações?

**Desafio adicional (opcional): IEVS exploratório.** Índice com dimensões de renda, habitação e condições urbanas, explicitando variáveis, normalização, pesos e testes de sensibilidade. Nunca apresentar como índice oficial ou medida validada de pobreza energética.

## Critérios de avaliação

| Critério | Peso |
|---|---|
| Git/GitHub e colaboração | 10% |
| Seleção, rastreabilidade e tratamento de dados | 20% |
| Modelagem e Supabase | 15% |
| Interface e funcionalidades | 20% |
| Análise territorial e interpretação crítica | 20% |
| Deploy e testes | 10% |
| Documentação e apresentação | 5% |

## Entregáveis finais

- Repositório GitHub com código, commits e documentação.
- Aplicação publicada na Vercel e conectada ao Supabase.
- Banco PostgreSQL populado e scripts de importação.
- Dashboard com indicadores, filtros, gráficos e mapa.
- Catálogo de fontes, períodos e escalas territoriais (mínimo 12 indicadores).
- Relatório comparativo dos dois bairros com conclusões e limitações.
- Apresentação e demonstração do ciclo: dados oficiais → ETL → Supabase → dashboard → GitHub → Vercel → análise territorial.
