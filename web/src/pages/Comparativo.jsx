import { useId, useMemo, useState } from 'react';
import EstadoCarregando from '../components/EstadoCarregando';
import EstadoErro from '../components/EstadoErro';
import EstadoVazio from '../components/EstadoVazio';
import GraficoBarras from '../components/GraficoBarras';
import SeloFonte from '../components/SeloFonte';
import { useConsulta } from '../hooks/useConsulta';
import { corDoTerritorio } from '../lib/cores';
import { CODIGO_BEIRU, CODIGO_PERNAMBUES, CODIGO_SALVADOR } from '../lib/territorios';
import { buscarIndicadores, buscarObservacoes, buscarTerritorios } from '../services/observacoes';
import {
  diferencaAbsoluta,
  diferencaPercentual,
  encontrarObservacao,
  motivoNaoComparavel,
  saoComparaveis,
} from '../utils/calculos';
import {
  formatarCompacto,
  formatarDiferencaAbsoluta,
  formatarDiferencaPercentual,
  formatarNumero,
  formatarPercentual,
  formatarValor,
  rotuloClassificacao,
  VAZIO,
} from '../utils/formatar';

const DIMENSOES = [
  { valor: 'todas', rotulo: 'Todas as dimensões' },
  { valor: 'demografica', rotulo: 'Demográfica' },
  { valor: 'social', rotulo: 'Social' },
  { valor: 'habitacional', rotulo: 'Habitacional' },
  { valor: 'economica', rotulo: 'Econômica' },
];

const ROTULOS_COMPACTOS = {
  dem_idade_0_14_pct: '0 a 14 anos',
  dem_idade_15_59_pct: '15 a 59 anos',
  dem_idade_60_mais_pct: '60+ anos',
  dem_mulheres_pct: 'Mulheres',
  soc_taxa_alfabetizacao_pct: 'Alfabetização',
  hab_agua_rede_geral_pct: 'Água (rede)',
  hab_esgoto_adequado_pct: 'Esgoto adequado',
  hab_lixo_coletado_pct: 'Lixo coletado',
  hab_lixo_cacamba_pct: 'Lixo caçamba',
  hab_sem_banheiro_exclusivo_pct: 'Sem banheiro',
};

// Textos de leitura de cada dimensão. Não trazem números: os valores ficam na tabela e nos
// gráficos, que vêm do Supabase. Também não afirmam causas que os dados não medem.
const ANALISES_DIMENSAO = {
  todas: {
    titulo: 'Como ler a comparação',
    texto:
      'A tabela reúne os indicadores dos dois bairros, com Salvador como referência municipal. As diferenças só aparecem quando os valores são comparáveis (mesmo indicador, mesmo ano e mesma unidade). Use o filtro de dimensão para ler cada tema; a interpretação completa está no relatório do projeto.',
  },
  demografica: {
    titulo: 'Leitura da dimensão demográfica',
    texto:
      'Compare o tamanho da população, a densidade e a estrutura etária. A densidade usa a área total do bairro (densidade bruta), que inclui vias e áreas não residenciais; sozinha, ela não mede o adensamento dentro das moradias.',
  },
  social: {
    titulo: 'Leitura da dimensão social',
    texto:
      'A taxa de alfabetização considera quem declara saber ler e escrever, entre as pessoas de 15 anos ou mais. Ela não mede anos de estudo nem a qualidade da escolarização.',
  },
  habitacional: {
    titulo: 'Leitura da dimensão habitacional',
    texto:
      'Água, esgoto e coleta de lixo indicam a forma de atendimento declarada no Censo, não a regularidade nem a qualidade do serviço. A participação do descarte em caçamba mostra como o lixo é recolhido, mas o Censo não registra o motivo. Os indicadores de entorno (Tela 3), como as faces de quadra sem circulação de veículos, ajudam a contextualizar a diferença, sem provar causa.',
  },
  economica: {
    titulo: 'Leitura da dimensão econômica',
    texto:
      'O rendimento por bairro é o do responsável pelo domicílio (média e mediana, em valores nominais de 2022). A média é sensível a valores extremos, por isso a comparação mais segura é pela mediana. Baixa renda não comprova, sozinha, pobreza energética.',
  },
};

const CORES_DIMENSAO = {
  demografica: 'bg-sky-100 text-sky-800 border-sky-200',
  social: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  habitacional: 'bg-amber-100 text-amber-800 border-amber-200',
  economica: 'bg-purple-100 text-purple-800 border-purple-200',
  urbana: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  energetica: 'bg-orange-100 text-orange-800 border-orange-200',
  socioenergetica: 'bg-rose-100 text-rose-800 border-rose-200',
};

async function carregarDadosComparativo() {
  const [territorios, indicadores, observacoes] = await Promise.all([
    buscarTerritorios(),
    buscarIndicadores(),
    buscarObservacoes({ tiposTerritorio: ['bairro', 'municipio'] }),
  ]);
  return { territorios, indicadores, observacoes };
}

export default function Comparativo() {
  const { dados, carregando, erro, recarregar } = useConsulta(carregarDadosComparativo);
  const [dimensaoFiltro, setDimensaoFiltro] = useState('todas');
  const [indicadorFiltro, setIndicadorFiltro] = useState('todos');
  const filtroDimensaoId = useId();
  const filtroIndicadorId = useId();

  // Filtragem e cruzamentos
  const { indicadoresFiltrados, linhasComparativas, dadosGraficoDestaque, dadosGraficoTaxas } =
    useMemo(() => {
      if (!dados) {
        return {
          indicadoresFiltrados: [],
          linhasComparativas: [],
          dadosGraficoDestaque: null,
          dadosGraficoTaxas: null,
        };
      }

      const { indicadores, observacoes } = dados;

      // 1. Indicadores por dimensão
      const indFiltrados = indicadores.filter(
        (ind) => dimensaoFiltro === 'todas' || ind.dimensao === dimensaoFiltro,
      );

      // 2. Linhas da tabela comparativa
      const linhas = indFiltrados.map((ind) => {
        const obsBeiru = encontrarObservacao(observacoes, ind.codigo, CODIGO_BEIRU);
        const obsPernambues = encontrarObservacao(observacoes, ind.codigo, CODIGO_PERNAMBUES);
        const obsSalvador = encontrarObservacao(observacoes, ind.codigo, CODIGO_SALVADOR);
        const comparavel = saoComparaveis(obsBeiru, obsPernambues);
        const motivo = comparavel ? null : motivoNaoComparavel(obsBeiru, obsPernambues);
        const difAbs = comparavel ? diferencaAbsoluta(obsBeiru.valor, obsPernambues.valor) : null;
        const difPct = comparavel ? diferencaPercentual(obsBeiru.valor, obsPernambues.valor) : null;

        return {
          indicador: ind,
          obsBeiru,
          obsPernambues,
          obsSalvador,
          comparavel,
          motivo,
          difAbs,
          difPct,
        };
      });

      // 3. Gráfico 1: Indicador em destaque ou comparativo por indicador
      let graficoDestaque = null;
      const indSelecionadoObj =
        indicadorFiltro !== 'todos'
          ? indFiltrados.find((i) => i.codigo === indicadorFiltro)
          : indFiltrados.find((i) => i.codigo === 'dem_populacao') || indFiltrados[0];

      if (indSelecionadoObj) {
        const obsB = encontrarObservacao(observacoes, indSelecionadoObj.codigo, CODIGO_BEIRU);
        const obsP = encontrarObservacao(observacoes, indSelecionadoObj.codigo, CODIGO_PERNAMBUES);
        const obsS = encontrarObservacao(observacoes, indSelecionadoObj.codigo, CODIGO_SALVADOR);

        const dadosBarras = [];
        if (obsB) {
          dadosBarras.push({
            rotulo: 'Beiru / Tancredo Neves',
            valor: Number(obsB.valor),
            cor: corDoTerritorio(CODIGO_BEIRU),
          });
        }
        if (obsP) {
          dadosBarras.push({
            rotulo: 'Pernambués',
            valor: Number(obsP.valor),
            cor: corDoTerritorio(CODIGO_PERNAMBUES),
          });
        }
        if (obsS && indSelecionadoObj.unidade === '%') {
          // Salvador como referência só entra quando percentual para manter a mesma escala
          dadosBarras.push({
            rotulo: 'Salvador (município)',
            valor: Number(obsS.valor),
            cor: corDoTerritorio(CODIGO_SALVADOR),
          });
        }

        graficoDestaque = {
          indicador: indSelecionadoObj,
          dados: dadosBarras,
          observacaoRef: obsB || obsP || obsS,
        };
      }

      // 4. Gráfico 2: Panorama comparativo das taxas percentuais (%)
      const indicadoresPercentuais = indFiltrados.filter((i) => i.unidade === '%');
      let graficoTaxas = null;

      if (indicadoresPercentuais.length > 0) {
        const dadosAgrupados = indicadoresPercentuais.map((ind) => {
          const obsB = encontrarObservacao(observacoes, ind.codigo, CODIGO_BEIRU);
          const obsP = encontrarObservacao(observacoes, ind.codigo, CODIGO_PERNAMBUES);
          const obsS = encontrarObservacao(observacoes, ind.codigo, CODIGO_SALVADOR);

          return {
            rotulo: ROTULOS_COMPACTOS[ind.codigo] || ind.nome.replace(/\s*\(.*?\)\s*/g, ''),
            nomeCompleto: ind.nome,
            beiru: obsB ? Number(obsB.valor) : null,
            pernambues: obsP ? Number(obsP.valor) : null,
            salvador: obsS ? Number(obsS.valor) : null,
          };
        });

        graficoTaxas = {
          dados: dadosAgrupados,
          series: [
            { chave: 'beiru', nome: 'Beiru / Tancredo Neves', cor: corDoTerritorio(CODIGO_BEIRU) },
            { chave: 'pernambues', nome: 'Pernambués', cor: corDoTerritorio(CODIGO_PERNAMBUES) },
            {
              chave: 'salvador',
              nome: 'Salvador (município)',
              cor: corDoTerritorio(CODIGO_SALVADOR),
            },
          ],
          observacaoRef: encontrarObservacao(
            observacoes,
            indicadoresPercentuais[0].codigo,
            CODIGO_BEIRU,
          ),
        };
      }

      return {
        indicadoresFiltrados: indFiltrados,
        linhasComparativas: linhas,
        dadosGraficoDestaque: graficoDestaque,
        dadosGraficoTaxas: graficoTaxas,
      };
    }, [dados, dimensaoFiltro, indicadorFiltro]);

  if (carregando) {
    return <EstadoCarregando mensagem="Carregando dados comparativos dos territórios…" />;
  }
  if (erro) {
    return <EstadoErro mensagem={erro.message} onTentarNovamente={recarregar} />;
  }
  if (!dados?.observacoes?.length) {
    return (
      <EstadoVazio mensagem="Ainda não há observações suficientes no banco.">
        <p className="mt-1 text-sm">
          Execute os scripts de ETL (<code>etl/a_demografia.py</code> e{' '}
          <code>etl/b_renda_habitacao.py</code>).
        </p>
      </EstadoVazio>
    );
  }

  const analiseAtual = ANALISES_DIMENSAO[dimensaoFiltro] || ANALISES_DIMENSAO.todas;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Comparativo Territorial</h1>
        <p className="text-sm text-stone-600 sm:text-base">
          Comparação direta entre os bairros Beiru/Tancredo Neves e Pernambués com base em
          diferenças absolutas e percentuais rigorosamente pareadas, com Salvador como referência.
        </p>
      </header>

      {/* Controles de Filtro */}
      <section
        aria-label="Filtros de comparação"
        className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={filtroDimensaoId} className="text-sm font-medium text-stone-700">
            Dimensão:
          </label>
          <select
            id={filtroDimensaoId}
            value={dimensaoFiltro}
            onChange={(e) => {
              setDimensaoFiltro(e.target.value);
              setIndicadorFiltro('todos');
            }}
            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          >
            {DIMENSOES.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor={filtroIndicadorId} className="text-sm font-medium text-stone-700">
            Indicador em destaque:
          </label>
          <select
            id={filtroIndicadorId}
            value={indicadorFiltro}
            onChange={(e) => setIndicadorFiltro(e.target.value)}
            className="max-w-xs truncate rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
          >
            <option value="todos">Todos da dimensão</option>
            {indicadoresFiltrados.map((ind) => (
              <option key={ind.codigo} value={ind.codigo}>
                {ind.nome} ({ind.unidade})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Alerta metodológico para dimensão econômica */}
      {dimensaoFiltro === 'economica' && (
        <section
          aria-labelledby="aviso-renda"
          className="rounded-xl border border-purple-200 bg-purple-50/80 p-4"
        >
          <h2 id="aviso-renda" className="text-sm font-semibold text-purple-900">
            Nota metodológica sobre rendimento nos agregados censitários
          </h2>
          <p className="mt-1 text-sm text-purple-800">
            O rendimento por bairro vem da divulgação &quot;Rendimento do Responsável&quot; do Censo
            2022: média e mediana do rendimento nominal mensal das pessoas responsáveis com
            rendimento. Não é renda domiciliar nem per capita, e o arquivo não traz faixas de
            salário mínimo, por isso a concentração de baixa renda não pode ser calculada nesta
            escala. A média é sensível a valores extremos; compare preferencialmente a mediana.
          </p>
        </section>
      )}

      {/* Seção de Visualizações (mínimo de 2 visualizações) */}
      <section
        aria-label="Visualizações gráficas"
        className={`grid gap-6 ${dadosGraficoTaxas?.dados?.length > 5 ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}
      >
        {/* Visualização 1: Gráfico do indicador selecionado */}
        {dadosGraficoDestaque && dadosGraficoDestaque.dados.length > 0 && (
          <GraficoBarras
            titulo={dadosGraficoDestaque.indicador.nome}
            descricao={`Comparação territorial do indicador (${dadosGraficoDestaque.indicador.unidade}).`}
            dados={dadosGraficoDestaque.dados}
            series={[{ chave: 'valor', nome: dadosGraficoDestaque.indicador.nome }]}
            formatarValor={(v) => formatarValor(v, dadosGraficoDestaque.indicador.unidade)}
            formatarEixo={(v) => {
              const unidade = dadosGraficoDestaque.indicador.unidade;
              if (unidade === '%') return `${formatarNumero(v)}%`;
              if (unidade === 'km²' || unidade === 'moradores/domicílio') {
                return formatarNumero(v, 1);
              }
              return formatarCompacto(v);
            }}
            rodape={
              dadosGraficoDestaque.observacaoRef && (
                <SeloFonte observacao={dadosGraficoDestaque.observacaoRef} />
              )
            }
          />
        )}

        {/* Visualização 2: Panorama de taxas percentuais agrupadas */}
        {dadosGraficoTaxas && dadosGraficoTaxas.dados.length > 0 && (
          <GraficoBarras
            titulo="Panorama comparativo de taxas (%)"
            descricao="Comparação das proporções percentuais entre Beiru/Tancredo Neves, Pernambués e Salvador."
            dados={dadosGraficoTaxas.dados}
            series={dadosGraficoTaxas.series}
            altura={340}
            rotacionarRotulos={dadosGraficoTaxas.dados.length > 3}
            formatarValor={(v) => formatarPercentual(v)}
            formatarEixo={(v) => `${formatarNumero(v)}%`}
            rodape={
              dadosGraficoTaxas.observacaoRef && (
                <SeloFonte
                  observacao={dadosGraficoTaxas.observacaoRef}
                  escala="Bairro e Salvador"
                />
              )
            }
          />
        )}
      </section>

      {/* Caixa de Interpretação Analítica Fundamentada */}
      <section
        aria-labelledby="analise-dimensao"
        className="rounded-xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
      >
        <h2 id="analise-dimensao" className="text-base font-semibold text-stone-900">
          {analiseAtual.titulo}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">{analiseAtual.texto}</p>
      </section>

      {/* Tabela Comparativa Territorial Completa */}
      <section aria-labelledby="titulo-tabela-comparativa" className="space-y-3">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <h2 id="titulo-tabela-comparativa" className="text-lg font-semibold text-stone-900">
            Tabela de Indicadores Pareados
          </h2>
          <p className="text-xs text-stone-500">
            Diferenças calculadas tomando Pernambués como base de comparação.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table
            data-testid="tabela-comparativa"
            aria-label="Tabela comparativa de indicadores"
            className="w-full min-w-[760px] text-left text-sm text-stone-700"
          >
            <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase text-stone-600">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Indicador
                </th>
                <th scope="col" className="px-3 py-3">
                  Dimensão
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Beiru / T. Neves
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Pernambués
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Salvador (ref.)
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Dif. Absoluta
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Dif. %
                </th>
                <th scope="col" className="px-3 py-3 text-center">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {linhasComparativas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-stone-500">
                    Nenhum indicador encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                linhasComparativas.map(
                  ({
                    indicador,
                    obsBeiru,
                    obsPernambues,
                    obsSalvador,
                    comparavel,
                    motivo,
                    difAbs,
                    difPct,
                  }) => {
                    const badgeDimensao =
                      CORES_DIMENSAO[indicador.dimensao] || 'bg-stone-100 text-stone-700';

                    return (
                      <tr key={indicador.codigo} className="hover:bg-stone-50/60">
                        <th scope="row" className="px-4 py-3 font-medium text-stone-900">
                          <div>{indicador.nome}</div>
                          <div className="text-xs font-normal text-stone-400">
                            {indicador.codigo} ({indicador.unidade})
                          </div>
                        </th>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${badgeDimensao}`}
                          >
                            {indicador.dimensao}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums text-stone-900">
                          {obsBeiru ? formatarValor(obsBeiru.valor, indicador.unidade) : VAZIO}
                        </td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums text-stone-900">
                          {obsPernambues
                            ? formatarValor(obsPernambues.valor, indicador.unidade)
                            : VAZIO}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-stone-500">
                          {obsSalvador
                            ? formatarValor(obsSalvador.valor, indicador.unidade)
                            : VAZIO}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {comparavel ? (
                            <span
                              className={
                                difAbs > 0
                                  ? 'font-medium text-stone-900'
                                  : difAbs < 0
                                    ? 'text-stone-700'
                                    : 'text-stone-500'
                              }
                            >
                              {formatarDiferencaAbsoluta(difAbs, indicador.unidade)}
                            </span>
                          ) : (
                            <span
                              title={motivo}
                              className="inline-block rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500"
                            >
                              Não comparável
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {comparavel ? (
                            <span
                              className={
                                difPct > 0
                                  ? 'font-semibold text-emerald-700'
                                  : difPct < 0
                                    ? 'font-semibold text-amber-700'
                                    : 'text-stone-500'
                              }
                            >
                              {formatarDiferencaPercentual(difPct)}
                            </span>
                          ) : (
                            <span
                              title={motivo}
                              className="inline-block rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-500"
                            >
                              {motivo}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <span className="text-xs text-stone-500">
                            {rotuloClassificacao(indicador.classificacao)}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
