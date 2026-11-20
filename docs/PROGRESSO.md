# Progresso do projeto

> **Etapa atual: A** (não iniciada)

Este arquivo é a memória compartilhada da equipe. A IA de cada integrante lê este arquivo para saber onde o projeto está e o atualiza ao terminar a etapa. Não apague registros de etapas anteriores.

## Status

| Etapa | Tema | Responsável | Status | Branch | PR | Concluída em |
|---|---|---|---|---|---|---|
| A | Fundação + demografia (Tela 1) | [nome] | não iniciada | `feature/etapa-a-fundacao` | | |
| B | Renda, escolaridade, habitação (Tela 2) | [nome] | não iniciada | `feature/etapa-b-renda-habitacao` | | |
| C | Infraestrutura urbana + mapa (Tela 3) | [nome] | não iniciada | `feature/etapa-c-mapa-urbano` | | |
| D | Energia (Tela 4) | [nome] | não iniciada | `feature/etapa-d-energia` | | |
| E | IPEA, metodologia, IEVS, fechamento (Tela 5) | [nome] | não iniciada | `feature/etapa-e-metodologia-final` | | |

Status possíveis: `não iniciada`, `em andamento`, `concluída`, `concluída com pendências`.

**URL pública (Vercel):** [preencher na etapa A]
**Repositório:** [preencher na etapa A]

## Visualizações funcionais (meta: 6 ou mais)

| # | Tela | Visualização | Etapa |
|---|---|---|---|
| | | | |

---

## Etapa A

### Critérios de aceite
- [ ] Repositório no GitHub com `main`, `develop` e branch da etapa; integrantes adicionados como colaboradores
- [ ] Issues criadas para as 5 etapas
- [ ] Estrutura de pastas conforme `docs/PADROES.md`
- [ ] Migrations `001_schema.sql` e `002_rls.sql` aplicadas no Supabase; RLS ativo com leitura pública
- [ ] Seed de territórios (com códigos IBGE reais dos bairros) e fontes aplicado
- [ ] Equivalência Beiru/Tancredo Neves verificada e documentada no catálogo
- [ ] Lista de arquivos do IBGE disponíveis por bairro registrada no registro de passagem
- [ ] `etl/comum.py`, `etl/carregar.py` e `etl/a_demografia.py` funcionando e idempotentes
- [ ] Pelo menos 3 indicadores demográficos reais no banco para os dois bairros
- [ ] `docs/qualidade/a_demografia.md` gerado
- [ ] App React + Vite em `web/` com Tailwind, rotas das 5 telas e componentes compartilhados
- [ ] `services/observacoes.js` consultando o Supabase com a chave `anon`
- [ ] `utils/calculos.js` e `utils/formatar.js` com testes passando
- [ ] Tela 1 funcional, responsiva, com fonte e ano visíveis e pelo menos 2 visualizações
- [ ] ESLint, Prettier e Vitest configurados; `lint`, `test` e `build` sem erro
- [ ] CI no GitHub Actions rodando
- [ ] Deploy na Vercel funcionando a partir da `main`, com `vercel.json` de rewrite
- [ ] README com URL, como rodar e responsável da etapa A
- [ ] Catálogo criado com os indicadores da etapa
- [ ] `docs/relatorio/01-perfil-demografico.md` escrito
- [ ] PR aberto para `develop`

### Registro de passagem
- **O que foi feito:**
- **Arquivos do IBGE disponíveis por bairro (para B, C e D):**
- **Decisões tomadas:**
- **Pendências / problemas conhecidos:**
- **O que a etapa B precisa saber:**
- **Como testar:**

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
