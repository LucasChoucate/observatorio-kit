import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SeloFonte from './SeloFonte';

const observacao = {
  instituicao: 'Instituto Brasileiro de Geografia e Estatística (IBGE)',
  fonte_titulo: 'Censo Demográfico 2022',
  fonte_url: 'https://ftp.ibge.gov.br/',
  ano: 2022,
  territorio_tipo: 'bairro',
  classificacao: 'derivado',
};

describe('SeloFonte', () => {
  it('mostra fonte com link, ano, escala e classificação', () => {
    render(<SeloFonte observacao={observacao} />);
    expect(screen.getByRole('link', { name: 'IBGE' })).toHaveAttribute(
      'href',
      'https://ftp.ibge.gov.br/',
    );
    expect(screen.getByText('Ano: 2022')).toBeInTheDocument();
    expect(screen.getByText('Escala: Bairro')).toBeInTheDocument();
    expect(screen.getByText('Derivado')).toBeInTheDocument();
  });

  it('permite sobrescrever a escala', () => {
    render(<SeloFonte observacao={observacao} escala="Bairro; Salvador como referência" />);
    expect(screen.getByText('Escala: Bairro; Salvador como referência')).toBeInTheDocument();
  });

  it('não renderiza nada sem observação', () => {
    const { container } = render(<SeloFonte observacao={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
