# Progresso do projeto

> **Etapa atual: B** (não iniciada; responsável a definir)

Este arquivo é a memória compartilhada da equipe. A IA de cada integrante lê este arquivo para saber onde o projeto está e o atualiza ao terminar a etapa. Não apague registros de etapas anteriores.

## Status

| Etapa | Tema | Responsável | Status | Branch | PR | Concluída em |
|---|---|---|---|---|---|---|
| A | Fundação + demografia (Tela 1) | Lucas Choucate | concluída com pendências | `feature/etapa-a-fundacao` | aberto para `develop` | 2026-11-20 |
| B | Renda, escolaridade, habitação (Tela 2) | [nome] | não iniciada | `feature/etapa-b-renda-habitacao` | | |
| C | Infraestrutura urbana + mapa (Tela 3) | [nome] | não iniciada | `feature/etapa-c-mapa-urbano` | | |
| D | Energia (Tela 4) | [nome] | não iniciada | `feature/etapa-d-energia` | | |
| E | IPEA, metodologia, IEVS, fechamento (Tela 5) | [nome] | não iniciada | `feature/etapa-e-metodologia-final` | | |

Status possíveis: `não iniciada`, `em andamento`, `concluída`, `concluída com pendências`.

**URL pública (Vercel):** [preencher na etapa A]
**Repositório:** https://github.com/LucasChoucate/observatorio-kit

## Visualizações funcionais (meta: 6 ou mais)

| # | Tela | Visualização | Etapa |
|---|---|---|---|
| 1 | Tela 1 (Visão geral) | Barras agrupadas: população e domicílios ocupados por bairro | A |
| 2 | Tela 1 (Visão geral) | Barras agrupadas: composição etária (0–14, 15–59, 60+) com Salvador como referência | A |
| 3 | Tela 1 (Visão geral) | Barras: densidade demográfica dos bairros e de Salvador | A |

---|---|---|---|
| | | | |

---

## Etapa A

### Critérios de aceite
- [x] Repositório no GitHub com `main`, `develop` e branch da etapa; integrantes adicionados como colaboradores (convites enviados; cada integrante precisa aceitar)
- [ ] Issues criadas para as 5 etapas (adiado pelo responsável da etapa A; criar pelo site em Issues → New issue, uma por etapa, com link para `docs/etapas/ETAPA_X.md`)
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
- [ ] CI no GitHub Actions rodando (o workflow só dispara em PR ou push para `develop`/`main`; confirmar no PR desta etapa)
- [ ] Deploy na Vercel funcionando a partir da `main`, com `vercel.json` de rewrite (deploy de preview da branch da etapa A funcionando, com dados e rewrite testados; a produção na `main` depende do merge `develop → main`)
- [ ] README com URL, como rodar e responsável da etapa A (falta a URL pública, que depende do deploy da `main`)
- [x] Catálogo criado com os indicadores da etapa
- [x] `docs/relatorio/01-perfil-demografico.md` escrito
- [ ] PR aberto para `develop`

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
- **Pendências / problemas conhecidos:**
  - Revisor do PR da etapa A: o responsável da etapa B, ainda não definido. Quando for definido, adicioná-lo em Reviewers no PR.
  - Criar as 5 Issues (adiado) e (opcional) o ruleset de `main`/`develop` (merge commit, 1 aprovação). Depois do primeiro CI, incluir os checks `Frontend (lint, testes e build)` e `ETL (sintaxe Python)` no ruleset.
  - A URL pública só funciona depois do merge `develop → main`. Depois disso, preencher a URL aqui e no README.
  - O `V0006` (domicílios imputados) aparece como fração no arquivo (0,0231 etc.). Ele não foi carregado como indicador.
- **O que a etapa B precisa saber:**
  - Peça ao Lucas as chaves por mensagem privada e crie `etl/.env` e `web/.env.local` a partir dos `.env.example`.
  - Reutilize `ler_csv_ibge`, `converter_colunas`, `filtrar_codigos`, `percentual` e `RelatorioQualidade` de `etl/comum.py`, e `garantir_indicador`/`upsert_observacoes` de `etl/carregar.py`. Copie a estrutura de `etl/a_demografia.py` (lista `INDICADORES` com metodologia e limitações, `--sem-carga`).
  - As constantes `BAIRROS` e `CODIGO_SALVADOR` estão em `etl/comum.py`. Os códigos usados no frontend estão em `web/src/lib/territorios.js`.
  - Na Tela 1 há comentários `ETAPA B` em `web/src/pages/VisaoGeral.jsx`, dentro de `SecaoBairro`, que é onde entram os cards de rendimento e saneamento. Basta acrescentar os códigos dos novos indicadores e reutilizar `CardIndicador`.
  - Para a Tela 2, use `saoComparaveis`/`motivoNaoComparavel` e `diferencaAbsoluta`/`diferencaPercentual` (base = segundo argumento), além de `montarDadosAgrupados` e `GraficoBarras`. Em indicadores em %, a diferença absoluta é em pontos percentuais.
  - Rendimento não existe nos agregados por bairro (ver acima). Confirme em outras divulgações antes de registrar a indisponibilidade.
- **Como testar:**
  1. `cd web && npm install && npm run lint && npm test && npm run build` (42 testes).
  2. `npm run dev` e abrir http://localhost:5173: a Tela 1 mostra cards e 3 gráficos; o seletor alterna entre um bairro e os dois; F12 no modo celular não deve ter rolagem horizontal.
  3. ETL: com `etl/.env` preenchido, `python etl/a_demografia.py` duas vezes. A tabela `observacoes` continua com 27 linhas.
  4. Sem o `.env`: `python etl/a_demografia.py --sem-carga` gera `data/processed/a_demografia.csv` e `docs/qualidade/a_demografia.md` aprovados.

---

## Etapa B

### Critérios de aceite
- [ ] Revisão do PR da etapa A feita
- [ ] `etl/b_renda_habitacao.py` funcionando e idempotente
- [ ] Indicadores de rendimento (ou registro de indisponibilidade por bairro)
- [ ] Taxa de alfabetização por bairro
- [ ] Indicadores de água, esgoto e lixo por bairro
- [ ] `docs/qualidade/b_renda_habitacao.md` gerado
- [ ] Tela 2 com filtros por dimensão e indicador
- [ ] Tela 2 com gráfico de barras e tabela com diferenças absolutas e percentuais
- [ ] Diferenças só exibidas quando comparáveis
- [ ] Pelo menos 2 visualizações na Tela 2
- [ ] Cards de rendimento e saneamento acrescentados à Tela 1
- [ ] Testes novos passando; `lint`, `test` e `build` sem erro
- [ ] Catálogo atualizado (incluindo não disponíveis)
- [ ] `docs/relatorio/02-rendimento.md` e `03-condicoes-habitacionais.md` escritos
- [ ] PR aberto para `develop`

### Registro de passagem
- **O que foi feito:**
- **Decisões tomadas:**
- **Pendências / problemas conhecidos:**
- **O que a etapa C precisa saber:**
- **Como testar:**

---

## Etapa C

### Critérios de aceite
- [ ] Revisão do PR da etapa B feita
- [ ] Malha oficial localizada, documentada e convertida para GeoJSON leve em `web/public/geo/`
- [ ] Área oficial dos bairros calculada; densidade demográfica gravada se pendente
- [ ] Dados de entorno urbano carregados (ou indisponibilidade documentada com alternativa)
- [ ] `docs/qualidade/c_urbano.md` gerado
- [ ] Tela 3 com mapa Leaflet, limites oficiais, pelo menos 2 camadas temáticas, legenda e popup
- [ ] Valores do mapa vindos do Supabase
- [ ] Aviso de escala (bairro ou setor) visível
- [ ] Cards de infraestrutura urbana na Tela 1
- [ ] `lint`, `test` e `build` sem erro
- [ ] Catálogo atualizado
- [ ] `docs/relatorio/04-infraestrutura-urbana.md` escrito
- [ ] PR aberto para `develop`

### Registro de passagem
- **O que foi feito:**
- **Decisões tomadas:**
- **Pendências / problemas conhecidos:**
- **O que a etapa D precisa saber:**
- **Como testar:**

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
