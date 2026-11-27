import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet';
import { paraNumero } from '../utils/calculos';
import { formatarValor } from '../utils/formatar';
import { conteudoPopup, corDaClasse, escaparHtml, indiceClasse } from '../utils/mapa';

const ESTILO_LIMITE_BAIRRO = { color: '#1c1917', weight: 2.5, fill: false };
const COR_BORDA = '#ffffff';
const COR_BORDA_SEM_DADO = '#a8a29e';
const COR_DESTAQUE = '#1c1917';

/** Nome e descrição de um polígono, para popup e tooltip. */
function identificacao(propriedades) {
  if (propriedades.tipo === 'setor_censitario') {
    return {
      titulo: `Setor censitário ${propriedades.codigo_ibge}`,
      subtitulo: `${propriedades.nome_bairro} · Tipo de setor (IBGE): ${propriedades.tipo_setor}`,
    };
  }
  return { titulo: propriedades.nome, subtitulo: 'Bairro (limite do IBGE)' };
}

/**
 * Mapa coroplético (Leaflet + OpenStreetMap) com os limites oficiais dos bairros por cima.
 * Os polígonos vêm do GeoJSON estático; a cor de cada um vem da observação do Supabase.
 * @param {object} props.bairros FeatureCollection dos bairros
 * @param {object} props.setores FeatureCollection dos setores
 * @param {'setor_censitario'|'bairro'} props.escala polígonos coloridos
 * @param {object} props.indicador linha de indicadores (codigo, nome, unidade, classificacao)
 * @param {object[]} props.observacoes linhas de vw_observacoes do indicador
 * @param {{min: number, max: number}[]} props.classes classes da legenda
 * @param {'menor'|'maior'} props.atencao ponta da escala com o tom mais escuro
 */
export default function MapaCoropletico({
  bairros,
  setores,
  escala,
  indicador,
  observacoes,
  classes,
  atencao,
}) {
  const limites = useMemo(() => L.geoJSON(bairros).getBounds(), [bairros]);
  const porCodigo = useMemo(
    () => new Map(observacoes.map((obs) => [obs.codigo_ibge, obs])),
    [observacoes],
  );
  const colecao = escala === 'setor_censitario' ? setores : bairros;

  function estilo(feature) {
    const obs = porCodigo.get(feature.properties.codigo_ibge);
    const indice = indiceClasse(obs?.valor, classes);
    const semDado = indice === null;
    return {
      fillColor: corDaClasse(indice, classes.length, atencao),
      fillOpacity: semDado ? 0.55 : 0.85,
      color: semDado ? COR_BORDA_SEM_DADO : COR_BORDA,
      weight: semDado ? 1 : 1.2,
      dashArray: semDado ? '3 3' : null,
    };
  }

  function aoCriarPoligono(feature, camada) {
    const obs = porCodigo.get(feature.properties.codigo_ibge) ?? null;
    const { titulo, subtitulo } = identificacao(feature.properties);
    const valor =
      obs && paraNumero(obs.valor) !== null
        ? formatarValor(obs.valor, indicador.unidade)
        : 'sem dado';
    camada.bindPopup(conteudoPopup({ titulo, subtitulo, indicador, observacao: obs }));
    camada.bindTooltip(escaparHtml(`${titulo}: ${valor}`), { sticky: true });
    camada.on({
      mouseover: () => camada.setStyle({ weight: 3, color: COR_DESTAQUE }),
      mouseout: () => camada.setStyle(estilo(feature)),
    });
  }

  function aoCriarLimite(feature, camada) {
    camada.bindTooltip(escaparHtml(feature.properties.nome), {
      permanent: true,
      direction: 'center',
      className: 'rotulo-bairro',
    });
  }

  return (
    <MapContainer
      bounds={limites}
      boundsOptions={{ padding: [12, 12] }}
      scrollWheelZoom={false}
      className="h-[380px] w-full rounded-xl sm:h-[480px] lg:h-[540px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={`${indicador.codigo}-${escala}`}
        data={colecao}
        style={estilo}
        onEachFeature={aoCriarPoligono}
      />
      <GeoJSON
        key="limites-bairros"
        data={bairros}
        style={ESTILO_LIMITE_BAIRRO}
        interactive={false}
        onEachFeature={aoCriarLimite}
      />
    </MapContainer>
  );
}
