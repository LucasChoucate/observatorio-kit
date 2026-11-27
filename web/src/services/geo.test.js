import { afterEach, describe, expect, it, vi } from 'vitest';
import { buscarGeoJson } from './geo';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buscarGeoJson', () => {
  it('lê o arquivo da pasta public/geo', async () => {
    const colecao = { type: 'FeatureCollection', features: [] };
    const fetchFalso = vi.fn().mockResolvedValue({ ok: true, json: () => colecao });
    vi.stubGlobal('fetch', fetchFalso);
    await expect(buscarGeoJson('setores')).resolves.toEqual(colecao);
    expect(fetchFalso).toHaveBeenCalledWith('/geo/setores.geojson');
  });

  it('gera erro legível quando o arquivo não existe', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(buscarGeoJson('bairros')).rejects.toThrow('bairros.geojson');
  });
});
