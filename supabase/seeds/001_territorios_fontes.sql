-- 001_territorios_fontes.sql
-- Dados fixos: territórios do projeto e fontes oficiais. Pode ser rodado mais de uma vez.
--
-- Códigos IBGE:
--   Brasil = 1 (código do nível "Brasil" no IBGE/SIDRA)
--   Bahia = 29, Salvador = 2927408 (códigos oficiais de UF e município)
--   Bairros: lidos de Agregados_por_bairros_basico_BR.csv (Censo 2022, coluna CD_BAIRRO),
--   arquivo Agregados_por_bairros_basico_BR_20260520.zip, acesso em 2026-11-20:
--     2927408018 = "Beiru / Tancredo Neves" (um único bairro no IBGE)
--     2927408117 = "Pernambués"

insert into territorios (nome, codigo_ibge, tipo, territorio_pai_id)
values ('Brasil', '1', 'pais', null)
on conflict (codigo_ibge) do nothing;

insert into territorios (nome, codigo_ibge, tipo, territorio_pai_id)
select 'Bahia', '29', 'estado', id from territorios where codigo_ibge = '1'
on conflict (codigo_ibge) do nothing;

insert into territorios (nome, codigo_ibge, tipo, territorio_pai_id)
select 'Salvador', '2927408', 'municipio', id from territorios where codigo_ibge = '29'
on conflict (codigo_ibge) do nothing;

insert into territorios (nome, codigo_ibge, tipo, territorio_pai_id)
select b.nome, b.codigo, 'bairro', t.id
from (values
  ('Beiru/Tancredo Neves', '2927408018'),
  ('Pernambués', '2927408117')
) as b (nome, codigo)
cross join territorios t
where t.codigo_ibge = '2927408'
on conflict (codigo_ibge) do nothing;

insert into fontes (sigla, instituicao, titulo, url, data_acesso) values
  (
    'IBGE_CENSO_2022',
    'Instituto Brasileiro de Geografia e Estatística (IBGE)',
    'Censo Demográfico 2022: Agregados por Setores Censitários (agregados por bairro e por município)',
    'https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/',
    '2026-11-20'
  ),
  (
    'IPEA_IVS',
    'Instituto de Pesquisa Econômica Aplicada (IPEA)',
    'Atlas da Vulnerabilidade Social (IVS)',
    'http://ivs.ipea.gov.br/',
    '2026-11-20'
  ),
  (
    'EPE_ANUARIO',
    'Empresa de Pesquisa Energética (EPE)',
    'Anuário Estatístico de Energia Elétrica: dados abertos',
    'https://www.epe.gov.br/pt/publicacoes-dados-abertos/dados-abertos/dados-do-anuario-estatistico-de-energia-eletrica',
    '2026-11-20'
  )
on conflict (sigla) do update set
  instituicao = excluded.instituicao,
  titulo = excluded.titulo,
  url = excluded.url;
