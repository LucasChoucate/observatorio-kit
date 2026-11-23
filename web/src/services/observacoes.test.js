import { beforeEach, describe, expect, it, vi } from 'vitest';

// Consulta falsa que registra as chamadas encadeadas e resolve com `resposta`.
const chamadas = [];
let resposta = { data: [], error: null };

function criarConsulta() {
  const consulta = {
    then: (resolver, rejeitar) => Promise.resolve(resposta).then(resolver, rejeitar),
  };
  for (const metodo of ['select', 'in', 'eq', 'order']) {
    consulta[metodo] = (...args) => {
      chamadas.push([metodo, ...args]);
      return consulta;
    };
  }
  return consulta;
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (tabela) => {
      chamadas.push(['from', tabela]);
      return criarConsulta();
    },
  },
}));

const { buscarObservacoes, buscarTerritorios, buscarIndicadores, buscarFontes } =
  await import('./observacoes');

beforeEach(() => {
  chamadas.length = 0;
  resposta = { data: [], error: null };
});

describe('buscarObservacoes', () => {
  it('consulta a view e aplica os filtros informados', async () => {
    resposta = { data: [{ id: 1 }], error: null };
    const dados = await buscarObservacoes({
      territorios: ['2927408018'],
      tiposTerritorio: ['bairro'],
      indicadores: ['dem_populacao'],
      dimensao: 'demografica',
      anos: [2022],
      fonte: 'IBGE_CENSO_2022',
    });
    expect(dados).toEqual([{ id: 1 }]);
    expect(chamadas).toContainEqual(['from', 'vw_observacoes']);
    expect(chamadas).toContainEqual(['in', 'codigo_ibge', ['2927408018']]);
    expect(chamadas).toContainEqual(['in', 'territorio_tipo', ['bairro']]);
    expect(chamadas).toContainEqual(['in', 'indicador_codigo', ['dem_populacao']]);
    expect(chamadas).toContainEqual(['eq', 'dimensao', 'demografica']);
    expect(chamadas).toContainEqual(['in', 'ano', [2022]]);
    expect(chamadas).toContainEqual(['eq', 'fonte_sigla', 'IBGE_CENSO_2022']);
  });

  it('não aplica filtros vazios', async () => {
    await buscarObservacoes({ territorios: [] });
    expect(chamadas.some(([metodo]) => metodo === 'in' || metodo === 'eq')).toBe(false);
  });

  it('lança erro legível quando o Supabase responde com erro', async () => {
    resposta = { data: null, error: { message: 'falhou' } };
    await expect(buscarObservacoes()).rejects.toThrow('Erro ao consultar o Supabase: falhou');
  });
});

describe('demais consultas', () => {
  it('buscarTerritorios filtra pelo tipo', async () => {
    await buscarTerritorios({ tipo: 'bairro' });
    expect(chamadas).toContainEqual(['from', 'territorios']);
    expect(chamadas).toContainEqual(['eq', 'tipo', 'bairro']);
  });

  it('buscarIndicadores filtra pela dimensão', async () => {
    await buscarIndicadores({ dimensao: 'social' });
    expect(chamadas).toContainEqual(['from', 'indicadores']);
    expect(chamadas).toContainEqual(['eq', 'dimensao', 'social']);
  });

  it('buscarFontes consulta a tabela de fontes', async () => {
    resposta = { data: null, error: null };
    expect(await buscarFontes()).toEqual([]);
    expect(chamadas).toContainEqual(['from', 'fontes']);
  });
});
