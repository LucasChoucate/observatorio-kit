-- 001_schema.sql
-- Esquema base do Observatório de Vulnerabilidade Socioenergética de Salvador.
-- Nunca editar esta migration depois de aplicada: mudanças vão em 003_..., 004_...

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
