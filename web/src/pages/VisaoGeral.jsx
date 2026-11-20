import { useState } from 'react';
import CardIndicador from '../components/CardIndicador';
import EstadoCarregando from '../components/EstadoCarregando';
import EstadoErro from '../components/EstadoErro';
import EstadoVazio from '../components/EstadoVazio';
import GraficoBarras from '../components/GraficoBarras';
import SeletorBairro, { AMBOS } from '../components/SeletorBairro';
import SeloFonte from '../components/SeloFonte';
import { useConsulta } from '../hooks/useConsulta';
import { corDoTerritorio } from '../lib/cores';
import { CODIGO_SALVADOR } from '../lib/territorios';
import { buscarObservacoes, buscarTerritorios } from '../services/observacoes';
import { encontrarObservacao } from '../utils/calculos';
import { formatarNumero, formatarPercentual } from '../utils/formatar';
import { chaveTerritorio, montarDadosAgrupados, montarDadosPorTerritorio } from '../utils/series';

// Indicadores exibidos (códigos do banco; os valores vêm do Supabase).
const CARDS_DEMOGRAFICOS = [
  'dem_populacao',
  'dem_domicilios',
  'dem_moradores_por_domicilio',
  'dem_densidade_hab_km2',
  'dem_idade_60_mais_pct',
  'dem_mulheres_pct',
];
const CONTAGENS = [
  { codigo: 'dem_populacao', rotulo: 'População' },
  { codigo: 'dem_domicilios', rotulo: 'Domicílios ocupados' },
];
const FAIXAS_ETARIAS = [
  { codigo: 'dem_idade_0_14_pct', rotulo: '0 a 14 anos' },
  { codigo: 'dem_idade_15_59_pct', rotulo: '15 a 59 anos' },
  { codigo: 'dem_idade_60_mais_pct', rotulo: '60 anos ou mais' },
];
const ROTULO_SALVADOR = 'Salvador (município)';

async function carregarVisaoGeral() {
  const [bairros, observacoes] = await Promise.all([
    buscarTerritorios({ tipo: 'bairro' }),
    buscarObservacoes({ dimensao: 'demografica', tiposTerritorio: ['bairro', 'municipio'] }),
  ]);
  return { bairros, observacoes };
}

function primeiraObservacao(observacoes, codigos) {
  return observacoes.find((obs) => codigos.includes(obs.indicador_codigo)) ?? null;
}

function SecaoBairro({ bairro, observacoes }) {
  return (
    <section aria-labelledby={`bairro-${bairro.codigo_ibge}`} className="space-y-3">
      <h2
        id={`bairro-${bairro.codigo_ibge}`}
        className="flex items-center gap-2 text-lg font-semibold"
      >
        <span
          aria-hidden="true"
          className="inline-block size-3 rounded-sm"
          style={{ background: corDoTerritorio(bairro.codigo_ibge) }}
        />
        {bairro.nome}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS_DEMOGRAFICOS.map((codigo) => (
          <CardIndicador
            key={codigo}
            observacao={encontrarObservacao(observacoes, codigo, bairro.codigo_ibge)}
            referencia={encontrarObservacao(observacoes, codigo, CODIGO_SALVADOR)}
            rotuloReferencia={ROTULO_SALVADOR}
          />
        ))}
      </div>
      {/* ETAPA B: acrescentar aqui os cards de rendimento e saneamento deste bairro. */}
      {/* ETAPA C: acrescentar aqui os cards de infraestrutura urbana deste bairro. */}
    </section>
  );
}

export default function VisaoGeral() {
  const { dados, carregando, erro, recarregar } = useConsulta(carregarVisaoGeral);
  const [selecao, setSelecao] = useState(AMBOS);

  let conteudo;
  if (carregando) {
    conteudo = <EstadoCarregando mensagem="Carregando indicadores demográficos…" />;
  } else if (erro) {
    conteudo = <EstadoErro mensagem={erro.message} onTentarNovamente={recarregar} />;
  } else if (!dados.bairros.length || !dados.observacoes.length) {
    conteudo = (
      <EstadoVazio mensagem="Ainda não há dados demográficos no banco.">
        <p className="mt-1 text-sm">
          Rode o seed do Supabase e o script <code>etl/a_demografia.py</code>.
        </p>
      </EstadoVazio>
    );
  } else {
    const { bairros, observacoes } = dados;
    const selecionados =
      selecao === AMBOS ? bairros : bairros.filter((b) => b.codigo_ibge === selecao);
    const salvador = {
      codigo_ibge: CODIGO_SALVADOR,
      nome: ROTULO_SALVADOR,
      rotulo: ROTULO_SALVADOR,
    };
    const temSalvador = observacoes.some((obs) => obs.codigo_ibge === CODIGO_SALVADOR);
    const comReferencia = temSalvador ? [...selecionados, salvador] : selecionados;
    const serie = (t) => ({
      chave: chaveTerritorio(t.codigo_ibge),
      nome: t.nome,
      cor: corDoTerritorio(t.codigo_ibge),
    });
    const escalaComReferencia = temSalvador
      ? 'Bairro; Salvador como referência municipal'
      : 'Bairro';

    const obsContagens = primeiraObservacao(
      observacoes,
      CONTAGENS.map((c) => c.codigo),
    );
    const obsFaixas = primeiraObservacao(
      observacoes,
      FAIXAS_ETARIAS.map((f) => f.codigo),
    );
    const obsDensidade = primeiraObservacao(observacoes, ['dem_densidade_hab_km2']);
    const dadosDensidade = montarDadosPorTerritorio(
      observacoes,
      'dem_densidade_hab_km2',
      comReferencia,
    ).map((linha) => ({ ...linha, cor: corDoTerritorio(linha.codigo_ibge) }));

    conteudo = (
      <div className="space-y-8">
        <SeletorBairro bairros={bairros} valor={selecao} onChange={setSelecao} />

        <div className={`grid gap-8 ${selecionados.length > 1 ? 'xl:grid-cols-2' : ''}`}>
          {selecionados.map((bairro) => (
            <SecaoBairro key={bairro.codigo_ibge} bairro={bairro} observacoes={observacoes} />
          ))}
        </div>

        <section aria-labelledby="graficos-demografia" className="space-y-3">
          <h2 id="graficos-demografia" className="text-lg font-semibold">
            Comparação demográfica
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {obsContagens && (
              <GraficoBarras
                titulo="População e domicílios ocupados"
                descricao="Contagens absolutas por bairro. Salvador fica de fora por estar em outra ordem de grandeza."
                dados={montarDadosAgrupados(observacoes, CONTAGENS, selecionados)}
                series={selecionados.map(serie)}
                rodape={<SeloFonte observacao={obsContagens} escala="Bairro" />}
              />
            )}
            {obsFaixas && (
              <GraficoBarras
                titulo="Composição etária"
                descricao="Percentual dos moradores em cada faixa de idade."
                dados={montarDadosAgrupados(observacoes, FAIXAS_ETARIAS, comReferencia)}
                series={comReferencia.map(serie)}
                formatarValor={(v) => formatarPercentual(v)}
                formatarEixo={(v) => `${formatarNumero(v)}%`}
                rodape={<SeloFonte observacao={obsFaixas} escala={escalaComReferencia} />}
              />
            )}
            {obsDensidade && dadosDensidade.length > 0 && (
              <GraficoBarras
                titulo="Densidade demográfica (hab/km²)"
                descricao="Pessoas por km² da área total de cada território."
                dados={dadosDensidade}
                series={[{ chave: 'valor', nome: 'Densidade' }]}
                rodape={<SeloFonte observacao={obsDensidade} escala={escalaComReferencia} />}
              />
            )}
          </div>
        </section>

        {/* ETAPA B e C: gráficos de rendimento, saneamento e infraestrutura podem entrar aqui. */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Visão geral</h1>
        <p className="max-w-3xl text-stone-600">
          Perfil dos bairros Beiru/Tancredo Neves e Pernambués segundo o Censo Demográfico 2022
          (IBGE). Os valores de Salvador aparecem apenas como referência, em escala municipal. No
          IBGE, Beiru/Tancredo Neves é um único bairro.
        </p>
      </header>
      {conteudo}
    </div>
  );
}
