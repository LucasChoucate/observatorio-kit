# Etapa B: Renda, escolaridade e habitação + Tela 2 (Comparativo territorial)

**Branch:** `feature/etapa-b-renda-habitacao`
**Perguntas do relatório:** 2 e 3
**Tela:** 2 (Comparativo territorial) completa; cards novos na Tela 1

Pré-requisito: etapa A concluída (ver `docs/PROGRESSO.md`). Leia o registro de passagem da etapa A, principalmente a lista de arquivos do IBGE disponíveis por bairro e a conclusão sobre Beiru/Tancredo Neves.

Os critérios de aceite estão em `docs/PROGRESSO.md`, seção "Etapa B".

---

## Parte 1: Revisão da etapa A

Antes de começar, revise o PR da etapa A (se ainda estiver aberto) e rode o projeto localmente. Configure `web/.env.local` e `etl/.env` com as chaves que o responsável da etapa A passar **por mensagem privada, nunca pelo repositório**.

## Parte 2: Dados (ETL)

Script `etl/b_renda_habitacao.py`, reutilizando `etl/comum.py` e `etl/carregar.py`.

Indicadores esperados, para os dois bairros e para Salvador como referência. Para cada um, primeiro confirme se o dado existe por bairro no Censo 2022; se não existir, registre na seção "não disponíveis" do catálogo:

**Econômica**
- rendimento médio ou mediano do responsável pelo domicílio, se publicado por bairro (observado);
- concentração de baixa renda, por exemplo percentual de responsáveis com rendimento até 1/2 ou até 1 salário mínimo, conforme as faixas do arquivo (derivado; documentar a faixa usada).

**Social**
- taxa de alfabetização da população de 15 anos ou mais (derivado: alfabetizados ÷ total da faixa × 100).

**Habitacional**
- `hab_agua_rede_geral_pct`: domicílios com abastecimento por rede geral (derivado);
- `hab_esgoto_adequado_pct`: domicílios com esgoto por rede geral ou fossa ligada à rede (derivado; documentar exatamente quais categorias do IBGE entram);
- `hab_lixo_coletado_pct`: domicílios com lixo coletado (derivado);
- se existir: domicílios sem banheiro de uso exclusivo (derivado).

Saídas: `data/processed/b_renda_habitacao.csv` e `docs/qualidade/b_renda_habitacao.md`. Atualize `data/raw/README.md` com os arquivos baixados.

## Parte 3: Tela 2, Comparativo territorial

- Filtro por **dimensão** (econômica, social, habitacional, e também demográfica da etapa A) e por **indicador**.
- **Gráfico de barras** comparando os dois bairros, com Salvador como referência quando houver.
- **Tabela** com: indicador, valor em cada bairro, diferença absoluta, diferença percentual, unidade, ano, fonte, classificação.
- Diferenças só aparecem quando `saoComparaveis()` (de `utils/calculos.js`) retornar verdadeiro; caso contrário, mostrar "não comparável" com o motivo.
- Pelo menos **2 visualizações** nesta tela (por exemplo, barras agrupadas por dimensão e barras de um indicador selecionado).
- Texto curto de interpretação por dimensão, carregado da tabela `analises` (cadastre as análises via ETL ou seed) ou escrito no componente, desde que não contenha números fixos.
- Responsiva; em celular, a tabela pode virar lista de cards.

Na **Tela 1**, acrescentar os cards de rendimento e de saneamento no espaço deixado pela etapa A.

## Parte 4: Testes

Acrescentar testes no Vitest para qualquer função nova de cálculo ou transformação usada pela Tela 2.

## Parte 5: Documentação

- Catálogo: registrar todos os indicadores desta etapa e os não disponíveis.
- `docs/relatorio/02-rendimento.md` (pergunta 2) e `docs/relatorio/03-condicoes-habitacionais.md` (pergunta 3).
- README: preencher o nome do responsável da etapa B.
- Preencher a seção da etapa B em `docs/PROGRESSO.md` e passar para a etapa C.
