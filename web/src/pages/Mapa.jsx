import { useCallback, useId, useMemo, useState } from 'react';
import EstadoCarregando from '../components/EstadoCarregando';
import EstadoErro from '../components/EstadoErro';
import EstadoVazio from '../components/EstadoVazio';
import GraficoBarras from '../components/GraficoBarras';
import LegendaMapa from '../components/LegendaMapa';
import MapaCoropletico from '../components/MapaCoropletico';
import SeloFonte from '../components/SeloFonte';
import { useConsulta } from '../hooks/useConsulta';
import { CAMADAS } from '../lib/camadas';
import { corDoTerritorio } from '../lib/cores';
import { CODIGO_SALVADOR } from '../lib/territorios';
import { buscarGeoJson } from '../services/geo';
import { buscarIndicadores, buscarObservacoes, buscarTerritorios } from '../services/observacoes';
import { paraNumero } from '../utils/calculos';
import { formatarNumero, formatarPercentual, formatarValor, VAZIO } from '../utils/formatar';
import { calcularClasses, escalaDasObservacoes } from '../utils/mapa';
import { chaveTerritorio, montarDadosAgrupados } from '../utils/series';

const ROTULO_SALVADOR = 'Salvador (município)';
const ROTULOS_DIMENSAO = {
  urbana: 'Entorno urbano',
  habitacional: 'Habitação',
  economica: 'Rendimento',
};

async function carregarBase() {
  const [bairrosGeo, setoresGeo, indicadores, bairros, observacoesUrbanas] = await Promise.all([
    buscarGeoJson('bairros'),
    buscarGeoJson('setores'),
    buscarIndicadores(),
    buscarTerritorios({ tipo: 'bairro' }),
    buscarObservacoes({ dimensao: 'urbana', tiposTerritorio: ['bairro', 'municipio'] }),
  ]);
  return { bairrosGeo, setoresGeo, indicadores, bairros, observacoesUrbanas };
}

function contarSetores(setoresGeo) {
  return setoresGeo.features.reduce((contagem, feature) => {
    const nome = feature.properties.nome_bairro;
    contagem[nome] = (contagem[nome] ?? 0) + 1;
    return contagem;
  }, {});
}

function AvisoEscala({ escala, setoresGeo }) {
  if (escala === 'setor_censitario') {
    const contagem = Object.entries(contarSetores(setoresGeo))
      .map(([nome, total]) => `${total} em ${nome}`)
      .join(' e ');
    return (
      <p
        role="note"
        className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900"
      >
        <span className="font-semibold">Escala: setor censitário.</span> Cada polígono é um setor do
        IBGE ({contagem}). Setores com poucos domicílios têm valores mais instáveis; a base de cada
        um aparece ao clicar.
      </p>
    );
  }
  return (
    <p
      role="note"
      className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <span className="font-semibold">Atenção: escala de bairro, não de setor.</span> Este indicador
      só está disponível por bairro, então cada bairro recebe um único valor e as diferenças
      internas não aparecem no mapa.
    </p>
  );
}

function TabelaCamada({ indicador, observacoes }) {
  const linhas = [...observacoes].sort(
    (a, b) =>
      (a.territorio_tipo === 'bairro' ? 0 : 1) - (b.territorio_tipo === 'bairro' ? 0 : 1) ||
      String(a.codigo_ibge).localeCompare(String(b.codigo_ibge)),
  );
  return (
    <details className="rounded-xl border border-stone-200 bg-white p-4 text-sm shadow-sm">
      <summary className="cursor-pointer text-stone-600 hover:text-stone-900">
        Ver os valores do mapa em tabela ({linhas.length} territórios)
      </summary>
      <div className="mt-3 max-h-80 overflow-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-stone-200 text-stone-500">
              <th scope="col" className="py-1 pr-4 font-medium">
                Território
              </th>
              <th scope="col" className="py-1 pr-4 text-right font-medium">
                {indicador.nome}
              </th>
              <th scope="col" className="py-1 font-medium">
                Nota
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((obs) => (
              <tr key={obs.codigo_ibge} className="border-b border-stone-100 align-top">
                <th scope="row" className="py-1 pr-4 font-normal">
                  {obs.territorio}
                </th>
                <td className="py-1 pr-4 text-right tabular-nums">
                  {paraNumero(obs.valor) === null ? VAZIO : formatarValor(obs.valor, obs.unidade)}
                </td>
                <td className="py-1 text-xs text-stone-500">{obs.nota ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function PainelCamada({ base, camada, indicador }) {
  const consultarCamada = useCallback(
    () =>
      buscarObservacoes({
        indicadores: [camada.codigo],
        tiposTerritorio: ['bairro', 'setor_censitario'],
      }),
    [camada.codigo],
  );
  const { dados: observacoes, carregando, erro, recarregar } = useConsulta(consultarCamada);

  const derivado = useMemo(() => {
    if (!observacoes) return null;
    const escala = escalaDasObservacoes(observacoes);
    const desenhadas = observacoes.filter((obs) =>
      escala === 'setor_censitario'
        ? obs.territorio_tipo === 'setor_censitario'
        : obs.territorio_tipo === 'bairro',
    );
    const colecao = escala === 'setor_censitario' ? base.setoresGeo : base.bairrosGeo;
    const comValor = new Set(
      desenhadas.filter((obs) => paraNumero(obs.valor) !== null).map((obs) => obs.codigo_ibge),
    );
    return {
      escala,
      desenhadas,
      classes: calcularClasses(desenhadas.map((obs) => obs.valor)),
      temSemDado: colecao.features.some((f) => !comValor.has(f.properties.codigo_ibge)),
      observacaoRef: desenhadas.find((obs) => paraNumero(obs.valor) !== null) ?? null,
    };
  }, [observacoes, base]);

  if (carregando) return <EstadoCarregando mensagem="Carregando a camada do mapa…" />;
  if (erro) return <EstadoErro mensagem={erro.message} onTentarNovamente={recarregar} />;
  if (!derivado.observacaoRef) {
    return (
      <EstadoVazio mensagem="Esta camada ainda não tem valores no banco.">
        <p className="mt-1 text-sm">
          Rode <code>etl/c_malha.py</code> e <code>etl/c_urbano.py</code> (ou o script da etapa do
          indicador).
        </p>
      </EstadoVazio>
    );
  }

  return (
    <div className="space-y-4">
      <AvisoEscala escala={derivado.escala} setoresGeo={base.setoresGeo} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div
          role="region"
          aria-label={`Mapa: ${indicador.nome}`}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
        >
          <MapaCoropletico
            bairros={base.bairrosGeo}
            setores={base.setoresGeo}
            escala={derivado.escala}
            indicador={indicador}
            observacoes={derivado.desenhadas}
            classes={derivado.classes}
            atencao={camada.atencao}
          />
        </div>
        <LegendaMapa
          indicador={indicador}
          classes={derivado.classes}
          atencao={camada.atencao}
          leitura={camada.leitura}
          escala={derivado.escala}
          temSemDado={derivado.temSemDado}
          observacaoRef={derivado.observacaoRef}
        />
      </div>
      <TabelaCamada indicador={indicador} observacoes={derivado.desenhadas} />
    </div>
  );
}

function GraficoEntorno({ base }) {
  const { bairros, observacoesUrbanas } = base;
  const categorias = CAMADAS.filter(
    (camada) =>
      camada.codigo.startsWith('urb_') &&
      observacoesUrbanas.some((obs) => obs.indicador_codigo === camada.codigo),
  ).map((camada) => ({ codigo: camada.codigo, rotulo: camada.rotuloCurto }));
  if (!categorias.length) return null;
  const temSalvador = observacoesUrbanas.some((obs) => obs.codigo_ibge === CODIGO_SALVADOR);
  const territorios = temSalvador
    ? [...bairros, { codigo_ibge: CODIGO_SALVADOR, nome: ROTULO_SALVADOR }]
    : bairros;
  const series = territorios.map((t) => ({
    chave: chaveTerritorio(t.codigo_ibge),
    nome: t.nome,
    cor: corDoTerritorio(t.codigo_ibge),
  }));
  const referencia = observacoesUrbanas.find(
    (obs) => obs.indicador_codigo === categorias[0].codigo,
  );
  return (
    <GraficoBarras
      titulo="Infraestrutura do entorno: bairros e Salvador"
      descricao="Percentual de domicílios cuja face de quadra tem cada característica. Em “Via sem veículos”, um valor maior indica mais domicílios em vias onde só passam pedestres, bicicletas e motos."
      dados={montarDadosAgrupados(observacoesUrbanas, categorias, territorios)}
      series={series}
      formatarValor={(v) => formatarPercentual(v)}
      formatarEixo={(v) => `${formatarNumero(v)}%`}
      rodape={
        <SeloFonte
          observacao={referencia}
          escala={temSalvador ? 'Bairro; Salvador como referência municipal' : 'Bairro'}
        />
      }
    />
  );
}

export default function Mapa() {
  const { dados: base, carregando, erro, recarregar } = useConsulta(carregarBase);
  const [codigoEscolhido, setCodigoEscolhido] = useState(null);
  const seletorId = useId();

  const camadasDisponiveis = useMemo(() => {
    if (!base) return [];
    return CAMADAS.map((camada) => ({
      ...camada,
      indicador: base.indicadores.find((ind) => ind.codigo === camada.codigo),
    })).filter((camada) => camada.indicador);
  }, [base]);

  let conteudo;
  if (carregando) {
    conteudo = <EstadoCarregando mensagem="Carregando limites territoriais e indicadores…" />;
  } else if (erro) {
    conteudo = <EstadoErro mensagem={erro.message} onTentarNovamente={recarregar} />;
  } else if (!camadasDisponiveis.length) {
    conteudo = (
      <EstadoVazio mensagem="Ainda não há indicadores do mapa no banco.">
        <p className="mt-1 text-sm">
          Rode <code>etl/c_malha.py</code> e <code>etl/c_urbano.py</code>.
        </p>
      </EstadoVazio>
    );
  } else {
    const camada =
      camadasDisponiveis.find((c) => c.codigo === codigoEscolhido) ?? camadasDisponiveis[0];
    const grupos = Object.entries(ROTULOS_DIMENSAO)
      .map(([dimensao, rotulo]) => ({
        rotulo,
        camadas: camadasDisponiveis.filter((c) => c.indicador.dimensao === dimensao),
      }))
      .filter((grupo) => grupo.camadas.length);
    conteudo = (
      <div className="space-y-8">
        <section aria-label="Mapa de vulnerabilidade" className="space-y-4">
          <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <label htmlFor={seletorId} className="text-sm font-medium text-stone-700">
              Camada temática:
            </label>
            <select
              id={seletorId}
              value={camada.codigo}
              onChange={(e) => setCodigoEscolhido(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-stone-900 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 focus:outline-none sm:w-auto sm:min-w-80"
            >
              {grupos.map((grupo) => (
                <optgroup key={grupo.rotulo} label={grupo.rotulo}>
                  {grupo.camadas.map((c) => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.indicador.nome}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <PainelCamada
            key={camada.codigo}
            base={base}
            camada={camada}
            indicador={camada.indicador}
          />
        </section>

        <section aria-labelledby="titulo-entorno" className="space-y-3">
          <h2 id="titulo-entorno" className="text-lg font-semibold">
            Comparação da infraestrutura do entorno
          </h2>
          <GraficoEntorno base={base} />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Mapa de vulnerabilidade</h1>
        <p className="max-w-3xl text-stone-600">
          Limites oficiais do IBGE (Censo 2022) de Beiru/Tancredo Neves e Pernambués, coloridos pelo
          indicador escolhido. Tons mais escuros marcam a ponta da escala que merece mais atenção.
          Os indicadores do entorno descrevem a face de quadra onde fica o domicílio. Iluminação
          pública não mede a continuidade nem a qualidade do fornecimento de energia nas casas.
        </p>
      </header>
      {conteudo}
    </div>
  );
}
