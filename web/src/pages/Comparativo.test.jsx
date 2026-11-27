import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buscarIndicadores, buscarObservacoes, buscarTerritorios } from '../services/observacoes';
import Comparativo from './Comparativo';

vi.mock('../services/observacoes', () => ({
  buscarTerritorios: vi.fn(),
  buscarIndicadores: vi.fn(),
  buscarObservacoes: vi.fn(),
}));

const territoriosMock = [
  { id: 1, codigo_ibge: '2927408018', nome: 'Beiru / Tancredo Neves', tipo: 'bairro' },
  { id: 2, codigo_ibge: '2927408117', nome: 'Pernambués', tipo: 'bairro' },
  { id: 3, codigo_ibge: '2927408', nome: 'Salvador', tipo: 'municipio' },
];

const indicadoresMock = [
  {
    id: 1,
    codigo: 'dem_populacao',
    nome: 'População residente',
    unidade: 'pessoas',
    dimensao: 'demografica',
    classificacao: 'observado',
  },
  {
    id: 2,
    codigo: 'soc_taxa_alfabetizacao_pct',
    nome: 'Taxa de alfabetização',
    unidade: '%',
    dimensao: 'social',
    classificacao: 'derivado',
  },
  {
    id: 3,
    codigo: 'hab_agua_rede_geral_pct',
    nome: 'Domicílios com água da rede geral',
    unidade: '%',
    dimensao: 'habitacional',
    classificacao: 'derivado',
  },
];

const observacoesMock = [
  {
    codigo_ibge: '2927408018',
    territorio_tipo: 'bairro',
    territorio: 'Beiru / Tancredo Neves',
    indicador_codigo: 'dem_populacao',
    indicador: 'População residente',
    ano: 2022,
    valor: 38329,
    unidade: 'pessoas',
    fonte_sigla: 'IBGE_CENSO_2022',
    fonte_titulo: 'Censo 2022',
  },
  {
    codigo_ibge: '2927408117',
    territorio_tipo: 'bairro',
    territorio: 'Pernambués',
    indicador_codigo: 'dem_populacao',
    indicador: 'População residente',
    ano: 2022,
    valor: 52564,
    unidade: 'pessoas',
    fonte_sigla: 'IBGE_CENSO_2022',
    fonte_titulo: 'Censo 2022',
  },
  {
    codigo_ibge: '2927408',
    territorio_tipo: 'municipio',
    territorio: 'Salvador',
    indicador_codigo: 'dem_populacao',
    indicador: 'População residente',
    ano: 2022,
    valor: 2417678,
    unidade: 'pessoas',
    fonte_sigla: 'IBGE_CENSO_2022',
    fonte_titulo: 'Censo 2022',
  },
  {
    codigo_ibge: '2927408018',
    territorio_tipo: 'bairro',
    territorio: 'Beiru / Tancredo Neves',
    indicador_codigo: 'soc_taxa_alfabetizacao_pct',
    indicador: 'Taxa de alfabetização',
    ano: 2022,
    valor: 95.0404,
    unidade: '%',
    fonte_sigla: 'IBGE_CENSO_2022',
    fonte_titulo: 'Censo 2022',
  },
  {
    codigo_ibge: '2927408117',
    territorio_tipo: 'bairro',
    territorio: 'Pernambués',
    indicador_codigo: 'soc_taxa_alfabetizacao_pct',
    indicador: 'Taxa de alfabetização',
    ano: 2022,
    valor: 96.7562,
    unidade: '%',
    fonte_sigla: 'IBGE_CENSO_2022',
    fonte_titulo: 'Censo 2022',
  },
  {
    codigo_ibge: '2927408018',
    territorio_tipo: 'bairro',
    territorio: 'Beiru / Tancredo Neves',
    indicador_codigo: 'hab_agua_rede_geral_pct',
    indicador: 'Domicílios com água da rede geral',
    ano: 2022,
    valor: 99.9352,
    unidade: '%',
    fonte_sigla: 'IBGE_CENSO_2022',
    fonte_titulo: 'Censo 2022',
  },
];

beforeEach(() => {
  vi.mocked(buscarTerritorios).mockResolvedValue(territoriosMock);
  vi.mocked(buscarIndicadores).mockResolvedValue(indicadoresMock);
  vi.mocked(buscarObservacoes).mockResolvedValue(observacoesMock);
});

describe('Comparativo', () => {
  it('renderiza título, filtros, tabela comparativa e gráficos', async () => {
    render(<Comparativo />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');

    expect(
      await screen.findByRole('heading', { name: 'Comparativo Territorial' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tabela de Indicadores Pareados' }),
    ).toBeInTheDocument();

    const tabela = screen.getByTestId('tabela-comparativa');
    expect(within(tabela).getByText('População residente')).toBeInTheDocument();
    expect(within(tabela).getByText('Taxa de alfabetização')).toBeInTheDocument();
    expect(within(tabela).getByText('Domicílios com água da rede geral')).toBeInTheDocument();

    // Valores presentes
    expect(within(tabela).getByText('38.329')).toBeInTheDocument();
    expect(within(tabela).getByText('52.564')).toBeInTheDocument();
  });

  it('calcula diferenças pareadas e mostra não comparável quando falta observação', async () => {
    render(<Comparativo />);
    await screen.findByRole('heading', { name: 'Comparativo Territorial' });

    // hab_agua_rede_geral_pct só tem Beiru, falta Pernambués -> Não comparável
    expect(screen.getAllByText('Não comparável').length).toBeGreaterThan(0);
  });

  it('filtra indicadores ao mudar o select de dimensão', async () => {
    render(<Comparativo />);
    await screen.findByRole('heading', { name: 'Comparativo Territorial' });

    const selectDimensao = screen.getByLabelText('Dimensão:');
    await userEvent.selectOptions(selectDimensao, 'habitacional');

    const tabela = screen.getByTestId('tabela-comparativa');
    expect(within(tabela).getByText('Domicílios com água da rede geral')).toBeInTheDocument();
    expect(within(tabela).queryByText('População residente')).not.toBeInTheDocument();
  });

  it('exibe nota metodológica ao selecionar dimensão econômica', async () => {
    render(<Comparativo />);
    await screen.findByRole('heading', { name: 'Comparativo Territorial' });

    const selectDimensao = screen.getByLabelText('Dimensão:');
    await userEvent.selectOptions(selectDimensao, 'economica');

    expect(
      screen.getByRole('heading', {
        name: /Nota metodológica sobre rendimento nos agregados censitários/,
      }),
    ).toBeInTheDocument();
  });

  it('exibe estado vazio quando não há observações', async () => {
    vi.mocked(buscarObservacoes).mockResolvedValue([]);
    render(<Comparativo />);
    expect(
      await screen.findByText(/Ainda não há observações suficientes no banco/),
    ).toBeInTheDocument();
  });

  it('exibe erro com opção de recarregar', async () => {
    vi.mocked(buscarObservacoes).mockRejectedValueOnce(new Error('Erro de conexão ao banco'));
    render(<Comparativo />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Erro de conexão ao banco');

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByRole('heading', { name: 'Comparativo Territorial' }),
    ).toBeInTheDocument();
  });
});
