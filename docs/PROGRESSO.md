# Progresso do projeto

> **Etapa atual: D** (não iniciada; responsável: Rafael Cezimbra)

Este arquivo é a memória compartilhada da equipe. A IA de cada integrante lê este arquivo para saber onde o projeto está e o atualiza ao terminar a etapa. Não apague registros de etapas anteriores.

## Status

| Etapa | Tema | Responsável | Status | Branch | PR | Concluída em |
|---|---|---|---|---|---|---|
| A | Fundação + demografia (Tela 1) | Lucas Choucate (@LucasChoucate) | concluída | `feature/etapa-a-fundacao` | [#1](https://github.com/LucasChoucate/observatorio-kit/pull/1) | 2026-11-20 |
| B | Renda, escolaridade, habitação (Tela 2) | Yasmin Queiroz (@yasminqjs) | concluída | `feature/etapa-b-renda-habitacao` | [#9](https://github.com/LucasChoucate/observatorio-kit/pull/9) | 2026-11-22 |
| C | Infraestrutura urbana + mapa (Tela 3) | Ramon Papes (@RamonPapes) | concluída | `feature/etapa-c-mapa-urbano` | | 2026-11-27 |
| D | Energia (Tela 4) | Rafael Cezimbra (@rafacezimbra) | não iniciada | `feature/etapa-d-energia` | | |
| E | IPEA, metodologia, IEVS, fechamento (Tela 5) | Icaro Yan (@icaro-cimatec) | não iniciada | `feature/etapa-e-metodologia-final` | | |

Status possíveis: `não iniciada`, `em andamento`, `concluída`, `concluída com pendências`.

**URL pública (Vercel):** https://observatorio-kit.vercel.app
**Repositório:** https://github.com/LucasChoucate/observatorio-kit

## Visualizações funcionais (meta: 6 ou mais)

| # | Tela | Visualização | Etapa |
|---|---|---|---|
| 1 | Tela 1 (Visão geral) | Barras agrupadas: população e domicílios ocupados por bairro | A |
| 2 | Tela 1 (Visão geral) | Barras agrupadas: composição etária (0–14, 15–59, 60+) com Salvador como referência | A |
| 3 | Tela 1 (Visão geral) | Barras: densidade demográfica dos bairros e de Salvador | A |
| 4 | Tela 2 (Comparativo) | Barras: comparação territorial do indicador selecionado (Beiru vs Pernambués vs Salvador) | B |
| 5 | Tela 2 (Comparativo) | Barras agrupadas: panorama comparativo de taxas percentuais (educação e saneamento) | B |
| 6 | Tela 3 (Mapa) | Mapa coroplético com limites oficiais do IBGE, 10 camadas (entorno por setor censitário; habitação e rendimento por bairro), legenda, popup e tabela | C |
| 7 | Tela 3 (Mapa) | Barras agrupadas: infraestrutura do entorno dos bairros com Salvador como referência | C |

---

## Etapa A

### Critérios de aceite
- [x] Repositório no GitHub com `main`, `develop` e branch da etapa; integrantes adicionados como colaboradores (convites enviados; cada integrante precisa aceitar)
- [x] Issues criadas para as 5 etapas (#2 A, #3 B, #4 C, #5 D, #6 E)
- [x] Estrutura de pastas conforme `docs/PADROES.md`
- [x] Migrations `001_schema.sql` e `002_rls.sql` aplicadas no Supabase; RLS ativo com leitura pública (testado: a chave pública lê a view e não consegue inserir)
- [x] Seed de territórios (com códigos IBGE reais dos bairros) e fontes aplicado
- [x] Equivalência Beiru/Tancredo Neves verificada e documentada no catálogo
- [x] Lista de arquivos do IBGE disponíveis por bairro registrada no registro de passagem
- [x] `etl/comum.py`, `etl/carregar.py` e `etl/a_demografia.py` funcionando e idempotentes (rodado 2 vezes: 9 indicadores e 27 observações nas duas)
- [x] Pelo menos 3 indicadores demográficos reais no banco para os dois bairros (9 indicadores)
- [x] `docs/qualidade/a_demografia.md` gerado
- [x] App React + Vite em `web/` com Tailwind, rotas das 5 telas e componentes compartilhados
- [x] `services/observacoes.js` consultando o Supabase com a chave `anon` (publishable)
- [x] `utils/calculos.js` e `utils/formatar.js` com testes passando
- [x] Tela 1 funcional, responsiva, com fonte e ano visíveis e pelo menos 2 visualizações (3 visualizações)
- [x] ESLint, Prettier e Vitest configurados; `lint`, `test` e `build` sem erro (42 testes)
- [x] CI no GitHub Actions rodando (verde no PR #1: `Frontend (lint, testes e build)` e `ETL (sintaxe Python)`)
- [x] Deploy na Vercel funcionando a partir da `main`, com `vercel.json` de rewrite (deploy de preview da branch da etapa A funcionando, com dados e rewrite testados; a produção na `main` depende do merge `develop → main`)
- [x] README com URL, como rodar e responsável da etapa A (https://observatorio-kit.vercel.app)
- [x] Catálogo criado com os indicadores da etapa
- [x] `docs/relatorio/01-perfil-demografico.md` escrito
- [x] PR aberto para `develop` (#1)

### Registro de passagem
- **O que foi feito:**
  - Repositório Git com `main`, `develop` e `feature/etapa-a-fundacao` em https://github.com/LucasChoucate/observatorio-kit.
  - Supabase (região São Paulo): tabelas `territorios`, `fontes`, `indicadores`, `observacoes` e `analises`, além da view `vw_observacoes`; RLS com leitura pública e sem política de escrita (só a service_role grava). Seed com Brasil (1), Bahia (29), Salvador (2927408), Beiru/Tancredo Neves (2927408018) e Pernambués (2927408117), e com as fontes `IBGE_CENSO_2022`, `IPEA_IVS` e `EPE_ANUARIO`.
  - ETL: `etl/comum.py` (leitura dos CSVs do IBGE, conversão, filtro com erro se faltar código, `percentual`, `razao`, `RelatorioQualidade`), `etl/carregar.py` (`conectar`, `buscar_territorio`, `buscar_fonte`, `garantir_indicador`, `upsert_observacoes` com o parâmetro `tipos_permitidos`, que impede gravar dado estadual em bairro) e `etl/a_demografia.py` (flag `--sem-carga` para rodar sem o `.env`).
  - 9 indicadores × 3 territórios (2 bairros + Salvador) = 27 observações: `dem_populacao`, `dem_domicilios`, `dem_moradores_por_domicilio`, `dem_area_km2`, `dem_densidade_hab_km2`, `dem_idade_0_14_pct`, `dem_idade_15_59_pct`, `dem_idade_60_mais_pct` e `dem_mulheres_pct`.
  - Frontend em `web/` (React 19, Vite 8, Tailwind 4, Recharts, React Router, Leaflet instalado), com páginas carregadas sob demanda. Componentes: `Layout`, `SeletorBairro` (exporta `AMBOS`), `CardIndicador` (aceita `referencia`), `SeloFonte` (aceita `escala` e `ano` para sobrescrever), `GraficoBarras` (barras agrupadas ou coloridas por item, com legenda, tooltip e tabela "Ver dados em tabela"), `EstadoCarregando`, `EstadoErro`, `EstadoVazio` e `EmConstrucao`. Hook `useConsulta(funcaoEstavel)`. Utilitários `calculos.js` (`diferencaAbsoluta`, `diferencaPercentual`, `saoComparaveis`, `motivoNaoComparavel`, `encontrarObservacao`, que devolve o ano mais recente), `formatar.js` e `series.js` (`montarDadosAgrupados`, `montarDadosPorTerritorio`).
  - Cores fixas por território em `web/src/lib/cores.js` (paleta validada para daltonismo). Bairro novo ou série nova usam os próximos tons da `PALETA`.
  - CI em `.github/workflows/ci.yml`: lint, format:check, test e build do frontend, mais a checagem de sintaxe do ETL.
  - Vercel: projeto importado com Root Directory `web` e as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (publishable). Production Branch: `main`.
- **Arquivos do IBGE disponíveis por bairro (para B, C e D):** diretório `Agregados_por_Bairro_csv/` do FTP do Censo 2022 (lista completa e URLs em `data/raw/README.md`): `basico`, `demografia`, `alfabetizacao`, `caracteristicas_domicilio1`, `caracteristicas_domicilio2`, `caracteristicas_domicilio3`, `cor_ou_raca`, `parentesco`, `obitos`, `domicilios_indigenas`, `pessoas_indigenas`, `domicilios_quilombolas` e `pessoas_quilombolas`. Há equivalentes por município em `Agregados_por_Municipio_csv/`. O dicionário (`dicionario_de_dados_agregados_por_setores_censitarios_20261113.xlsx`) mostra que, nesses arquivos:
  - **existem** abastecimento de água (rede geral), destino do esgoto, coleta de lixo e banheiros (temas Características do Domicílio, partes 2 e 3) e alfabetização;
  - **não existem** rendimento/renda, energia elétrica nem características do entorno (iluminação, pavimentação, calçada, arborização). Nenhuma variável do dicionário contém esses termos. As etapas B, C e D precisam procurar em outras divulgações do Censo 2022 ou registrar a indisponibilidade no catálogo;
  - o FTP também tem `malha_com_atributos/` (subpastas `bairros/` e `setores/`), útil para a etapa C.
- **Decisões tomadas:**
  - Beiru/Tancredo Neves é um único bairro no IBGE (código 2927408018) e é tratado como um território só, com o limite do IBGE.
  - `dem_populacao` usa V0001 (arquivo básico, versão 2026-05-20). As faixas etárias usam o arquivo de demografia, com a **soma das 11 faixas** como denominador, porque no arquivo oficial essa soma fica um pouco abaixo de V01006 (diferença de 1, 6 e 558 pessoas, registrada no relatório de qualidade, sem correção).
  - Faixas 0–14 / 15–59 / 60+, porque o arquivo não permite 65+ (registrado em "não disponíveis").
  - `dem_moradores_por_domicilio` usa a média publicada pelo IBGE (V0005, observado) em vez de V0001 ÷ V0007, porque V0001 inclui moradores de domicílios coletivos.
  - `dem_densidade_hab_km2` é calculada já nesta etapa com o AREA_KM2 oficial do IBGE (densidade bruta). A etapa C não precisa recalcular, só confirmar o polígono.
  - Salvador vem do arquivo oficial por município (não da soma dos bairros) e aparece sempre como "Salvador (município)".
  - O `.gitattributes` força LF, porque a equipe usa sistemas diferentes e o Prettier exige LF.
  - As páginas são carregadas sob demanda (`React.lazy`) para manter o bundle inicial pequeno.
  - Publicação na `main` (combinado com a equipe e registrado em `docs/PADROES.md` seção 4): a etapa A publica logo após o merge; nas etapas B, C e D o PR `develop → main` é opcional; a etapa E faz a publicação final com a tag `v1.0.0`.
- **Pendências / problemas conhecidos:**
  - Revisora do PR da etapa A: Yasmin Queiroz (@yasminqjs), responsável da etapa B.
  - Atribuir as Issues #5 (D) e #6 (E) a Rafael e Icaro depois que aceitarem o convite de colaborador. A Issue #2 fecha com `Closes #2` no PR `develop → main`.
  - (Opcional) o ruleset de `main`/`develop` (merge commit, 1 aprovação). Depois do primeiro CI, incluir os checks `Frontend (lint, testes e build)` e `ETL (sintaxe Python)` no ruleset.
  - A URL pública (https://observatorio-kit.vercel.app) já está registrada, mas só mostra o site depois do merge `develop → main`. Até lá, ela responde 404.
  - O `V0006` (domicílios imputados) aparece como fração no arquivo (0,0231 etc.). Ele não foi carregado como indicador.
- **O que a etapa B precisa saber:**
  - Peça ao Lucas as chaves por mensagem privada e crie `etl/.env` e `web/.env.local` a partir dos `.env.example`.
  - Reutilize `ler_csv_ibge`, `converter_colunas`, `filtrar_codigos`, `percentual` e `RelatorioQualidade` de `etl/comum.py`, e `garantir_indicador`/`upsert_observacoes` de `etl/carregar.py`. Copie a estrutura de `etl/a_demografia.py` (lista `INDICADORES` com metodologia e limitações, `--sem-carga`).
  - As constantes `BAIRROS` e `CODIGO_SALVADOR` estão em `etl/comum.py`. Os códigos usados no frontend estão em `web/src/lib/territorios.js`.
  - Na Tela 1 há comentários `ETAPA B` em `web/src/pages/VisaoGeral.jsx`, dentro de `SecaoBairro`, que é onde entram os cards de rendimento e saneamento. Basta acrescentar os códigos dos novos indicadores e reutilizar `CardIndicador`.
  - Para a Tela 2, use `saoComparaveis`/`motivoNaoComparavel` e `diferencaAbsoluta`/`diferencaPercentual` (base = segundo argumento), além de `montarDadosAgrupados` e `GraficoBarras`. Em indicadores em %, a diferença absoluta é em pontos percentuais.
  - Rendimento não existe nos agregados por bairro (ver acima). Confirme em outras divulgações antes de registrar a indisponibilidade.
  - Ao instalar pacotes npm no Windows, confira se o CI vai aceitar o lockfile com `npm ci --os=linux --cpu=x64 --dry-run` dentro de `web/`. Se acusar "Missing ... from lock file", apague `node_modules` e `package-lock.json` e rode `npm install` de novo (bug do npm com dependências opcionais de outras plataformas).
- **Como testar:**
  1. `cd web && npm install && npm run lint && npm test && npm run build` (42 testes).
  2. `npm run dev` e abrir http://localhost:5173: a Tela 1 mostra cards e 3 gráficos; o seletor alterna entre um bairro e os dois; F12 no modo celular não deve ter rolagem horizontal.
  3. ETL: com `etl/.env` preenchido, `python etl/a_demografia.py` duas vezes. A tabela `observacoes` continua com 27 linhas.
  4. Sem o `.env`: `python etl/a_demografia.py --sem-carga` gera `data/processed/a_demografia.csv` e `docs/qualidade/a_demografia.md` aprovados.

---

## Etapa B

### Critérios de aceite
- [x] Revisão do PR da etapa A feita (PR #1 revisado e mesclado na `develop`)
- [x] `etl/b_renda_habitacao.py` funcionando e idempotente (testado duas vezes com `--sem-carga`)
- [x] Indicadores de rendimento (ou registro de indisponibilidade por bairro) (indisponibilidade confirmada no dicionário do Censo 2022 e documentada)
- [x] Taxa de alfabetização por bairro (15 anos ou mais, Censo 2022)
- [x] Indicadores de água, esgoto e lixo por bairro (características do domicílio 2, Censo 2022)
- [x] `docs/qualidade/b_renda_habitacao.md` gerado
- [x] Tela 2 com filtros por dimensão e indicador (dimensões demográfica, social, habitacional e econômica)
- [x] Tela 2 com gráfico de barras e tabela com diferenças absolutas e percentuais (Pernambués como base)
- [x] Diferenças só exibidas quando comparáveis (validadas com `saoComparaveis()` e `motivoNaoComparavel()`)
- [x] Pelo menos 2 visualizações na Tela 2 (gráfico de indicador destacado e panorama comparativo de taxas)
- [x] Cards de rendimento e saneamento acrescentados à Tela 1 (saneamento, alfabetização e alerta metodológico de renda)
- [x] Testes novos passando; `lint`, `test` e `build` sem erro (51 testes no Vitest)
- [x] Catálogo atualizado (incluindo não disponíveis)
- [x] `docs/relatorio/02-rendimento.md` e `03-condicoes-habitacionais.md` escritos
- [x] PR aberto para `develop`

### Registro de passagem
- **O que foi feito:**
  - Script ETL `etl/b_renda_habitacao.py` implementado e testado com idempotência (saída em `data/processed/b_renda_habitacao.csv` com 18 observações calculadas e validadas).
  - Indicadores calculados para Beiru/Tancredo Neves, Pernambués e Salvador (referência): `soc_taxa_alfabetizacao_pct` (alfabetização 15+), `hab_agua_rede_geral_pct` (água da rede), `hab_esgoto_adequado_pct` (esgoto por rede ou fossa ligada), `hab_lixo_coletado_pct` (coleta direta + caçamba), `hab_lixo_cacamba_pct` (descarte em caçamba) e `hab_sem_banheiro_exclusivo_pct` (sem banheiro exclusivo).
  - Relatório de qualidade gerado e aprovado em `docs/qualidade/b_renda_habitacao.md` (100% das 22 regras validadas sem falhas).
  - Relatórios analíticos fundamentados elaborados em `docs/relatorio/02-rendimento.md` (pergunta 2) e `docs/relatorio/03-condicoes-habitacionais.md` (pergunta 3).
  - Catálogo em `docs/catalogo/CATALOGO.md` atualizado com todos os 6 novos indicadores e registro explícito da indisponibilidade metodológica de renda nos agregados por bairro do Censo 2022.
  - Tela 1 (`VisaoGeral.jsx`): adicionada seção de cards de educação e saneamento básico por bairro e nota metodológica sobre rendimento.
  - Tela 2 (`Comparativo.jsx`): implementação completa da tela de Comparativo Territorial, contendo:
    - Filtros dinâmicos por dimensão (demográfica, social, habitacional, econômica e todas) e por indicador individual;
    - 2 visualizações funcionais (`GraficoBarras`): comparação territorial do indicador selecionado e panorama geral de taxas percentuais;
    - Tabela comparativa com indicador, unidade, valores nos dois bairros e Salvador, cálculo pareado de diferenças absolutas e percentuais com validação por `saoComparaveis()` e `motivoNaoComparavel()`;
    - Painel de interpretação analítica fundamentada por dimensão;
    - Alerta metodológico contextual na dimensão econômica;
    - Responsividade em dispositivos móveis e suporte a leitor de tela / acessibilidade.
  - Testes: novos testes criados em `Comparativo.test.jsx` e `formatar.test.js`, ampliando a suíte para 51 testes no Vitest (todos passando).
  - Qualidade: `npm run lint` (ESLint) e `npm run format:check` (Prettier) 100% limpos e build de produção Vite verificado.
- **Decisões tomadas:**
  - A indisponibilidade de variáveis de rendimento nominal ou por salários mínimos nos agregados por bairro do Censo 2022 foi confirmada diretamente no dicionário oficial do IBGE e registrada de forma transparente, sem inventar dados nem interpolar estimativas silenciosas.
  - A taxa de alfabetização da população de 15 anos ou mais foi adotada como proxy de capital humano e potencial de renda para contextualizar a vulnerabilidade social.
  - Na tabela comparativa, a base de cálculo da diferença percentual foi fixada em Pernambués (`(Beiru − Pernambués) ÷ Pernambués × 100`).
  - Para variáveis em porcentagem, a diferença absoluta é rotulada e tratada em pontos percentuais (`p.p.`).
  - O indicador de lixo coletado soma a coleta direta no domicílio (`V00397`) e o descarte em caçamba de serviço de limpeza (`V00398`). Foi criado também o indicador específico `hab_lixo_cacamba_pct`, que revelou dependência de caçamba em 68,2% dos domicílios de Beiru e 54,7% em Pernambués, atestando restrições viárias e topográficas de acesso a caminhões e serviços públicos de emergência (inclusive manutenção da rede elétrica).
- **Pendências / problemas conhecidos:**
  - O script de ETL rodou com sucesso localmente com `--sem-carga`; a gravação definitiva no Supabase depende da aplicação das chaves em `etl/.env` pelo time.
  - Revisão do PR da Etapa B a ser realizada por Ramon Papes (@RamonPapes), responsável pela Etapa C.
- **O que a etapa C precisa saber:**
  - Os limites dos bairros e as malhas territoriais estão disponíveis no FTP do IBGE em `malha_com_atributos/bairros/` (subpasta do Censo 2022).
  - A densidade demográfica (`dem_densidade_hab_km2`) e a área do polígono (`dem_area_km2`) já foram gravadas na Etapa A. A Etapa C deve converter os limites para um GeoJSON leve em `web/public/geo/`.
  - Dados de características do entorno urbano (arborização, calçada, iluminação pública, pavimentação) não estão presentes nos agregados por bairro do Censo 2022; verifique se há arquivos temáticos específicos de entorno ou registre a indisponibilidade no catálogo conforme as regras.
  - Na Tela 1 (`VisaoGeral.jsx`) há o comentário reservado `{/* ETAPA C: acrescentar aqui os cards de infraestrutura urbana deste bairro. */}`.
- **Como testar:**
  1. `cd web && npm test -- --run && npm run lint && npm run format:check && npm run build` (51 testes passando).
  2. `python etl/b_renda_habitacao.py --sem-carga` gera `data/processed/b_renda_habitacao.csv` e `docs/qualidade/b_renda_habitacao.md` aprovado.
  3. `npm run dev` e navegar para http://localhost:5173/comparativo: testar os filtros de dimensão, a tabela de diferenças pareadas e os gráficos.

> **Nota da etapa C (2026-11-27):** três pontos deste registro foram revistos na etapa C, em commits `fix` separados (detalhes no registro da etapa C). (1) O Censo 2022 tem rendimento por bairro (divulgação "Rendimento do Responsável"), então o indicador de rendimento agora tem dados. (2) A dependência de caçamba não comprova restrição viária nem efeito sobre a manutenção da rede elétrica: o texto virou hipótese no relatório 03 e no catálogo. (3) Os dados da etapa B foram gravados no Supabase.

---

## Etapa C

### Critérios de aceite
- [x] Revisão do PR da etapa B feita (PR #9 aprovado e mesclado na `develop`; os problemas apontados foram corrigidos nesta etapa, em commits `fix` separados)
- [x] Malha oficial localizada, documentada e convertida para GeoJSON leve em `web/public/geo/` (malha do Censo 2022, versão 2024-11-13; `bairros.geojson` com 21 KB e `setores.geojson` com 240 KB e 172 setores)
- [x] Área oficial dos bairros calculada; densidade demográfica gravada se pendente (área em SIRGAS 2000 / UTM 24S confere com o `AREA_KM2` do IBGE, diferença de −0,07%; a densidade já estava gravada desde a etapa A)
- [x] Dados de entorno urbano carregados (7 indicadores `urb_` por bairro, Salvador e setor censitário: 1.225 observações)
- [x] `docs/qualidade/c_urbano.md` gerado (aprovado, sem falhas; também `docs/qualidade/c_malha.md`)
- [x] Tela 3 com mapa Leaflet, limites oficiais, pelo menos 2 camadas temáticas, legenda e popup (10 camadas)
- [x] Valores do mapa vindos do Supabase (consulta por indicador na `vw_observacoes` com a chave anon; só a geometria vem do GeoJSON estático)
- [x] Aviso de escala (bairro ou setor) visível
- [x] Cards de infraestrutura urbana na Tela 1
- [x] `lint`, `test` e `build` sem erro (83 testes no Vitest)
- [x] Catálogo atualizado
- [x] `docs/relatorio/04-infraestrutura-urbana.md` escrito
- [x] PR aberto para `develop` (aberto pelo site do GitHub logo depois do push, porque o GitHub CLI não está instalado)

### Registro de passagem
- **O que foi feito:**
  - Correções da etapa B, em commits `fix` separados, a partir da revisão do PR #9:
    - O Censo 2022 publica o rendimento do responsável pelo domicílio por bairro (variáveis V06001 a V06006). `etl/b_renda_habitacao.py` passou a gravar `eco_rendimento_mediano_responsavel_rs` e `eco_rendimento_medio_responsavel_rs` (observados, em R$) para os dois bairros e Salvador, com a base e o desvio padrão na nota. Mediana: R$ 1.212 em Beiru/Tancredo Neves e em Pernambués, R$ 1.230 em Salvador.
    - `arquivo_origem` com o nome real dos arquivos (sufixo `_BR`).
    - Tela 2, catálogo e relatórios 02 e 03 sem números escritos à mão e sem afirmações de causa (o uso de caçamba ficou como hipótese).
    - Cards de rendimento na Tela 1 com alerta de leitura; valores em reais formatados (`R$ 2.035,87`).
    - O Supabase tinha só os 6 indicadores originais da etapa B; agora tem os 8.
  - `etl/c_malha.py`: lê os GeoPackages de bairros e setores do Censo 2022, valida CRS, nomes, códigos, geometrias, área e cobertura dos setores, simplifica sem abrir frestas entre vizinhos (`simplify_coverage`, tolerância de 1 m) e grava `web/public/geo/bairros.geojson` e `setores.geojson` (EPSG:4326). Cadastra os 172 setores em `territorios` (tipo `setor_censitario`, com `territorio_pai_id` apontando para o bairro).
  - `etl/c_urbano.py`: 7 indicadores derivados do entorno (iluminação pública, via pavimentada, calçada, bueiro, arborização, rampa para cadeirante e via só para pedestres, bicicletas e motos), calculados como V05xxx ÷ V05000 × 100 por bairro, Salvador e setor. Valida a soma das categorias, se a soma dos setores bate com o total do bairro, a cobertura do universo (97,8% e 99,9% dos domicílios ocupados) e a concordância com os percentuais publicados pelo IBGE (diferença mediana de no máximo 0,74 p.p.).
  - `etl/carregar.py`: `buscar_territorios` e `garantir_territorios` em lote, e upsert em blocos de 500 linhas.
  - Tela 3 (`pages/Mapa.jsx`), com uma visualização por item:
    - mapa coroplético (`MapaCoropletico`) com 10 camadas: as 7 do entorno por setor, mais caçamba, esgoto adequado e rendimento mediano por bairro;
    - legenda (`LegendaMapa`) com faixas, "sem dado" e fonte;
    - popup com valor, base e fonte;
    - aviso de escala;
    - tabela dos valores;
    - gráfico de barras agrupadas do entorno (bairros e Salvador).

    Os utilitários estão em `utils/mapa.js` (classes, cores, popup com HTML escapado) e as camadas em `lib/camadas.js`.
  - Tela 1 ganhou o grupo de cards "Infraestrutura urbana do entorno". Tela 2 ganhou a dimensão "Urbana (entorno)".
  - Catálogo (7 `urb_`, 2 `eco_`, malha, setores e não disponíveis do entorno) e relatório `04-infraestrutura-urbana.md`. O relatório 02 foi reescrito com os dados de rendimento.
  - Carga no Supabase rodada duas vezes por script, sem duplicar nada: 1.276 observações e 177 territórios. Conferido que a chave anon lê a view e não consegue inserir.
  - Conferência visual com dados reais em 1366 px e em 390 px (emulação de celular): sem rolagem horizontal.
- **Decisões tomadas:**
  - A escala do mapa é decidida pelos dados. Se a camada tem valor por setor, o mapa desenha setores. Se não tem, desenha os bairros com o aviso "Atenção: escala de bairro, não de setor".
  - O denominador é V05000, que inclui as faces não declaradas, como nos percentuais do IBGE; por isso o valor é um piso. Setores com 50% ou mais de faces não declaradas ficam sem valor (nulo, com nota) em vez de um 0% artificial. São 5 setores sem dado: 2 fora da pesquisa do entorno, 1 com sigilo e 2 com 77,6% e 100% de faces não declaradas.
  - Os indicadores do entorno são `derivado` e contam domicílios. Os percentuais publicados pelo IBGE contam moradores; a diferença foi medida pelo script.
  - Cores: rampa sequencial azul de 5 tons, validada para daltonismo. O tom mais escuro marca a ponta que merece mais atenção, e o sentido muda por camada (campo `atencao` em `lib/camadas.js`). As faixas são quintis; com 5 valores distintos ou menos, há um tom por valor. Quando muitos valores se repetem (ex.: iluminação pública, quase sempre 100%), os cortes coincidem, sobram menos faixas e a legenda avisa.
  - O GeoJSON segue a grafia do IBGE ("Beiru / Tancredo Neves"); na tela vale o nome do banco, buscado pelo código.
  - Rendimento: só o do responsável pelo domicílio, com a mediana como medida principal, porque a média é sensível a valores extremos.
  - Iluminação pública é tratada como infraestrutura urbana, não como acesso à energia nos domicílios.
- **Pendências / problemas conhecidos:**
  - O IBGE também publica rendimento e saneamento por setor (ex.: `Agregados_por_setores_renda_responsavel`), mas esses dados não foram carregados. No mapa, essas camadas aparecem por bairro. Podem servir à etapa E (ex.: IEVS por setor).
  - O Censo 2022 não registra esgoto a céu aberto, lixo acumulado nem a qualidade ou manutenção dos itens do entorno. Isso está documentado no catálogo.
  - No celular, o primeiro rótulo inclinado do eixo X do `GraficoBarras` (componente da etapa A) sai um pouco cortado à esquerda. É só estética e fica para a revisão geral da etapa E.
  - A coluna PR da etapa C na tabela de status fica vazia até o PR ser aberto pelo site. Preencha o número na revisão.
- **O que a etapa D precisa saber:**
  - Os dados da EPE são estaduais: grave-os no território Bahia (`29`), nunca nos bairros. `upsert_observacoes(..., tipos_permitidos={'estado'})` barra esse erro.
  - O Supabase devolve no máximo 1.000 linhas por consulta, e a `vw_observacoes` já tem 1.276. Sempre filtre por indicador, dimensão ou tipo de território (ex.: `buscarObservacoes({ indicadores, tiposTerritorio })`).
  - `territorios` agora inclui 172 setores (`setor_censitario`, filhos dos bairros). Para listar bairros, filtre `tipo = 'bairro'`.
  - Para pôr uma camada nova no mapa, acrescente uma entrada em `web/src/lib/camadas.js` (`codigo`, `rotuloCurto`, `atencao`, `leitura`). Se o indicador tiver valor por setor, o mapa usa setores sozinho.
  - Iluminação pública alta não indica fornecimento de energia contínuo nem de qualidade. As hipóteses do relatório 04 (pouca arborização e calor, vias sem veículos e manutenção da rede) devem ser testadas na pergunta 7, não tratadas como fato.
  - `formatarValor` já trata `R$`; `unidadeNoValor(unidade)` diz se a unidade vai junto do número.
- **Como testar:**
  1. `cd web && npm run lint && npm test && npm run build` (83 testes).
  2. ETL com `etl/.env` preenchido, nesta ordem e duas vezes cada: `python etl/b_renda_habitacao.py`, `python etl/c_malha.py` e `python etl/c_urbano.py`. Resultado esperado: `observacoes` com 1.276 linhas e `territorios` com 177, nas duas rodadas. Sem o `.env`, use `--sem-carga`. Os relatórios em `docs/qualidade/` devem sair aprovados. Os arquivos de entrada estão listados em `data/raw/README.md`.
  3. `npm run dev` e abrir http://localhost:5173/mapa, depois:
     - trocar a camada: calçada mostra 5 faixas por setor, e caçamba mostra o aviso amarelo de escala de bairro;
     - clicar num setor para ver valor, base e fonte;
     - abrir a tabela;
     - no modo celular (F12), conferir que não há rolagem horizontal.
  4. Tela 1: grupos "Rendimento do responsável pelo domicílio" e "Infraestrutura urbana do entorno". Tela 2: dimensão "Urbana (entorno)".

---

## Etapa D

### Critérios de aceite
- [ ] Revisão do PR da etapa C feita
- [ ] `etl/d_energia_epe.py` com série histórica de consumo e consumidores residenciais da Bahia
- [ ] Dados da EPE gravados somente no território Bahia (ou outros territórios reais), nunca nos bairros
- [ ] Verificação de dados de energia do IBGE por bairro (carregados ou indisponibilidade documentada)
- [ ] 2 ou 3 indicadores proxy socioenergéticos com fórmula, justificativa e limitações
- [ ] `docs/qualidade/d_energia_epe.md` gerado
- [ ] Tela 4 separando visualmente contexto estadual e indicadores locais
- [ ] Pelo menos 2 visualizações na Tela 4
- [ ] `lint`, `test` e `build` sem erro
- [ ] Catálogo atualizado
- [ ] `docs/relatorio/05`, `06` e `07` escritos
- [ ] PR aberto para `develop`

### Registro de passagem
- **O que foi feito:**
- **Decisões tomadas:**
- **Pendências / problemas conhecidos:**
- **O que a etapa E precisa saber:**
- **Como testar:**

---

## Etapa E

### Critérios de aceite
- [ ] Revisão do PR da etapa D feita
- [ ] IVS do IPEA carregado na escala e ano reais, com limitação documentada
- [ ] Tela 5 dinâmica: dicionário de indicadores com filtros, fontes, classificação, limitações e arquitetura
- [ ] IEVS exploratório com normalização, pesos e sensibilidade (opcional)
- [ ] Revisão geral: todas as telas responsivas, 6 ou mais visualizações listadas acima
- [ ] Nenhuma chave `service_role` no repositório
- [ ] `lint`, `test` e `build` sem erro; CI verde
- [ ] Catálogo consolidado com 12 ou mais indicadores
- [ ] `docs/relatorio/00`, `08` e `09` escritos
- [ ] `RELATORIO.md` consolidado e `RELATORIO.pdf` gerado, com integrantes e papéis
- [ ] `docs/DEMO.md` com o roteiro da demonstração
- [ ] README final completo
- [ ] Merge na `main`, Vercel atualizada, tag `v1.0.0` e Release criadas

### Registro de passagem
- **O que foi feito:**
- **Decisões tomadas:**
- **Pendências / problemas conhecidos:**
- **Como testar:**
