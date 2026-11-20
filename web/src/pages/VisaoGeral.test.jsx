import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buscarObservacoes, buscarTerritorios } from '../services/observacoes';
import VisaoGeral from './VisaoGeral';

vi.mock('../services/observacoes', () => ({
  buscarObservacoes: vi.fn(),
  buscarTerritorios: vi.fn(),
}));

// Dados fictícios só para o teste de interface (não são valores reais).
const fonte = {
  fonte_sigla: 'TESTE',
  instituicao: 'Fonte de Teste (FT)',
  fonte_titulo: 'Fonte de teste',
  fonte_url: 'https://exemplo.org',
  ano: 2022,
  classificacao: 'observado',
};
const obs = (codigo_ibge, territorio_tipo, indicador_codigo, valor, unidade = 'pessoas') => ({
  ...fonte,
  codigo_ibge,
  territorio_tipo,
  territorio: codigo_ibge,
  indicador_codigo,
  indicador: `Indicador ${indicador_codigo}`,
  valor,
  unidade,
});
const bairros = [
  { codigo_ibge: '111', nome: 'Bairro Um' },
  { codigo_ibge: '222', nome: 'Bairro Dois' },
];
const observacoes = [
  obs('111', 'bairro', 'dem_populacao', 1000),
  obs('222', 'bairro', 'dem_populacao', 2000),
  obs('2927408', 'municipio', 'dem_populacao', 90000),
  obs('111', 'bairro', 'dem_idade_0_14_pct', 20, '%'),
  obs('2927408', 'municipio', 'dem_idade_0_14_pct', 18, '%'),
];

beforeEach(() => {
  vi.mocked(buscarTerritorios).mockResolvedValue(bairros);
  vi.mocked(buscarObservacoes).mockResolvedValue(observacoes);
});

describe('VisaoGeral', () => {
  it('mostra carregando e depois os cards dos dois bairros com a referência municipal', async () => {
    render(<VisaoGeral />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(await screen.findByRole('heading', { name: 'Bairro Um' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bairro Dois' })).toBeInTheDocument();
    expect(screen.getAllByText('1.000').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Salvador \(município\)/).length).toBeGreaterThan(0);
    expect(screen.getByText('Composição etária')).toBeInTheDocument();
  });

  it('filtra para um bairro pelo seletor', async () => {
    render(<VisaoGeral />);
    await screen.findByRole('heading', { name: 'Bairro Um' });
    await userEvent.click(screen.getByRole('radio', { name: 'Bairro Dois' }));
    expect(screen.queryByRole('heading', { name: 'Bairro Um' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bairro Dois' })).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há dados', async () => {
    vi.mocked(buscarObservacoes).mockResolvedValue([]);
    render(<VisaoGeral />);
    expect(await screen.findByText(/Ainda não há dados demográficos/)).toBeInTheDocument();
  });

  it('mostra erro com opção de tentar novamente', async () => {
    vi.mocked(buscarObservacoes).mockRejectedValueOnce(new Error('sem conexão'));
    render(<VisaoGeral />);
    expect(await screen.findByRole('alert')).toHaveTextContent('sem conexão');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('heading', { name: 'Bairro Um' })).toBeInTheDocument();
  });
});
