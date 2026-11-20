# Etapa E: IPEA, metodologia, IEVS e fechamento + Tela 5 (Metodologia e fontes)

**Branch:** `feature/etapa-e-metodologia-final`
**Pergunta do relatório:** 8, mais conclusões gerais e consolidação
**Tela:** 5 (Metodologia e fontes) completa

Pré-requisito: etapa D concluída (ver `docs/PROGRESSO.md`). Leia todos os registros de passagem.

Os critérios de aceite estão em `docs/PROGRESSO.md`, seção "Etapa E".

---

## Parte 1: Revisão da etapa D

Revise o PR da etapa D (se ainda estiver aberto), rode o projeto e passe pelas 5 telas.

## Parte 2: Dados do IPEA (ETL)

Script `etl/e_ipea_ivs.py`. Fonte: Atlas da Vulnerabilidade Social (link 3 do REQUISITOS).

1. Verificar em que escala e anos o IVS está disponível para Salvador: município, região metropolitana, UDH (unidade de desenvolvimento humano). Verificar se alguma UDH corresponde aos bairros e se a base é o Censo 2010 ou mais recente.
2. Gravar o IVS e seus subíndices (infraestrutura urbana, capital humano, renda e trabalho) **no território e no ano reais**. Se for UDH, criar o território do tipo adequado e documentar a correspondência aproximada com os bairros como limitação; não gravar como se fosse o bairro.
3. Saídas: `data/processed/e_ipea_ivs.csv` e `docs/qualidade/e_ipea_ivs.md`.
4. Exibir esses dados na Tela 1 ou na Tela 2, com o selo da escala e do ano (a diferença de ano em relação ao Censo 2022 precisa ficar visível).

## Parte 3: Tela 5, Metodologia e fontes

Tela carregada **dinamicamente do Supabase** (tabelas `indicadores`, `fontes`, `territorios`, `observacoes`):

- **Dicionário de indicadores**: tabela com código, nome, dimensão, classificação, fórmula, unidade, escala, ano(s), fonte e limitações; filtro por dimensão e por classificação; busca por nome.
- **Fontes**: instituição, título, URL clicável, data de acesso.
- **Explicação da classificação** (observado, derivado, proxy).
- **Limitações gerais** do observatório (escala, anos diferentes entre fontes, ausência de dados familiares de energia, equivalência Beiru/Tancredo Neves).
- **Arquitetura**: diagrama ou texto do fluxo dados → ETL → Supabase → React → Vercel, com link para o repositório.

## Parte 4: IEVS exploratório (opcional, recomendado se houver tempo)

Script `etl/e_ievs.py`:

1. Escolher variáveis já carregadas nas dimensões renda, habitação e condições urbanas (2 ou 3 por dimensão).
2. Normalização documentada (por exemplo min-max sobre os bairros de Salvador, se disponíveis, ou outra escolha justificada; com só 2 bairros, min-max entre eles é degenerado, então use Salvador ou o conjunto de bairros como referência).
3. Pesos documentados (cenário base: pesos iguais).
4. **Teste de sensibilidade**: pelo menos 2 cenários alternativos de pesos, mostrando se a ordem dos bairros muda.
5. Gravar como indicador `sen_ievs` com classificação `proxy` e limitação explícita: **não é índice oficial nem medida validada de pobreza energética**.
6. Exibir na Tela 2 ou na Tela 5 com esse aviso, incluindo o resultado da sensibilidade.
7. Testes no Vitest ou `pytest` para a normalização e o cálculo.

## Parte 5: Revisão geral de qualidade

- Passar por todas as telas em desktop e celular; corrigir quebras de layout.
- Confirmar que o projeto tem **pelo menos 6 visualizações funcionais** e listar quais são no PROGRESSO.
- Confirmar que nenhuma tela mostra dado estadual como se fosse do bairro.
- Confirmar que não há chave `service_role` em nenhum arquivo do repositório (`git grep` pela chave e por `service_role`).
- `npm run lint`, `npm test`, `npm run build` sem erros; CI verde.

## Parte 6: Fechamento da documentação

- `docs/catalogo/CATALOGO.md`: revisar e consolidar; confirmar 12 indicadores ou mais com disponibilidade verificada.
- `docs/relatorio/08-intervencoes.md` (pergunta 8).
- `docs/relatorio/00-introducao.md` (contexto, objetivo, territórios, fontes, método) e `docs/relatorio/09-conclusoes-limitacoes.md` (síntese comparativa dos dois bairros e limitações gerais).
- `docs/relatorio/RELATORIO.md`: juntar todas as seções em ordem, com capa (título, disciplina, professor, integrantes e o papel de cada um). Gerar o PDF (Pandoc, ou abrir no Word/Google Docs e exportar) e salvar em `docs/relatorio/RELATORIO.pdf`.
- `docs/DEMO.md`: roteiro da demonstração ao vivo mostrando o ciclo completo (arquivo oficial → script de ETL → tabela no Supabase → tela no site → commit → deploy automático na Vercel → análise).
- `README.md` final: descrição, URL pública, integrantes e papéis, stack, como rodar, estrutura de pastas, links para catálogo, relatório e demo.

## Parte 7: Entrega

1. PR da etapa E para `develop`, revisado pelo responsável da etapa A.
2. PR `develop → main`. Confirmar que a Vercel publicou e que a URL pública funciona em aba anônima.
3. Criar uma tag `v1.0.0` na `main` e uma Release no GitHub com o resumo da entrega.
4. Marcar o projeto como concluído em `docs/PROGRESSO.md`.
