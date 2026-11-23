import { supabase } from '../lib/supabase';

function cliente() {
  if (!supabase) {
    throw new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

async function executar(consulta) {
  const { data, error } = await consulta;
  if (error) throw new Error(`Erro ao consultar o Supabase: ${error.message}`);
  return data ?? [];
}

/**
 * Observações já com território, indicador e fonte (view vw_observacoes).
 * Todos os filtros são opcionais.
 * @param {object} filtros
 * @param {string[]} [filtros.territorios] códigos IBGE dos territórios
 * @param {string[]} [filtros.tiposTerritorio] ex.: ['bairro', 'municipio']
 * @param {string[]} [filtros.indicadores] códigos dos indicadores (ex.: 'dem_populacao')
 * @param {string} [filtros.dimensao] ex.: 'demografica'
 * @param {number[]} [filtros.anos]
 * @param {string} [filtros.fonte] sigla da fonte (ex.: 'IBGE_CENSO_2022')
 */
export async function buscarObservacoes({
  territorios,
  tiposTerritorio,
  indicadores,
  dimensao,
  anos,
  fonte,
} = {}) {
  let consulta = cliente().from('vw_observacoes').select('*');
  if (territorios?.length) consulta = consulta.in('codigo_ibge', territorios);
  if (tiposTerritorio?.length) consulta = consulta.in('territorio_tipo', tiposTerritorio);
  if (indicadores?.length) consulta = consulta.in('indicador_codigo', indicadores);
  if (dimensao) consulta = consulta.eq('dimensao', dimensao);
  if (anos?.length) consulta = consulta.in('ano', anos);
  if (fonte) consulta = consulta.eq('fonte_sigla', fonte);
  return executar(consulta.order('indicador_codigo').order('ano').order('territorio_id'));
}

/** Indicadores cadastrados, opcionalmente de uma dimensão. */
export async function buscarIndicadores({ dimensao } = {}) {
  let consulta = cliente().from('indicadores').select('*');
  if (dimensao) consulta = consulta.eq('dimensao', dimensao);
  return executar(consulta.order('codigo'));
}

/** Fontes oficiais cadastradas. */
export async function buscarFontes() {
  return executar(cliente().from('fontes').select('*').order('sigla'));
}

/** Territórios, opcionalmente de um tipo ('bairro', 'municipio', 'estado', ...). */
export async function buscarTerritorios({ tipo } = {}) {
  let consulta = cliente().from('territorios').select('*');
  if (tipo) consulta = consulta.eq('tipo', tipo);
  return executar(consulta.order('nome'));
}
