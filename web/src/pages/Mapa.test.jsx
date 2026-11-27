import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buscarGeoJson } from '../services/geo';
import { buscarIndicadores, buscarObservacoes, buscarTerritorios } from '../services/observacoes';
import Mapa from './Mapa';

vi.mock('../services/observacoes', () => ({
  buscarIndicadores: vi.fn(),
  buscarObservacoes: vi.fn(),
  buscarTerritorios: vi.fn(),
}));
vi.mock('../services/geo', () => ({ buscarGeoJson: vi.fn() }));
// O Leaflet não desenha no jsdom: o mapa vira um resumo das props recebidas.
vi.mock('../components/MapaCoropletico', () => ({
  default: ({ escala, observacoes, classes }) => (
    <div data-testid="mapa">
      {escala} · {observacoes.length} polígonos · {classes.length} classes
    </div>
  ),
}));

// Dados fictícios só para o teste de interface (não são valores reais).
const fonte = {
  fonte_sigla: 'TESTE',
  instituicao: 'Fonte de Teste (FT)',
  fonte_titulo: 'Fonte de teste',
  fonte_url: 'https://exemplo.org',
  ano: 2022,
  classificacao: 'derivado',
  unidade: '%',
};
const obs = (codigo_ibge, territorio_tipo, indicador_codigo, valor) => ({
  ...fonte,
  codigo_ibge,
  territorio_tipo,
  territorio: `Território ${codigo_ibge}`,
  indicador_codigo,
  valor,
  nota: valor === null ? 'Sem dado.' : 'Base: 10 domicílios.',
});
const feature = (codigo_ibge, props = {}) => ({
  type: 'Feature',
  properties: { codigo_ibge, ...props },
  geometry: { type: 'Polygon', coordinates: [] },
});
const geo = {
  bairros: { type: 'FeatureCollection', features: [feature('111', { nome: 'BAIRRO UM' })] },
  setores: {
    type: 'FeatureCollection',
    // Grafia da malha diferente da do banco: a tela deve usar a do banco.
    features: ['s1', 's2', 's3'].map((c) =>
      feature(c, { tipo: 'setor_censitario', codigo_bairro: '111', nome_bairro: 'BAIRRO UM' }),
    ),
  },
};
const indicadores = [
  {
    codigo: 'urb_iluminacao_publica_pct',
    nome: 'Domicílios em face com iluminação pública',
    unidade: '%',
    dimensao: 'urbana',
  },
  {
    codigo: 'hab_lixo_cacamba_pct',
    nome: 'Domicílios com descarte em caçamba',
    unidade: '%',
    dimensao: 'habitacional',
  },
];
const urbanasBairro = [
  obs('111', 'bairro', 'urb_iluminacao_publica_pct', 90),
  obs('2927408', 'municipio', 'urb_iluminacao_publica_pct', 95),
];
const camadaIluminacao = [
  obs('111', 'bairro', 'urb_iluminacao_publica_pct', 90),
  obs('s1', 'setor_censitario', 'urb_iluminacao_publica_pct', 80),
  obs('s2', 'setor_censitario', 'urb_iluminacao_publica_pct', 100),
  obs('s3', 'setor_censitario', 'urb_iluminacao_publica_pct', null),
];
const camadaCacamba = [obs('111', 'bairro', 'hab_lixo_cacamba_pct', 60)];

beforeEach(() => {
  vi.mocked(buscarGeoJson).mockImplementation(async (nome) => geo[nome]);
  vi.mocked(buscarIndicadores).mockResolvedValue(indicadores);
  vi.mocked(buscarTerritorios).mockResolvedValue([{ codigo_ibge: '111', nome: 'Bairro Um' }]);
  vi.mocked(buscarObservacoes).mockImplementation(async ({ dimensao, indicadores: codigos }) => {
    if (dimensao === 'urbana') return urbanasBairro;
    if (codigos?.[0] === 'urb_iluminacao_publica_pct') return camadaIluminacao;
    if (codigos?.[0] === 'hab_lixo_cacamba_pct') return camadaCacamba;
    return [];
  });
});

describe('Mapa', () => {
  it('desenha a camada por setor com legenda, aviso de escala e gráfico do entorno', async () => {
    render(<Mapa />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(await screen.findByTestId('mapa')).toHaveTextContent(
      'setor_censitario · 3 polígonos · 2 classes',
    );
    expect(screen.getByRole('note')).toHaveTextContent('Escala: setor censitário');
    expect(screen.getByRole('note')).toHaveTextContent('3 em Bairro Um');
    const legenda = screen.getByRole('region', { name: 'Legenda' });
    expect(within(legenda).getByText('80,0%')).toBeInTheDocument();
    expect(within(legenda).getByText('100,0%')).toBeInTheDocument();
    expect(within(legenda).getByText(/Sem dado/)).toBeInTheDocument();
    expect(screen.getByText('Infraestrutura do entorno: bairros e Salvador')).toBeInTheDocument();
    expect(buscarObservacoes).toHaveBeenCalledWith({
      indicadores: ['urb_iluminacao_publica_pct'],
      tiposTerritorio: ['bairro', 'setor_censitario'],
    });
  });

  it('avisa quando a camada escolhida só existe por bairro', async () => {
    render(<Mapa />);
    await screen.findByTestId('mapa');
    await userEvent.selectOptions(
      screen.getByLabelText('Camada temática:'),
      'hab_lixo_cacamba_pct',
    );
    expect(await screen.findByText(/escala de bairro, não de setor/)).toBeInTheDocument();
    expect(screen.getByTestId('mapa')).toHaveTextContent('bairro · 1 polígonos · 1 classes');
  });

  it('mostra estado vazio quando o banco não tem indicadores do mapa', async () => {
    vi.mocked(buscarIndicadores).mockResolvedValue([]);
    render(<Mapa />);
    expect(await screen.findByText(/Ainda não há indicadores do mapa/)).toBeInTheDocument();
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(buscarGeoJson).mockRejectedValueOnce(new Error('sem malha'));
    render(<Mapa />);
    expect(await screen.findByRole('alert')).toHaveTextContent('sem malha');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByTestId('mapa')).toBeInTheDocument();
  });
});
