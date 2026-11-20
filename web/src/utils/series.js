// Montagem dos dados dos gráficos a partir das observações do Supabase. Funções puras.
import { encontrarObservacao, paraNumero } from './calculos';

/** Chave da série de um território nos dados do gráfico (prefixo evita chave só numérica). */
export function chaveTerritorio(codigoIbge) {
  return `t_${codigoIbge}`;
}

/**
 * Dados para barras agrupadas: uma linha por categoria (indicador) e uma coluna por território.
 * @param {object[]} observacoes linhas de vw_observacoes
 * @param {{codigo: string, rotulo: string}[]} categorias indicadores, na ordem do eixo
 * @param {{codigo_ibge: string}[]} territorios
 * @returns {object[]} ex.: [{ rotulo: '0 a 14 anos', t_2927408018: 18.0, t_2927408: 16.8 }]
 */
export function montarDadosAgrupados(observacoes, categorias, territorios) {
  return categorias.map(({ codigo, rotulo }) => {
    const linha = { rotulo };
    for (const territorio of territorios) {
      const obs = encontrarObservacao(observacoes, codigo, territorio.codigo_ibge);
      linha[chaveTerritorio(territorio.codigo_ibge)] = obs ? paraNumero(obs.valor) : null;
    }
    return linha;
  });
}

/**
 * Dados para barras simples de um indicador: uma linha por território.
 * Territórios sem observação ficam de fora (nunca viram zero).
 * @returns {{codigo_ibge: string, rotulo: string, valor: number}[]}
 */
export function montarDadosPorTerritorio(observacoes, indicadorCodigo, territorios) {
  return territorios
    .map((territorio) => {
      const obs = encontrarObservacao(observacoes, indicadorCodigo, territorio.codigo_ibge);
      return {
        codigo_ibge: territorio.codigo_ibge,
        rotulo: territorio.rotulo ?? territorio.nome,
        valor: obs ? paraNumero(obs.valor) : null,
      };
    })
    .filter((linha) => linha.valor !== null);
}
