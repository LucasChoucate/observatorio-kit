import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatarCompacto, formatarNumero } from '../utils/formatar';

const COR_GRADE = '#e7e5e4';
const COR_TEXTO_EIXO = '#57534e';

function Amostra({ cor }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-2.5 rounded-sm"
      style={{ background: cor }}
    />
  );
}

function ConteudoTooltip({ active, payload, label, formatarValor }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-stone-800">{label}</p>
      <ul className="space-y-0.5">
        {payload.map((item) => (
          <li key={item.dataKey} className="flex items-center gap-2 text-stone-600">
            <Amostra cor={item.payload?.cor ?? item.color} />
            <span>{item.name}:</span>
            <span className="font-medium text-stone-900 tabular-nums">
              {formatarValor(item.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Gráfico de barras verticais genérico (Recharts), com legenda, tooltip e tabela de dados.
 *
 * Barras agrupadas: `series` com várias entradas { chave, nome, cor }; cada linha de `dados`
 * tem `rotulo` (eixo X) e um valor por chave.
 * Barras simples coloridas por item: uma série e `cor` em cada linha de `dados`.
 *
 * @param {string} props.titulo
 * @param {string} [props.descricao]
 * @param {object[]} props.dados
 * @param {{chave: string, nome: string, cor?: string}[]} props.series
 * @param {(valor: number) => string} [props.formatarValor] tooltip e tabela
 * @param {(valor: number) => string} [props.formatarEixo] eixo Y
 * @param {React.ReactNode} [props.rodape] normalmente um <SeloFonte />
 */
export default function GraficoBarras({
  titulo,
  descricao,
  dados,
  series,
  formatarValor = (v) => formatarNumero(v),
  formatarEixo = formatarCompacto,
  rodape,
  altura,
  rotacionarRotulos,
}) {
  const rotacionar = rotacionarRotulos ?? dados.length > 3;
  const alturaGrafico = altura ?? (rotacionar ? 340 : 280);
  const corPorItem = series.length === 1 && dados.some((linha) => linha.cor);

  return (
    <figure className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm min-w-0 overflow-hidden">
      <figcaption>
        <h3 className="font-semibold text-stone-900">{titulo}</h3>
        {descricao && <p className="mt-0.5 text-sm text-stone-600">{descricao}</p>}
      </figcaption>

      {series.length >= 2 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700" aria-label="Legenda">
          {series.map((serie) => (
            <li key={serie.chave} className="flex items-center gap-1.5">
              <Amostra cor={serie.cor} />
              {serie.nome}
            </li>
          ))}
        </ul>
      )}

      <div style={{ height: alturaGrafico }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            margin={{ top: 8, right: 12, bottom: rotacionar ? 16 : 4, left: 0 }}
            barGap={2}
          >
            <CartesianGrid vertical={false} stroke={COR_GRADE} />
            <XAxis
              dataKey="rotulo"
              tickLine={false}
              axisLine={{ stroke: COR_GRADE }}
              interval={0}
              angle={rotacionar ? -35 : 0}
              textAnchor={rotacionar ? 'end' : 'middle'}
              height={rotacionar ? 65 : 30}
              tick={{ fill: COR_TEXTO_EIXO, fontSize: rotacionar ? 11 : 12 }}
              tickFormatter={(v) =>
                typeof v === 'string' && v.length > 22 ? `${v.slice(0, 20)}…` : v
              }
            />
            <YAxis
              tickFormatter={formatarEixo}
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fill: COR_TEXTO_EIXO, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: '#f5f5f4' }}
              content={<ConteudoTooltip formatarValor={formatarValor} />}
            />
            {series.map((serie) => (
              <Bar
                key={serie.chave}
                dataKey={serie.chave}
                name={serie.nome}
                fill={serie.cor ?? '#2a78d6'}
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              >
                {corPorItem && dados.map((linha) => <Cell key={linha.rotulo} fill={linha.cor} />)}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="text-sm text-stone-700">
        <summary className="cursor-pointer text-stone-600 hover:text-stone-900">
          Ver dados em tabela
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th scope="col" className="py-1 pr-4 font-medium">
                  &nbsp;
                </th>
                {series.map((serie) => (
                  <th key={serie.chave} scope="col" className="py-1 pr-4 text-right font-medium">
                    {serie.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.map((linha) => (
                <tr key={linha.rotulo} className="border-b border-stone-100">
                  <th scope="row" className="py-1 pr-4 font-normal">
                    {linha.rotulo}
                  </th>
                  {series.map((serie) => (
                    <td key={serie.chave} className="py-1 pr-4 text-right tabular-nums">
                      {formatarValor(linha[serie.chave])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {rodape}
    </figure>
  );
}
