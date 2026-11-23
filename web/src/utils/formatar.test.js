import { describe, expect, it } from 'vitest';
import {
  formatarCompacto,
  formatarData,
  formatarDiferencaPercentual,
  formatarNumero,
  formatarPercentual,
  formatarValor,
  rotuloClassificacao,
  rotuloEscala,
  siglaInstituicao,
  VAZIO,
} from './formatar';

describe('formatarNumero', () => {
  it('usa ponto como milhar e vírgula como decimal', () => {
    expect(formatarNumero(2417678)).toBe('2.417.678');
    expect(formatarNumero(1.6362, 2)).toBe('1,64');
    expect(formatarNumero('38329')).toBe('38.329');
  });

  it('mostra traço quando não há valor', () => {
    expect(formatarNumero(null)).toBe(VAZIO);
  });
});

describe('formatarPercentual', () => {
  it('formata valores já em escala 0–100', () => {
    expect(formatarPercentual(18.0079)).toBe('18,0%');
    expect(formatarPercentual(54.2442, 2)).toBe('54,24%');
  });

  it('mostra traço quando não há valor', () => {
    expect(formatarPercentual(undefined)).toBe(VAZIO);
  });
});

describe('formatarDiferencaPercentual', () => {
  it('inclui o sinal', () => {
    expect(formatarDiferencaPercentual(12.34)).toBe('+12,3%');
    expect(formatarDiferencaPercentual(-4)).toBe('−4,0%');
    expect(formatarDiferencaPercentual(0)).toBe('0,0%');
  });

  it('mostra traço quando não é comparável', () => {
    expect(formatarDiferencaPercentual(null)).toBe(VAZIO);
  });
});

describe('formatarValor', () => {
  it('escolhe as casas decimais pela unidade', () => {
    expect(formatarValor(38329, 'pessoas')).toBe('38.329');
    expect(formatarValor(2.5, 'moradores/domicílio')).toBe('2,5');
    expect(formatarValor(23425.5072, 'hab/km²')).toBe('23.426');
    expect(formatarValor(15.0367, '%')).toBe('15,0%');
    expect(formatarValor(1.6362, 'km²')).toBe('1,64');
    expect(formatarValor(1.23456, 'outra')).toBe('1,23');
  });
});

describe('formatarCompacto', () => {
  it('abrevia números grandes', () => {
    expect(formatarCompacto(52564)).toBe('52,6 mil');
    expect(formatarCompacto(2417678)).toBe('2,4 mi');
    expect(formatarCompacto(null)).toBe(VAZIO);
  });
});

describe('formatarData', () => {
  it('converte ISO em DD/MM/AAAA sem mudar o dia', () => {
    expect(formatarData('2026-11-20')).toBe('20/11/2026');
    expect(formatarData('2026-01-01T00:00:00Z')).toBe('01/01/2026');
  });

  it('mostra traço para vazio ou inválido', () => {
    expect(formatarData(null)).toBe(VAZIO);
    expect(formatarData('2026')).toBe(VAZIO);
  });
});

describe('siglaInstituicao', () => {
  it('extrai a sigla entre parênteses', () => {
    expect(siglaInstituicao('Instituto Brasileiro de Geografia e Estatística (IBGE)')).toBe('IBGE');
    expect(siglaInstituicao('Sem sigla')).toBe('Sem sigla');
    expect(siglaInstituicao(null)).toBe(VAZIO);
  });
});

describe('rótulos', () => {
  it('traduz escala e classificação', () => {
    expect(rotuloEscala('bairro')).toBe('Bairro');
    expect(rotuloEscala('municipio')).toBe('Município');
    expect(rotuloClassificacao('proxy')).toBe('Proxy/estimativa');
    expect(rotuloClassificacao('derivado')).toBe('Derivado');
  });
});
