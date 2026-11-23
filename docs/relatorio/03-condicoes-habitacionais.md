# Pergunta 3: Quais condições habitacionais podem representar vulnerabilidade?

## Resposta curta

A análise dos dados do Censo 2022 para Beiru/Tancredo Neves e Pernambués revela dois padrões distintos
em relação às condições habitacionais:

1. **Alta cobertura nominal de saneamento básico:** ambos os bairros apresentam índices formais
   de abastecimento de água pela rede geral (99,94% em Beiru e 99,84% em Pernambués) e de esgotamento
   sanitário adequado (98,28% em Beiru e 98,86% em Pernambués) superiores à média de Salvador (94,95%).
   A carência extrema de banheiro privativo é quase nula (4 domicílios em Beiru e zero em Pernambués).
2. **Forte vulnerabilidade na logística de descarte de resíduos:** embora mais de 95% dos domicílios
   tenham lixo recolhido pelo serviço de limpeza, **68,22% dos domicílios de Beiru/Tancredo Neves e
   54,66% de Pernambués dependem de caçambas comunitárias** (contra 40,84% em Salvador). Apenas 29,22%
   dos domicílios em Beiru contam com coleta porta a porta.

Essa dependência massiva de caçambas é o principal indicador de precariedade habitacional e urbanística
revelado pelos dados: reflete a existência de becos estreitos, escadarias íngremes e traçado viário que
impede o acesso de veículos de serviços públicos essenciais, incluindo viaturas de manutenção da rede elétrica.

## Dados

Fonte: IBGE, Censo Demográfico 2022, Agregados por Setores Censitários, arquivo
`Agregados_por_bairros_caracteristicas_domicilio2_BR.csv` e equivalente municipal, ano 2022,
tratados pelo script `etl/b_renda_habitacao.py`. Universo: Domicílios Particulares Permanentes Ocupados (DPPO).

| Indicador | Beiru/Tancredo Neves | Pernambués | Salvador (município) | Classificação |
|---|---|---|---|---|
| Total de DPPO (domicílios) | 15.436 | 21.539 | 957.587 | observado |
| Água por rede geral de distribuição (%) | 99,94 | 99,84 | 99,22 | derivado |
| Esgotamento adequado (rede ou fossa ligada) (%) | 98,28 | 98,86 | 94,95 | derivado |
| Lixo coletado por serviço de limpeza (%) | 97,45 | 95,54 | 98,15 | derivado |
| Lixo coletado porta a porta no domicílio (%) | 29,22 | 40,87 | 57,31 | derivado |
| Lixo depositado em caçamba pública (%) | 68,22 | 54,66 | 40,84 | derivado |
| Domicílios sem banheiro de uso exclusivo (%) | 0,03 | 0,00 | 0,05 | derivado |

Comparações territoriais derivadas dos dados:

- **Abastecimento de água:** cobertura praticamente universalizada na rede física em ambos os territórios (> 99,8%).
- **Esgotamento sanitário:** Pernambués possui proporção de esgoto adequado 0,58 p.p. superior à de Beiru/Tancredo Neves; ambos superam a média soteropolitana (onde áreas insulares e rurais reduzem o índice municipal).
- **Destino do lixo (porta a porta vs caçamba):** a proporção de domicílios dependentes de caçamba em Beiru/Tancredo Neves (68,22%) é 13,56 pontos percentuais maior que a de Pernambués (54,66%) e 27,38 pontos percentuais superior à de Salvador (40,84%).
- **Ausência de banheiro privativo:** residual em ambos os territórios (4 domicílios em Beiru e nenhum em Pernambués).

## Interpretação

- **O contraste entre rede formal e qualidade efetiva.** A quase totalidade de domicílios ligados à rede de água (99,9%) e esgoto (98,3%–98,9%) atesta que os dois bairros são áreas urbanas consolidadas, integradas à malha metropolitana da EMBASA. Contudo, **a presença de tubulação não garante regularidade de fornecimento**. Em áreas de topografia acidentada e alta densidade demográfica (como Beiru, com 23,4 mil hab/km²), intermitências no abastecimento e baixa pressão na rede são frequentes, obrigando as famílias a instalar reservatórios e motobombas elétricas. Isso gera consumo elétrico adicional não planejado, sobrecarregando o orçamento doméstico.
- **Topografia, tecido urbano e caçambas de lixo.** A enorme proporção de descarte em caçamba em Beiru (68,2%) e Pernambués (54,7%) expressa fisicamente a configuração espacial dessas comunidades: ocupações em encostas, ruelas estreitas e caminhos de pedestres que impedem o trânsito de caminhões compactadores. A necessidade de deslocamento a pé com resíduos sólidos por longas distâncias favorece pontos de descarte irregular em encostas, gerando riscos ambientais (entupimento de drenagens, proliferação de vetores e instabilidade de taludes na chuva).
- **Vulnerabilidade socioenergética conexa.** A mesma limitação espacial que impede o caminhão de lixo de chegar à porta do morador dificulta o acesso dos caminhões de emergência da concessionária de energia elétrica (Neoenergia Coelba). Em episódios de temporais, fiação partida, queima de transformadores ou curtos-circuitos, o restabelecimento do fornecimento em ruelas e becos é mais demorado e perigoso, prolongando a interrupção de energia nas residências vulneráveis.

## Limitações

- **Cobertura cadastral vs. continuidade do serviço.** As variáveis do Censo (V00111 e V00309) captam se o domicílio possui a ligação física à rede, mas não informam sobre pressão da água, frequência de racionamento semanal, potabilidade nem se o esgoto coletado recebe tratamento terciário completo antes do despejo final.
- **Universo de análise.** Os dados referem-se a Domicílios Particulares Permanentes Ocupados (DPPO), excluindo domicílios improvisados (DPIO) em situações de extrema precariedade habitacional (barracos sob pontes, materiais reaproveitados), embora estes representem parcela numericamente pequena no cômputo censitário geral.
