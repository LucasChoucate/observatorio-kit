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
      <article className="rounded-xl border border-dashed border-stone-300 bg-white p-4">
        <h3 className="text-sm font-medium text-stone-600">{nome}</h3>
        <p className="mt-1 text-sm text-stone-500">Sem dado disponível para este território.</p>
      </article>
    );
  }
  const { valor, unidade } = observacao;
  return (
    <article className="flex flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-medium text-stone-600">{nome}</h3>
        <p className="mt-1 text-2xl font-semibold text-stone-900 tabular-nums">
          {formatarValor(valor, unidade)}
          {unidade !== '%' && (
            <span className="ml-1 text-sm font-normal text-stone-500">{unidade}</span>
          )}
        </p>
        {referencia && (
          <p className="mt-1 text-xs text-stone-500">
            {rotuloReferencia ?? referencia.territorio}:{' '}
            <span className="font-medium text-stone-700 tabular-nums">
              {formatarValor(referencia.valor, referencia.unidade)}
              {referencia.unidade !== '%' && ` ${referencia.unidade}`}
            </span>
          </p>
        )}
      </div>
      <SeloFonte observacao={observacao} />
    </article>
  );
}
