import { describe, expect, it } from 'vitest';
import {
  calcularClasses,
  conteudoPopup,
  corDaClasse,
  COR_SEM_DADO,
  escalaDasObservacoes,
  escaparHtml,
  indiceClasse,
  quantil,
  RAMPA_SEQUENCIAL,
  rotuloClasse,
} from './mapa';

describe('quantil', () => {
  it('interpola entre as posições', () => {
    expect(quantil([0, 10], 0.5)).toBe(5);
    expect(quantil([1, 2, 3, 4, 5], 0.25)).toBe(2);
    expect(quantil([7], 0.8)).toBe(7);
    expect(quantil([], 0.5)).toBeNull();
  });
});

describe('calcularClasses', () => {
  it('cria uma classe por valor quando há poucos valores distintos', () => {
    expect(calcularClasses([40, 30, '30', null])).toEqual([
      { min: 30, max: 30 },
      { min: 40, max: 40 },
    ]);
  });

  it('usa quintis para muitos valores, cobrindo do mínimo ao máximo', () => {
    const valores = Array.from({ length: 11 }, (_, i) => i * 10);
    const classes = calcularClasses(valores);
    expect(classes).toHaveLength(5);
    expect(classes[0].min).toBe(0);
    expect(classes.at(-1).max).toBe(100);
    expect(classes[1].min).toBe(classes[0].max);
  });

  it('não repete cortes quando os valores se concentram', () => {
    const valores = [50, 60, 70, 80, 90, 100, 100, 100, 100, 100, 100, 100];
    const classes = calcularClasses(valores);
    const limites = classes.map((c) => c.max);
    expect(new Set(limites).size).toBe(limites.length);
    expect(classes.at(-1).max).toBe(100);
  });

  it('devolve lista vazia sem valores', () => {
    expect(calcularClasses([null, undefined, ''])).toEqual([]);
  });
});

describe('indiceClasse', () => {
  const classes = [
    { min: 0, max: 10 },
    { min: 10, max: 20 },
  ];
  it('encontra a classe pelo limite superior', () => {
    expect(indiceClasse(5, classes)).toBe(0);
    expect(indiceClasse(10, classes)).toBe(0);
    expect(indiceClasse(15, classes)).toBe(1);
  });
  it('devolve null sem valor', () => {
    expect(indiceClasse(null, classes)).toBeNull();
    expect(indiceClasse(5, [])).toBeNull();
  });
});

describe('corDaClasse', () => {
  it('escurece com o valor quando a atenção está nos valores altos', () => {
    expect(corDaClasse(0, 5, 'maior')).toBe(RAMPA_SEQUENCIAL[0]);
    expect(corDaClasse(4, 5, 'maior')).toBe(RAMPA_SEQUENCIAL[4]);
  });
  it('inverte quando a atenção está nos valores baixos', () => {
    expect(corDaClasse(0, 5, 'menor')).toBe(RAMPA_SEQUENCIAL[4]);
    expect(corDaClasse(4, 5, 'menor')).toBe(RAMPA_SEQUENCIAL[0]);
  });
  it('usa os extremos com duas classes e o meio com uma', () => {
    expect(corDaClasse(0, 2, 'maior')).toBe(RAMPA_SEQUENCIAL[0]);
    expect(corDaClasse(1, 2, 'maior')).toBe(RAMPA_SEQUENCIAL[4]);
    expect(corDaClasse(0, 1, 'menor')).toBe(RAMPA_SEQUENCIAL[2]);
  });
  it('usa a cor de sem dado quando não há classe', () => {
    expect(corDaClasse(null, 5)).toBe(COR_SEM_DADO);
  });
});

describe('rotuloClasse', () => {
  it('mostra faixa ou valor único', () => {
    expect(rotuloClasse({ min: 38.57, max: 45 }, '%')).toBe('38,6% a 45,0%');
    expect(rotuloClasse({ min: 1212, max: 1212 }, 'R$')).toBe('R$ 1.212,00');
  });
});

describe('escalaDasObservacoes', () => {
  it('prefere setor quando há valor por setor', () => {
    expect(
      escalaDasObservacoes([
        { territorio_tipo: 'bairro', valor: 1 },
        { territorio_tipo: 'setor_censitario', valor: 2 },
      ]),
    ).toBe('setor_censitario');
  });
  it('cai para bairro quando os setores não têm valor', () => {
    expect(
      escalaDasObservacoes([
        { territorio_tipo: 'bairro', valor: 1 },
        { territorio_tipo: 'setor_censitario', valor: null },
      ]),
    ).toBe('bairro');
  });
});

describe('conteudoPopup', () => {
  const indicador = { nome: 'Iluminação <pública>', unidade: '%', classificacao: 'derivado' };
  it('monta território, valor, nota, fonte e ano, escapando HTML', () => {
    const html = conteudoPopup({
      titulo: 'Setor 1',
      subtitulo: 'Bairro & Cia',
      indicador,
      observacao: {
        valor: 96.5079,
        nota: 'Base: 10',
        instituicao: 'Instituto (IBGE)',
        ano: 2022,
      },
    });
    expect(html).toContain('Setor 1');
    expect(html).toContain('Bairro &amp; Cia');
    expect(html).toContain('Iluminação &lt;pública&gt;');
    expect(html).toContain('<strong>96,5%</strong>');
    expect(html).toContain('Fonte: IBGE · Ano: 2022 · Derivado');
  });
  it('indica sem dado quando a observação não tem valor', () => {
    const html = conteudoPopup({
      titulo: 'Setor 2',
      indicador,
      observacao: { valor: null, nota: 'Valor sigiloso', instituicao: 'X (IBGE)', ano: 2022 },
    });
    expect(html).toContain('<strong>Sem dado</strong>');
    expect(html).toContain('Valor sigiloso');
  });
  it('escapa aspas', () => {
    expect(escaparHtml(`a"b'c`)).toBe('a&quot;b&#39;c');
  });
});
