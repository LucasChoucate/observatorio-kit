# Etapa A: Fundação do projeto + dimensão demográfica (Tela 1)

**Branch:** `feature/etapa-a-fundacao`
**Perguntas do relatório:** 1
**Telas:** 1 (Visão geral) completa; 2 a 5 como páginas vazias

Esta é a etapa que monta a base usada por todas as outras. Ao final dela, o ciclo inteiro precisa funcionar em miniatura: dado oficial → ETL → Supabase → site → GitHub → Vercel.

Os critérios de aceite estão em `docs/PROGRESSO.md`, seção "Etapa A".

---

## Parte 1: Repositório

O repositório ainda não existe. A pasta atual contém só a documentação do kit.

1. `git init`, criar a branch `main`, primeiro commit com os arquivos do kit: `chore: adiciona documentação inicial do projeto`.
2. Criar a branch `develop` a partir da `main`.
3. **Passo humano:** criar o repositório no GitHub (público ou privado, sem README automático), adicionar o remote e fazer push de `main` e `develop`. Se o `gh` estiver disponível: `gh repo create <nome> --source=. --push`.
4. **Passo humano:** em Settings → Collaborators, adicionar os outros 4 integrantes.
5. **Passo humano (recomendado):** em Settings → Branches, proteger `main` e `develop` exigindo Pull Request com 1 aprovação.
6. Criar a branch `feature/etapa-a-fundacao` a partir da `develop` e seguir nela.
7. Criar 5 Issues no GitHub, uma por etapa (A a E), com o título "Etapa X: <tema>" e o link para o arquivo da etapa. Se o `gh` estiver disponível, crie pelo terminal; senão, passe as instruções ao usuário.

## Parte 2: Estrutura de pastas e configuração

Criar a estrutura definida em `docs/PADROES.md`, seção 1. Pastas vazias recebem um `.gitkeep`. Em `data/raw/` criar um `README.md` listando os arquivos que cada etapa baixa e a URL de cada um (comece com os da etapa A).

Separar o `.env.example` da raiz em `web/.env.example` e `etl/.env.example`.

## Parte 3: Supabase

1. **Passo humano:** criar conta e projeto no Supabase (região mais próxima: São Paulo). Anotar a URL do projeto, a chave `anon` e a chave `service_role` (Project Settings → API).
2. Criar `supabase/migrations/001_schema.sql` com o esquema abaixo. Os nomes foram ajustados para português em relação ao roteiro (o professor permite alterar) e foram acrescentados campos para as exigências de classificação, dimensão e limitações:

```sql
create table territorios (
  id bigint generated always as identity primary key,
  nome text not null,
  codigo_ibge text unique,
  tipo text not null check (tipo in ('pais', 'estado', 'municipio', 'bairro', 'setor_censitario')),
  territorio_pai_id bigint references territorios (id)
);

create table fontes (
  id bigint generated always as identity primary key,
  sigla text not null unique,          -- ex.: IBGE_CENSO_2022, IPEA_IVS, EPE_ANUARIO
  instituicao text not null,
  titulo text not null,
  url text not null,
  data_acesso date not null
);

create table indicadores (
  id bigint generated always as identity primary key,
  codigo text not null unique,          -- ex.: dem_populacao
  nome text not null,
  descricao text,
  unidade text not null,
  dimensao text not null check (dimensao in (
    'demografica', 'economica', 'social', 'habitacional', 'urbana', 'energetica', 'socioenergetica'
  )),
  classificacao text not null check (classificacao in ('observado', 'derivado', 'proxy')),
  metodologia text,                     -- fórmula ou descrição do cálculo
  limitacoes text
);

create table observacoes (
  id bigint generated always as identity primary key,
  territorio_id bigint not null references territorios (id),
  indicador_id bigint not null references indicadores (id),
  fonte_id bigint not null references fontes (id),
  ano int not null,
  valor numeric,
  nota text,
  unique (territorio_id, indicador_id, fonte_id, ano)
);

create table analises (
  id bigint generated always as identity primary key,
  titulo text not null,
  descricao text not null,
  data_criacao timestamptz not null default now()
);

create index on observacoes (territorio_id);
create index on observacoes (indicador_id);
create index on observacoes (ano);

-- visão usada pelo frontend: cada observação já com nomes, fonte e metadados
create view vw_observacoes with (security_invoker = true) as
select
  o.id, o.ano, o.valor, o.nota,
  t.id as territorio_id, t.nome as territorio, t.tipo as territorio_tipo, t.codigo_ibge,
  i.id as indicador_id, i.codigo as indicador_codigo, i.nome as indicador, i.unidade,
  i.dimensao, i.classificacao, i.metodologia, i.limitacoes,
  f.id as fonte_id, f.sigla as fonte_sigla, f.instituicao, f.titulo as fonte_titulo,
  f.url as fonte_url, f.data_acesso
from observacoes o
join territorios t on t.id = o.territorio_id
join indicadores i on i.id = o.indicador_id
join fontes f on f.id = o.fonte_id;
```

3. Criar `supabase/migrations/002_rls.sql`: habilitar RLS nas 5 tabelas e criar, em cada uma, uma política de `select` para `anon` e `authenticated` com `using (true)`. Nenhuma política de escrita (só a `service_role`, que ignora RLS, escreve).
4. Criar `supabase/seeds/001_territorios_fontes.sql` com:
   - territórios: Brasil, Bahia, Salvador, Beiru/Tancredo Neves e Pernambués, com `territorio_pai_id` encadeado. **Os códigos IBGE dos bairros devem ser lidos do arquivo oficial de agregados por bairro, não inventados.** Se ainda não tiver o arquivo, deixe o seed de bairros para depois da Parte 4 e preencha com os códigos encontrados.
   - fontes: IBGE Censo 2022, IPEA Atlas da Vulnerabilidade Social, EPE Anuário Estatístico de Energia Elétrica, com URLs do `docs/REQUISITOS.md` e a data de acesso de hoje.
5. **Passo humano:** rodar as migrations e o seed no SQL Editor do Supabase (ou com o Supabase CLI, se instalado). Confirmar que as tabelas aparecem no Table Editor.

## Parte 4: ETL base e dados demográficos

1. `etl/requirements.txt`: `pandas`, `python-dotenv`, `supabase`. Orientar o usuário a criar um ambiente virtual (`python -m venv .venv`).
2. `etl/comum.py`: funções para ler os CSVs do IBGE (atenção a separador `;`, encoding `latin-1` ou `utf-8`, decimais com vírgula, valores sigilosos marcados com `X` ou `-`), filtrar os bairros do projeto pelo código, converter tipos e validar.
3. `etl/carregar.py`: funções `garantir_indicador(...)`, `buscar_territorio(...)`, `buscar_fonte(...)` e `upsert_observacoes(df)` usando a `service_role` lida de `etl/.env`. Upsert pela chave única `(territorio_id, indicador_id, fonte_id, ano)`.
4. **Investigação:** abrir o diretório do FTP do IBGE (link 1 do REQUISITOS) e listar os arquivos de agregados por bairro disponíveis. Registrar no registro de passagem quais arquivos existem, porque as etapas B, C e D vão depender dessa lista. **Confirmar como Beiru/Tancredo Neves aparece no IBGE** (nome exato, código, se é um bairro só) e registrar a conclusão no catálogo.
5. `etl/a_demografia.py`, com pelo menos estes indicadores para os dois bairros (e para Salvador, como referência):
   - `dem_populacao` (observado);
   - `dem_domicilios` (observado, domicílios particulares permanentes ocupados ou o recorte que o arquivo oferecer, documentando qual);
   - `dem_moradores_por_domicilio` (derivado: população em domicílios ÷ domicílios);
   - composição etária: percentual por faixa (por exemplo 0 a 14, 15 a 64, 65 ou mais), derivado, se o arquivo de demografia por bairro existir;
   - `dem_densidade_hab_km2` (derivado) **somente se** houver área oficial do bairro; senão, registrar como pendência para a etapa C, que vai trabalhar com a malha.
6. Gerar `data/processed/a_demografia.csv` e `docs/qualidade/a_demografia.md`.
7. **Passo humano:** baixar o arquivo do IBGE se a IA não conseguir; preencher `etl/.env`; rodar o script; conferir no Supabase.

## Parte 5: Frontend base

1. Criar a aplicação em `web/` com Vite (template React, JavaScript).
2. Instalar: `@supabase/supabase-js`, `react-router-dom`, `recharts`, `leaflet`, `react-leaflet`, Tailwind CSS (plugin oficial do Vite). Dev: `eslint`, `prettier`, `eslint-config-prettier`, `vitest`, `@testing-library/react`, `jsdom`.
3. Scripts no `web/package.json`: `dev`, `build`, `preview`, `lint`, `format`, `test`.
4. `web/src/lib/supabase.js`: cliente com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Se faltarem, mostrar erro claro no console.
5. `web/src/services/observacoes.js`: `buscarObservacoes({ territorios, indicadores, dimensao, anos, fonte })` consultando `vw_observacoes`; `buscarIndicadores({ dimensao })`; `buscarFontes()`; `buscarTerritorios({ tipo })`.
6. `web/src/utils/calculos.js`: `diferencaAbsoluta(a, b)`, `diferencaPercentual(a, b)` (retorna `null` se a base for 0 ou nula), `saoComparaveis(obsA, obsB)` (mesmo indicador, ano e unidade). `web/src/utils/formatar.js`: números e percentuais no padrão pt-BR. **Testes no Vitest para todas.**
7. Componentes compartilhados em `web/src/components/` (as próximas etapas vão reutilizar):
   - `Layout` com cabeçalho, menu das 5 telas e rodapé com os nomes da equipe (lidos de uma constante em `src/lib/equipe.js`, que cada pessoa preenche com o próprio nome);
   - `SeletorBairro` (um ou os dois bairros);
   - `CardIndicador` (nome, valor, unidade, `SeloFonte`);
   - `SeloFonte` (fonte, ano, escala, classificação, com link para a fonte);
   - `GraficoBarras` genérico sobre Recharts;
   - `EstadoCarregando`, `EstadoErro`, `EstadoVazio`.
8. Rotas com `react-router-dom`: `/` (Visão geral), `/comparativo`, `/mapa`, `/energia`, `/metodologia`. As 4 últimas mostram "Em construção: etapa X" por enquanto.
9. `web/vercel.json` com rewrite de todas as rotas para `/index.html` (senão as rotas do React dão 404 ao recarregar na Vercel).

## Parte 6: Tela 1, Visão geral

- Seletor de bairro (Beiru/Tancredo Neves, Pernambués, ambos).
- Cards com os indicadores demográficos carregados do Supabase, com fonte, ano e escala visíveis.
- Pelo menos **2 visualizações**: por exemplo, barras de população e domicílios dos dois bairros, e a pirâmide ou barras por faixa etária.
- Valor de Salvador como referência, claramente identificado como municipal.
- Espaço preparado para as etapas B e C acrescentarem cards de rendimento e infraestrutura (o roteiro pede isso na Tela 1). Deixe um comentário no código indicando onde.
- Responsiva.

## Parte 7: CI

`.github/workflows/ci.yml`: em push e pull request para `develop` e `main`, rodar `npm ci`, `npm run lint`, `npm test` e `npm run build` dentro de `web/`.

## Parte 8: Deploy na Vercel (passo humano guiado)

1. Entrar na Vercel com a conta do GitHub, importar o repositório.
2. Root Directory: `web`. Framework: Vite.
3. Environment Variables: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (nunca a `service_role`).
4. Production Branch: `main`. A `develop` e os PRs ganham URLs de preview automaticamente.
5. Depois do merge desta etapa na `develop`, abrir PR `develop → main` e confirmar que a URL pública abre a Tela 1 com dados.
6. Registrar a URL pública no README e no PROGRESSO.

## Parte 9: Documentação

- `README.md`: preencher a URL da Vercel, a seção de como rodar localmente (web e ETL) e o nome do responsável da etapa A na tabela de integrantes.
- `docs/catalogo/CATALOGO.md`: criar com o cabeçalho de `docs/PADROES.md` seção 9 e registrar os indicadores desta etapa, incluindo a conclusão sobre Beiru/Tancredo Neves.
- `docs/relatorio/01-perfil-demografico.md`: responder a pergunta 1 no modelo de `docs/PADROES.md` seção 10, usando somente os dados carregados.
- Preencher a seção da etapa A em `docs/PROGRESSO.md` e passar para a etapa B.
