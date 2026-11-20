-- 002_rls.sql
-- RLS ligado em todas as tabelas: leitura pública (anon e authenticated).
-- Não há política de escrita: só a service_role (que ignora o RLS) grava, pelos scripts de ETL.

alter table territorios enable row level security;
alter table fontes enable row level security;
alter table indicadores enable row level security;
alter table observacoes enable row level security;
alter table analises enable row level security;

create policy "leitura publica de territorios" on territorios
  for select to anon, authenticated using (true);
create policy "leitura publica de fontes" on fontes
  for select to anon, authenticated using (true);
create policy "leitura publica de indicadores" on indicadores
  for select to anon, authenticated using (true);
create policy "leitura publica de observacoes" on observacoes
  for select to anon, authenticated using (true);
create policy "leitura publica de analises" on analises
  for select to anon, authenticated using (true);

-- Permissões explícitas de leitura na API (alguns projetos novos do Supabase não expõem
-- tabelas novas automaticamente). A view usa security_invoker, então também depende
-- das políticas acima.
grant usage on schema public to anon, authenticated;
grant select on territorios, fontes, indicadores, observacoes, analises, vw_observacoes
  to anon, authenticated;
