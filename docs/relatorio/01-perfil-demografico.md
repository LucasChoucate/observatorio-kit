# Pergunta 1: Qual é o perfil demográfico de Beiru/Tancredo Neves e Pernambués?

## Resposta curta

Pernambués tem mais moradores (52.564) e mais domicílios ocupados (21.568) que Beiru/Tancredo Neves
(38.329 pessoas e 15.458 domicílios), mas ocupa o dobro da área. Por isso Beiru/Tancredo Neves é o
bairro mais denso: cerca de 23,4 mil hab/km², contra 16,4 mil em Pernambués (43% a mais). Beiru/Tancredo
Neves também é um pouco mais jovem (18,0% de 0 a 14 anos, contra 15,8%). Os dois bairros têm proporções
de idosos (60+) muito parecidas, perto de 15%, levemente abaixo da de Salvador (16,5%).

## Dados

Fonte de todos os valores: IBGE, Censo Demográfico 2022, Agregados por Setores Censitários (agregados
por bairro e por município), ano de referência 2022, carregados pelo script `etl/a_demografia.py`.
Salvador aparece apenas como referência municipal.

| Indicador | Beiru/Tancredo Neves | Pernambués | Salvador (município) | Classificação |
|---|---|---|---|---|
| População residente (pessoas) | 38.329 | 52.564 | 2.417.678 | observado |
| Domicílios particulares ocupados | 15.458 | 21.568 | 959.423 | observado |
| Média de moradores por domicílio | 2,5 | 2,4 | 2,5 | observado |
| Área (km²) | 1,64 | 3,21 | 693,44 | observado |
| Densidade demográfica (hab/km²) | 23.426 | 16.388 | 3.486 | derivado |
| População de 0 a 14 anos (%) | 18,0 | 15,8 | 16,8 | derivado |
| População de 15 a 59 anos (%) | 67,0 | 69,2 | 66,7 | derivado |
| População de 60 anos ou mais (%) | 15,0 | 15,0 | 16,5 | derivado |
| Mulheres na população (%) | 54,2 | 53,9 | 54,5 | derivado |

Comparações derivadas dos valores acima (mesmo indicador, mesmo ano e mesma unidade):

- Pernambués tem 37,1% mais moradores e 39,5% mais domicílios ocupados que Beiru/Tancredo Neves, em uma
  área 1,96 vez maior.
- A densidade de Beiru/Tancredo Neves é 42,9% maior que a de Pernambués.
- Os dois bairros somam 3,8% da população de Salvador (1,6% e 2,2%).
- Diferença na população de 0 a 14 anos: +2,2 pontos percentuais em Beiru/Tancredo Neves.

## Interpretação

- **Ocupação mais intensa em Beiru/Tancredo Neves.** Com menos moradores e a mesma média de moradores
  por domicílio, o bairro concentra a população em metade da área de Pernambués. Isso sugere um tecido
  urbano mais compacto, com mais domicílios por km². Esse padrão pode pressionar mais a infraestrutura
  urbana (etapa C).
- **Tamanho dos domicílios semelhante.** A média de moradores por domicílio é praticamente igual nos
  dois bairros e em Salvador (2,4 a 2,5). Pela média, não há indício de domicílios mais cheios em um dos
  bairros.
- **Estrutura etária.** Beiru/Tancredo Neves tem mais crianças e adolescentes. Pernambués tem mais
  pessoas de 15 a 59 anos. A proporção de idosos é igual nos dois e um pouco menor que a do município.
  Uma parcela maior de crianças pode significar mais demanda por escola e cuidado, o que interessa à
  leitura de renda e vulnerabilidade (etapas B e D).
- **Predomínio feminino.** Os dois bairros têm maioria de mulheres, em proporção próxima à de Salvador.

O que os dados **não** indicam: a densidade bruta não mede o adensamento dentro das moradias
(cômodos ou dormitórios por pessoa), e uma média de moradores parecida não exclui que haja domicílios
superlotados em parte do bairro. Nenhum desses indicadores, sozinho, mede vulnerabilidade social ou
energética.

## Limitações

- **Escala e limites.** Os bairros seguem a delimitação do IBGE no Censo 2022. No IBGE,
  Beiru/Tancredo Neves é um único bairro (código 2927408018), e o limite pode não coincidir com a
  percepção dos moradores ou com outras delimitações municipais.
- **Densidade bruta.** A área usada é a do polígono inteiro, incluindo vias, áreas verdes e
  equipamentos. A comparação com Salvador é pouco informativa, porque a área municipal inclui ilhas e
  áreas não urbanizadas.
- **Faixas etárias.** O arquivo agrupa as idades em 60 a 69 e 70 ou mais, por isso o recorte de idosos
  é 60+ (não 65+). No arquivo oficial, a soma das faixas fica ligeiramente abaixo do total de moradores
  (1 pessoa em Beiru/Tancredo Neves, 6 em Pernambués e 558 em Salvador). As faixas foram calculadas
  sobre a soma das faixas, e a diferença não foi corrigida.
- **Totais de população.** A população vem do arquivo básico (V0001, versão de 20/05/2026) e as
  faixas vêm do arquivo de demografia (V01006). Em Beiru/Tancredo Neves os dois totais diferem em
  6 pessoas.
- **Ano.** Todos os dados são de 2022 e não captam mudanças posteriores.
