// Funções puras do mapa coroplético (Tela 3). Testadas em mapa.test.js.
import { paraNumero } from './calculos';
import { formatarValor, rotuloClassificacao, siglaInstituicao } from './formatar';

// Rampa sequencial de um só tom (azul), clara → escura, validada como ordinal sobre fundo
// branco (contraste da ponta clara ≥ 2:1). A cor indica a classe, nunca o território.
export const RAMPA_SEQUENCIAL = ['#84b9f3', '#519ced', '#257de0', '#1b64be', '#0e3d7e'];
export const COR_SEM_DADO = '#e7e5e4';

/** Quantil com interpolação linear (tipo 7) de um vetor já ordenado. */
export function quantil(ordenados, p) {
  if (!ordenados.length) return null;
  const posicao = (ordenados.length - 1) * p;
  const base = Math.floor(posicao);
  const resto = posicao - base;
  const proximo = ordenados[base + 1];
  return proximo === undefined
    ? ordenados[base]
    : ordenados[base] + resto * (proximo - ordenados[base]);
}

/**
 * Classes da legenda a partir dos valores (ausentes são ignorados).
 * Com até `maxClasses` valores distintos, cada valor vira uma classe própria (ex.: dois bairros).
 * Senão, usa quantis (quintis por padrão), sem repetir cortes.
 * @returns {{min: number, max: number}[]} em ordem crescente
 */
export function calcularClasses(valores, maxClasses = RAMPA_SEQUENCIAL.length) {
  const ordenados = valores
    .map(paraNumero)
    .filter((v) => v !== null)
    .sort((a, b) => a - b);
  if (!ordenados.length) return [];
  const distintos = [...new Set(ordenados)];
  if (distintos.length <= maxClasses) return distintos.map((v) => ({ min: v, max: v }));
  const cortes = [];
  for (let i = 1; i < maxClasses; i += 1) cortes.push(quantil(ordenados, i / maxClasses));
  const limites = [...new Set([ordenados[0], ...cortes, ordenados.at(-1)])];
  return limites.slice(0, -1).map((inicio, i) => ({ min: inicio, max: limites[i + 1] }));
}

/** Índice da classe que contém o valor, ou null quando não há valor. */
export function indiceClasse(valor, classes) {
  const numero = paraNumero(valor);
  if (numero === null || !classes.length) return null;
  const indice = classes.findIndex((classe) => numero <= classe.max);
  return indice === -1 ? classes.length - 1 : indice;
}

/**
 * Cor da classe na rampa. Tons mais escuros = mais atenção: se `atencao` é 'menor' (ex.:
 * iluminação pública), os valores baixos ficam escuros; se é 'maior', os altos.
 */
export function corDaClasse(indice, totalClasses, atencao = 'maior') {
  if (indice === null || indice === undefined || totalClasses < 1) return COR_SEM_DADO;
  const ultimo = RAMPA_SEQUENCIAL.length - 1;
  const passo = totalClasses === 1 ? ultimo / 2 : (indice * ultimo) / (totalClasses - 1);
  const posicao = Math.round(atencao === 'menor' ? ultimo - passo : passo);
  return RAMPA_SEQUENCIAL[posicao];
}

/** Rótulo de uma classe da legenda (ex.: '38,6% a 45,0%' ou só 'R$ 1.212,00'). */
export function rotuloClasse(classe, unidade) {
  const min = formatarValor(classe.min, unidade);
  const max = formatarValor(classe.max, unidade);
  return min === max ? min : `${min} a ${max}`;
}

/**
 * Escala a desenhar no mapa: 'setor_censitario' quando há ao menos um valor por setor;
 * senão 'bairro' (a tela mostra o aviso de escala).
 */
export function escalaDasObservacoes(observacoes) {
  const temSetor = observacoes.some(
    (obs) => obs.territorio_tipo === 'setor_censitario' && paraNumero(obs.valor) !== null,
  );
  return temSetor ? 'setor_censitario' : 'bairro';
}

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para inserir em HTML (popups do Leaflet recebem HTML). */
export function escaparHtml(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/**
 * HTML do popup de um polígono: território, valor, nota, fonte, ano e classificação.
 * @param {object} args
 * @param {string} args.titulo nome do território
 * @param {string} [args.subtitulo] ex.: bairro e tipo do setor
 * @param {object} args.indicador linha da tabela indicadores (nome, unidade, classificacao)
 * @param {object|null} args.observacao linha de vw_observacoes ou null (sem dado)
 */
export function conteudoPopup({ titulo, subtitulo, indicador, observacao }) {
  const temValor = observacao && paraNumero(observacao.valor) !== null;
  const valor = temValor ? formatarValor(observacao.valor, indicador.unidade) : 'Sem dado';
  const linhas = [
    `<p class="popup-titulo">${escaparHtml(titulo)}</p>`,
    subtitulo ? `<p class="popup-sub">${escaparHtml(subtitulo)}</p>` : '',
    `<p>${escaparHtml(indicador.nome)}: <strong>${escaparHtml(valor)}</strong></p>`,
    observacao?.nota ? `<p class="popup-sub">${escaparHtml(observacao.nota)}</p>` : '',
    observacao
      ? `<p class="popup-sub">Fonte: ${escaparHtml(siglaInstituicao(observacao.instituicao))}` +
        ` · Ano: ${escaparHtml(observacao.ano)}` +
        ` · ${escaparHtml(rotuloClassificacao(indicador.classificacao))}</p>`
      : '',
  ];
  return linhas.filter(Boolean).join('');
}
