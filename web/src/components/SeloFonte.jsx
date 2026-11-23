import { rotuloClassificacao, rotuloEscala, siglaInstituicao } from '../utils/formatar';

const ESTILO_CLASSIFICACAO = {
  observado: 'bg-stone-100 text-stone-700 ring-stone-300',
  derivado: 'bg-sky-50 text-sky-800 ring-sky-200',
  proxy: 'bg-amber-50 text-amber-900 ring-amber-300',
};

/**
 * Fonte, ano, escala e classificação de um dado, com link para a fonte oficial.
 * Recebe uma linha de vw_observacoes. `escala` e `ano` permitem sobrescrever o texto
 * (ex.: gráfico que mistura bairros e o município de referência).
 */
export default function SeloFonte({ observacao, escala, ano, className = '' }) {
  if (!observacao) return null;
  const classificacao = observacao.classificacao;
  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500 ${className}`}
    >
      <span>
        Fonte:{' '}
        <a
          href={observacao.fonte_url}
          target="_blank"
          rel="noreferrer"
          title={observacao.fonte_titulo}
          className="font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-700"
        >
          {siglaInstituicao(observacao.instituicao)}
        </a>
      </span>
      <span aria-hidden="true">·</span>
      <span>Ano: {ano ?? observacao.ano}</span>
      <span aria-hidden="true">·</span>
      <span>Escala: {escala ?? rotuloEscala(observacao.territorio_tipo)}</span>
      {classificacao && (
        <span
          title={observacao.metodologia ?? undefined}
          className={`rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${
            ESTILO_CLASSIFICACAO[classificacao] ?? ESTILO_CLASSIFICACAO.observado
          }`}
        >
          {rotuloClassificacao(classificacao)}
        </span>
      )}
    </p>
  );
}
