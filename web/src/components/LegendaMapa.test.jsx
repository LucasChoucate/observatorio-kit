import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calcularClasses } from '../utils/mapa';
import LegendaMapa from './LegendaMapa';

const indicador = { nome: 'Indicador de teste', unidade: '%' };
const props = { indicador, atencao: 'menor', leitura: 'Leitura.', escala: 'setor_censitario' };

// Valores fictícios só para o teste de interface.
describe('LegendaMapa', () => {
  it('fala em 1/5 por faixa quando os cinco quintis existem', () => {
    const classes = calcularClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    render(<LegendaMapa {...props} classes={classes} />);
    expect(screen.getByText(/cada faixa reúne cerca de 1\/5/)).toBeInTheDocument();
  });

  it('avisa quando valores repetidos reduzem o número de faixas', () => {
    const classes = calcularClasses([60, 70, 80, 90, 95, 100, 100, 100, 100, 100, 100, 100]);
    expect(classes.length).toBeLessThan(5);
    render(<LegendaMapa {...props} classes={classes} temSemDado />);
    expect(screen.getByText(new RegExp(`sobram ${classes.length} faixas`))).toBeInTheDocument();
    expect(screen.queryByText(/1\/5/)).not.toBeInTheDocument();
    expect(screen.getByText(/Sem dado/)).toBeInTheDocument();
  });

  it('usa um tom por valor quando há poucos valores distintos', () => {
    render(<LegendaMapa {...props} classes={calcularClasses([10, 20])} />);
    expect(screen.getByText('Um tom por valor observado.')).toBeInTheDocument();
  });
});
