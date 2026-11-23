// Funções puras de cálculo. Toda função nova aqui precisa de teste em calculos.test.js.

/** Converte o valor vindo do banco (numeric pode chegar como número ou texto) em número ou null. */
export function paraNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

/** a − b. null se algum valor estiver ausente. */
export function diferencaAbsoluta(a, b) {
  const x = paraNumero(a);
  const y = paraNumero(b);
  if (x === null || y === null) return null;
  return x - y;
}

/** (a − b) ÷ b × 100, com b como base. null se a base for 0 ou algum valor estiver ausente. */
export function diferencaPercentual(a, b) {
  const x = paraNumero(a);
  const y = paraNumero(b);
  if (x === null || y === null || y === 0) return null;
  return ((x - y) / y) * 100;
}

/**
 * Motivo pelo qual duas observações não podem ser comparadas, ou null se forem comparáveis.
 * Comparáveis = mesmo indicador, mesmo ano e mesma unidade, ambas com valor.
 */
export function motivoNaoComparavel(obsA, obsB) {
  if (!obsA || !obsB) return 'falta uma das observações';
  if (obsA.indicador_codigo !== obsB.indicador_codigo) return 'indicadores diferentes';
  if (obsA.ano !== obsB.ano) return `anos diferentes (${obsA.ano} e ${obsB.ano})`;
  if (obsA.unidade !== obsB.unidade) return 'unidades diferentes';
  if (paraNumero(obsA.valor) === null || paraNumero(obsB.valor) === null) return 'valor ausente';
  return null;
}

/** true quando as observações têm mesmo indicador, ano e unidade (e ambas têm valor). */
export function saoComparaveis(obsA, obsB) {
  return motivoNaoComparavel(obsA, obsB) === null;
}

/**
 * Observação de um indicador em um território (pelo código IBGE). Se houver mais de um ano,
 * devolve a do ano mais recente. null se não existir.
 */
export function encontrarObservacao(observacoes, indicadorCodigo, codigoIbge) {
  return observacoes.reduce((maisRecente, obs) => {
    if (obs.indicador_codigo !== indicadorCodigo || obs.codigo_ibge !== codigoIbge) {
      return maisRecente;
    }
    return !maisRecente || obs.ano > maisRecente.ano ? obs : maisRecente;
  }, null);
}
