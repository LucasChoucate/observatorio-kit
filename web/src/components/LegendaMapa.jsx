import { rotuloEscala } from '../utils/formatar';
import { COR_SEM_DADO, corDaClasse, RAMPA_SEQUENCIAL, rotuloClasse } from '../utils/mapa';
import SeloFonte from './SeloFonte';

function Amostra({ cor, tracejada = false }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3.5 w-6 shrink-0 rounded-sm ${
        tracejada ? 'border border-dashed border-stone-400' : ''
      }`}
      style={{ background: cor }}
    />
  );
}

/**
 * Legenda do mapa: faixas de valor com a cor, unidade, leitura da escala, sem dado e fonte.
 * As faixas aparecem em ordem crescente de valor; a cor segue `atencao`.
 */
export default function LegendaMapa({
  indicador,
  classes,
  atencao,
  leitura,
  escala,
  temSemDado,
  observacaoRef,
}) {
  const porQuantis = classes.some((classe) => classe.min !== classe.max);
  let notaFaixas = 'Um tom por valor observado.';
  if (porQuantis && classes.length === RAMPA_SEQUENCIAL.length) {
    notaFaixas =
      'Faixas por quintis dos valores dos polígonos (cada faixa reúne cerca de 1/5 deles).';
  } else if (porQuantis) {
    notaFaixas =
      `Faixas por quintis dos valores dos polígonos. Muitos polígonos têm o mesmo valor, então ` +
      `alguns cortes coincidem: sobram ${classes.length} faixas, com quantidades diferentes de polígonos.`;
  }
  return (
    <section
      aria-labelledby="legenda-mapa"
      className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div>
        <h2 id="legenda-mapa" className="font-semibold text-stone-900">
          Legenda
        </h2>
        <p className="mt-0.5 text-sm text-stone-600">
          {indicador.nome} ({indicador.unidade})
        </p>
      </div>
      <ul className="space-y-1.5 text-sm text-stone-700">
        {classes.map((classe, indice) => (
          <li key={`${classe.min}-${classe.max}`} className="flex items-center gap-2">
            <Amostra cor={corDaClasse(indice, classes.length, atencao)} />
            <span className="tabular-nums">{rotuloClasse(classe, indicador.unidade)}</span>
          </li>
        ))}
        {temSemDado && (
          <li className="flex items-center gap-2">
            <Amostra cor={COR_SEM_DADO} tracejada />
            <span>Sem dado (fora da pesquisa ou sigilo do IBGE)</span>
          </li>
        )}
      </ul>
      <p className="text-xs text-stone-600">{leitura}</p>
      <p className="text-xs text-stone-500">{notaFaixas}</p>
      {observacaoRef && <SeloFonte observacao={observacaoRef} escala={rotuloEscala(escala)} />}
    </section>
  );
}
