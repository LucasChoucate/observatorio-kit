# Pergunta 4: Quais diferenças existem na infraestrutura urbana?

## Resposta curta

Iluminação pública e via pavimentada chegam a quase todos os domicílios dos dois bairros (acima de
96%). As diferenças estão na infraestrutura para pedestres, na drenagem e no verde. Só cerca de
**4 em cada 10 domicílios** têm calçada na face de quadra (39,5% em Beiru/Tancredo Neves e 38,6% em
Pernambués, contra 56,9% em Salvador). Beiru/Tancredo Neves fica atrás de Pernambués em arborização
(−9,5 p.p.), bueiro (−8,0 p.p.) e rampa para cadeirante (0,7% contra 7,1%). Nos dois bairros, **um terço
dos domicílios** está em vias onde só passam pedestres, bicicletas e motos (33,3% e 35,0%, contra
22,9% em Salvador). A média do bairro esconde um contraste interno forte: nos setores que o IBGE
classifica como Favela e Comunidade Urbana, a calçada é rara e a via sem veículos é comum. Nos demais
setores, o padrão se inverte.

## Dados

Fonte: IBGE, Censo Demográfico 2022, divulgação "Características urbanísticas do entorno dos
domicílios", arquivos `Agregados_por_bairros_entorno_domicílios_BR.csv`,
`Agregados_por_setores_entorno_domicílios_BR.csv` e `Agregados_por_municipios_entorno_domicílios_BR.csv`
(2025-04-17), ano de referência 2022, script `etl/c_urbano.py`. Universo: domicílios particulares
permanentes ocupados em setores da pesquisa do entorno (V05000): 15.120 em Beiru/Tancredo Neves
(97,8% dos domicílios ocupados), 21.546 em Pernambués (99,9%) e 956.277 em Salvador. Todos os
indicadores são derivados: V05xxx ÷ V05000 × 100.

| Indicador (% de domicílios cuja face de quadra tem…) | Beiru/Tancredo Neves | Pernambués | Salvador (município) | Beiru − Pernambués | Classificação |
|---|---|---|---|---|---|
| Iluminação pública (`urb_iluminacao_publica_pct`) | 96,5 | 98,5 | 98,2 | −2,0 p.p. | derivado |
| Via pavimentada (`urb_via_pavimentada_pct`) | 98,2 | 98,7 | 97,9 | −0,4 p.p. | derivado |
| Calçada (`urb_calcada_pct`) | 39,5 | 38,6 | 56,9 | +0,9 p.p. | derivado |
| Bueiro ou boca de lobo (`urb_bueiro_pct`) | 60,9 | 68,9 | 55,6 | −8,0 p.p. | derivado |
| Ao menos uma árvore (`urb_arborizacao_pct`) | 24,5 | 34,0 | 34,5 | −9,5 p.p. | derivado |
| Rampa para cadeirante (`urb_rampa_cadeirante_pct`) | 0,7 | 7,1 | 7,1 | −6,4 p.p. | derivado |
| Via só para pedestres, bicicletas e motos (`urb_via_sem_veiculos_pct`) | 33,3 | 35,0 | 22,9 | −1,6 p.p. | derivado |

**Distribuição por setor censitário** (mediana e intervalo entre o 1º e o 3º quartil dos setores com
valor; 68 setores em Beiru/Tancredo Neves e 99 em Pernambués, de 72 e 100):

| Indicador | Beiru/Tancredo Neves: mediana (Q1 a Q3) | Pernambués: mediana (Q1 a Q3) |
|---|---|---|
| Calçada (%) | 31,4 (13,5 a 64,6) | 19,2 (5,0 a 85,7) |
| Via sem veículos (%) | 35,9 (10,7 a 53,6) | 32,4 (0,0 a 65,4) |
| Arborização (%) | 13,1 (0,0 a 39,6) | 22,8 (5,7 a 51,7) |
| Bueiro (%) | 67,9 (33,4 a 87,9) | 77,7 (56,4 a 96,3) |
| Iluminação pública (%) | 100,0 (97,9 a 100,0) | 100,0 (100,0 a 100,0) |

- Setores com menos de 25% de domicílios com calçada: 29 de 68 em Beiru/Tancredo Neves e 52 de 99 em
  Pernambués.
- Setores em que metade ou mais dos domicílios está em via sem veículos: 19 em Beiru/Tancredo Neves e
  38 em Pernambués.
- Setores com iluminação pública abaixo de 90%: 4 em Beiru/Tancredo Neves (mínimo 67,8%) e 2 em
  Pernambués (mínimo 80,0%).
- Entre os setores, a proporção de via sem veículos e a de calçada andam em sentidos opostos
  (correlação de −0,69 em 167 setores).

**Cálculo complementar: setores de Favela e Comunidade Urbana × demais setores.** Classificação
`CD_TIPO` da malha do Censo 2022. Somas de V05xxx e V05000 dos setores de cada tipo, pelo
mesmo método dos indicadores. Ficam de fora os 2 setores de Beiru/Tancredo Neves sem linha no
arquivo do entorno e o setor com sigilo (tipo convento, hospital ou ILPI).

| Bairro e tipo de setor | Domicílios (V05000) | Via sem veículos (%) | Calçada (%) | Iluminação pública (%) |
|---|---|---|---|---|
| Beiru/Tancredo Neves: Favela e Comunidade Urbana (61 setores com dado, de 63) | 13.733 (90,8% do bairro) | 35,9 | 33,9 | 96,2 |
| Beiru/Tancredo Neves: demais setores (8 não especiais) | 1.387 | 8,2 | 94,7 | 100,0 |
| Pernambués: Favela e Comunidade Urbana (73 setores) | 15.419 (71,6% do bairro) | 47,6 | 17,6 | 97,9 |
| Pernambués: demais setores (27 não especiais) | 6.127 | 3,1 | 91,3 | 100,0 |

## Interpretação

- **O básico está coberto; o que falta é o espaço do pedestre.** Poste e pavimento chegam a quase
  todas as faces. A falta de calçada, de rampa e de árvores mostra um entorno pouco preparado para quem
  anda a pé, para pessoas com deficiência e para o conforto térmico. Em Beiru/Tancredo Neves,
  arborização e rampa ficam bem abaixo de Pernambués e de Salvador.
- **Vias estreitas e sem passagem de veículos.** Um terço dos domicílios mora em becos, escadarias ou
  vielas onde só passam pedestres, bicicletas e motos, bem acima da proporção de Salvador. Isso é
  compatível com o uso predominante de caçamba para o lixo (pergunta 3), mas **não prova causa**: o
  Censo não registra por que o domicílio usa caçamba.
- **A média do bairro esconde dois tecidos urbanos.** Pernambués tem médias parecidas com as de
  Beiru/Tancredo Neves em calçada e via sem veículos, mas por composição: 28% dos domicílios estão em
  setores comuns, com calçada em mais de 90% das faces, e o restante em setores de favela e
  comunidade urbana, onde só 17,6% têm calçada e quase metade está em via sem veículos. Beiru/Tancredo
  Neves é mais homogêneo, com nove em cada dez domicílios em setores de favela e comunidade urbana. O
  mapa da Tela 3 mostra onde essas carências se concentram.
- **Leitura socioenergética, com cautela.** Iluminação pública alta **não** indica que o fornecimento
  de energia nas casas seja contínuo ou de boa qualidade. A menor arborização pode aumentar a exposição
  ao calor e a demanda por ventilação, e as vias sem veículos podem dificultar serviços de manutenção.
  São hipóteses a testar, porque estes dados não medem consumo, interrupções nem tempo de reparo (etapa D
  e pergunta 7).

O que os dados **não** indicam: a qualidade ou a manutenção dos itens (poste apagado, buraco, calçada
quebrada), alagamentos, esgoto a céu aberto e lixo acumulado. Os dois últimos não fazem parte do
entorno do Censo 2022 (ver "não disponíveis" no catálogo).

## Limitações

- **Face de quadra, não a casa.** O recenseador registra a característica na face de quadra onde fica o
  domicílio. A presença do item não informa largura, estado nem funcionamento.
- **Não declarados.** O denominador V05000 inclui as faces não declaradas (1,1% em Beiru/Tancredo
  Neves, 0,9% em Pernambués e 0,3% em Salvador), como nos percentuais publicados pelo IBGE. O valor é um
  piso. Em 2 setores, 77,6% e 100% das faces não foram declaradas; eles aparecem como "sem dado" no mapa,
  em vez de um valor artificialmente baixo. Mais 3 setores não têm dado: dois fora da pesquisa do
  entorno e um com sigilo (detalhes em `docs/qualidade/c_urbano.md`).
- **Domicílios × moradores.** Os indicadores contam domicílios. Os "dados percentuais" do IBGE contam
  moradores. A diferença mediana por setor fica entre 0 e 0,74 p.p., conferida pelo script.
- **Setores pequenos.** Setores com poucos domicílios (o menor tem 19 no universo do entorno) têm
  percentuais mais instáveis. A base aparece no popup do mapa.
- **Limites oficiais.** Bairros e setores seguem a malha do IBGE no Censo 2022 (versão de 2024-11-13). A
  área recalculada em SIRGAS 2000 / UTM 24S confere com o AREA_KM2 oficial (−0,07%). A classificação
  Favela e Comunidade Urbana é a do IBGE e pode diferir de outras delimitações.
- **Ano.** Os dados são de 2022 e não captam obras posteriores.
