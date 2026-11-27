# Pergunta 2: Como se distribuem os indicadores de rendimento?

> Revisada na etapa C (2026-11-27). A primeira versão registrava o rendimento por bairro como
> indisponível. O IBGE publicou o rendimento do responsável em uma divulgação própria do Censo 2022,
> fora do diretório principal dos agregados, e esses dados agora entram aqui.

## Resposta curta

Metade das pessoas responsáveis pelo domicílio (entre as que têm rendimento) ganha até **R$ 1.212 por
mês** nos dois bairros. É a mesma mediana em Beiru/Tancredo Neves e em Pernambués, praticamente igual
à de Salvador (R$ 1.230). A média é mais alta em Pernambués (R$ 2.316) que em Beiru/Tancredo Neves
(R$ 2.036), e as duas ficam bem abaixo da média de Salvador (R$ 3.161). A média de Beiru/Tancredo Neves é
pouco confiável para comparação: a dispersão publicada pelo IBGE mostra valores extremos que puxam a
média para cima. Na alfabetização (15 anos ou mais), Beiru/Tancredo Neves fica 1,7 ponto percentual abaixo
de Pernambués.

## Dados

Fonte: IBGE, Censo Demográfico 2022, ano de referência 2022, script `etl/b_renda_habitacao.py`.
Rendimento: arquivos `Agregados_por_bairros_renda_responsavel_BR.csv` e
`Agregados_por_municipios_renda_responsavel_BR.csv` (divulgação "Rendimento do Responsável", versão
2026-05-08). Alfabetização: `Agregados_por_bairros_alfabetizacao_BR.csv` e equivalente municipal.
Salvador entra só como referência municipal.

| Indicador | Beiru/Tancredo Neves | Pernambués | Salvador (município) | Classificação |
|---|---|---|---|---|
| Rendimento mediano mensal do responsável (R$) | 1.212,00 | 1.212,00 | 1.230,00 | observado |
| Rendimento médio mensal do responsável (R$) | 2.035,87 | 2.316,25 | 3.160,73 | observado |
| Desvio-padrão do rendimento do responsável (R$, raiz de V06005) | 58.617 | 3.307 | 13.801 | observado (variância publicada) |
| Pessoas responsáveis em DPPO (V06001) | 15.454 | 21.561 | 958.539 | observado |
| Taxa de alfabetização de 15 anos ou mais (%) | 95,04 | 96,76 | 96,63 | derivado |
| Pessoas de 15 anos ou mais que não sabem ler e escrever | 1.558 | 1.435 | 67.617 | observado |

Comparações derivadas (mesmo indicador, mesmo ano e mesma unidade; Pernambués como base):

- Mediana do rendimento: diferença de R$ 0 (0%) entre os bairros. Os dois ficam R$ 18 (1,5%) abaixo da
  mediana de Salvador.
- Média do rendimento: Beiru/Tancredo Neves tem R$ 280,38 a menos que Pernambués (−12,1%). Em relação a
  Salvador, a média é 35,6% menor em Beiru/Tancredo Neves e 26,7% menor em Pernambués.
- Alfabetização: Beiru/Tancredo Neves fica 1,72 ponto percentual abaixo de Pernambués e 1,59 p.p.
  abaixo de Salvador.

## Interpretação

- **Rendimento típico baixo e igual nos dois bairros.** Pela mediana, o responsável "do meio" ganha
  R$ 1.212, o valor do salário mínimo vigente em 2022 (Lei nº 14.358/2022). É comum que a mediana caia
  exatamente no mínimo, porque muita gente recebe esse valor. Por essa medida, os dois bairros não se
  diferenciam entre si e quase não se diferenciam de Salvador.
- **A média separa os bairros, mas com ressalva.** A média maior de Pernambués sugere mais responsáveis
  com rendimentos acima do mínimo. Em Beiru/Tancredo Neves, porém, o desvio-padrão (R$ 58.617, cerca de
  29 vezes a média) indica um ou poucos valores muito altos no universo do bairro. Sem eles, a média de
  Beiru/Tancredo Neves seria menor, e a diferença em relação a Pernambués provavelmente maior. O
  arquivo não permite saber quanto, porque não traz a distribuição.
- **Distância em relação a Salvador.** A média de Salvador (R$ 3.161) fica muito acima da mediana
  (R$ 1.230), o que é compatível com rendimentos altos concentrados em parte do município. Os dois
  bairros estão abaixo da média municipal, mas a comparação com o município mistura territórios
  muito diferentes e deve ser lida só como referência.
- **Alfabetização.** A taxa menor em Beiru/Tancredo Neves é coerente com a média de rendimento menor,
  mas os dados agregados não permitem afirmar relação de causa entre as duas.
- **Leitura socioenergética.** Rendimento baixo aumenta o peso da conta de energia no orçamento, mas
  **baixa renda não comprova pobreza energética de uma família**. Para isso seriam necessários dados por
  domicílio (gasto com energia, inadimplência, cortes, equipamentos), que o Censo não traz (etapa D).

O que os dados **não** indicam: a renda total das famílias, a renda por pessoa, a proporção de
domicílios abaixo de um corte de pobreza e a informalidade do trabalho.

## Limitações

- **Universo.** O rendimento é só o da pessoa responsável pelo domicílio que tem rendimento. Ficam de
  fora os outros moradores e os responsáveis sem rendimento. Não é renda domiciliar nem per capita.
- **Sem faixas.** O arquivo por bairro não traz faixas de salário mínimo, por isso não é possível medir a
  concentração de baixa renda (registrado no catálogo, em "não disponíveis").
- **Valores nominais de 2022**, sem correção pela inflação, com data de referência do Censo.
- **Média sensível a extremos.** Use a mediana para comparar os bairros. A dispersão vem da variância
  publicada pelo IBGE (V06005), e não foi feita nenhuma correção sobre os dados.
- **Alfabetização declarada.** A variável V00900 mede só se a pessoa declara saber ler e escrever um
  bilhete simples. Não mede anos de estudo nem letramento funcional.
- **Escala.** Os limites dos bairros são os do IBGE no Censo 2022. O IVS do IPEA (etapa E) usa outra escala
  e outro ano e não pode ser misturado a estes valores.
