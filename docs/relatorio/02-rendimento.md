# Pergunta 2: Como se distribuem os indicadores de rendimento?

## Resposta curta

Nos dados abertos do Censo Demográfico 2022 divulgados pelo IBGE até o momento (Agregados por Setores
Censitários, recorte por bairros), **não foram publicadas variáveis de rendimento nominal nem faixas de
salário mínimo**. O dicionário oficial do IBGE comprova que nenhuma variável de renda foi agregada nessa escala.
Em cumprimento aos critérios metodológicos do projeto (REQUISITOS.md: *nunca inventar dados nem estimar
em silêncio*), a indisponibilidade foi formalmente registrada.

Como indicador social substitutivo e proxy de capital humano, a **taxa de alfabetização da população de
15 anos ou mais** mostra que Pernambués atinge 96,76% (alinhado aos 96,63% de Salvador como um todo),
enquanto Beiru/Tancredo Neves apresenta 95,04% (-1,72 ponto percentual). Embora ambos os bairros
possuam taxas superiores a 95%, a diferença reflete níveis distintos de escolarização acumulada, fator
fortemente correlacionado com a inserção no mercado de trabalho formal e com a renda domiciliar.

## Dados

Fonte: IBGE, Censo Demográfico 2022, Agregados por Setores Censitários (agregados por bairro e por
município), arquivo `Agregados_por_bairros_alfabetizacao_BR.csv` e `Agregados_por_municipios_alfabetizacao_BR.csv`,
ano 2022, tratados pelo script `etl/b_renda_habitacao.py`. Salvador entra como referência municipal.

| Indicador | Beiru/Tancredo Neves | Pernambués | Salvador (município) | Classificação |
|---|---|---|---|---|
| Rendimento médio do responsável pelo domicílio (R$) | Não disponível | Não disponível | Não disponível | - |
| Percentual de domicílios com renda até 1/2 SM (%) | Não disponível | Não disponível | Não disponível | - |
| População de 15 anos ou mais (pessoas) | 31.414 | 44.238 | 2.006.599 | observado |
| Pessoas alfabetizadas com 15 anos ou mais (pessoas) | 29.856 | 42.803 | 1.938.982 | observado |
| Pessoas não alfabetizadas com 15 anos ou mais (pessoas) | 1.558 | 1.435 | 67.617 | observado |
| Taxa de alfabetização de 15 anos ou mais (%) | 95,04 | 96,76 | 96,63 | derivado |

Comparações derivadas dos dados de alfabetização:

- Pernambués possui taxa de alfabetização 1,72 ponto percentual acima de Beiru/Tancredo Neves.
- Em Beiru/Tancredo Neves, há 1.558 pessoas de 15 anos ou mais que não sabem ler e escrever (4,96% da faixa etária).
- Em Pernambués, há 1.435 pessoas não alfabetizadas (3,24% da faixa etária), mesmo com uma população jovem/adulta 40,8% maior.
- A taxa de Pernambués é ligeiramente superior à média do município de Salvador (+0,13 p.p.), enquanto Beiru/Tancredo Neves fica 1,59 p.p. abaixo da média municipal.

## Interpretação

- **Indisponibilidade do rendimento no Censo 2022 por bairro.** No Censo 2010, os dados da amostra continham variáveis de rendimento médio por setor censitário e bairro. No entanto, na divulgação de agregados do Censo 2022 até 2026, o IBGE priorizou as características dos domicílios, demografia básica, cor/raça e alfabetização, postergando ou não divulgando tabelas de renda na malha de bairros. Seguir rigorosamente a fonte oficial impede a adoção de interpolações não fundamentadas.
- **Capital humano e potencial de renda.** A literatura socioeconômica e os estudos do IPEA estabelecem relação direta entre escolaridade/alfabetização e rendimento do trabalho. A taxa menor em Beiru/Tancredo Neves (95,04%), combinada com o perfil demográfico mais jovem apurado na Etapa A (18,0% de crianças de 0 a 14 anos contra 15,8% em Pernambués), indica maior razão de dependência econômica e potencial concentração de trabalhadores em ocupações informais e de menor remuneração.
- **Risco socioenergético.** Famílias em situação de vulnerabilidade de renda enfrentam maior dificuldade para manter o pagamento regular das tarifas de energia elétrica e arcar com equipamentos elétricos eficientes (como geladeiras modernas com selo Procel A). No entanto, como enfatizado pelo roteiro da disciplina, **baixa renda não comprova pobreza energética por si só**, mas configura um dos seus principais pilares condicionantes quando associada a habitações precárias e tarifas elevadas.
- **Complementação na Etapa E.** O Atlas da Vulnerabilidade Social (IVS) do IPEA, que inclui a dimensão Renda e Trabalho, será incorporado na Etapa E na escala territorial em que foi publicado (Unidades de Desenvolvimento Humano - UDHs e município de Salvador), fornecendo a contextualização histórica e comparativa necessária.

## Limitações

- **Ausência de dados de renda na escala intraurbana de bairro no Censo 2022.** Não é metodologicamente aceitável atribuir o rendimento médio de Salvador (R$ 3.000+) a bairros periféricos que sabidamente possuem padrões diferenciados.
- **Conceito de alfabetização no Censo.** A variável V00900 mede apenas se a pessoa declara saber ler e escrever um bilhete simples no idioma que conhece. Não mede anos de estudo concluídos, letramento funcional ou qualificação técnica e profissional.
