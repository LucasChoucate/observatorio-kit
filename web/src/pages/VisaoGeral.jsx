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
const CARDS_RENDIMENTO = [
  'eco_rendimento_mediano_responsavel_rs',
  'eco_rendimento_medio_responsavel_rs',
];
const CARDS_URBANOS = [
  'urb_iluminacao_publica_pct',
  'urb_via_pavimentada_pct',
  'urb_calcada_pct',
  'urb_bueiro_pct',
  'urb_arborizacao_pct',
  'urb_via_sem_veiculos_pct',
];
const CARDS_SOCIAIS_HABITACIONAIS = [
  'soc_taxa_alfabetizacao_pct',
  'hab_agua_rede_geral_pct',
  'hab_esgoto_adequado_pct',
  'hab_lixo_coletado_pct',
  'hab_lixo_cacamba_pct',
  'hab_sem_banheiro_exclusivo_pct',
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
    buscarObservacoes({ tiposTerritorio: ['bairro', 'municipio'] }),
  ]);
  return { bairros, observacoes };
}

function primeiraObservacao(observacoes, codigos) {
  return observacoes.find((obs) => codigos.includes(obs.indicador_codigo)) ?? null;
}

/** Grupo de cards de um tema; some quando o bairro não tem nenhum indicador do grupo no banco. */
function GrupoCards({ titulo, codigos, bairro, observacoes, gridCards, children }) {
  const cards = codigos
    .map((codigo) => ({
      codigo,
      obs: encontrarObservacao(observacoes, codigo, bairro.codigo_ibge),
      ref: encontrarObservacao(observacoes, codigo, CODIGO_SALVADOR),
    }))
    .filter((item) => item.obs != null);
  if (!cards.length) return null;
  return (
    <div className="space-y-2 pt-2">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">{titulo}</h3>
      <div className={gridCards}>
        {cards.map(({ codigo, obs, ref }) => (
          <CardIndicador
            key={codigo}
            observacao={obs}
            referencia={ref}
            rotuloReferencia={ROTULO_SALVADOR}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

function SecaoBairro({ bairro, observacoes, duasColunas }) {
  const gridCards = `grid gap-3 sm:grid-cols-2 ${duasColunas ? '2xl:grid-cols-3' : 'lg:grid-cols-3'}`;
  const propsGrupo = { bairro, observacoes, gridCards };

  return (
    <section aria-labelledby={`bairro-${bairro.codigo_ibge}`} className="space-y-4">
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
      <div className={gridCards}>
        {CARDS_DEMOGRAFICOS.map((codigo) => (
          <CardIndicador
            key={codigo}
            observacao={encontrarObservacao(observacoes, codigo, bairro.codigo_ibge)}
            referencia={encontrarObservacao(observacoes, codigo, CODIGO_SALVADOR)}
            rotuloReferencia={ROTULO_SALVADOR}
          />
        ))}
      </div>

      {/* ETAPA B: rendimento do responsável, educação e saneamento básico do bairro */}
      <GrupoCards
        titulo="Rendimento do responsável pelo domicílio (Censo 2022)"
        codigos={CARDS_RENDIMENTO}
        {...propsGrupo}
      >
        <p className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          Rendimento nominal mensal só das pessoas responsáveis com rendimento, não a renda da
          família nem por pessoa. A média é sensível a valores extremos; para comparar os bairros,
          prefira a mediana. Baixa renda não comprova, sozinha, pobreza energética.
        </p>
      </GrupoCards>
      <GrupoCards
        titulo="Educação e saneamento básico (Censo 2022)"
        codigos={CARDS_SOCIAIS_HABITACIONAIS}
        {...propsGrupo}
      />

      {/* ETAPA C: infraestrutura urbana do entorno do bairro */}
      <GrupoCards
        titulo="Infraestrutura urbana do entorno (Censo 2022)"
        codigos={CARDS_URBANOS}
        {...propsGrupo}
      >
        <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
          Percentual de domicílios cuja face de quadra tem cada item. Iluminação pública não mede a
          continuidade nem a qualidade do fornecimento de energia nas casas. O mapa por setor
          censitário está na tela Mapa de vulnerabilidade.
        </p>
      </GrupoCards>
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
            <SecaoBairro
              key={bairro.codigo_ibge}
              bairro={bairro}
              observacoes={observacoes}
              duasColunas={selecionados.length > 1}
            />
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
