import { describe, expect, it } from 'vitest';
import {
  diferencaAbsoluta,
  diferencaPercentual,
  encontrarObservacao,
  motivoNaoComparavel,
  paraNumero,
  saoComparaveis,
} from './calculos';

const obs = (sobrescrever = {}) => ({
  indicador_codigo: 'dem_populacao',
  codigo_ibge: '1',
  ano: 2022,
  unidade: 'pessoas',
  valor: 100,
  ...sobrescrever,
});

describe('paraNumero', () => {
  it('converte números e textos numéricos', () => {
    expect(paraNumero(10)).toBe(10);
    expect(paraNumero('2.5')).toBe(2.5);
    expect(paraNumero(0)).toBe(0);
  });

  it('devolve null para ausentes e não numéricos', () => {
    expect(paraNumero(null)).toBeNull();
    expect(paraNumero(undefined)).toBeNull();
    expect(paraNumero('')).toBeNull();
    expect(paraNumero('abc')).toBeNull();
    expect(paraNumero(Number.NaN)).toBeNull();
  });
});

describe('diferencaAbsoluta', () => {
  it('calcula a − b', () => {
    expect(diferencaAbsoluta(150, 100)).toBe(50);
    expect(diferencaAbsoluta(100, 150)).toBe(-50);
    expect(diferencaAbsoluta('3.5', 1)).toBe(2.5);
  });

  it('devolve null quando falta valor', () => {
    expect(diferencaAbsoluta(null, 1)).toBeNull();
    expect(diferencaAbsoluta(1, undefined)).toBeNull();
  });
});

describe('diferencaPercentual', () => {
  it('usa b como base', () => {
    expect(diferencaPercentual(150, 100)).toBe(50);
    expect(diferencaPercentual(50, 100)).toBe(-50);
  });

  it('devolve null quando a base é zero ou ausente', () => {
    expect(diferencaPercentual(10, 0)).toBeNull();
    expect(diferencaPercentual(10, null)).toBeNull();
    expect(diferencaPercentual(null, 10)).toBeNull();
  });
});

describe('saoComparaveis e motivoNaoComparavel', () => {
  it('aceita mesmo indicador, ano e unidade', () => {
    expect(saoComparaveis(obs(), obs({ codigo_ibge: '2', valor: 200 }))).toBe(true);
    expect(motivoNaoComparavel(obs(), obs())).toBeNull();
  });

  it('rejeita indicadores diferentes', () => {
    expect(saoComparaveis(obs(), obs({ indicador_codigo: 'dem_domicilios' }))).toBe(false);
    expect(motivoNaoComparavel(obs(), obs({ indicador_codigo: 'x' }))).toBe(
      'indicadores diferentes',
    );
  });

  it('rejeita anos diferentes', () => {
    expect(saoComparaveis(obs(), obs({ ano: 2010 }))).toBe(false);
    expect(motivoNaoComparavel(obs(), obs({ ano: 2010 }))).toBe('anos diferentes (2022 e 2010)');
  });

  it('rejeita unidades diferentes', () => {
    expect(saoComparaveis(obs(), obs({ unidade: '%' }))).toBe(false);
  });

  it('rejeita observação ausente ou sem valor', () => {
    expect(saoComparaveis(obs(), null)).toBe(false);
    expect(motivoNaoComparavel(obs(), obs({ valor: null }))).toBe('valor ausente');
  });
});

describe('encontrarObservacao', () => {
  const lista = [obs(), obs({ codigo_ibge: '2', valor: 5 })];

  it('encontra pelo indicador e território', () => {
    expect(encontrarObservacao(lista, 'dem_populacao', '2').valor).toBe(5);
  });

  it('prefere o ano mais recente', () => {
    const serie = [obs({ ano: 2010, valor: 1 }), obs({ ano: 2022, valor: 2 }), obs({ ano: 2000 })];
    expect(encontrarObservacao(serie, 'dem_populacao', '1').valor).toBe(2);
  });

  it('devolve null quando não existe', () => {
    expect(encontrarObservacao(lista, 'dem_domicilios', '2')).toBeNull();
  });
});
