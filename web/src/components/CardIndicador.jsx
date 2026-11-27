import { formatarValor } from '../utils/formatar';
import SeloFonte from './SeloFonte';

/**
 * Card de um indicador: nome, valor, unidade e SeloFonte.
 * `referencia` (opcional) é outra observação do mesmo indicador, exibida como comparação
 * (ex.: Salvador, escala municipal), identificada por `rotuloReferencia`.
 */
export default function CardIndicador({ titulo, observacao, referencia, rotuloReferencia }) {
  const nome = titulo ?? observacao?.indicador ?? 'Indicador';
  if (!observacao) {
    return (
      <article className="min-w-0 overflow-hidden rounded-xl border border-dashed border-stone-300 bg-white p-4">
        <h3 className="break-words text-sm font-medium text-stone-600">{nome}</h3>
        <p className="mt-1 text-sm text-stone-500">Sem dado disponível para este território.</p>
      </article>
    );
  }
  const { valor, unidade } = observacao;
  return (
    <article className="flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <h3 className="break-words text-sm font-medium text-stone-600">{nome}</h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-2xl font-semibold text-stone-900 tabular-nums">
          <span>{formatarValor(valor, unidade)}</span>
          {unidade !== '%' && (
            <span className="break-words text-xs font-normal text-stone-500">{unidade}</span>
          )}
        </p>
        {referencia && (
          <p className="mt-1 break-words text-xs text-stone-500">
            {rotuloReferencia ?? referencia.territorio}:{' '}
            <span className="font-medium text-stone-700 tabular-nums">
              {formatarValor(referencia.valor, referencia.unidade)}
              {referencia.unidade !== '%' && ` ${referencia.unidade}`}
            </span>
          </p>
        )}
      </div>
      <div className="pt-1">
        <SeloFonte observacao={observacao} />
      </div>
    </article>
  );
}
