// Geometrias estáticas dos limites oficiais (IBGE, Censo 2022), geradas por etl/c_malha.py.
// Os arquivos só trazem códigos e nomes; os valores do mapa vêm do Supabase (observacoes.js).

/**
 * Lê web/public/geo/<nome>.geojson.
 * @param {'bairros'|'setores'} nome
 * @returns {Promise<object>} FeatureCollection
 */
export async function buscarGeoJson(nome) {
  const resposta = await fetch(`${import.meta.env.BASE_URL}geo/${nome}.geojson`);
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar o limite territorial (${nome}.geojson).`);
  }
  return resposta.json();
}
