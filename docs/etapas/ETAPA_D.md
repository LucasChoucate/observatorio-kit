# Etapa D: Dimensão energética + Tela 4 (Análise energética)

**Branch:** `feature/etapa-d-energia`
**Perguntas do relatório:** 5, 6 e 7
**Tela:** 4 (Análise energética) completa

Pré-requisito: etapa C concluída (ver `docs/PROGRESSO.md`). Leia os registros de passagem das etapas anteriores.

Os critérios de aceite estão em `docs/PROGRESSO.md`, seção "Etapa D".

---

## Parte 1: Revisão da etapa C

Revise o PR da etapa C (se ainda estiver aberto), rode o projeto e confira o mapa.

## Parte 2: Dados da EPE (ETL)

Script `etl/d_energia_epe.py`. Fonte: dados abertos do Anuário Estatístico de Energia Elétrica (link 4 do REQUISITOS).

1. Baixar o(s) arquivo(s) de consumo e de número de consumidores por UF e classe. Registrar URL, nome do arquivo, data de acesso e o ano mais recente disponível.
2. Indicadores, **todos gravados no território Bahia** (tipo `estado`), nunca nos bairros:
   - `ene_consumo_residencial_ba` (observado, MWh, série histórica de pelo menos 5 anos);
   - `ene_consumidores_residenciais_ba` (observado, unidades consumidoras, mesma série);
   - `ene_consumo_medio_residencial_ba` (derivado: consumo ÷ consumidores, em kWh/mês ou kWh/ano; documentar a conversão);
   - opcional, para contexto: os mesmos indicadores para Brasil ou Nordeste, gravados nos territórios correspondentes.
3. Saídas: `data/processed/d_energia_epe.csv` e `docs/qualidade/d_energia_epe.md`.

## Parte 3: Dados energéticos locais (IBGE)

Verificar se o Censo 2022 publicou, por bairro, alguma variável sobre **energia elétrica nos domicílios** (existência, origem). Se existir, criar indicador `ene_*` por bairro (observado ou derivado). Se não existir, registrar em "não disponíveis".

## Parte 4: Indicadores socioenergéticos (proxies)

Com base nos dados das etapas A, B e C, propor no máximo 2 ou 3 indicadores **proxy** que permitam discutir risco de vulnerabilidade energética nos bairros, por exemplo a combinação de baixa renda com moradia precária. Para cada um:

- classificação `proxy`, dimensão `socioenergetica`;
- fórmula explícita no catálogo e no campo `metodologia`;
- justificativa e limitações no campo `limitacoes` (lembrar: baixa renda não comprova pobreza energética de uma família).

Script `etl/d_socioenergetico.py`.

## Parte 5: Tela 4, Análise energética

- Seção **"Contexto estadual: Bahia"** com selo visual bem diferente dos dados locais (cor ou faixa "Dado estadual, não se refere aos bairros").
  - **Gráfico de linha** com a evolução do consumo residencial da Bahia.
  - **Gráfico** com a evolução dos consumidores residenciais ou do consumo médio por consumidor.
- Seção **"Indicadores locais"** com os dados do IBGE por bairro (se existirem) e os proxies socioenergéticos, com aviso de que são aproximações.
- Texto explicando por que os dados estaduais não podem ser aplicados aos bairros.
- Pelo menos **2 visualizações** nesta tela.
- Responsiva.

## Parte 6: Documentação

- Catálogo: indicadores EPE, IBGE energéticos, proxies e não disponíveis.
- `docs/relatorio/05-riscos-energeticos.md` (pergunta 5), `docs/relatorio/06-contexto-bahia.md` (pergunta 6), `docs/relatorio/07-dados-necessarios.md` (pergunta 7: quais dados seriam necessários para medir vulnerabilidade energética familiar diretamente, por exemplo gasto com energia sobre renda, consumo por unidade consumidora em escala local, cortes por inadimplência, tarifa social, conforto térmico; dizer onde poderiam ser obtidos, como distribuidora, ANEEL, pesquisa de campo).
- README: preencher o nome do responsável da etapa D.
- Preencher a seção da etapa D em `docs/PROGRESSO.md` e passar para a etapa E.
