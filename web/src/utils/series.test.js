import { describe, expect, it } from 'vitest';
import { chaveTerritorio, montarDadosAgrupados, montarDadosPorTerritorio } from './series';

const observacoes = [
  { indicador_codigo: 'a', codigo_ibge: '1', ano: 2022, valor: '10' },
  { indicador_codigo: 'a', codigo_ibge: '2', ano: 2022, valor: 20 },
  { indicador_codigo: 'b', codigo_ibge: '1', ano: 2022, valor: 30 },
];
const territorios = [
  { codigo_ibge: '1', nome: 'Um' },
  { codigo_ibge: '2', nome: 'Dois', rotulo: 'Dois (ref.)' },
];

describe('chaveTerritorio', () => {
  it('prefixa o código', () => {
    expect(chaveTerritorio('2927408')).toBe('t_2927408');
  });
});

describe('montarDadosAgrupados', () => {
  it('cria uma linha por categoria e uma coluna por território', () => {
    const dados = montarDadosAgrupados(
      observacoes,
      [
        { codigo: 'a', rotulo: 'A' },
        { codigo: 'b', rotulo: 'B' },
      ],
      territorios,
    );
    expect(dados).toEqual([
      { rotulo: 'A', t_1: 10, t_2: 20 },
      { rotulo: 'B', t_1: 30, t_2: null },
    ]);
  });
});

describe('montarDadosPorTerritorio', () => {
  it('usa rótulo quando existe e descarta territórios sem dado', () => {
    expect(montarDadosPorTerritorio(observacoes, 'a', territorios)).toEqual([
      { codigo_ibge: '1', rotulo: 'Um', valor: 10 },
      { codigo_ibge: '2', rotulo: 'Dois (ref.)', valor: 20 },
    ]);
    expect(montarDadosPorTerritorio(observacoes, 'b', territorios)).toHaveLength(1);
  });
});
