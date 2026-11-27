// Formatação no padrão pt-BR. Funções puras, testadas em formatar.test.js.
import { paraNumero } from './calculos';

export const VAZIO = '—';

/** Número com separador de milhar e casas decimais fixas. */
export function formatarNumero(valor, casas = 0) {
  const numero = paraNumero(valor);
  if (numero === null) return VAZIO;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(numero);
}

/** Valor já em escala 0–100 formatado como percentual (ex.: 18,0%). */
export function formatarPercentual(valor, casas = 1) {
  const numero = paraNumero(valor);
  if (numero === null) return VAZIO;
  return `${formatarNumero(numero, casas)}%`;
}

/** Diferença percentual com sinal (ex.: +12,3% ou −4,0%). */
export function formatarDiferencaPercentual(valor, casas = 1) {
  const numero = paraNumero(valor);
  if (numero === null) return VAZIO;
  const sinal = numero > 0 ? '+' : numero < 0 ? '−' : '';
  return `${sinal}${formatarPercentual(Math.abs(numero), casas)}`;
}

/** Diferença absoluta formatada com sinal (+ / −) e sufixo de pontos percentuais para %. */
export function formatarDiferencaAbsoluta(valor, unidade, casas) {
  const numero = paraNumero(valor);
  if (numero === null) return VAZIO;
  const sinal = numero > 0 ? '+' : numero < 0 ? '−' : '';
  const casasDecimais = casas ?? (unidade === '%' ? 1 : (CASAS_POR_UNIDADE[unidade] ?? 0));
  const formatado = formatarNumero(Math.abs(numero), casasDecimais);
  if (unidade === '%') {
    return `${sinal}${formatado} p.p.`;
  }
  if (unidade === 'R$') {
    return `${sinal}R$ ${formatado}`;
  }
  return `${sinal}${formatado}`;
}

const CASAS_POR_UNIDADE = {
  '%': 1,
  pessoas: 0,
  domicílios: 0,
  'hab/km²': 0,
  'km²': 2,
  'moradores/domicílio': 1,
  R$: 2,
};

/** Unidades que já aparecem dentro do valor formatado (%, R$) e não precisam de rótulo à parte. */
export function unidadeNoValor(unidade) {
  return unidade === '%' || unidade === 'R$';
}

/**
 * Formata o valor de um indicador conforme a unidade. Percentuais recebem o símbolo % e
 * valores monetários o prefixo R$.
 */
export function formatarValor(valor, unidade) {
  if (unidade === '%') return formatarPercentual(valor, CASAS_POR_UNIDADE['%']);
  if (unidade === 'R$') {
    const numero = formatarNumero(valor, CASAS_POR_UNIDADE.R$);
    return numero === VAZIO ? VAZIO : `R$ ${numero}`;
  }
  return formatarNumero(valor, CASAS_POR_UNIDADE[unidade] ?? 2);
}

/** Número compacto para eixos de gráfico (ex.: 52 mil, 2,4 mi). */
export function formatarCompacto(valor) {
  const numero = paraNumero(valor);
  if (numero === null) return VAZIO;
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
    .format(numero)
    .replace(/\s/g, ' '); // o Intl usa espaço não separável; padroniza com espaço comum
}

/** Data ISO (AAAA-MM-DD) em DD/MM/AAAA, sem conversão de fuso horário. */
export function formatarData(dataIso) {
  if (!dataIso) return VAZIO;
  const [ano, mes, dia] = String(dataIso).slice(0, 10).split('-');
  if (!ano || !mes || !dia) return VAZIO;
  return `${dia}/${mes}/${ano}`;
}

const ROTULOS_ESCALA = {
  pais: 'País',
  estado: 'Estado',
  municipio: 'Município',
  bairro: 'Bairro',
  setor_censitario: 'Setor censitário',
};

/** Rótulo legível do tipo de território (escala geográfica). */
export function rotuloEscala(tipo) {
  return ROTULOS_ESCALA[tipo] ?? tipo ?? VAZIO;
}

/** Sigla entre parênteses no fim do nome da instituição, ex.: '... (IBGE)' → 'IBGE'. */
export function siglaInstituicao(instituicao) {
  if (!instituicao) return VAZIO;
  const encontrado = String(instituicao).match(/\(([^()]+)\)\s*$/);
  return encontrado ? encontrado[1] : instituicao;
}

const ROTULOS_CLASSIFICACAO = {
  observado: 'Observado',
  derivado: 'Derivado',
  proxy: 'Proxy/estimativa',
};

/** Rótulo legível da classificação do indicador. */
export function rotuloClassificacao(classificacao) {
  return ROTULOS_CLASSIFICACAO[classificacao] ?? classificacao ?? VAZIO;
}
